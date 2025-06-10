const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  returnOrder,
  requestRefund,
} = require("../controllers/orders");
const { checkAuth } = require("../middlewares/auth");

// Create a new order
router.post("/create", checkAuth, createOrder);

// Get all orders for the logged-in user
router.get("/my-orders", checkAuth, getMyOrders);

// Get a specific order by ID
router.get("/:orderId", checkAuth, getOrderById);

// Update an order (admin only)
router.put("/:orderId", checkAuth, updateOrder);

// Cancel an order
router.post("/:orderId/cancel", checkAuth, cancelOrder);

// Return an order
router.post("/:orderId/return", checkAuth, returnOrder);

// Request refund
router.post("/:orderId/refund", checkAuth, requestRefund);

module.exports = router;
