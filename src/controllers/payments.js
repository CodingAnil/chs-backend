const { RAZORPAY_KEY_SECRET } = require("../configs");
const razorpay = require("../configs/razorpay");
const { sendResponse } = require("../utils");

// ✅ createOrder
const createOrder = async (req, res) => {
  const { amount, currency = "INR" } = req.body;

  try {
    const order =await  razorpay.orders.create({
      amount: amount * 100, // Amount in paisa
      currency: currency,
      payment_capture: 1,
    });

    return sendResponse(res, 200, "Order Created", order);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, error.message);
  }
};

// ✅ verifyPayment
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", "ntaN5SWwb05l5DYioUHKbvF3");
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const digest = hmac.digest("hex");

  if (digest === razorpay_signature) {
    return sendResponse(res, 200, "Payment verified");
  } else {
    return sendResponse(res, 400, "Invalid signature");
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
