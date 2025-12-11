import express from 'express';
import {
  getUserProfile,
  updateProfile,
  followUser,
  getUserPosts,
  getBookmarks,
  toggleBookmark,
  searchUsers
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.js';
import { updateProfileValidation, paginationValidation } from '../middleware/validators.js';

const router = express.Router();

// Public routes
router.get('/search', paginationValidation, searchUsers);
router.get('/:username', getUserProfile);
router.get('/:username/posts', paginationValidation, getUserPosts);

// Protected routes
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.post('/:userId/follow', protect, followUser);
router.get('/me/bookmarks', protect, paginationValidation, getBookmarks);
router.post('/bookmarks/:postId', protect, toggleBookmark);

export default router;
