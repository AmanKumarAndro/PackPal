const express = require('express');
const { 
  UserLogin, 
  UserRegister, 
  UserLogout, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const authRouter = express.Router();

// Public routes
authRouter.post('/login', UserLogin);
authRouter.post('/register', UserRegister);
authRouter.post('/logout', UserLogout);

// Protected routes
authRouter.get('/profile', authMiddleware, getUserProfile);
authRouter.put('/profile', authMiddleware, updateUserProfile);

module.exports = authRouter;
