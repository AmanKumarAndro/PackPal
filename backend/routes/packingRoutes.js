const express = require('express');
const {
  createPackingList,
  getPackingList,
  generateAIPackingList,
  addCategory,
  addItem,
  toggleItemPacked,
  updateItem,
  deleteItem,
  deleteCategory
} = require('../controllers/packingController');
const authMiddleware = require('../middleware/auth');

const packingListRouter = express.Router();

// All routes are protected
packingListRouter.use(authMiddleware);

// Packing list routes
packingListRouter.post('/trip/:tripId', createPackingList);
packingListRouter.get('/trip/:tripId', getPackingList);
packingListRouter.post('/trip/:tripId/ai-generate', generateAIPackingList);

// Category routes
packingListRouter.post('/trip/:tripId/category', addCategory);
packingListRouter.delete('/trip/:tripId/category/:categoryId', deleteCategory);

// Item routes
packingListRouter.post('/trip/:tripId/category/:categoryId/item', addItem);
packingListRouter.patch('/trip/:tripId/category/:categoryId/item/:itemId/toggle', toggleItemPacked);
packingListRouter.put('/trip/:tripId/category/:categoryId/item/:itemId', updateItem);
packingListRouter.delete('/trip/:tripId/category/:categoryId/item/:itemId', deleteItem);

module.exports = packingListRouter;