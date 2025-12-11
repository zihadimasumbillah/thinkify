import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  checkUsername,
  checkEmail
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../middleware/validators.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/check-username/:username', checkUsername);
router.get('/check-email/:email', checkEmail);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);

export default router;
