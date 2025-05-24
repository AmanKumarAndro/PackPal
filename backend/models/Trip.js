const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    city: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  dates: {
    startDate: Date,
    endDate: Date,
    duration: Number
  },
  tripType: {
    type: String,
    enum: ['business', 'leisure', 'adventure', 'family', 'solo'],
    required: true
  },
  weather: {
    forecast: [{
      date: Date,
      temperature: {
        min: Number,
        max: Number
      },
      condition: String,
      humidity: Number,
      windSpeed: Number
    }]
  },
  packingList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PackingList'
  },
  attractions: [{
    name: String,
    description: String,
    rating: Number,
    category: String
  }],
  aiSuggestions: {
    packingRecommendations: String,
    travelTips: String,
    localAttractions: String
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
