import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import Category from '../models/Category.model.js';

// ============================================
// MOCK DATA
// ============================================

const categories = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Discussions about latest tech trends, programming, and software development',
    color: '#4ADE80',
  },
  {
    name: 'Science',
    slug: 'science',
    description: 'Scientific discoveries, research, and breakthroughs',
    color: '#60A5FA',
  },
  {
    name: 'Philosophy',
    slug: 'philosophy',
    description: 'Deep thoughts about life, existence, and human nature',
    color: '#A78BFA',
  },
  {
    name: 'Art & Design',
    slug: 'art-design',
    description: 'Creative works, design trends, and artistic expression',
    color: '#F472B6',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Entrepreneurship, startups, and business strategies',
    color: '#FBBF24',
  },
  {
    name: 'Health & Wellness',
    slug: 'health-wellness',
    description: 'Physical and mental health, fitness, and well-being',
    color: '#34D399',
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'Video games, esports, and gaming culture',
    color: '#F87171',
  },
  {
    name: 'Music',
    slug: 'music',
    description: 'Music production, artists, and industry news',
    color: '#FB923C',
  },
];

const users = [
  {
    username: 'alex_dev',
    email: 'alex@example.com',
    password: 'Password123!',
    displayName: 'Alex Chen',
    bio: 'Full-stack developer passionate about React and Node.js. Building cool stuff one commit at a time.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    location: 'San Francisco, CA',
    website: 'https://alexchen.dev',
  },
  {
    username: 'sarah_thinks',
    email: 'sarah@example.com',
    password: 'Password123!',
    displayName: 'Sarah Mitchell',
    bio: 'Philosophy enthusiast and writer. I love exploring big ideas and meaningful conversations.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    location: 'New York, NY',
  },
  {
    username: 'mike_creates',
    email: 'mike@example.com',
    password: 'Password123!',
    displayName: 'Mike Rodriguez',
    bio: 'UI/UX Designer with 8 years of experience. Crafting beautiful digital experiences.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    location: 'Austin, TX',
    website: 'https://mikedesigns.co',
  },
  {
    username: 'emma_science',
    email: 'emma@example.com',
    password: 'Password123!',
    displayName: 'Dr. Emma Watson',
    bio: 'Research scientist specializing in neuroscience. Science communicator and lifelong learner.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    location: 'Boston, MA',
  },
  {
    username: 'james_gamer',
    email: 'james@example.com',
    password: 'Password123!',
    displayName: 'James Park',
    bio: 'Pro gamer and streamer. Competitive esports player. Let\'s talk gaming!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    location: 'Los Angeles, CA',
    website: 'https://twitch.tv/jamespark',
  },
  {
    username: 'lisa_music',
    email: 'lisa@example.com',
    password: 'Password123!',
    displayName: 'Lisa Thompson',
    bio: 'Music producer and songwriter. Creating beats and melodies that move souls.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    location: 'Nashville, TN',
  },
  {
    username: 'demo_user',
    email: 'demo@thinkify.com',
    password: 'demo123',
    displayName: 'Demo User',
    bio: 'This is a demo account to explore Thinkify. Feel free to browse around!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    location: 'Internet',
  },
];

