const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cardHolderName: { type: String, required: true },
  cardNumber: { type: String, required: true },
  expMonth: { type: String, required: true },
  expYear: { type: String, required: true },
  cvv: { type: String, required: true }
});

module.exports = mongoose.model("Payment", paymentSchema);
