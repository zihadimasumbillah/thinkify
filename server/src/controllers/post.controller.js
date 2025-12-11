import Post from '../models/Post.model.js';
import Category from '../models/Category.model.js';
import { asyncHandler, createPagination } from '../utils/helpers.js';

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags, coverImage, status } = req.body;

  // Verify category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  const post = await Post.create({
    title,
    content,
    category,
    tags: tags || [],
    coverImage: coverImage || '',
    status: status || 'published',
    author: req.user._id
  });

  // Update category post count
  await Category.findByIdAndUpdate(category, { $inc: { postCount: 1 } });

  const populatedPost = await Post.findById(post._id)
    .populate('author', 'username displayName avatar')
    .populate('category', 'name slug icon color');

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    post: populatedPost
  });
});

/**
 * @desc    Get all posts with filters
 * @route   GET /api/posts
 * @access  Public
 */
export const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { category, tag, sort, search } = req.query;

  // Build query
  const query = { status: 'published' };

  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) query.category = cat._id;
  }

  if (tag) {
    query.tags = { $in: [tag.toLowerCase()] };
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Build sort
  let sortOption = { createdAt: -1 };
  switch (sort) {
    case 'popular':
      sortOption = { views: -1, createdAt: -1 };
      break;
    case 'trending':
      sortOption = { lastActivity: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'most-liked':
      sortOption = { 'likes.length': -1, createdAt: -1 };
      break;
  }

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'username displayName avatar')
      .populate('category', 'name slug icon color')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    posts,
    pagination: createPagination(page, limit, total)
  });
});

/**
 * @desc    Get single post by slug
 * @route   GET /api/posts/:slug
 * @access  Public
 */
export const getPost = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const post = await Post.findOne({ slug })
    .populate('author', 'username displayName avatar bio reputation')
    .populate('category', 'name slug icon color description')
    .populate({
      path: 'likes',
      select: 'username displayName avatar'
    });

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Increment views
  post.views += 1;
  await post.save({ validateBeforeSave: false });

  // Check if current user has liked/bookmarked
  let userInteraction = { liked: false, bookmarked: false };
  if (req.user) {
    userInteraction.liked = post.likes.some(like => like._id.equals(req.user._id));
    userInteraction.bookmarked = req.user.bookmarks.includes(post._id);
  }

  res.status(200).json({
    success: true,
    post,
    userInteraction
  });
});

/**
 * @desc    Update a post
 * @route   PUT /api/posts/:id
 * @access  Private (author only)
 */
export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, category, tags, coverImage, status } = req.body;

  let post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Check ownership
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this post'
    });
  }

  // Update fields
  if (title) post.title = title;
  if (content) post.content = content;
  if (category) post.category = category;
  if (tags) post.tags = tags;
  if (coverImage !== undefined) post.coverImage = coverImage;
  if (status) post.status = status;

  await post.save();

  const updatedPost = await Post.findById(id)
    .populate('author', 'username displayName avatar')
    .populate('category', 'name slug icon color');

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    post: updatedPost
  });
});

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private (author only)
 */
export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Check ownership
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this post'
    });
  }

  // Update category post count
  await Category.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } });

  await post.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
});

/**
 * @desc    Like/Unlike a post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const isLiked = post.likes.includes(req.user._id);

  if (isLiked) {
    post.likes = post.likes.filter(userId => !userId.equals(req.user._id));
    // Remove from dislikes if present
    post.dislikes = post.dislikes.filter(userId => !userId.equals(req.user._id));
  } else {
    post.likes.push(req.user._id);
    // Remove from dislikes if was disliked
    post.dislikes = post.dislikes.filter(userId => !userId.equals(req.user._id));
  }

  await post.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: isLiked ? 'Post unliked' : 'Post liked',
    liked: !isLiked,
    likeCount: post.likes.length
  });
});

/**
 * @desc    Get trending posts
 * @route   GET /api/posts/trending
 * @access  Public
 */
export const getTrendingPosts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const posts = await Post.aggregate([
    { $match: { status: 'published' } },
    {
      $addFields: {
        score: {
          $add: [
            { $multiply: [{ $size: '$likes' }, 3] },
            '$views',
            { $multiply: ['$commentCount', 5] }
          ]
        }
      }
    },
    { $sort: { score: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [{ $project: { username: 1, displayName: 1, avatar: 1 } }]
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
        pipeline: [{ $project: { name: 1, slug: 1, icon: 1, color: 1 } }]
      }
    },
    { $unwind: '$author' },
    { $unwind: '$category' }
  ]);

  res.status(200).json({
    success: true,
    posts
  });
});

/**
 * @desc    Get posts feed for authenticated user
 * @route   GET /api/posts/feed
 * @access  Private
 */
export const getFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get posts from users the current user follows, plus their own posts
  const followingIds = [...req.user.following, req.user._id];

  const query = {
    author: { $in: followingIds },
    status: 'published'
  };

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'username displayName avatar')
      .populate('category', 'name slug icon color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    posts,
    pagination: createPagination(page, limit, total)
  });
});

export default {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  getTrendingPosts,
  getFeed
};
