const express = require('express');
const {
  createFeedback,
  getPublicFeedback,
  getUserFeedback,
  getTripFeedback,
  updateFeedback,
  deleteFeedback,
  toggleFeedbackLike,
  getFeedbackStats,
  getTopRatedFeedback,
  getRecentFeedback
} = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/auth');

const feedbackRouter = express.Router();

// Public routes
feedbackRouter.get('/public', getPublicFeedback);
feedbackRouter.get('/trip/:tripId', getTripFeedback);
feedbackRouter.get('/stats', getFeedbackStats);
feedbackRouter.get('/top-rated', getTopRatedFeedback);
feedbackRouter.get('/recent', getRecentFeedback);

// Protected routes
feedbackRouter.post('/', authMiddleware, createFeedback);
feedbackRouter.get('/my-feedback', authMiddleware, getUserFeedback);
feedbackRouter.put('/:id', authMiddleware, updateFeedback);
feedbackRouter.delete('/:id', authMiddleware, deleteFeedback);
feedbackRouter.patch('/:id/like', authMiddleware, toggleFeedbackLike);

module.exports = feedbackRouter;
