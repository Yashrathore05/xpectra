/**
 * User Model
 * For dashboard authentication and access control
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'readonly'],
    default: 'user'
  },
  sites: [{
    type: String,
    ref: 'Site'
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date,
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Method to set password
UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.passwordHash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

// Method to validate password
UserSchema.methods.validPassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.passwordHash === hash;
};

// Method to generate a password reset token
UserSchema.methods.generatePasswordResetToken = function() {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return this.resetPasswordToken;
};

// Pre-save hook to ensure email uniqueness
UserSchema.pre('save', async function(next) {
  if (!this.isModified('email')) return next();

  try {
    const user = await this.constructor.findOne({ email: this.email });
    if (user && this._id.toString() !== user._id.toString()) {
      return next(new Error('Email already in use'));
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User; 