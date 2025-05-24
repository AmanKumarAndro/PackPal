import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Auth API calls
export const authAPI = {
  login: (email, password) => API.post('/auth/login', { email, password }),
  register: (name, email, password) => API.post('/auth/register', { name, email, password }),
  logout: () => API.post('/auth/logout'),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
};

// Trip API calls
export const tripAPI = {
  createTrip: (tripData) => API.post('/trips', tripData),
  getUserTrips: () => API.get('/trips'),
  getTripById: (id) => API.get(`/trips/${id}`),
  updateTrip: (id, tripData) => API.put(`/trips/${id}`, tripData),
  deleteTrip: (id) => API.delete(`/trips/${id}`),
  getTripWeather: (id) => API.get(`/trips/${id}/weather`),
  generateAISuggestions: (id) => API.post(`/trips/${id}/ai-suggestions`),
  getPublicTrips: () => API.get('/trips/public'),
  toggleTripVisibility: (id) => API.patch(`/trips/${id}/visibility`),
};

// Packing API calls
export const packingAPI = {
  createPackingList: (tripId) => API.post(`/packing/trip/${tripId}`),
  getPackingList: (tripId) => API.get(`/packing/trip/${tripId}`),
  generateAIPackingList: (tripId) => API.post(`/packing/trip/${tripId}/ai-generate`, { prompt }),
  addCategory: (tripId, name) => API.post(`/packing/trip/${tripId}/category`, { name }),
  deleteCategory: (tripId, categoryId) => API.delete(`/packing/trip/${tripId}/category/${categoryId}`),
  addItem: (tripId, categoryId, itemData) => API.post(`/packing/trip/${tripId}/category/${categoryId}/item`, itemData),
  toggleItemPacked: (tripId, categoryId, itemId) => API.patch(`/packing/trip/${tripId}/category/${categoryId}/item/${itemId}/toggle`),
  updateItem: (tripId, categoryId, itemId, itemData) => API.put(`/packing/trip/${tripId}/category/${categoryId}/item/${itemId}`, itemData),
  deleteItem: (tripId, categoryId, itemId) => API.delete(`/packing/trip/${tripId}/category/${categoryId}/item/${itemId}`),
};

// Feedback API calls
export const feedbackAPI = {
  createFeedback: (feedbackData) => API.post('/feedback', feedbackData),
  getPublicFeedback: () => API.get('/feedback/public'),
  getUserFeedback: () => API.get('/feedback/my-feedback'),
  getTripFeedback: (tripId) => API.get(`/feedback/trip/${tripId}`),
  updateFeedback: (id, feedbackData) => API.put(`/feedback/${id}`, feedbackData),
  deleteFeedback: (id) => API.delete(`/feedback/${id}`),
  toggleFeedbackLike: (id) => API.patch(`/feedback/${id}/like`),
  getFeedbackStats: () => API.get('/feedback/stats'),
  getTopRatedFeedback: () => API.get('/feedback/top-rated'),
  getRecentFeedback: () => API.get('/feedback/recent'),
};

