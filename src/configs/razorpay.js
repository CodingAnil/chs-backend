const Razorpay = require("razorpay");
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require(".");

const razorpay = new Razorpay({
    key_id: "rzp_test_m7Sk7RENHjMHdW" ,   // Use environment variables for security
    key_secret: "ntaN5SWwb05l5DYioUHKbvF3",
});

module.exports = razorpay;