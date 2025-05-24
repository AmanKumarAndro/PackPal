
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const Trip = require('../models/Trip');
const PackingList = require('../models/PackingList');
const User = require('../models/User');
require('dotenv').config();
const {
    getGeminiModel,
    genAI
} = require('../config/gemini');
// Create a new trip
const createTrip = async (req, res) => {
  try {
    const { destination, dates, tripType } = req.body;
    console.log(req.body);
    
    // Calculate duration
    const startDate = new Date(dates.startDate);
    const endDate = new Date(dates.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    const trip = new Trip({
      user: req.user._id,
      destination,
      dates: {
        ...dates,
        duration
      },
      tripType
    });

    await trip.save();

    // Add trip to user's trips array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { trips: trip._id }
    });

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating trip' });
    console.log(error);
  }
};

// Get user's trips
const getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id })
      .populate('packingList')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      trips
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching trips' });
  }
};

// Get single trip
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('packingList');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json({
      success: true,
      trip
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching trip' });
  }
};

// Update trip
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json({
      success: true,
      message: 'Trip updated successfully',
      trip
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating trip' });
  }
};

// Delete trip
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Remove from user's trips array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { trips: trip._id }
    });

    // Delete associated packing list
    if (trip.packingList) {
      await PackingList.findByIdAndDelete(trip.packingList);
    }

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting trip' });
  }
};

// Get weather for trip destination
const getTripWeather = async (req, res) => {
  try {
    const trip = await Trip.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

      const { city, country } = trip.destination;
      console.log(process.env.OPENWEATHER_API_KEY);
    const weatherResponse = await axios.get(
      `http://api.openweathermap.org/data/2.5/forecast?q=${city},${country}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    const forecast = weatherResponse.data.list.map(item => ({
      date: new Date(item.dt * 1000),
      temperature: {
        min: item.main.temp_min,
        max: item.main.temp_max
      },
      condition: item.weather[0].description,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed
    }));

    // Update trip with weather data
    trip.weather.forecast = forecast;
    await trip.save();

    res.json({
      success: true,
      weather: forecast
    });
  } catch (error) {
      console.log(error);
    res.status(500).json({ success: false, message: 'Error fetching weather' });
  }
};

// Generate AI suggestions for trip
const generateAISuggestions = async (req, res) => {
  try {
    const trip = await Trip.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" }); 
    
    const { destination, dates, tripType } = trip;
    
    // Generate packing recommendations
    const packingPrompt = `Generate packing recommendations for a ${tripType} trip to ${destination.city}, ${destination.country} from ${dates.startDate} to ${dates.endDate}. Consider the weather and trip duration.`;
    
    // Generate travel tips
    const tipsPrompt = `Provide helpful travel tips for visiting ${destination.city}, ${destination.country} for a ${tripType} trip. Include local customs, transportation, and safety tips.`;
    
    // Generate attractions
    const attractionsPrompt = `Suggest top attractions and activities in ${destination.city}, ${destination.country} for a ${tripType} trip. Include brief descriptions and ratings.`;

    const [packingResult, tipsResult, attractionsResult] = await Promise.all([
      model.generateContent(packingPrompt),
      model.generateContent(tipsPrompt),
      model.generateContent(attractionsPrompt)
    ]);

    const aiSuggestions = {
      packingRecommendations: packingResult.response.text(),
      travelTips: tipsResult.response.text(),
      localAttractions: attractionsResult.response.text()
    };

    // Update trip with AI suggestions
    trip.aiSuggestions = aiSuggestions;
    await trip.save();

    res.json({
      success: true,
      aiSuggestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating AI suggestions' });
    console.log(error);
  }
};

// Get public trips (for sharing/feedback)
const getPublicTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ isPublic: true })
      .populate('user', 'name')
      .populate('packingList')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      trips
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching public trips' });
  }
};

// Toggle trip visibility
const toggleTripVisibility = async (req, res) => {
  try {
    const trip = await Trip.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    trip.isPublic = !trip.isPublic;
    await trip.save();

    res.json({
      success: true,
      message: `Trip is now ${trip.isPublic ? 'public' : 'private'}`,
      isPublic: trip.isPublic
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating trip visibility' });
  }
};

module.exports = {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripWeather,
  generateAISuggestions,
  getPublicTrips,
  toggleTripVisibility
};
