const mongoose = require('mongoose');
require('dotenv').config();

const ExpenseSheet = require('./model/expenseSheetModel');

const updateSettlements = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all settlements to unsettled
    const result = await ExpenseSheet.updateMany(
      {}, // All documents
      { settled: false } // Set settled to false
    );

    console.log(`✅ Updated ${result.modifiedCount} settlements to unsettled`);
    console.log('🔥 All settlements are now UNSETTLED - ready for demo!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateSettlements();