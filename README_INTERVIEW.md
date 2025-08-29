# 🚀 Splitwise - Interview Code Guide

## User Flow: Login → Signup → Create Group → Add Member → Add Expense → Settlement

---

## 1. 🔐 USER AUTHENTICATION

### Frontend - Login Component
```jsx
// Login.jsx
import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post('/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        placeholder="Email"
        required
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Frontend - Signup Component
```jsx
// Signup.jsx
import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/users/signup', { name: username, email, password });
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input 
        type="text" 
        value={username} 
        onChange={e => setUsername(e.target.value)} 
        placeholder="Full name"
        required
      />
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        placeholder="Email"
        required
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="Password"
        required
      />
      <button type="submit">Create Account</button>
    </form>
  );
}
```

### Backend - User Controller
```javascript
// userController.js
const User = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      userId: user._id,
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
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
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signup, login };
```

### Backend - Auth Middleware
```javascript
// auth.js
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
```

---

## 2. 👥 GROUP MANAGEMENT

### Frontend - Create Group
```jsx
// CreateGroup.jsx
import { useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import getUserId from '../utils/getUserId';

export default function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState('friends');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userId = getUserId();
      const response = await axios.post('/groups', {
        name: groupName,
        description,
        userId,
        type: groupType
      });
      
      alert('Group created successfully!');
      navigate(`/group/${response.data._id}`);
    } catch (error) {
      alert('Failed to create group');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Group Name"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <select value={groupType} onChange={(e) => setGroupType(e.target.value)}>
        <option value="friends">Friends</option>
        <option value="family">Family</option>
        <option value="roommates">Roommates</option>
      </select>
      <button type="submit">Create Group</button>
    </form>
  );
}
```

### Backend - Group Controller
```javascript
// groupController.js
const Group = require('../model/groupModel');

