const express = require('express');
const {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripWeather,
  generateAISuggestions,
  getPublicTrips,
  toggleTripVisibility
} = require('../controllers/tripController');
const authMiddleware = require('../middleware/auth');

const tripRouter = express.Router();

// Public routes
tripRouter.get('/public', getPublicTrips);

// Protected routes
tripRouter.post('/', authMiddleware, createTrip);
tripRouter.get('/', authMiddleware, getUserTrips);
tripRouter.get('/:id', authMiddleware, getTripById);
tripRouter.put('/:id', authMiddleware, updateTrip);
tripRouter.delete('/:id', authMiddleware, deleteTrip);
tripRouter.get('/:id/weather', authMiddleware, getTripWeather);
tripRouter.post('/:id/ai-suggestions', authMiddleware, generateAISuggestions);
tripRouter.patch('/:id/visibility', authMiddleware, toggleTripVisibility);

module.exports = tripRouter;