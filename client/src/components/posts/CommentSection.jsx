import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHeart, HiOutlineHeart, HiReply, HiChevronDown, HiLockClosed } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { CommentSkeleton } from '../common/Skeleton';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

const CommentSection = ({ postId, isLocked }) => {
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  // Fetch comments
  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId, sortBy],
    queryFn: async () => {
      const response = await api.get(`/comments/post/${postId}?sort=${sortBy}`);
      return response.data;
    },
  });

  // Create comment mutation
  const createMutation = useMutation({
    mutationFn: async (content) => {
      const response = await api.post('/comments', { content, postId });
      return response.data;
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['post']);
      toast.success('Comment added!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    createMutation.mutate(newComment);
  };

  const comments = data?.comments || [];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-100">
          Comments ({data?.pagination?.totalItems || 0})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm bg-dark-300 border border-dark-50 rounded-lg px-3 py-1.5 text-gray-300 focus:outline-none focus:border-primary"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Liked</option>
        </select>
      </div>

      {/* Add Comment Form */}
      {isLocked ? (
        <div className="flex items-center gap-2 p-4 bg-dark-300 rounded-lg text-gray-500 mb-6">
          <HiLockClosed className="w-5 h-5" />
          <span>This discussion is locked. No new comments can be added.</span>
        </div>
      ) : isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <Avatar src={user?.avatar} alt={user?.displayName} size="sm" />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="input resize-none mb-2"
                maxLength={2000}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {newComment.length}/2000
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim()}
                  isLoading={createMutation.isPending}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-dark-300 rounded-lg text-center">
          <p className="text-gray-400 mb-3">Login to join the conversation</p>
          <Link to="/login">
            <Button size="sm">Login</Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} postId={postId} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// Individual Comment Component
const CommentItem = ({ comment, postId, isReply = false }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  // Fetch replies
  const { data: repliesData, isLoading: repliesLoading } = useQuery({
    queryKey: ['replies', comment._id],
    queryFn: async () => {
      const response = await api.get(`/comments/${comment._id}/replies`);
      return response.data;
    },
    enabled: showReplies,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => api.post(`/comments/${comment._id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['replies', comment.parentComment]);
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async (content) => {
      const response = await api.post('/comments', {
        content,
        postId,
        parentComment: comment._id,
      });
      return response.data;
    },
    onSuccess: () => {
      setReplyContent('');
      setShowReplyForm(false);
      queryClient.invalidateQueries(['replies', comment._id]);
      queryClient.invalidateQueries(['comments', postId]);
      toast.success('Reply added!');
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('Please login to like comments');
      return;
    }
    likeMutation.mutate();
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    replyMutation.mutate(replyContent);
  };

  const isLiked = comment.likes?.some((id) => id === user?._id || id._id === user?._id);

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return commentDate.toLocaleDateString();
  };

  const replies = repliesData?.replies || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={isReply ? 'ml-8 border-l-2 border-dark-50 pl-4' : ''}
    >
      <div className="flex gap-3">
        <Link to={`/user/${comment.author?.username}`}>
          <Avatar
            src={comment.author?.avatar}
            alt={comment.author?.displayName}
            size={isReply ? 'xs' : 'sm'}
          />
        </Link>
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/user/${comment.author?.username}`}
              className="font-medium text-gray-200 hover:text-primary transition-colors text-sm"
            >
              {comment.author?.displayName || comment.author?.username}
            </Link>
            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            {comment.isEdited && (
              <span className="text-xs text-gray-600">(edited)</span>
            )}
          </div>

          {/* Content */}
          <p className={`text-gray-300 ${comment.status === 'deleted' ? 'italic text-gray-500' : ''}`}>
            {comment.content}
          </p>

          {/* Actions */}
          {comment.status === 'active' && (
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                {isLiked ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
                {comment.likes?.length || 0}
              </button>

              {!isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  <HiReply className="w-4 h-4" />
                  Reply
                </button>
              )}
            </div>
          )}

          {/* Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleReply}
                className="mt-3"
              >
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to @${comment.author?.username}...`}
                  rows={2}
                  className="input resize-none text-sm mb-2"
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyContent.trim()}
                    isLoading={replyMutation.isPending}
                  >
                    Reply
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Show Replies Toggle */}
          {!isReply && comment.replyCount > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
            >
              <HiChevronDown className={`w-4 h-4 transition-transform ${showReplies ? 'rotate-180' : ''}`} />
              {showReplies ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {/* Replies */}
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-3"
              >
                {repliesLoading ? (
                  <CommentSkeleton />
                ) : (
                  replies.map((reply) => (
                    <CommentItem key={reply._id} comment={reply} postId={postId} isReply />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentSection;