const postsData = [
  {
    title: 'The Future of AI in Software Development',
    content: `Artificial Intelligence is revolutionizing how we write code. From GitHub Copilot to ChatGPT, AI tools are becoming indispensable for developers.

## Key Trends

1. **Code Generation**: AI can now write boilerplate code, suggest completions, and even generate entire functions.

2. **Bug Detection**: ML models are getting better at identifying potential bugs before they reach production.

3. **Code Review**: Automated code review powered by AI helps maintain code quality.

## My Thoughts

While AI won't replace developers anytime soon, it's definitely changing how we work. The developers who embrace these tools will have a significant advantage.

What do you think? Are you using AI tools in your workflow? Share your experiences below! 👇`,
    tags: ['ai', 'programming', 'future', 'technology'],
    categorySlug: 'technology',
    authorUsername: 'alex_dev',
  },
  {
    title: 'Why Philosophy Matters in the Age of Technology',
    content: `In our rush to adopt new technologies, we often forget to ask the fundamental questions: Should we? What does it mean for humanity?

## The Forgotten Questions

Technology companies move fast and break things, but rarely stop to consider:
- **Ethics**: Is this technology ethical?
- **Purpose**: Does this improve human flourishing?
- **Consequences**: What are the long-term implications?

## Ancient Wisdom for Modern Times

Philosophers like Aristotle, Kant, and Mill provide frameworks that are surprisingly relevant today:

- **Virtue Ethics**: What kind of people do we become when we use this technology?
- **Deontology**: Are there duties we're violating?
- **Utilitarianism**: Does this maximize overall well-being?

## Call to Action

I believe every tech company should have philosophers on staff. Not as an afterthought, but as a core part of the development process.

What philosophical frameworks do you find most useful? Let's discuss! 🤔`,
    tags: ['philosophy', 'ethics', 'technology', 'thinking'],
    categorySlug: 'philosophy',
    authorUsername: 'sarah_thinks',
  },
  {
    title: 'Design Trends That Will Dominate 2024',
    content: `As we move through 2024, some exciting design trends are emerging. Here's my breakdown of what's hot and what's not.

## 🔥 Hot Trends

### 1. Neubrutalism
Bold, raw, and unapologetic design that breaks conventional rules. Think thick borders, clashing colors, and intentionally "ugly" aesthetics.

### 2. 3D Elements
With better browser performance, we're seeing more 3D objects integrated into web design.

### 3. Dark Mode Everything
Users love dark mode, and designers are creating beautiful dark-first experiences.

### 4. Micro-interactions
Small, delightful animations that make interfaces feel alive.

## ❄️ Cooling Off

- Minimalism (overdone)
- Generic stock photos
- Cookie-cutter templates

## My Predictions

I think we'll see a return to more personality in design. Users are tired of every site looking the same.

What trends are you excited about? Drop your thoughts below! 🎨`,
    tags: ['design', 'ui', 'ux', 'trends', '2024'],
    categorySlug: 'art-design',
    authorUsername: 'mike_creates',
  },
  {
    title: 'Breakthrough: New Discovery in Neuroplasticity',
    content: `Exciting news from the neuroscience world! Our lab just published findings that could change how we understand brain adaptation.

## The Discovery

We found that adult neurons have far more plasticity than previously thought. Contrary to the old belief that "you can't teach an old dog new tricks," our research shows:

- Neural pathways can reform at any age
- Certain exercises dramatically increase plasticity
- Sleep plays an even bigger role than we knew

## Implications

This has huge implications for:
- **Stroke recovery**: Better rehabilitation protocols
- **Learning**: More effective educational approaches
- **Mental health**: New treatment pathways for depression and anxiety

## The Science

Without getting too technical, we used advanced imaging to observe neurons rewiring in real-time. The results were remarkable.

I'll be doing an AMA next week if you have questions! 🧠`,
    tags: ['science', 'neuroscience', 'research', 'brain'],
    categorySlug: 'science',
    authorUsername: 'emma_science',
  },
  {
    title: 'From Casual Gamer to Pro: My Journey',
    content: `5 years ago, I was just another kid playing games after school. Today, I compete professionally. Here's how it happened.

## The Beginning

I started playing competitively in local tournaments. Got destroyed. A lot. But I kept at it.

## The Grind

- **Practice**: 6-8 hours daily
- **VOD Review**: Analyzing every match
- **Coaching**: Invested in professional coaching
- **Team Play**: Found teammates who pushed me

## Lessons Learned

1. **Talent is overrated**: Hard work beats talent when talent doesn't work hard
2. **Mental game matters**: 50% of competing is psychological
3. **Take care of your body**: Exercise, sleep, and nutrition affect performance
4. **Community is everything**: Surround yourself with people who elevate you

## Current Status

Now signed to a pro team, competing in major tournaments. Living the dream! 🎮

Ask me anything about going pro!`,
    tags: ['gaming', 'esports', 'career', 'motivation'],
    categorySlug: 'gaming',
    authorUsername: 'james_gamer',
  },
  {
    title: 'The Art of Music Production: A Beginner\'s Guide',
    content: `So you want to make music? Let me share everything I wish someone told me when I started.

## Getting Started

### Equipment You Actually Need
- A computer (any modern laptop works)
- DAW software (FL Studio, Ableton, Logic)
- Headphones (not earbuds)
- A basic MIDI controller (optional but helpful)

### Equipment You DON'T Need (Yet)
- Expensive studio monitors
- Hardware synthesizers
- Professional microphones
- Acoustic treatment

## Learning Path

1. **Week 1-4**: Learn your DAW basics
2. **Month 2-3**: Study song structure
3. **Month 4-6**: Focus on one genre
4. **Month 7+**: Develop your unique sound

## Common Mistakes

- Buying too much gear too early
- Not finishing songs
- Comparing yourself to professionals
- Ignoring music theory

## My Best Advice

**Finish your tracks.** Even if they're bad. You learn more from completing 10 bad songs than from having 100 unfinished "masterpieces."

Drop your music questions below! 🎵`,
    tags: ['music', 'production', 'beginner', 'tutorial'],
    categorySlug: 'music',
    authorUsername: 'lisa_music',
  },
  {
    title: 'Building a Startup: Lessons from My First Year',
    content: `One year ago, I quit my job to start a company. Here's what I learned.

## The Good

- **Freedom**: Making your own decisions is incredible
- **Growth**: I've learned more this year than the previous five
- **Impact**: Directly seeing how your work affects customers

## The Bad

- **Stress**: It never really turns off
- **Finances**: The first year is TOUGH
- **Loneliness**: It can be isolating

## The Ugly

- Lost 20 pounds from stress (gained it back, don't worry)
- Almost ran out of money twice
- Questioned everything multiple times

## Key Lessons

1. **Cash is king**: Always have more runway than you think you need
2. **Talk to customers**: They'll tell you what to build
3. **Move fast**: Speed is your only advantage against big companies
4. **Take care of yourself**: You can't pour from an empty cup

## Would I do it again?

Absolutely. Despite everything, it's the most fulfilling thing I've ever done.

Fellow founders, what's your biggest challenge right now? 💼`,
    tags: ['business', 'startup', 'entrepreneurship', 'lessons'],
    categorySlug: 'business',
    authorUsername: 'alex_dev',
  },
  {
    title: 'Mental Health in Tech: Breaking the Silence',
    content: `We need to talk about mental health in the tech industry. It's a conversation that's long overdue.

## The Problem

- **Burnout rates** in tech are astronomical
- **Imposter syndrome** affects even senior developers
- **Always-on culture** makes it hard to disconnect
- **Remote work** can increase isolation

## My Story

I burned out hard two years ago. Couldn't code, couldn't think, couldn't get out of bed some days. I'm sharing this because silence helps no one.

## What Helped Me

1. **Therapy**: Best investment I ever made
2. **Boundaries**: No work after 6pm, period
3. **Exercise**: Even just walking daily
4. **Community**: Talking to others who understood
5. **Taking time off**: Actually using PTO

## For Managers

- Normalize mental health discussions
- Don't celebrate overwork
- Check in with your team regularly
- Lead by example

## Resources

If you're struggling, you're not alone. Please reach out to a professional or a trusted person in your life.

Let's break the stigma together. 💚`,
    tags: ['health', 'mentalhealth', 'tech', 'wellness'],
    categorySlug: 'health-wellness',
    authorUsername: 'sarah_thinks',
  },
];

