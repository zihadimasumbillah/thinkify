/**
 * ============================================
 * THINKIFY - MongoDB Database Verification
 * ============================================
 * 
 * Run this in MongoDB Compass, VS Code MongoDB Extension,
 * or mongosh to verify database contents.
 * 
 * Connection String (MongoDB Atlas):
 * mongodb+srv://thinkify-admin:<password>@cluster0.al2uxgz.mongodb.net/thinkify
 */

// Select database
use('thinkify');

// ============================================
// 1. DATABASE OVERVIEW
// ============================================
print('\n' + '='.repeat(60));
print('📊 DATABASE OVERVIEW');
print('='.repeat(60));

const collections = db.getCollectionNames();
print(`\nCollections found: ${collections.length}`);
collections.forEach(col => {
  const count = db.getCollection(col).countDocuments();
  print(`  • ${col}: ${count} documents`);
});

// ============================================
// 2. USERS COLLECTION
// ============================================
print('\n' + '='.repeat(60));
print('👤 USERS DATA');
print('='.repeat(60));

const userCount = db.users.countDocuments();
print(`\nTotal users: ${userCount}`);

if (userCount > 0) {
  print('\nSample users (latest 5):');
  db.users.find({}, {
    username: 1,
    email: 1,
    displayName: 1,
    role: 1,
    isActive: 1,
    createdAt: 1
  }).sort({ createdAt: -1 }).limit(5).forEach(user => {
    print(`  - ${user.username} (${user.email}) - Role: ${user.role || 'user'}`);
  });
  
  // User stats
  const activeUsers = db.users.countDocuments({ isActive: true });
  const adminUsers = db.users.countDocuments({ role: 'admin' });
  print(`\nActive users: ${activeUsers}`);
  print(`Admin users: ${adminUsers}`);
}

// ============================================
// 3. POSTS COLLECTION
// ============================================
print('\n' + '='.repeat(60));
print('📝 POSTS DATA');
print('='.repeat(60));

const postCount = db.posts.countDocuments();
print(`\nTotal posts: ${postCount}`);

if (postCount > 0) {
  print('\nSample posts (latest 5):');
  db.posts.find({}, {
    title: 1,
    slug: 1,
    status: 1,
    views: 1,
    createdAt: 1
  }).sort({ createdAt: -1 }).limit(5).forEach(post => {
    print(`  - "${post.title}" (${post.views || 0} views) - ${post.status || 'published'}`);
  });
  
  // Post stats
  const publishedPosts = db.posts.countDocuments({ status: 'published' });
  const draftPosts = db.posts.countDocuments({ status: 'draft' });
  const totalViews = db.posts.aggregate([
    { $group: { _id: null, total: { $sum: '$views' } } }
  ]).toArray()[0]?.total || 0;
  
  print(`\nPublished: ${publishedPosts}`);
  print(`Drafts: ${draftPosts}`);
  print(`Total views: ${totalViews}`);
  
  // Posts with most likes
  print('\nMost popular posts (by likes):');
  db.posts.find({ status: 'published' })
    .sort({ 'likes.length': -1 })
    .limit(3)
    .forEach(post => {
      print(`  - "${post.title}" - ${post.likes?.length || 0} likes`);
    });
}

// ============================================
// 4. CATEGORIES COLLECTION
// ============================================
print('\n' + '='.repeat(60));
print('📁 CATEGORIES DATA');
print('='.repeat(60));

const categoryCount = db.categories.countDocuments();
print(`\nTotal categories: ${categoryCount}`);

if (categoryCount > 0) {
  print('\nAll categories:');
  db.categories.find({}).forEach(cat => {
    print(`  - ${cat.name} (${cat.slug}) - ${cat.postCount || 0} posts`);
  });
}

// ============================================
// 5. COMMENTS COLLECTION
// ============================================
print('\n' + '='.repeat(60));
print('💬 COMMENTS DATA');
print('='.repeat(60));

const commentCount = db.comments.countDocuments();
print(`\nTotal comments: ${commentCount}`);

if (commentCount > 0) {
  print('\nRecent comments (latest 5):');
  db.comments.find({}, {
    content: 1,
    createdAt: 1
  }).sort({ createdAt: -1 }).limit(5).forEach(comment => {
    const preview = comment.content?.substring(0, 50) || 'N/A';
    print(`  - "${preview}..."`);
  });
}

// ============================================
// 6. DATA INTEGRITY CHECKS
// ============================================
print('\n' + '='.repeat(60));
print('🔍 DATA INTEGRITY CHECKS');
print('='.repeat(60));

// Check for orphaned posts (no valid author)
const userIds = db.users.find({}, { _id: 1 }).map(u => u._id);
const orphanedPosts = db.posts.countDocuments({
  author: { $nin: userIds }
});
print(`\nOrphaned posts (invalid author): ${orphanedPosts}`);

// Check for posts without category
const postsWithoutCategory = db.posts.countDocuments({
  $or: [{ category: null }, { category: { $exists: false } }]
});
print(`Posts without category: ${postsWithoutCategory}`);

// Check for duplicate slugs
const duplicateSlugs = db.posts.aggregate([
  { $group: { _id: '$slug', count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
]).toArray();
print(`Duplicate post slugs: ${duplicateSlugs.length}`);

// Check indexes
print('\nIndexes on posts collection:');
db.posts.getIndexes().forEach(idx => {
  print(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
});

// ============================================
// 7. SUMMARY
// ============================================
print('\n' + '='.repeat(60));
print('📋 SUMMARY');
print('='.repeat(60));

const hasData = userCount > 0 || postCount > 0 || categoryCount > 0;

print(`
Database: thinkify
Users: ${userCount}
Posts: ${postCount}
Categories: ${categoryCount}
Comments: ${commentCount}

Status: ${hasData ? '✅ Database has data' : '⚠️ Database is empty'}
`);

if (!hasData) {
  print('💡 Tip: Run seed data to populate the database:');
  print('   cd server && node src/seeds/seedData.js');
}

print('='.repeat(60));
