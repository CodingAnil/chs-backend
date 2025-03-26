const express = require("express");
const { createOrder, verifyPayment } = require("../controllers/payments");
const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);

// router.post("/create-split-payment", async (req, res) => {
//   const { amount, doctor_account_id, admin_fee_percent = 10 } = req.body;

//   try {
//     const transfer = await razorpay.orders.create({
//       amount: amount * 100,
//       currency: "INR",
//       receipt: "receipt#1",
//       payment_capture: 1,
//       notes: {
//         doctor: "Doctor Fee",
//         admin: "Admin Commission",
//       },
//       transfers: [
//         {
//           account: doctor_account_id, // Doctor Razorpay account
//           amount: Math.floor(amount * 0.9) * 100, // 90% to doctor
//           currency: "INR",
//         },
//         {
//           account: "YOUR_ADMIN_ACCOUNT_ID", // Admin Razorpay account
//           amount: Math.floor(amount * 0.1) * 100, // 10% to admin
//           currency: "INR",
//         },
//       ],
//     });

//     res.status(200).json(transfer);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router;
