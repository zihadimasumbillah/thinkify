import User from '../models/User.model.js';
import { sendTokenResponse, clearTokenCookie } from '../utils/tokenUtils.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, displayName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === email 
        ? 'Email already registered' 
        : 'Username already taken'
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    displayName: displayName || username
  });

  sendTokenResponse(user, 201, res, 'Registration successful! Welcome to Thinkify.');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Update last active
  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful!');
});

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('followers', 'username displayName avatar')
    .populate('following', 'username displayName avatar');

  res.status(200).json({
    success: true,
    user
  });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

/**
 * @desc    Check if username is available
 * @route   GET /api/auth/check-username/:username
 * @access  Public
 */
export const checkUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const exists = await User.findOne({ username: username.toLowerCase() });

  res.status(200).json({
    success: true,
    available: !exists
  });
});

/**
 * @desc    Check if email is available
 * @route   GET /api/auth/check-email/:email
 * @access  Public
 */
export const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;

  const exists = await User.findOne({ email: email.toLowerCase() });

  res.status(200).json({
    success: true,
    available: !exists
  });
});

export default {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  checkUsername,
  checkEmail
};
