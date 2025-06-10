const express = require("express");
const router = express.Router();
const {
  getAllOrderedProducts,
  getOrderAnalytics,
  getOrderDetailsById,
} = require("../../controllers/admin/orderController");
const { checkAuth, checkAdminAuth } = require("../../middlewares/auth");

// Get all ordered products with filters
router.get("/products", checkAuth, getAllOrderedProducts);

// Get order analytics
router.get("/analytics", checkAuth, getOrderAnalytics);

// Get order details by ID
router.get("/:orderId", checkAuth, getOrderDetailsById);

module.exports = router; 