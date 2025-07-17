const Expense = require('../model/expenseModel');
const ExpenseSheet = require('../model/expenseSheetModel');
const Group = require('../model/groupModel');

const createExpense = async (req, res) => {
  try {
    console.log(req.body);
    const { groupId, description, amount, paidBy, splitMember, splitType, date } = req.body;

    if (!groupId || !description || !amount || !paidBy || !splitMember || !splitType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!Array.isArray(paidBy) || !Array.isArray(splitMember)) {
      return res.status(400).json({ message: 'paidBy and splitMember must be arrays' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const totalPaid = paidBy.reduce((sum, payer) => sum + parseFloat(payer.amount || 0), 0);
    if (Math.abs(totalPaid - amount) > 0.01) {
      return res.status(400).json({ message: 'Sum of paidBy amounts must equal total expense amount' });
    }

    const expense = await Expense.create({
      groupId,
      description,
      amount,
      paidBy,
      splitMember,
      splitType,
      date: date || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('groupId', 'name')
      .populate('paidBy.userId', 'name email')
      .populate('splitMember.userId', 'name email');

    res.status(201).json({
      success: true,
      data: populatedExpense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('groupId', 'name')
      .populate('paidBy.userId', 'name email')
      .populate('splitMember', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(expenses);
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('groupId', 'name')
      .populate('paidBy.userId', 'name email')
      .populate('splitMember.userId', 'name email');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getExpensesByGroup = async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId })
      .populate('groupId', 'name')
      .populate('paidBy.userId', 'name email')
      .populate('splitMember', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses by group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getExpensesInvolvingUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const expenses = await Expense.find({
      $or: [
        { 'paidBy.userId': userId },
        { splitMember: userId }
      ]
    })
    .populate('groupId', 'name')
    .populate('paidBy.userId', 'name email')
    .populate('splitMember', 'name email')
    .sort({ createdAt: -1 });
    
    const expensesWithInvolvement = expenses.map(expense => {
      const userPayer = expense.paidBy.find(payer => 
        payer.userId._id.toString() === userId
      );
      const isSplitMember = expense.splitMember.some(member => 
        member._id.toString() === userId
      );

      let userInvolvement = {
        amountPaid: userPayer ? userPayer.amount : 0,
        amountOwed: isSplitMember ? expense.amount / expense.splitMember.length : 0,
        netAmount: 0
      };

      userInvolvement.netAmount = userInvolvement.amountPaid - userInvolvement.amountOwed;

      return {
        ...expense.toObject(),
        userInvolvement
      };
    });

    res.json(expensesWithInvolvement);
  } catch (error) {
    console.error('Get expenses involving user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { description, amount, payers, splitMembers, splitType, date } = req.body;
    
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    const isPayer = expense.paidBy.some(payer => 
      payer.userId.toString() === req.user._id.toString()
    );
    if (!isPayer) {
      return res.status(401).json({ message: 'Not authorized to update this expense' });
    }

    if (payers) {
      const totalPaid = payers.reduce((sum, payer) => sum + payer.amount, 0);
      if (Math.abs(totalPaid - amount) > 0.01) {
        return res.status(400).json({ message: 'Sum of payer amounts must equal total expense amount' });
      }
    }
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { 
        description, 
        amount, 
        payers,
        splitMembers,
        splitType, 
        date, 
        updatedAt: new Date() 
      },
      { new: true }
    ).populate('groupId', 'name')
     .populate('paidBy.userId', 'name email')
     .populate('splitMember', 'name email');
    
    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    const isPayer = expense.paidBy.some(payer => 
      payer.userId.toString() === req.user._id.toString()
    );
    if (!isPayer) {
      return res.status(401).json({ message: 'Not authorized to delete this expense' });
    }
    
    await Expense.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  getExpensesByGroup,
  getExpensesInvolvingUser,
  updateExpense,
  deleteExpense
}; 
