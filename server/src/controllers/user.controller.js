import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import { asyncHandler, createPagination } from '../utils/helpers.js';

/**
 * @desc    Get user profile by username
 * @route   GET /api/users/:username
 * @access  Public
 */
export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username })
    .select('-email -preferences')
    .populate('followers', 'username displayName avatar')
    .populate('following', 'username displayName avatar');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get post count
  const postCount = await Post.countDocuments({ author: user._id, status: 'published' });

  res.status(200).json({
    success: true,
    user: {
      ...user.toObject(),
      postCount,
      followerCount: user.followers.length,
      followingCount: user.following.length
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { displayName, bio, avatar, preferences } = req.body;

  const updateFields = {};
  if (displayName !== undefined) updateFields.displayName = displayName;
  if (bio !== undefined) updateFields.bio = bio;
  if (avatar !== undefined) updateFields.avatar = avatar;
  if (preferences !== undefined) updateFields.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateFields,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

/**
 * @desc    Follow a user
 * @route   POST /api/users/:userId/follow
 * @access  Private
 */
export const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself'
    });
  }

  const userToFollow = await User.findById(userId);

  if (!userToFollow) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if already following
  const isFollowing = req.user.following.includes(userId);

  if (isFollowing) {
    // Unfollow
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { followers: req.user._id } });

    return res.status(200).json({
      success: true,
      message: `Unfollowed @${userToFollow.username}`,
      isFollowing: false
    });
  } else {
    // Follow
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: userId } });
    await User.findByIdAndUpdate(userId, { $addToSet: { followers: req.user._id } });

    return res.status(200).json({
      success: true,
      message: `Now following @${userToFollow.username}`,
      isFollowing: true
    });
  }
});

/**
 * @desc    Get user's posts
 * @route   GET /api/users/:username/posts
 * @access  Public
 */
export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const query = { author: user._id, status: 'published' };

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

/**
 * @desc    Get user's bookmarks
 * @route   GET /api/users/bookmarks
 * @access  Private
 */
export const getBookmarks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const user = await User.findById(req.user._id).populate({
    path: 'bookmarks',
    populate: [
      { path: 'author', select: 'username displayName avatar' },
      { path: 'category', select: 'name slug icon color' }
    ],
    options: {
      sort: { createdAt: -1 },
      skip: (page - 1) * limit,
      limit: limit
    }
  });

  const total = req.user.bookmarks.length;

  res.status(200).json({
    success: true,
    bookmarks: user.bookmarks,
    pagination: createPagination(page, limit, total)
  });
});

/**
 * @desc    Bookmark/Unbookmark a post
 * @route   POST /api/users/bookmarks/:postId
 * @access  Private
 */
export const toggleBookmark = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  const isBookmarked = req.user.bookmarks.includes(postId);

  if (isBookmarked) {
    await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: postId } });
    return res.status(200).json({
      success: true,
      message: 'Post removed from bookmarks',
      isBookmarked: false
    });
  } else {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarks: postId } });
    return res.status(200).json({
      success: true,
      message: 'Post added to bookmarks',
      isBookmarked: true
    });
  }
});

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Public
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }

  const query = {
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { displayName: { $regex: q, $options: 'i' } }
    ]
  };

  const [users, total] = await Promise.all([
    User.find(query)
      .select('username displayName avatar bio reputation')
      .skip(skip)
      .limit(limit),
    User.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    users,
    pagination: createPagination(page, limit, total)
  });
});

export default {
  getUserProfile,
  updateProfile,
  followUser,
  getUserPosts,
  getBookmarks,
  toggleBookmark,
  searchUsers
};
