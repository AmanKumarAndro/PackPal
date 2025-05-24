const Feedback = require('../models/Feedback');
const Trip = require('../models/Trip');

// Create feedback
const createFeedback = async (req, res) => {
  try {
    const { tripId, rating, comment, category } = req.body;

    // Verify trip exists if tripId is provided
    if (tripId) {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }
    }

    const feedback = new Feedback({
      user: req.user._id,
      trip: tripId || null,
      rating,
      comment,
      category
    });

    await feedback.save();

    // Populate user info for response
    await feedback.populate('user', 'name');
    if (tripId) {
      await feedback.populate('trip', 'destination dates tripType');
    }

    res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating feedback' });
    console.log(error);
  }
};

// Get all public feedback
const getPublicFeedback = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = { isPublic: true };
    
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    
    const feedback = await Feedback.find(query)
      .populate('user', 'name')
      .populate('trip', 'destination dates tripType')
      .sort({ createdAt: -1, likes: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching feedback' });
  }
};

// Get user's feedback
const getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .populate('trip', 'destination dates tripType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user feedback' });
  }
};

// Get feedback for a specific trip
const getTripFeedback = async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const feedback = await Feedback.find({ 
      trip: tripId, 
      isPublic: true 
    })
      .populate('user', 'name')
      .sort({ createdAt: -1, likes: -1 });

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching trip feedback' });
  }
};

// Update feedback
const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, category, isPublic } = req.body;

    const feedback = await Feedback.findOne({ 
      _id: id, 
      user: req.user._id 
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Update fields if provided
    if (rating !== undefined) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;
    if (category !== undefined) feedback.category = category;
    if (isPublic !== undefined) feedback.isPublic = isPublic;

    await feedback.save();

    // Populate for response
    await feedback.populate('user', 'name');
    if (feedback.trip) {
      await feedback.populate('trip', 'destination dates tripType');
    }

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating feedback' });
  }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findOneAndDelete({ 
      _id: id, 
      user: req.user._id 
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting feedback' });
  }
};

// Like/Unlike feedback
const toggleFeedbackLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const hasLiked = feedback.likedBy.includes(userId);

    if (hasLiked) {
      // Unlike
      feedback.likedBy.pull(userId);
      feedback.likes = Math.max(0, feedback.likes - 1);
    } else {
      // Like
      feedback.likedBy.push(userId);
      feedback.likes += 1;
    }

    await feedback.save();

    res.json({
      success: true,
      message: hasLiked ? 'Feedback unliked' : 'Feedback liked',
      liked: !hasLiked,
      likes: feedback.likes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating like status' });
  }
};

// Get feedback statistics
const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalLikes: { $sum: '$likes' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalFeedback = await Feedback.countDocuments();
    const publicFeedback = await Feedback.countDocuments({ isPublic: true });
    const averageOverallRating = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        byCategory: stats,
        total: totalFeedback,
        public: publicFeedback,
        averageRating: averageOverallRating[0]?.averageRating || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching feedback stats' });
  }
};

// Get top rated feedback
const getTopRatedFeedback = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const feedback = await Feedback.find({ 
      isPublic: true,
      rating: { $gte: 4 }
    })
      .populate('user', 'name')
      .populate('trip', 'destination dates tripType')
      .sort({ rating: -1, likes: -1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching top rated feedback' });
  }
};

// Get recent feedback
const getRecentFeedback = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const feedback = await Feedback.find({ isPublic: true })
      .populate('user', 'name')
      .populate('trip', 'destination dates tripType')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching recent feedback' });
  }
};

module.exports = {
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
};
