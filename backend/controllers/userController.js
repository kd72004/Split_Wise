const User = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const  findDegreeOfConnection  = require('./userDegree'); 

// @desc    Register user
// @route   POST /api/users/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10); // generate the random string which is 2 race 10 times slower to crack it 
    const hashedPassword = await bcrypt.hash(password, salt); // hash this random string and password together so no rainbow table can be used to crack it 

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    if (user) {
      res.status(201).json({
        userId: user._id,
        message: 'User registered successfully'
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password); // read the salt from the database password and then hash this current password with the salt and then check same or not 
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      userId: user._id,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to userController.js
const getDegreeOfConnection = async (req, res) => {
  try {
    const { myUserId, targetId } = req.params;
    
    const degree = await findDegreeOfConnection(myUserId, targetId);
    
    res.json({ degree });
  } catch (error) {
    console.error('Find degree error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to userController.js
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email mutualFriends')
      .populate('mutualFriends', 'name');
    
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user info by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('name email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  signup,
  login,
  getMe,
  getAllUsers,
  getDegreeOfConnection,
  getUserById
}; 