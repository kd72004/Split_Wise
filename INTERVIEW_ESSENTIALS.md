# 🎯 Splitwise - Interview Essentials (20 Pages)

## 📋 What Interviewers Actually Ask About

### **Top 5 Interview Topics:**
1. **Authentication & Security** (JWT, bcrypt)
2. **Database Design & Relationships** 
3. **Algorithms** (Settlement optimization, BFS)
4. **API Design & Architecture**
5. **Frontend State Management**

---

## 1. 🔐 AUTHENTICATION SYSTEM

### **Frontend Login (Most Asked)**
```jsx
// Login.jsx - Key Interview Points
const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const res = await axios.post('/users/login', { email, password });
    localStorage.setItem('token', res.data.token);  // Token storage
    navigate('/dashboard');
  } catch (err) {
    toast.error(err.response?.data?.message);
  }
};

// Form validation (Always asked)
const validateForm = () => {
  const errors = {};
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email';
  if (!password || password.length < 6) errors.password = 'Password too short';
  return Object.keys(errors).length === 0;
};
```

### **Backend Authentication (Critical)**
```javascript
// userController.js - JWT & bcrypt implementation
const login = async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  // Check password with bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  res.json({ userId: user._id, token });
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const user = await User.create({ name, email, password: hashedPassword });
  res.status(201).json({ userId: user._id });
};
```

### **JWT Middleware (Always Asked)**
```javascript
// auth.js - Token verification
const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**Interview Questions:**
- How do you handle authentication? → JWT tokens
- How do you secure passwords? → bcrypt with salt
- How do you protect routes? → Middleware validation

---

## 2. 🗄️ DATABASE DESIGN & RELATIONSHIPS

### **Core Models (Always Asked)**
```javascript
// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mutualFriends: [{ type: ObjectId, ref: 'User' }]  // For BFS algorithm
}, { timestamps: true });

// Group Model  
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  createdBy: { type: ObjectId, ref: 'User', required: true },  // 1:Many
  type: String
}, { timestamps: true });

// Expense Model (Complex relationships)
const expenseSchema = new mongoose.Schema({
  groupId: { type: ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: [{                           // Multiple payers
    userId: { type: ObjectId, ref: 'User' },
    amount: Number
  }],
  splitMember: [{                      // Multiple split members
    userId: { type: ObjectId, ref: 'User' },
    amount: Number
  }],
  splitType: { type: String, required: true }
}, { timestamps: true });

// ExpenseSheet Model (Settlement tracking)
const expenseSheetSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User', required: true },      // Who owes
  payerId: { type: ObjectId, ref: 'User', required: true },     // Who to pay
  groupId: { type: ObjectId, ref: 'Group', required: true },
  amountToPay: { type: Number, required: true },
  settled: { type: Boolean, default: false }
}, { timestamps: true });
```

### **Key Relationships**
- **User ↔ Group:** 1:Many (createdBy)
- **Group ↔ Expense:** 1:Many 
- **User ↔ ExpenseSheet:** 1:Many (multiple roles)
- **User ↔ User:** Many:Many (mutualFriends for BFS)

**Interview Questions:**
- How did you design the database? → Show relationships
- How do you handle complex expense splitting? → paidBy/splitMember arrays
- How do you track settlements? → ExpenseSheet model

---

## 3. 🧮 ALGORITHMS (Most Important)

### **Settlement Optimization Algorithm**
```javascript
// algo.js - Heap-based settlement (O(n log n))
class MaxHeap {
  constructor() { this.data = []; }
  push(item) { this.data.push(item); this.data.sort((a, b) => b[0] - a[0]); }
  pop() { return this.data.shift(); }
  isEmpty() { return this.data.length === 0; }
}

