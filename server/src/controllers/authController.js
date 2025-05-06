/**
 * Authentication Controller
 * Handles user registration, login, and account management
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createLogger } = require('../utils/logger');

const logger = createLogger();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.register = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Create new user
    const user = new User({
      email,
      name
    });
    
    // Set password (this will hash it)
    user.setPassword(password);
    
    // Save user
    await user.save();
    
    // Generate token
    const token = generateToken(user);
    
    // Don't send password hash back to client
    const userWithoutPassword = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    return res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    logger.error(`User registration error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * User login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.active) {
      return res.status(401).json({ error: 'Account disabled' });
    }
    
    // Validate password
    if (!user.validPassword(password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user);
    
    // Don't send password hash back to client
    const userWithoutPassword = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      lastLogin: user.lastLogin
    };
    
    return res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    logger.error(`User login error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * User logout
 * This is mostly a client-side operation, but we can implement token invalidation if needed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.logout = async (req, res) => {
  // For a simple implementation, we just send success
  // In a more complex system, we would invalidate the token
  return res.json({ success: true });
};

/**
 * Refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }
    
    try {
      // Verify the existing token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find the user
      const user = await User.findById(decoded.id);
      if (!user || !user.active) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }
      
      // Generate a new token
      const newToken = generateToken(user);
      
      return res.json({ token: newToken });
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Request password reset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that the email doesn't exist
      return res.json({ success: true });
    }
    
    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    // TODO: Send email with reset token
    
    return res.json({
      success: true,
      message: 'Password reset instructions sent to email'
    });
  } catch (error) {
    logger.error(`Password reset request error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Reset password with token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password required' });
    }
    
    // Find user with the reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // Set new password
    user.setPassword(password);
    
    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    return res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    logger.error(`Password reset error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get current user info
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already attached to request by the auth middleware
    const user = req.user;
    
    return res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update current user info
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateCurrentUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;
    
    // Find user
    const user = await User.findById(userId);
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();
    
    return res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Change password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    // Find user
    const user = await User.findById(userId);
    
    // Validate current password
    if (!user.validPassword(currentPassword)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Set new password
    user.setPassword(newPassword);
    await user.save();
    
    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
} 