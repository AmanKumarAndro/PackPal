
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await Admin.findOne({ email });
    
    if (!user) {
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 30 // 30 minutes
    });

    res.status(200).json({
      success: true,
      role: user.role,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    console.log(error);
  }
};

const UserRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingUser || existingAdmin) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password // Will be hashed by pre-save middleware
    });

    await user.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
    console.log(error);
  }
};

const UserLogout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

const getUserProfile = async (req, res) => {
    try {
      console.log(req.user);
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        trips: user.trips
      }
    });
    } catch (error) {
        console.log(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, profile } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, profile },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { 
  UserLogin, 
  UserRegister, 
  UserLogout, 
  getUserProfile, 
  updateUserProfile 
};

