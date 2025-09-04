const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const createIndexes = require('./config/indexes');
const keepAlive = require('./utils/keepAlive');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:3000', 'https://splitwise.vercel.app', 'https://splitwise-app.vercel.app', 'https://split-wise-sepia.vercel.app', 'https://split-wise-ekabx9zk7-kalyani-daves-projects.vercel.app'],
    credentials: true
  }));

  app.use(express.json());
connectDB().then(() => {
  createIndexes(); // Create indexes after DB connection
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/group-memberships', require('./routes/groupMembershipRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/settlements', require('./routes/settlementRoutes'));

app.get('/', (req, res) => {
    res.send('Testing purpose');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (process.env.NODE_ENV === 'production') {
        keepAlive(); // Start keep alive in production
    }
});
