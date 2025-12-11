import express from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  getTrendingPosts,
  getFeed
} from '../controllers/post.controller.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { createPostValidation, updatePostValidation, paginationValidation } from '../middleware/validators.js';

const router = express.Router();

// Public routes
router.get('/', paginationValidation, getPosts);
router.get('/trending', getTrendingPosts);
router.get('/:slug', optionalAuth, getPost);

// Protected routes
router.post('/', protect, createPostValidation, createPost);
router.get('/user/feed', protect, paginationValidation, getFeed);
router.put('/:id', protect, updatePostValidation, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);

export default router;
