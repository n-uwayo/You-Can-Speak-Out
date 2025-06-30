// routes/authRoutes.ts
import express from 'express';

import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  getUserStats
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth.middleware';
import { changePasswordValidation, loginValidation, registerValidation, updateProfileValidation } from '../middleware/validation.middleware';

const router = express.Router();

// Validation rules


// Public routes (no authentication required)
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes (authentication required)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfileValidation, updateProfile);
router.put('/change-password', authMiddleware, changePasswordValidation, changePassword);
router.post('/refresh-token', authMiddleware, refreshToken);
router.post('/logout', authMiddleware, logout);
router.get('/stats', authMiddleware, getUserStats);

export default router;