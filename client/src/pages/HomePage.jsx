import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HiPlus, HiFire, HiSparkles } from 'react-icons/hi';
import PostCard from '../components/posts/PostCard';
import { PostSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import api from '../services/api';
import useAuthStore from '../stores/authStore';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  // Fetch posts
  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['posts', 'home'],
    queryFn: async () => {
      const response = await api.get('/posts?limit=10&sort=newest');
      return response.data;
    },
  });

  // Fetch trending posts
  const { data: trendingData } = useQuery({
    queryKey: ['posts', 'trending'],
    queryFn: async () => {
      const response = await api.get('/posts/trending?limit=5');
      return response.data;
    },
  });

  const posts = postsData?.posts || [];
  const trendingPosts = trendingData?.posts || [];

  return (
    <div className="space-y-6">
      {/* Hero Section for Non-authenticated users */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center bg-gradient-to-br from-dark-200 to-dark-300 border-primary/20"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to <span className="text-primary neon-text">Thinkify</span>
          </h1>
          <p className="text-lg text-gray-400 mb-6 max-w-2xl mx-auto">
            A vibrant space for meaningful conversations. Share your ideas, 
            engage with thinkers, and discover perspectives that matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" icon={HiSparkles}>
                Get Started
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="secondary" size="lg">
                Explore Discussions
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Create Post CTA (Authenticated users) */}
      {isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4"
        >
          <Link 
            to="/create"
            className="flex items-center gap-4 p-3 rounded-lg bg-dark-300 hover:bg-dark-100 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <HiPlus className="w-5 h-5 text-primary" />
            </div>
            <span className="text-gray-400">What's on your mind? Start a discussion...</span>
          </Link>
        </motion.div>
      )}

      {/* Trending Posts (if available) */}
      {trendingPosts.length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-4">
            <HiFire className="text-orange-500" />
            Trending Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingPosts.slice(0, 4).map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TrendingPostCard post={post} rank={index + 1} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Main Feed */}
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-100 mb-4">
          <HiSparkles className="text-primary" />
          Latest Discussions
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="card p-8 text-center">
            <p className="text-red-500 mb-4">Failed to load posts</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-400 mb-4">No discussions yet. Be the first to start one!</p>
            <Link to="/create">
              <Button icon={HiPlus}>Create Post</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {posts.length >= 10 && (
          <div className="mt-6 text-center">
            <Link to="/explore">
              <Button variant="secondary">View More Discussions</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Trending Post Card (Compact)
const TrendingPostCard = ({ post, rank }) => (
  <Link 
    to={`/post/${post.slug}`}
    className="card-interactive flex gap-4 items-start"
  >
    <div className={`
      w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
      ${rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : ''}
      ${rank === 2 ? 'bg-gray-400/20 text-gray-400' : ''}
      ${rank === 3 ? 'bg-orange-500/20 text-orange-500' : ''}
      ${rank > 3 ? 'bg-dark-100 text-gray-500' : ''}
    `}>
      {rank}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium text-gray-100 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
        {post.title}
      </h3>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{post.author?.displayName || post.author?.username}</span>
        <span>·</span>
        <span>{post.commentCount} comments</span>
      </div>
    </div>
  </Link>
);

export default HomePage;
