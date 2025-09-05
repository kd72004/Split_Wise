const axios = require('axios');

// If axios not installed, use built-in http
const http = require('http');
const https = require('https');

const keepAlive = () => {
  const url = process.env.RENDER_URL || 'https://split-wise-6na0.onrender.com';
  
  // Ping immediately
  const ping = () => {
    try {
      https.get(url, (res) => {
        console.log('Keep alive ping sent at:', new Date().toISOString());
      }).on('error', (error) => {
        console.log('Keep alive failed:', error.message);
      });
    } catch (error) {
      console.log('Keep alive failed:', error.message);
    }
  };
  
  ping(); // First ping
  setInterval(ping, 10 * 60 * 1000); // Ping every 10 minutes
};

module.exports = keepAlive;