import Comment from '../models/Comment.model.js';
import Post from '../models/Post.model.js';
import { asyncHandler, createPagination } from '../utils/helpers.js';

/**
 * @desc    Create a new comment
 * @route   POST /api/comments
 * @access  Private
 */
export const createComment = asyncHandler(async (req, res) => {
  const { content, postId, parentComment } = req.body;

  // Verify post exists and is not locked
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  if (post.isLocked) {
    return res.status(403).json({
      success: false,
      message: 'This post is locked and cannot receive new comments'
    });
  }

  // If parentComment is provided, verify it exists
  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found'
      });
    }
  }

  const comment = await Comment.create({
    content,
    post: postId,
    author: req.user._id,
    parentComment: parentComment || null
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate('author', 'username displayName avatar');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    comment: populatedComment
  });
});

/**
 * @desc    Get comments for a post
 * @route   GET /api/comments/post/:postId
 * @access  Public
 */
export const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || 'newest';

  // Verify post exists
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Get only top-level comments (parentComment: null)
  const query = {
    post: postId,
    parentComment: null,
    status: 'active'
  };

  // Sort options
  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  if (sort === 'popular') sortOption = { 'likes.length': -1, createdAt: -1 };

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .populate('author', 'username displayName avatar')
      .populate({
        path: 'replies',
        match: { status: 'active' },
        populate: { path: 'author', select: 'username displayName avatar' },
        options: { sort: { createdAt: 1 }, limit: 3 }
      })
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Comment.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    comments,
    pagination: createPagination(page, limit, total)
  });
});

/**
 * @desc    Get replies for a comment
 * @route   GET /api/comments/:commentId/replies
 * @access  Public
 */
export const getCommentReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {
    parentComment: commentId,
    status: 'active'
  };

  const [replies, total] = await Promise.all([
    Comment.find(query)
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    replies,
    pagination: createPagination(page, limit, total)
  });
});

/**
 * @desc    Update a comment
 * @route   PUT /api/comments/:id
 * @access  Private (author only)
 */
export const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  // Check ownership
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this comment'
    });
  }

  comment.content = content;
  await comment.save();

  const updatedComment = await Comment.findById(id)
    .populate('author', 'username displayName avatar');

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    comment: updatedComment
  });
});

/**
 * @desc    Delete a comment (soft delete)
 * @route   DELETE /api/comments/:id
 * @access  Private (author only)
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  // Check ownership
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this comment'
    });
  }

  // Soft delete
  comment.status = 'deleted';
  comment.content = '[This comment has been deleted]';
  await comment.save();

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

/**
 * @desc    Like/Unlike a comment
 * @route   POST /api/comments/:id/like
 * @access  Private
 */
export const toggleCommentLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  const isLiked = comment.likes.includes(req.user._id);

  if (isLiked) {
    comment.likes = comment.likes.filter(userId => !userId.equals(req.user._id));
  } else {
    comment.likes.push(req.user._id);
    // Remove from dislikes if was disliked
    comment.dislikes = comment.dislikes.filter(userId => !userId.equals(req.user._id));
  }

  await comment.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: isLiked ? 'Comment unliked' : 'Comment liked',
    liked: !isLiked,
    likeCount: comment.likes.length
  });
});

export default {
  createComment,
  getPostComments,
  getCommentReplies,
  updateComment,
  deleteComment,
  toggleCommentLike
};