async function settleDebts(transactions, groupId) {
  // 1. Calculate net balances
  const net = new Map();
  for (const [user, amt] of transactions) {
    const id = extractId(user).toString();
    net.set(id, (net.get(id) || 0) + amt);
  }

  // 2. Separate creditors and debtors
  const creditors = new MaxHeap();  // People owed money
  const debtors = new MaxHeap();    // People who owe money
  
  for (const [user, amt] of net.entries()) {
    if (amt > 0) creditors.push([amt, user]);
    else if (amt < 0) debtors.push([-amt, user]);
  }

  // 3. Minimize transactions using heap
  const settlements = [];
  while (!creditors.isEmpty() && !debtors.isEmpty()) {
    const [creditAmt, creditUser] = creditors.pop();
    const [debtAmt, debtUser] = debtors.pop();
    const settleAmt = Math.min(creditAmt, debtAmt);

    settlements.push({ from: debtUser, to: creditUser, amount: settleAmt });

    // Re-insert remaining amounts
    if (creditAmt > settleAmt) creditors.push([creditAmt - settleAmt, creditUser]);
    if (debtAmt > settleAmt) debtors.push([debtAmt - settleAmt, debtUser]);
  }

  return settlements;
}
```

### **BFS Algorithm (Degree of Connection)**
```javascript
// findDegreeOfConnection.js - BFS implementation
async function findDegreeOfConnection(sourceUserId, targetUserId) {
  if (sourceUserId === targetUserId) return 0;

  const visited = new Set();
  const queue = [{ userId: sourceUserId, degree: 0 }];
  visited.add(sourceUserId);

  while (queue.length > 0) {
    const { userId, degree } = queue.shift();
    
    const user = await User.findById(userId).populate('mutualFriends');
    if (!user) continue;
    
    for (const friend of user.mutualFriends) {
      const friendId = friend._id.toString();
      
      if (friendId === targetUserId) return degree + 1;
      
      if (!visited.has(friendId)) {
        visited.add(friendId);
        queue.push({ userId: friendId, degree: degree + 1 });
      }
    }
  }
  
  return -1; // No connection
}
```

**Interview Questions:**
- How do you optimize settlements? → Heap algorithm, O(n log n)
- How do you find connections between users? → BFS, O(V + E)
- What's the time complexity? → Settlement: O(n log n), BFS: O(V + E)

---

## 4. 🛣️ API DESIGN & ARCHITECTURE

### **RESTful API Structure**
```javascript
// Key API Endpoints (Most Asked)

// Authentication
POST   /api/users/signup
POST   /api/users/login
GET    /api/users/me

// Groups
POST   /api/groups                    // Create group
GET    /api/groups/:id                // Get group details
GET    /api/group-memberships/user/:userId  // Get user's groups

// Expenses  
POST   /api/expenses                  // Add expense
GET    /api/expenses/group/:groupId   // Get group expenses

// Settlements
POST   /api/settlements/:groupId      // Calculate settlements
PUT    /api/settlements/:id/settle    // Mark as paid
```

### **Expense Creation (Complex Logic)**
```javascript
// expenseController.js - Most asked about complex logic
const createExpense = async (req, res) => {
  const { groupId, description, amount, paidBy, splitMember, splitType } = req.body;

  // Validation: Total paid must equal expense amount
  const totalPaid = paidBy.reduce((sum, payer) => sum + payer.amount, 0);
  if (Math.abs(totalPaid - amount) > 0.01) {
    return res.status(400).json({ message: 'Paid amount mismatch' });
  }

  const expense = await Expense.create({
    groupId, description, amount, paidBy, splitMember, splitType, date: new Date()
  });

  res.status(201).json({ success: true, data: expense });
};
```

**Interview Questions:**
- How did you design your APIs? → RESTful structure
- How do you handle complex expense splitting? → Validation + arrays
- How do you ensure data consistency? → Server-side validation

---

## 5. ⚛️ FRONTEND STATE MANAGEMENT

### **React Hooks & State**
```jsx
// Dashboard.jsx - State management example
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const userId = getUserId();
      const groupsRes = await axios.get(`/group-memberships/user/${userId}`);
      
      let totalExpenses = 0, totalAmount = 0;
      for (const group of groupsRes.data) {
        const expensesRes = await axios.get(`/expenses/group/${group._id}`);
        totalExpenses += expensesRes.data.length;
        totalAmount += expensesRes.data.reduce((sum, exp) => sum + exp.amount, 0);
      }
      
      setStats({ totalGroups: groupsRes.data.length, totalExpenses, totalAmount });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {loading ? <div>Loading...</div> : (
        <div className="stats">
          <div>Groups: {stats.totalGroups}</div>
          <div>Expenses: {stats.totalExpenses}</div>
          <div>Amount: ₹{stats.totalAmount}</div>
        </div>
      )}
    </div>
  );
};
```

### **Axios Configuration**
```javascript
// axiosInstance.js - Token management
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Auto-attach token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Interview Questions:**
- How do you manage state in React? → useState, useEffect hooks
- How do you handle API calls? → Axios with interceptors
- How do you handle authentication on frontend? → Token in localStorage

---

## 6. 🔧 TECHNICAL ARCHITECTURE

### **Tech Stack Justification**
```
Frontend: React + Vite
- Why React? Component reusability, large ecosystem
- Why Vite? Faster development, better performance than CRA

Backend: Node.js + Express
- Why Node.js? JavaScript everywhere, non-blocking I/O
- Why Express? Lightweight, flexible routing

Database: MongoDB + Mongoose
- Why MongoDB? Flexible schema, good for complex nested data
- Why Mongoose? Schema validation, easier queries

Authentication: JWT + bcrypt
- Why JWT? Stateless, scalable
- Why bcrypt? Industry standard for password hashing
```

