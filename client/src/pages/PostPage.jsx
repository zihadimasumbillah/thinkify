import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  HiHeart, 
  HiOutlineHeart, 
  HiChat, 
  HiBookmark, 
  HiOutlineBookmark,
  HiShare,
  HiArrowLeft,
  HiDotsHorizontal
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import CommentSection from '../components/posts/CommentSection';
import { PostSkeleton } from '../components/common/Skeleton';
import api from '../services/api';
import useAuthStore from '../stores/authStore';

const PostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  // Fetch post
  const { data, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const response = await api.get(`/posts/${slug}`);
      return response.data;
    },
  });

  const post = data?.post;
  const userInteraction = data?.userInteraction || { liked: false, bookmarked: false };

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => api.post(`/posts/${post._id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries(['post', slug]);
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: () => api.post(`/users/bookmarks/${post._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['post', slug]);
      toast.success(userInteraction.bookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }
    likeMutation.mutate();
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark posts');
      return;
    }
    bookmarkMutation.mutate();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <PostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-100 mb-2">Post Not Found</h2>
        <p className="text-gray-400 mb-4">The discussion you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button variant="secondary" icon={HiArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
      >
        <HiArrowLeft />
        Back
      </button>

      {/* Post Card */}
      <article className="card">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Link 
            to={`/user/${post.author.username}`}
            className="flex items-center gap-3 group"
          >
            <Avatar 
              src={post.author.avatar} 
              alt={post.author.displayName || post.author.username}
              size="md"
            />
            <div>
              <p className="font-medium text-gray-100 group-hover:text-primary transition-colors">
                {post.author.displayName || post.author.username}
              </p>
              <p className="text-sm text-gray-500">
                @{post.author.username} · {formatDate(post.createdAt)}
              </p>
            </div>
          </Link>

          {user?._id === post.author._id && (
            <button className="p-2 text-gray-500 hover:text-gray-300 transition-colors">
              <HiDotsHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category */}
        <Link 
          to={`/category/${post.category.slug}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm mb-4"
          style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
        >
          <span>{post.category.icon}</span>
          {post.category.name}
        </Link>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-4">
          {post.title}
        </h1>

        {/* Cover Image */}
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
          />
        )}

        {/* Content */}
        <div className="prose prose-invert prose-primary max-w-none mb-6">
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                to={`/tag/${tag}`}
                className="badge-secondary hover:bg-primary/20 hover:text-primary transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Stats & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-50">
          <div className="flex items-center gap-6">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={`flex items-center gap-2 transition-colors ${
                userInteraction.liked 
                  ? 'text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              {userInteraction.liked ? (
                <HiHeart className="w-6 h-6" />
              ) : (
                <HiOutlineHeart className="w-6 h-6" />
              )}
              <span>{post.likes?.length || 0}</span>
            </button>

            {/* Comments */}
            <div className="flex items-center gap-2 text-gray-400">
              <HiChat className="w-6 h-6" />
              <span>{post.commentCount || 0}</span>
            </div>

            {/* Views */}
            <span className="text-gray-500 text-sm">
              {post.views} views
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
              className={`p-2 rounded-lg transition-colors ${
                userInteraction.bookmarked 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-400 hover:text-primary hover:bg-dark-100'
              }`}
            >
              {userInteraction.bookmarked ? (
                <HiBookmark className="w-5 h-5" />
              ) : (
                <HiOutlineBookmark className="w-5 h-5" />
              )}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-dark-100 transition-colors"
            >
              <HiShare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </article>

      {/* Author Card */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">About the Author</h3>
        <Link 
          to={`/user/${post.author.username}`}
          className="flex items-center gap-4"
        >
          <Avatar 
            src={post.author.avatar} 
            alt={post.author.displayName}
            size="lg"
          />
          <div>
            <p className="font-semibold text-gray-100">{post.author.displayName}</p>
            <p className="text-sm text-gray-500">@{post.author.username}</p>
            {post.author.bio && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{post.author.bio}</p>
            )}
          </div>
        </Link>
      </div>

      {/* Comments Section */}
      <CommentSection postId={post._id} isLocked={post.isLocked} />
    </motion.div>
  );
};

export default PostPage;
