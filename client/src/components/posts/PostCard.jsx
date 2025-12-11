import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHeart, HiChat, HiEye } from 'react-icons/hi';
import Avatar from '../common/Avatar';

const PostCard = ({ post }) => {
  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.article
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="card-interactive group"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/user/${post.author?.username}`} onClick={(e) => e.stopPropagation()}>
          <Avatar
            src={post.author?.avatar}
            alt={post.author?.displayName || post.author?.username}
            size="sm"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/user/${post.author?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-gray-100 hover:text-primary transition-colors truncate"
            >
              {post.author?.displayName || post.author?.username}
            </Link>
            <span className="text-gray-600">·</span>
            <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
          </div>
          {post.category && (
            <Link
              to={`/category/${post.category.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs hover:underline"
              style={{ color: post.category.color }}
            >
              <span>{post.category.icon}</span>
              {post.category.name}
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <Link to={`/post/${post.slug}`} className="block">
        <h2 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
      </Link>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              to={`/tag/${tag}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-gray-500 hover:text-primary transition-colors"
            >
              #{tag}
            </Link>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-gray-600">+{post.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer - Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-dark-50/50">
        <div className="flex items-center gap-1.5 text-gray-500">
          <HiHeart className="w-4 h-4" />
          <span className="text-sm">{post.likes?.length || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <HiChat className="w-4 h-4" />
          <span className="text-sm">{post.commentCount || 0}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <HiEye className="w-4 h-4" />
          <span className="text-sm">{post.views || 0}</span>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
