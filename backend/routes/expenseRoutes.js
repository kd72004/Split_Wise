const express = require('express');
const router = express.Router();
const { 
  createExpense, 
  getAllExpenses, 
  getExpenseById, 
  getExpensesByGroup,
  getExpensesInvolvingUser,
  updateExpense, 
  deleteExpense 
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Expense routes
router.post('/', createExpense);
router.get('/', getAllExpenses);
router.get('/group/:groupId', getExpensesByGroup);
router.get('/involving/:userId', getExpensesInvolvingUser);
router.get('/:id', getExpenseById);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router; 