import express from 'express';
import {
  createComment,
  getPostComments,
  getCommentReplies,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.js';
import { createCommentValidation, paginationValidation } from '../middleware/validators.js';

const router = express.Router();

// Public routes
router.get('/post/:postId', paginationValidation, getPostComments);
router.get('/:commentId/replies', paginationValidation, getCommentReplies);

// Protected routes
router.post('/', protect, createCommentValidation, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleCommentLike);

export default router;
