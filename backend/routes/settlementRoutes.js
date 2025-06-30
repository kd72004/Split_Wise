const express = require('express');
const router = express.Router();
const { getUnsettledTransactions, settleGroup, getUserSettlements, settlePayment } = require('../controllers/settlementController');
const auth = require('../middleware/auth');

// Protected routes
router.get('/unsettled', auth, getUnsettledTransactions);
router.post('/:groupId', auth, settleGroup);

// Get all settlements (settled and unsettled) for a user in a group
router.get('/user', getUserSettlements);

// Mark a settlement as settled
router.patch('/settle/:id', settlePayment);

module.exports = router;



