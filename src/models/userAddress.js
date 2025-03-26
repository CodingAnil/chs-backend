const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },                         // Full name
  mobileNo: { type: String, required: true },                     // Mobile number
  email: { type: String },                                        // Optional email
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  state: { type: String, required: true },
  houseNumber: { type: String, required: true },                  // House/Flat number
  landmark: { type: String },                                     // Optional landmark
  type: {                                                         // Address type
    type: String,
    enum: ["home", "office", "friendhome", "other"],
    default: "home",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Address", addressSchema);