const commentsData = [
  {
    content: 'This is such an insightful post! I\'ve been using AI tools for a few months now and they\'ve definitely made me more productive.',
    postIndex: 0,
    authorUsername: 'sarah_thinks',
  },
  {
    content: 'Great points about ethics in tech. I think every CS curriculum should include philosophy courses.',
    postIndex: 1,
    authorUsername: 'alex_dev',
  },
  {
    content: 'Neubrutalism is definitely having a moment! I\'ve been experimenting with it in my recent projects.',
    postIndex: 2,
    authorUsername: 'sarah_thinks',
  },
  {
    content: 'This is fascinating research! Would love to learn more about the specific exercises that increase plasticity.',
    postIndex: 3,
    authorUsername: 'mike_creates',
  },
  {
    content: 'Respect for sharing your journey! The mental game advice is so true.',
    postIndex: 4,
    authorUsername: 'alex_dev',
  },
  {
    content: 'This is exactly what I needed! Just got FL Studio and was feeling overwhelmed.',
    postIndex: 5,
    authorUsername: 'james_gamer',
  },
  {
    content: 'The cash lesson is so real. We almost went under because we didn\'t have enough runway.',
    postIndex: 6,
    authorUsername: 'mike_creates',
  },
  {
    content: 'Thank you for sharing your story. It takes courage to be vulnerable about mental health.',
    postIndex: 7,
    authorUsername: 'emma_science',
  },
  {
    content: 'I disagree that AI will make developers more productive. It often produces buggy code that takes longer to fix.',
    postIndex: 0,
    authorUsername: 'mike_creates',
  },
  {
    content: 'As a philosophy professor, I couldn\'t agree more with this post. We need more critical thinking in tech.',
    postIndex: 1,
    authorUsername: 'emma_science',
  },
];

