const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./model/userModel');
const Group = require('./model/groupModel');
const GroupMembership = require('./model/groupMembershipModel');
const Expense = require('./model/expenseModel');
const ExpenseSheet = require('./model/expenseSheetModel');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Group.deleteMany({});
    await GroupMembership.deleteMany({});
    await Expense.deleteMany({});
    await ExpenseSheet.deleteMany({});
    console.log('Cleared existing data');

    // Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      {
        name: 'Kalyani Dave',
        email: 'kalyani@example123.com',
        password: hashedPassword
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@example123.com',
        password: hashedPassword
      },
      {
        name: 'Priya Patel',
        email: 'priya@example123.com',
        password: hashedPassword
      },
      {
        name: 'Arjun Singh',
        email: 'arjun@example123.com',
        password: hashedPassword
      },
      {
        name: 'Sneha Gupta',
        email: 'sneha@example123.com',
        password: hashedPassword
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram@example123.com',
        password: hashedPassword
      },
      {
        name: 'Anita Verma',
        email: 'anita@example123.com',
        password: hashedPassword
      }
    ]);
    console.log('Created users');

    // Create Groups
    const groups = await Group.create([
      {
        name: 'Goa Beach Trip 2024',
        description: 'Annual college friends trip to Goa beaches',
        createdBy: users[0]._id,
        type: 'trip'
      },
      {
        name: 'Flat Mates - Pune',
        description: 'Shared apartment expenses in Pune',
        createdBy: users[1]._id,
        type: 'roommates'
      },
      {
        name: 'Office Team Outings',
        description: 'Team lunch and celebration expenses',
        createdBy: users[2]._id,
        type: 'project'
      }
    ]);
    console.log('Created groups');

    // Create Group Memberships
    const memberships = await GroupMembership.create([
      // Goa Beach Trip 2024 - 5 members
      { userId: users[0]._id, groupId: groups[0]._id },
      { userId: users[1]._id, groupId: groups[0]._id },
      { userId: users[2]._id, groupId: groups[0]._id },
      { userId: users[3]._id, groupId: groups[0]._id },
      { userId: users[4]._id, groupId: groups[0]._id },
      
      // Flat Mates - Pune - 4 members
      { userId: users[1]._id, groupId: groups[1]._id },
      { userId: users[2]._id, groupId: groups[1]._id },
      { userId: users[5]._id, groupId: groups[1]._id },
      { userId: users[6]._id, groupId: groups[1]._id },
      
      // Office Team Outings - 5 members
      { userId: users[2]._id, groupId: groups[2]._id },
      { userId: users[0]._id, groupId: groups[2]._id },
      { userId: users[3]._id, groupId: groups[2]._id },
      { userId: users[4]._id, groupId: groups[2]._id },
      { userId: users[5]._id, groupId: groups[2]._id }
    ]);
    console.log('Created group memberships');

    // Create Expenses
    const expenses = await Expense.create([
      // Goa Beach Trip 2024 expenses
      {
        groupId: groups[0]._id,
        description: 'Beach Resort Booking - 3 Days',
        amount: 15000,
        paidBy: [{ userId: users[0]._id, amount: 15000 }],
        splitMember: [
          { userId: users[0]._id, amount: 3000 },
          { userId: users[1]._id, amount: 3000 },
          { userId: users[2]._id, amount: 3000 },
          { userId: users[3]._id, amount: 3000 },
          { userId: users[4]._id, amount: 3000 }
        ],
        splitType: 'equally',
        date: new Date('2024-01-15')
      },
      {
        groupId: groups[0]._id,
        description: 'Flight Tickets Mumbai-Goa',
        amount: 20000,
        paidBy: [{ userId: users[1]._id, amount: 20000 }],
        splitMember: [
          { userId: users[0]._id, amount: 4000 },
          { userId: users[1]._id, amount: 4000 },
          { userId: users[2]._id, amount: 4000 },
          { userId: users[3]._id, amount: 4000 },
          { userId: users[4]._id, amount: 4000 }
        ],
        splitType: 'equally',
        date: new Date('2024-01-10')
      },
      {
        groupId: groups[0]._id,
        description: 'Food & Beach Activities',
        amount: 8500,
        paidBy: [{ userId: users[2]._id, amount: 8500 }],
        splitMember: [
          { userId: users[0]._id, amount: 1700 },
          { userId: users[1]._id, amount: 1700 },
          { userId: users[2]._id, amount: 1700 },
          { userId: users[3]._id, amount: 1700 },
          { userId: users[4]._id, amount: 1700 }
        ],
        splitType: 'equally',
        date: new Date('2024-01-16')
      },

      // Flat Mates - Pune expenses
      {
        groupId: groups[1]._id,
        description: 'Monthly Electricity Bill',
        amount: 3200,
        paidBy: [{ userId: users[1]._id, amount: 3200 }],
        splitMember: [
          { userId: users[1]._id, amount: 800 },
          { userId: users[2]._id, amount: 800 },
          { userId: users[5]._id, amount: 800 },
          { userId: users[6]._id, amount: 800 }
        ],
        splitType: 'equally',
        date: new Date('2024-01-05')
      },
      {
        groupId: groups[1]._id,
        description: 'Grocery & Household Items',
        amount: 2800,
        paidBy: [{ userId: users[5]._id, amount: 2800 }],
        splitMember: [
          { userId: users[1]._id, amount: 700 },
          { userId: users[2]._id, amount: 700 },
          { userId: users[5]._id, amount: 700 },
          { userId: users[6]._id, amount: 700 }
        ],
        splitType: 'equally',
        date: new Date('2024-01-12')
      },
      {
        groupId: groups[1]._id,
        description: 'Internet & Cable Bill',
        amount: 1600,
        paidBy: [{ userId: users[6]._id, amount: 1600 }],
        splitMember: [
          { userId: users[1]._id, amount: 400 },
          { userId: users[2]._id, amount: 400 },
          { userId: users[5]._id, amount: 400 },
          { userId: users[6]._id, amount: 400 }
        ],
        splitType: 'equally',
        date: new Date('2024-01-08')
      },

      // Office Team Outings expenses
      {
        groupId: groups[2]._id,
        description: 'Team Lunch at Restaurant',
        amount: 4500,
        paidBy: [{ userId: users[2]._id, amount: 4500 }],
        splitMember: [
          { userId: users[2]._id, amount: 900 },
          { userId: users[0]._id, amount: 900 },
          { userId: users[3]._id, amount: 900 },
          { userId: users[4]._id, amount: 900 },
          { userId: users[5]._id, amount: 900 }
        ],
        splitType: 'equally',
        date: new Date('2024-01-18')
      },
      {
        groupId: groups[2]._id,
        description: 'Birthday Celebration Cake',
        amount: 1200,
        paidBy: [{ userId: users[0]._id, amount: 1200 }],
        splitMember: [
          { userId: users[2]._id, amount: 240 },
          { userId: users[0]._id, amount: 240 },
          { userId: users[3]._id, amount: 240 },
          { userId: users[4]._id, amount: 240 },
          { userId: users[5]._id, amount: 240 }
        ],
        splitType: 'equally',
        date: new Date('2024-01-20')
      },
      {
        groupId: groups[2]._id,
        description: 'Coffee & Snacks Meeting',
        amount: 800,
        paidBy: [{ userId: users[3]._id, amount: 800 }],
        splitMember: [
          { userId: users[2]._id, amount: 160 },
          { userId: users[0]._id, amount: 160 },
          { userId: users[3]._id, amount: 160 },
          { userId: users[4]._id, amount: 160 },
          { userId: users[5]._id, amount: 160 }
        ],
        splitType: 'equally',
        date: new Date('2024-01-22')
      }
    ]);
    console.log('Created expenses');

    // Create sample settlements (UNSETTLED)
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
    console.log('Created settlements');

    console.log('\n🎉 Complete dummy data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📂 Groups: ${groups.length} (4-5 members each)`);
    console.log(`💰 Expenses: ${expenses.length} (3 per group)`);
    console.log(`⚖️ Settlements: ${settlements.length} (all UNSETTLED)`);
    
    console.log('\n🔐 Login Credentials (All passwords: password123):');
    console.log('📧 kalyani@example123.com (Main User)');
    console.log('📧 rahul@example123.com');
    console.log('📧 priya@example123.com');
    console.log('📧 arjun@example123.com');
    console.log('📧 sneha@example123.com');
    console.log('📧 vikram@example123.com');
    console.log('📧 anita@example123.com');

    console.log('\n💡 Groups Overview:');
    console.log('🏖️  Goa Beach Trip 2024: ₹43,500 total (5 members) - 3 settlements');
    console.log('🏠 Flat Mates - Pune: ₹7,600 total (4 members) - 2 settlements');
    console.log('🍽️  Office Team Outings: ₹6,500 total (5 members) - 2 settlements');
    console.log('\n🔥 All settlements are UNSETTLED - ready for optimization demo!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();