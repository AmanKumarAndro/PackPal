
const PackingList = require('../models/PackingList');
const Trip = require('../models/Trip');
const {
    getGeminiModel, genAI
} = require('../config/gemini');

// Create packing list for a trip
const createPackingList = async (req, res) => {
  try {
    const { tripId } = req.params;
    
    // Check if trip exists and belongs to user
    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if packing list already exists
    if (trip.packingList) {
      return res.status(400).json({ message: 'Packing list already exists for this trip' });
    }

    const packingList = new PackingList({
      trip: tripId,
      categories: []
    });

    await packingList.save();

    // Update trip with packing list reference
    trip.packingList = packingList._id;
    await trip.save();

    res.status(201).json({
      success: true,
      message: 'Packing list created successfully',
      packingList
    });
  } catch (error) {
      console.log(error);
    res.status(500).json({ success: false, message: 'Error creating packing list' });
  }
};

// Get packing list for a trip
const getPackingList = async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const packingList = await PackingList.findOne({ trip: tripId })
      .populate('trip', 'destination dates tripType user');

    if (!packingList) {
      return res.status(404).json({ message: 'Packing list not found' });
    }

    // Check if user owns the trip
    if (packingList.trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      packingList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching packing list' });
  }
};

// Generate AI-powered packing suggestions
const generateAIPackingList = async (req, res) => {
  try {
    const { tripId } = req.params;
    console.log(tripId);
    
    const trip = await Trip.findOne({ _id: tripId, user: req.user._id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" }); 

    
    const prompt = `Create a detailed packing list for a ${trip.tripType} trip to ${trip.destination.city}, ${trip.destination.country} from ${trip.dates.startDate} to ${trip.dates.endDate} (${trip.dates.duration} days).

    Return the response in this exact JSON format:
    {
      "categories": [
        {
          "name": "Clothing",
          "items": [
            {
              "name": "T-shirts",
              "quantity": 3,
              "priority": "essential",
              "aiSuggested": true
            }
          ]
        }
      ]
    }

    Include categories like: Clothing, Electronics, Toiletries, Documents, Accessories, Shoes, Weather Gear, Medications, Entertainment, Food & Snacks.
    Set priority as: essential, important, or optional.
    Consider the weather, trip duration, and trip type.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean the response to extract JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const aiSuggestions = JSON.parse(jsonMatch[0]);

    // Find or create packing list
    let packingList = await PackingList.findOne({ trip: tripId });
    if (!packingList) {
      packingList = new PackingList({
        trip: tripId,
        categories: aiSuggestions.categories
      });
      
      // Update trip with packing list reference
      trip.packingList = packingList._id;
      console.log(trip.packingList);
      await trip.save();
    } else {
      // Merge with existing categories
      packingList.categories = [...packingList.categories, ...aiSuggestions.categories];
    }

    // Calculate completion percentage
    packingList.completionPercentage = calculateCompletionPercentage(packingList.categories);
    await packingList.save();

    res.json({
      success: true,
      message: 'AI packing suggestions generated successfully',
      packingList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating AI packing list' });
    console.log(error);
  }
};

// Add category to packing list
const addCategory = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name } = req.body;

    const packingList = await PackingList.findOne({ trip: tripId })
      .populate('trip', 'user');

    if (!packingList) {
      return res.status(404).json({ message: 'Packing list not found' });
    }

    if (packingList.trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    packingList.categories.push({
      name,
      items: []
    });

    await packingList.save();

    res.json({
      success: true,
      message: 'Category added successfully',
      packingList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding category' });
  }
};

// Add item to category
const addItem = async (req, res) => {
  try {
    const { tripId, categoryId } = req.params;
    const { name, quantity, priority } = req.body;

    const packingList = await PackingList.findOne({ trip: tripId })
      .populate('trip', 'user');

    if (!packingList) {
      return res.status(404).json({ message: 'Packing list not found' });
    }

    if (packingList.trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const category = packingList.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.items.push({
      name,
      quantity: quantity || 1,
      priority: priority || 'important',
      isPacked: false,
      aiSuggested: false
    });

    packingList.completionPercentage = calculateCompletionPercentage(packingList.categories);
    await packingList.save();

    res.json({
      success: true,
      message: 'Item added successfully',
      packingList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding item' });
  }
};

// Toggle item packed status
const toggleItemPacked = async (req, res) => {
  try {
    const { tripId, categoryId, itemId } = req.params;

    const packingList = await PackingList.findOne({ trip: tripId })
      .populate('trip', 'user');

    if (!packingList) {
      return res.status(404).json({ message: 'Packing list not found' });
    }

    if (packingList.trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const category = packingList.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const item = category.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.isPacked = !item.isPacked;
    packingList.completionPercentage = calculateCompletionPercentage(packingList.categories);
    await packingList.save();

    res.json({
      success: true,
      message: `Item marked as ${item.isPacked ? 'packed' : 'unpacked'}`,
      packingList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating item' });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { tripId, categoryId, itemId } = req.params;
    const { name, quantity, priority } = req.body;

    const packingList = await PackingList.findOne({ trip: tripId })
      .populate('trip', 'user');

    if (!packingList) {
      return res.status(404).json({ message: 'Packing list not found' });
    }

    if (packingList.trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const category = packingList.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const item = category.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (name) item.name = name;
    if (quantity) item.quantity = quantity;
    if (priority) item.priority = priority;

    await packingList.save();

    res.json({
      success: true,
      message: 'Item updated successfully',
      packingList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating item' });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const { tripId, categoryId, itemId } = req.params;

    const packingList = await PackingList.findOne({ trip: tripId })
      .populate('trip', 'user');

    if (!packingList) {
      return res.status(404).json({ message: 'Packing list not found' });
    }

    if (packingList.trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const category = packingList.categories.id(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.items.pull(itemId);
    packingList.completionPercentage = calculateCompletionPercentage(packingList.categories);
    await packingList.save();

    res.json({
      success: true,
      message: 'Item deleted successfully',
      packingList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting item' });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { tripId, categoryId } = req.params;

    const packingList = await PackingList.findOne({ trip: tripId })
      .populate('trip', 'user');

    if (!packingList) {
      return res.status(404).json({ message: 'Packing list not found' });
    }

    if (packingList.trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    packingList.categories.pull(categoryId);
    packingList.completionPercentage = calculateCompletionPercentage(packingList.categories);
    await packingList.save();

    res.json({
      success: true,
      message: 'Category deleted successfully',
      packingList
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting category' });
  }
};

// Helper function to calculate completion percentage
const calculateCompletionPercentage = (categories) => {
  if (!categories || categories.length === 0) return 0;
  
  let totalItems = 0;
  let packedItems = 0;
  
  categories.forEach(category => {
    category.items.forEach(item => {
      totalItems++;
      if (item.isPacked) packedItems++;
    });
  });
  
  return totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
};

module.exports = {

  createPackingList,
  getPackingList,
  generateAIPackingList,
  addCategory,
  addItem,
  toggleItemPacked,
  updateItem,
  deleteItem,
  deleteCategory
};