// ============================================
// SEED FUNCTION
// ============================================

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/thinkify';
    await mongoose.connect(mongoUri);
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Category.deleteMany({}),
    ]);

    // Seed categories
    console.log('📂 Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // Seed users
    console.log('👥 Seeding users...');
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    const userMap = {};
    createdUsers.forEach((user) => {
      userMap[user.username] = user._id;
    });

    // Add followers relationships
    console.log('🔗 Creating follow relationships...');
    await User.findByIdAndUpdate(userMap['alex_dev'], {
      $push: {
        followers: [userMap['sarah_thinks'], userMap['mike_creates']],
        following: [userMap['emma_science']],
      },
    });
    await User.findByIdAndUpdate(userMap['sarah_thinks'], {
      $push: {
        followers: [userMap['alex_dev']],
        following: [userMap['alex_dev'], userMap['mike_creates']],
      },
    });

    // Seed posts
    console.log('📝 Seeding posts...');
    const postsToCreate = postsData.map((post, index) => ({
      title: post.title,
      slug: slugify(post.title, { lower: true, strict: true }) + '-' + index,
      content: post.content,
      tags: post.tags,
      category: categoryMap[post.categorySlug],
      author: userMap[post.authorUsername],
      likes: [userMap['demo_user']], // Demo user likes all posts
      views: Math.floor(Math.random() * 500) + 50,
    }));
    const createdPosts = await Post.insertMany(postsToCreate);

    // Add some random likes to posts
    for (const post of createdPosts) {
      const randomLikes = Object.values(userMap)
        .filter(() => Math.random() > 0.5)
        .slice(0, 3);
      await Post.findByIdAndUpdate(post._id, {
        $addToSet: { likes: { $each: randomLikes } },
      });
    }

    // Seed comments
    console.log('💬 Seeding comments...');
    const commentsToCreate = commentsData.map((comment) => ({
      content: comment.content,
      post: createdPosts[comment.postIndex]._id,
      author: userMap[comment.authorUsername],
      likes: Math.random() > 0.5 ? [userMap['demo_user']] : [],
    }));
    await Comment.insertMany(commentsToCreate);

    // Update post comment counts
    for (let i = 0; i < createdPosts.length; i++) {
      const commentCount = commentsData.filter((c) => c.postIndex === i).length;
      await Post.findByIdAndUpdate(createdPosts[i]._id, {
        commentsCount: commentCount,
      });
    }

    // Summary
    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Posts: ${createdPosts.length}`);
    console.log(`   - Comments: ${commentsToCreate.length}`);
    console.log('\n🔐 Demo Account:');
    console.log('   Email: demo@thinkify.com');
    console.log('   Password: demo123');
    console.log('\n🔐 Test Account:');
    console.log('   Email: alex@example.com');
    console.log('   Password: Password123!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
