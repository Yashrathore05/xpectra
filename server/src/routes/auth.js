/**
 * Authentication Routes
 * Endpoints for user authentication and dashboard access
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middlewares/auth');

// POST /api/auth/register - Register a new user
router.post('/register', authController.register);

// POST /api/auth/login - User login
router.post('/login', authController.login);

// POST /api/auth/logout - User logout
router.post('/logout', authController.logout);

// POST /api/auth/refresh-token - Refresh JWT token
router.post('/refresh-token', authController.refreshToken);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', authController.resetPassword);

// GET /api/auth/me - Get current user info (requires auth)
router.get('/me', authenticateJWT, authController.getCurrentUser);

// PUT /api/auth/me - Update current user info (requires auth)
router.put('/me', authenticateJWT, authController.updateCurrentUser);

// PUT /api/auth/change-password - Change password (requires auth)
router.put('/change-password', authenticateJWT, authController.changePassword);

module.exports = router; 