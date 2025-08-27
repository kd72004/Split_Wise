# Splitwise - Design Document

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [System Overview](#system-overview)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [System Architecture](#system-architecture)
6. [Technology Stack](#technology-stack)
7. [Database Design](#database-design)
8. [API Design](#api-design)
9. [Algorithms](#algorithms)
10. [Class Diagram](#class-diagram)

---

## Problem Statement

Managing shared expenses among friends, roommates, or groups is a common challenge that leads to:
- **Manual Calculations:** Time-consuming and error-prone expense splitting
- **Complex Settlements:** Multiple transactions required to settle debts
- **Lack of Transparency:** No clear tracking of who owes what to whom
- **Social Friction:** Disputes over money due to poor record keeping
- **Inefficient Payments:** Suboptimal settlement paths leading to unnecessary transactions

**Solution:** Splitwise is a smart expense splitting application that automates expense management, optimizes settlements using advanced algorithms, and provides transparent tracking of group finances.

---

## System Overview

Splitwise is a full-stack web application that enables users to:
- Create groups and manage shared expenses
- Split expenses using various methods (equal, custom amounts)
- Track balances and settlements automatically
- Optimize settlement transactions using heap-based algorithms
- Find degree of connection between users using BFS
- Manage user authentication and group memberships

---

## Functional Requirements

### User Management
- **FR1:** User registration and authentication
- **FR2:** User profile management
- **FR3:** Find degree of connection between users
- **FR4:** Manage mutual friends relationships

### Group Management
- **FR5:** Create and manage expense groups
- **FR6:** Add/remove group members
- **FR7:** Update group information
- **FR8:** Delete groups (creator only)

### Expense Management
- **FR9:** Add expenses with multiple payers and split members
- **FR10:** Support different split types (equal, custom)
- **FR11:** Edit and delete expenses
- **FR12:** View expense history by group
- **FR13:** Track user involvement in expenses

### Settlement Management
- **FR14:** Calculate optimal settlements using heap algorithm
- **FR15:** Track settlement status (settled/unsettled)
- **FR16:** Generate settlement recommendations
- **FR17:** Mark settlements as completed

---

## Non-Functional Requirements

### Performance
- **NFR1:** API response time < 500ms for 95% of requests
- **NFR2:** Support up to 1000 concurrent users
- **NFR3:** Database queries optimized with proper indexing

### Scalability
- **NFR4:** Horizontal scaling capability for backend services
- **NFR5:** Database partitioning support for large datasets

### Security
- **NFR6:** JWT-based authentication with 30-day expiration
- **NFR7:** Password hashing using bcrypt with salt rounds
- **NFR8:** Input validation and sanitization
- **NFR9:** CORS protection for API endpoints

### Usability
- **NFR10:** Responsive design for mobile and desktop
- **NFR11:** Intuitive user interface with modern design
- **NFR12:** Real-time notifications for settlements

### Reliability
- **NFR13:** 99.9% uptime availability
- **NFR14:** Automated error handling and logging
- **NFR15:** Data backup and recovery mechanisms

---

## System Architecture

### Frontend Architecture
```
React Application (Vite)
├── Components/
│   ├── Authentication
│   ├── Group Management
│   ├── Expense Tracking
│   └── Settlement Display
├── Pages/
│   ├── Dashboard
│   ├── Group Details
│   └── User Profile
├── Utils/
│   ├── API Client (Axios)
│   ├── Authentication
│   └── Helpers
└── Styling (Tailwind CSS)
```

### Backend Architecture
```
Node.js/Express Server
├── Controllers/
│   ├── User Controller
│   ├── Group Controller
│   ├── Expense Controller
│   └── Settlement Controller
├── Models/
│   ├── User Model
│   ├── Group Model
│   ├── Expense Model
│   └── ExpenseSheet Model
├── Routes/
│   └── API Endpoints
├── Middleware/
│   └── Authentication
└── Utils/
    ├── Settlement Optimizer
    ├── BFS Algorithm
    └── Helper Functions
```

---

## Technology Stack

### Frontend
- **Framework:** React 19.1.0
- **Build Tool:** Vite 7.0.0
- **Styling:** Tailwind CSS 4.1.11
- **Routing:** React Router DOM 7.6.3
- **HTTP Client:** Axios 1.10.0
- **Icons:** Lucide React, React Icons
- **Notifications:** React Toastify
- **Authentication:** JWT Decode

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB with Mongoose 7.5.0
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 2.4.3
- **CORS:** cors 2.8.5
- **Environment:** dotenv 16.3.1

### Development Tools
- **Package Manager:** npm
- **Version Control:** Git
- **Code Quality:** ESLint
- **Development Server:** Nodemon

---

## Database Design

### Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  mutualFriends: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

#### Groups Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  createdBy: ObjectId (required),
  type: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### GroupMembership Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required),
  groupId: ObjectId (required),
  joinedAt: Date
}
```

#### Expenses Collection
```javascript
{
  _id: ObjectId,
  groupId: ObjectId (required),
  description: String (required),
  amount: Number (required),
  paidBy: [{userId: ObjectId, amount: Number}],
  splitMember: [{userId: ObjectId, amount: Number}],
  splitType: String (required),
  date: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

#### ExpenseSheet Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (required),
  groupId: ObjectId (required),
  amountToPay: Number (required),
  payerId: ObjectId (required),
  settled: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Design

### Authentication Endpoints
- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:myUserId/degree/:targetId` - Get degree of connection

### Group Endpoints
- `POST /api/groups` - Create group
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Expense Endpoints
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `GET /api/expenses/group/:groupId` - Get expenses by group
- `GET /api/expenses/user/:userId` - Get expenses involving user
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Settlement Endpoints
- `GET /api/settlements/group/:groupId` - Get group settlements
- `POST /api/settlements/optimize` - Calculate optimal settlements

---

## Algorithms

### 1. Heap-Based Settlement Optimization
**Purpose:** Minimize the number of transactions required to settle all debts within a group.

**Algorithm:**
1. Calculate net balance for each user (amount paid - amount owed)
2. Create two heaps: creditors (positive balance) and debtors (negative balance)
3. While both heaps are not empty:
   - Extract maximum creditor and maximum debtor
   - Settle the minimum of their absolute amounts
   - Update balances and re-insert if not zero
4. Generate settlement transactions

**Time Complexity:** O(n log n)
**Space Complexity:** O(n)

### 2. Degree of Connection (BFS)
**Purpose:** Find the shortest path between two users in the friend network.

**Algorithm:**
1. Start BFS from source user
2. Track visited users and their degrees
3. For each user, explore their mutual friends
4. Return degree when target user is found
5. Return -1 if no connection exists

**Time Complexity:** O(V + E) where V = users, E = friendships
**Space Complexity:** O(V)

---

## Class Diagram

The system follows object-oriented design principles with clear separation of concerns:

### Entity Classes
- **User:** Manages user data and authentication
- **Group:** Handles group creation and management
- **GroupMembership:** Junction table for user-group relationships
- **Expense:** Tracks expense details and splitting logic
- **ExpenseSheet:** Manages settlement calculations and status

### Key Relationships
- **User ↔ Group:** One-to-Many (creator relationship)
- **User ↔ GroupMembership:** One-to-Many
- **Group ↔ GroupMembership:** One-to-Many
- **Group ↔ Expense:** One-to-Many
- **User ↔ ExpenseSheet:** One-to-Many (multiple roles: payer, payee)
- **User ↔ User:** Many-to-Many (mutual friends)

![Class Diagram](finalDiagram.png)

### Design Patterns Used
- **MVC Pattern:** Separation of Models, Views, and Controllers
- **Repository Pattern:** Data access abstraction through Mongoose models
- **Middleware Pattern:** Authentication and request processing
- **Factory Pattern:** Model creation and validation

---

## Conclusion

Splitwise provides a comprehensive solution for expense management with advanced algorithmic optimizations. The system is designed for scalability, maintainability, and user experience, making it suitable for both personal use and commercial deployment.

The combination of modern web technologies, efficient algorithms, and clean architecture ensures that Splitwise can handle complex expense splitting scenarios while maintaining optimal performance and user satisfaction.