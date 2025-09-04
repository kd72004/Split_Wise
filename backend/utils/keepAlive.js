const axios = require('axios');

const keepAlive = () => {
  const url = process.env.RENDER_URL || 'https://split-wise-6na0.onrender.com';
  
  setInterval(async () => {
    try {
      await axios.get(url);
      console.log('Keep alive ping sent');
    } catch (error) {
      console.log('Keep alive failed:', error.message);
    }
  }, 14 * 60 * 1000); // Ping every 14 minutes
};

module.exports = keepAlive;