const createGroup = async (req, res) => {
  try {
    const { name, description, userId, type } = req.body;

    const group = await Group.create({
      name,
      description,
      createdBy: userId,
      type
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createGroup, getGroupById };
```

---

## 3. 👤 ADD MEMBER TO GROUP

### Frontend - Add Member
```jsx
// AddMember.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';

export default function AddMember() {
  const { groupId } = useParams();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/group-memberships', {
        userId: selectedUserId,
        groupId
      });
      
      alert('Member added successfully!');
      navigate(`/group/${groupId}`);
    } catch (error) {
      alert('Failed to add member');
    }
  };

  return (
    <form onSubmit={handleAddMember}>
      <select 
        value={selectedUserId} 
        onChange={(e) => setSelectedUserId(e.target.value)}
        required
      >
        <option value="">Select a user</option>
        {users.map(user => (
          <option key={user._id} value={user._id}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>
      <button type="submit">Add Member</button>
    </form>
  );
}
```

### Backend - Group Membership Controller
```javascript
// groupMembershipController.js
const GroupMembership = require('../model/groupMembershipModel');
const User = require('../model/userModel');

const addMemberToGroup = async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    // Check if already member
    const existingMembership = await GroupMembership.findOne({ userId, groupId });
    if (existingMembership) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Create membership
    const membership = await GroupMembership.create({
      userId,
      groupId,
      joinedAt: new Date()
    });

    // Update mutual friends for BFS algorithm
    const groupMembers = await GroupMembership.find({ groupId })
      .populate('userId', '_id name');

    const existingMemberIds = groupMembers.map(member => member.userId._id);
    await User.findByIdAndUpdate(userId, {
      $addToSet: { mutualFriends: { $each: existingMemberIds } }
    });

    // Add new member to existing members' friend lists
    for (let member of groupMembers) {
      await User.findByIdAndUpdate(member.userId._id, {
        $addToSet: { mutualFriends: userId }
      });
    }

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const memberships = await GroupMembership.find({ groupId: req.params.groupId })
      .populate('userId', 'name email')
      .sort({ joinedAt: 1 });

    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { addMemberToGroup, getGroupMembers };
```

---

## 4. 💰 ADD EXPENSE

### Frontend - Add Expense
```jsx
// AddExpense.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';

export default function AddExpense() {
  const { groupId } = useParams();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [members, setMembers] = useState([]);
  const [paidBy, setPaidBy] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroupMembers();
  }, [groupId]);

  const fetchGroupMembers = async () => {
    try {
      const res = await axios.get(`/group-memberships/group/${groupId}`);
      setMembers(res.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const expenseData = {
        groupId,
        description,
        amount: parseFloat(amount),
        paidBy: [{
          userId: paidBy,
          amount: parseFloat(amount)
        }],
        splitMember: members.map(member => ({
          userId: member.userId._id,
          amount: parseFloat(amount) / members.length
        })),
        splitType,
        date: new Date()
      };

      await axios.post('/expenses', expenseData);
      alert('Expense added successfully!');
      navigate(`/group/${groupId}`);
    } catch (error) {
      alert('Failed to add expense');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Expense description"
        required
      />
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        step="0.01"
        required
      />
      <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
        <option value="">Who paid?</option>
        {members.map(member => (
          <option key={member.userId._id} value={member.userId._id}>
            {member.userId.name}
          </option>
        ))}
      </select>
      <select value={splitType} onChange={(e) => setSplitType(e.target.value)}>
        <option value="equal">Split Equally</option>
        <option value="custom">Custom Split</option>
      </select>
      <button type="submit">Add Expense</button>
    </form>
  );
}
```

### Backend - Expense Controller
```javascript
// expenseController.js
const Expense = require('../model/expenseModel');

const createExpense = async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, splitMember, splitType, date } = req.body;

    // Validation
    if (!groupId || !description || !amount || !paidBy || !splitMember || !splitType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate total paid amount
    const totalPaid = paidBy.reduce((sum, payer) => sum + parseFloat(payer.amount || 0), 0);
    if (Math.abs(totalPaid - amount) > 0.01) {
      return res.status(400).json({ 
        message: 'Sum of paidBy amounts must equal total expense amount' 
      });
    }

    const expense = await Expense.create({
      groupId,
      description,
      amount,
      paidBy,
      splitMember,
      splitType,
      date: date || new Date()
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
    res.status(500).json({ message: 'Server error' });
  }
};

const getExpensesByGroup = async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId })
      .populate('groupId', 'name')
      .populate('paidBy.userId', 'name email')
      .populate('splitMember.userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createExpense, getExpensesByGroup };
```

---

## 5. 🧮 SETTLEMENT OPTIMIZATION

### Frontend - Settlement Component
```jsx
// SettlementList.jsx
import { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';

export default function SettlementList({ groupId, onClose }) {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettlements();
  }, [groupId]);

  const fetchSettlements = async () => {
    try {
      const res = await axios.get(`/settlements/${groupId}`);
      setSettlements(res.data);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSettled = async (settlementId) => {
    try {
      await axios.put(`/settlements/${settlementId}/settle`);
      alert('Settlement marked as paid!');
      fetchSettlements(); // Refresh list
    } catch (error) {
      alert('Failed to mark as settled');
    }
  };

  if (loading) return <div>Loading settlements...</div>;

  return (
    <div className="settlements">
      <h3>Optimal Settlements</h3>
      {settlements.length === 0 ? (
        <p>No settlements needed!</p>
      ) : (
        settlements.map((settlement, index) => (
          <div key={index} className="settlement-item">
            <p>
              <strong>{settlement.from}</strong> owes <strong>{settlement.to}</strong> 
              ₹{settlement.amount}
            </p>
            <button onClick={() => handleMarkSettled(settlement.id)}>
              Mark as Paid
            </button>
          </div>
        ))
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### Backend - Settlement Algorithm
```javascript
// algo.js - Heap-based Settlement Optimization
const ExpenseSheet = require('../model/expenseSheetModel');

class MaxHeap {
  constructor() { this.data = []; }
  push(item) { this.data.push(item); this.data.sort((a, b) => b[0] - a[0]); }
  pop() { return this.data.shift(); }
  isEmpty() { return this.data.length === 0; }
}

function extractId(val) {
  if (!val) return val;
  if (typeof val === 'object' && val._id) return val._id;
  if (typeof val === 'string') return val;
  return val;
}

async function settleDebts(transactions, groupId) {
  // 1. Calculate net balances
  const net = new Map();
  for (const [user, amt] of transactions) {
    const id = extractId(user).toString();
    net.set(id, (net.get(id) || 0) + amt);
  }

  // 2. Remove users with zero balance
  for (const [user, amt] of Array.from(net.entries())) {
    if (Math.abs(amt) < 1e-6) net.delete(user);
  }

  // 3. Prepare MaxHeaps for creditors and debtors
  const creditors = new MaxHeap(); // [amount, userId]
  const debtors = new MaxHeap();   // [amount, userId]
  
  for (const [user, amt] of net.entries()) {
    if (amt > 0) creditors.push([amt, user]);
    else if (amt < 0) debtors.push([-amt, user]);
  }

  // 4. Clear old unsettled settlements
  await ExpenseSheet.deleteMany({ groupId, settled: false });

  // 5. Settle debts using heap algorithm
  const settlements = [];
  while (!creditors.isEmpty() && !debtors.isEmpty()) {
    const [creditAmt, creditUser] = creditors.pop();
    const [debtAmt, debtUser] = debtors.pop();
    const settleAmt = Math.min(creditAmt, debtAmt);

    if (creditUser !== debtUser && settleAmt > 0) {
      settlements.push({ from: debtUser, to: creditUser, amount: settleAmt });

      // Save to database
      await ExpenseSheet.create({
        userId: extractId(debtUser),
        payerId: extractId(creditUser),
        groupId,
        amountToPay: settleAmt,
        settled: false
      });
    }

    // Re-insert remaining amounts
    if (creditAmt > settleAmt) creditors.push([creditAmt - settleAmt, creditUser]);
    if (debtAmt > settleAmt) debtors.push([debtAmt - settleAmt, debtUser]);
  }

  return settlements;
}

async function fetchUnsettledTransactions(groupId) {
  try {
    const unsettledExpenses = await ExpenseSheet.find({
      groupId,
      settled: false
    });

    const transactions = [];
    for (const expense of unsettledExpenses) {
      transactions.push([extractId(expense.payerId), expense.amountToPay]);
      transactions.push([extractId(expense.userId), -expense.amountToPay]);
    }
    
    return await settleDebts(transactions, groupId);
  } catch (error) {
    throw error;
  }
}

module.exports = { fetchUnsettledTransactions, settleDebts };
```

### Backend - Settlement Controller
```javascript
// settlementController.js
const { fetchUnsettledTransactions } = require('../utils/algo');
const ExpenseSheet = require('../model/expenseSheetModel');

const getUnsettledTransactions = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const result = await fetchUnsettledTransactions(groupId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

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
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUnsettledTransactions, settlePayment };
```

---

## 6. 🗄️ DATABASE MODELS

### User Model
```javascript
// userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mutualFriends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

### Group Model
```javascript
// groupModel.js
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: String
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
```

### Expense Model
```javascript
// expenseModel.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true }
  }],
  splitMember: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: Number
  }],
  splitType: { type: String, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
```

### ExpenseSheet Model
```javascript
// expenseSheetModel.js
const mongoose = require('mongoose');

const expenseSheetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  amountToPay: { type: Number, required: true },
  payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  settled: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ExpenseSheet', expenseSheetSchema);
```

---

## 7. 🛣️ API ROUTES

```javascript
// Complete API Structure

// Authentication
POST   /api/users/signup
POST   /api/users/login
GET    /api/users/me

// Groups
POST   /api/groups
GET    /api/groups/:id

// Group Membership
POST   /api/group-memberships
GET    /api/group-memberships/group/:groupId

// Expenses
POST   /api/expenses
GET    /api/expenses/group/:groupId

// Settlements
GET    /api/settlements/:groupId
PUT    /api/settlements/:id/settle
```

---

## 🎯 KEY INTERVIEW POINTS

### **User Flow:**
1. **Login/Signup** → JWT authentication with bcrypt
2. **Create Group** → Database group creation
3. **Add Member** → Mutual friends network for BFS
4. **Add Expense** → Complex splitting with validation
5. **Settlement** → Heap algorithm optimization (O(n log n))

### **Algorithms:**
- **Settlement:** MaxHeap reduces O(n²) to O(n log n)
- **BFS:** Finds user connections in O(V + E)

### **Security:**
- JWT tokens, bcrypt hashing, input validation

**This covers the complete user journey with all essential interview code!** 🚀