### **Project Structure**
```
splitwise/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── utils/         # Helper functions
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── controllers/       # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, validation
│   ├── utils/            # Algorithms
│   └── index.js
└── README.md
```

---

## 7. 🎯 COMMON INTERVIEW QUESTIONS & ANSWERS

### **Q1: Walk me through your project architecture**
**A:** "Splitwise is a full-stack expense sharing app. Frontend uses React for UI, backend uses Node.js/Express for REST APIs, and MongoDB for data storage. Key features include user authentication with JWT, complex expense splitting, and settlement optimization using heap algorithms."

### **Q2: How do you handle authentication and security?**
**A:** "I use JWT tokens for stateless authentication. Passwords are hashed with bcrypt using 10 salt rounds. Protected routes use middleware to verify tokens. Frontend stores tokens in localStorage and auto-attaches them to API requests."

### **Q3: Explain your settlement optimization algorithm**
**A:** "I use a heap-based algorithm to minimize transactions. First, calculate net balances for each user. Then use two max heaps - one for creditors, one for debtors. Match highest creditor with highest debtor until all debts are settled. Time complexity is O(n log n)."

### **Q4: How did you design the database schema?**
**A:** "I have 5 main models: User, Group, Expense, ExpenseSheet, and GroupMembership. Key relationships include User creates Groups (1:Many), Groups have Expenses (1:Many), and ExpenseSheet tracks settlements. I use MongoDB for flexibility with nested arrays in Expense model."

### **Q5: What challenges did you face and how did you solve them?**
**A:** "Main challenge was optimizing settlements to minimize transactions. Initially used brute force O(n²) approach, but optimized with heap algorithm to O(n log n). Another challenge was handling complex expense splitting with multiple payers - solved with validation and nested arrays."

### **Q6: How do you handle errors and edge cases?**
**A:** "Backend has try-catch blocks with proper HTTP status codes. Frontend uses toast notifications for user feedback. Key validations include: expense amounts must match, users can't owe themselves, and settlement amounts are positive."

### **Q7: How would you scale this application?**
**A:** "For scaling: implement caching with Redis, add database indexing on frequently queried fields, use pagination for large datasets, implement rate limiting, and consider microservices architecture for different domains."

---

## 8. 🚀 DEMO FLOW FOR INTERVIEWS

### **5-Minute Demo Script:**

1. **Authentication (30s)**
   - "Users sign up with email/password, stored securely with bcrypt"
   - "JWT tokens handle authentication"

2. **Group Creation (30s)**
   - "Users create groups, become admin automatically"
   - "Can add members who become mutual friends for BFS algorithm"

3. **Expense Management (1min)**
   - "Add expenses with complex splitting - multiple payers, custom amounts"
   - "System validates total paid equals expense amount"

4. **Settlement Optimization (2min)**
   - "Click 'Settle Up' triggers heap algorithm"
   - "Minimizes transactions from O(n²) to O(n log n)"
   - "Shows optimal payment plan"

5. **Advanced Features (1min)**
   - "BFS algorithm finds degree of connection between users"
   - "Real-time dashboard with statistics"
   - "Settlement tracking with status updates"

---

## 9. 📊 KEY METRICS & ACHIEVEMENTS

### **Technical Achievements:**
- ✅ **Algorithm Optimization:** Reduced settlement complexity from O(n²) to O(n log n)
- ✅ **Security Implementation:** JWT + bcrypt authentication
- ✅ **Complex Data Modeling:** 5 interconnected MongoDB models
- ✅ **Advanced Algorithms:** BFS for social connections
- ✅ **Full-Stack Integration:** React frontend + Node.js backend

### **Code Quality:**
- ✅ **Error Handling:** Comprehensive try-catch blocks
- ✅ **Input Validation:** Server-side validation for all inputs
- ✅ **Code Organization:** Modular structure with separation of concerns
- ✅ **API Design:** RESTful endpoints with proper HTTP methods

---

## 10. 🎯 FINAL INTERVIEW TIPS

### **What to Emphasize:**
1. **Algorithm Knowledge** - Heap optimization, BFS implementation
2. **System Design** - Database relationships, API architecture  
3. **Security Practices** - JWT, bcrypt, input validation
4. **Problem Solving** - How you optimized settlement algorithm
5. **Full-Stack Skills** - React + Node.js integration

### **Be Ready to Explain:**
- Why you chose specific technologies
- How you handle edge cases and errors
- Time/space complexity of your algorithms
- How you would scale the application
- Challenges faced and solutions implemented

### **Code You Must Know by Heart:**
- JWT authentication middleware
- Settlement optimization algorithm
- BFS degree of connection
- Expense creation with validation
- Database schema relationships

---

**🎉 YOU'RE INTERVIEW READY!**

This 20-page guide covers exactly what interviewers ask about. Focus on these core concepts and you'll confidently answer any question about your Splitwise project!