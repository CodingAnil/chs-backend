const Razorpay = require("razorpay");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require(".");

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,   // Use environment variables for security
    key_secret: RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;