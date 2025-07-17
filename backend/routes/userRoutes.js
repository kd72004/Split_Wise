const express = require('express');
const router = express.Router();
const { signup, login, getMe ,getAllUsers,getDegreeOfConnection , getUserById } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getMe);
// Add to userRoutes.js
router.get('/all', auth , getAllUsers);
router.get('/degree/:myUserId/:targetId',auth, getDegreeOfConnection);
router.get('/:id', auth, getUserById);
module.exports = router; 