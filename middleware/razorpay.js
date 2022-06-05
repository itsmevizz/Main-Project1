require('dotenv').config()
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.razorPaykey_id, 
  key_secret: process.env.razorPaykey_secret,
});

module.exports =instance