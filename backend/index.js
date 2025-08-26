const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://splitwise.vercel.app', 'https://splitwise-app.vercel.app']
      : 'http://localhost:5174',
    credentials: true
  }));

  app.use(express.json());
connectDB();

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
});
