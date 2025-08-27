const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const ExpenseSheet = require('./model/expenseSheetModel');
const User = require('./model/userModel');
const Group = require('./model/groupModel');

const createSettlements = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing settlements
    await ExpenseSheet.deleteMany({});
    console.log('Cleared existing settlements');

    // Get users and groups
    const users = await User.find({});
    const groups = await Group.find({});

    if (users.length === 0 || groups.length === 0) {
      console.log('No users or groups found. Run seed script first.');
      process.exit(1);
    }

    // Create sample settlements (unsettled)
    const settlements = await ExpenseSheet.create([
      // Goa Trip settlements
      {
        userId: users[1]._id, // Rahul owes
        payerId: users[0]._id, // to Kalyani
        groupId: groups[0]._id,
        amountToPay: 1000,
        settled: false
      },
      {
        userId: users[2]._id, // Priya owes
        payerId: users[0]._id, // to Kalyani
        groupId: groups[0]._id,
        amountToPay: 2300,
        settled: false
      },
      {
        userId: users[3]._id, // Arjun owes
        payerId: users[1]._id, // to Rahul
        groupId: groups[0]._id,
        amountToPay: 1700,
        settled: false
      },
      
      // Flat expenses settlements
      {
        userId: users[2]._id, // Priya owes
        payerId: users[1]._id, // to Rahul
        groupId: groups[1]._id,
        amountToPay: 800,
        settled: false
      },
      {
        userId: users[6]._id, // Anita owes
        payerId: users[5]._id, // to Vikram
        groupId: groups[1]._id,
        amountToPay: 700,
        settled: false
      },
      
      // Office settlements
      {
        userId: users[0]._id, // Kalyani owes
        payerId: users[2]._id, // to Priya
        groupId: groups[2]._id,
        amountToPay: 660,
        settled: false
      },
      {
        userId: users[4]._id, // Sneha owes
        payerId: users[3]._id, // to Arjun
        groupId: groups[2]._id,
        amountToPay: 480,
        settled: false
      }
    ]);

    console.log('\n🎉 Settlements created successfully!');
    console.log(`⚖️ Total settlements: ${settlements.length}`);
    console.log('🔥 All settlements are UNSETTLED - ready for optimization demo!');
    
    console.log('\n💡 Settlement Summary:');
    console.log('🏖️  Goa Beach Trip: 3 settlements');
    console.log('🏠 Flat Mates: 2 settlements');
    console.log('🍽️  Office Team: 2 settlements');

    process.exit(0);
  } catch (error) {
    console.error('Error creating settlements:', error);
    process.exit(1);
  }
};

createSettlements();