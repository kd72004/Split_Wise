const { fetchUnsettledTransactions, processGroupSettlements } = require('../utils/algo');
const ExpenseSheet = require('../model/expenseSheetModel');

// @desc    Get unsettled transactions
// @route   GET /api/settlements/unsettled
// @access  Private
const getUnsettledTransactions = async (req, res) => {
  try {
    // const result = await fetchUnsettledTransactions();
    const groupId = req.params.groupId; 
    const result = await fetchUnsettledTransactions(groupId);
    res.json(result);
  } catch (error) {
    console.error('Get unsettled transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Settle up group
// @route   POST /api/settlements/:groupId
const settleGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    // Get frontend transactions from request body (array of [userId, amount])
    const frontendTransactions = req.body.transactions || [];
    // Call the algo with both backend and frontend transactions
    const settlements = await processGroupSettlements(groupId, frontendTransactions);
    res.json({ settlements });
  } catch (error) {
    console.error('Settle group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all settlements (settled and unsettled) for a user in a group
const getUserSettlements = async (req, res) => {
  try {
    const { groupId, userId } = req.query;
    if (!groupId || !userId) {
      return res.status(400).json({ message: 'groupId and userId are required' });
    }
    // Find settlements where user is either payer or payee
    const settlements = await ExpenseSheet.find({
      groupId,
      $or: [
        { userId }, // user owes
        { payerId: userId } // user is owed
      ]
    })
      .populate('userId', 'name email')
      .populate('payerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(settlements);
  } catch (error) {
    console.error('Get user settlements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a settlement as settled
const settlePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ExpenseSheet.findByIdAndUpdate(
      id,
      { settled: true, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Settlement not found' });
    }
    res.json({ message: 'Settlement marked as settled', settlement: updated });
  } catch (error) {
    console.error('Settle payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUnsettledTransactions,
  settleGroup,
  getUserSettlements,
  settlePayment
};
