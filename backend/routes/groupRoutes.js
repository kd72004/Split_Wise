const express = require('express');
const router = express.Router();
const { 
  createGroup, 
  getAllGroups, 
  getGroupById, 
  updateGroup, 
  deleteGroup 
} = require('../controllers/groupController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Group routes
router.post('/', createGroup);
router.get('/', getAllGroups);
router.get('/:id', getGroupById);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

module.exports = router; 