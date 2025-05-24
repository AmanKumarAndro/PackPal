const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoutes');
const tripRouter = require('./routes/tripRoutes');
const packingListRouter = require('./routes/packingRoutes');
const feedbackRouter = require('./routes/feedbackRoutes');
require('dotenv').config();


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/trips', tripRouter);
app.use('/api/packing', packingListRouter);
app.use('/api/feedback', feedbackRouter);
app.get('/api/health', (req, res) => {
    res.json({ 
      success: true, 
      message: 'PackPal API is running!',
      timestamp: new Date().toISOString()
    });
  });
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
