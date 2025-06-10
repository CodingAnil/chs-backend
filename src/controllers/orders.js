const Order = require("../models/order");
const Product = require("../models/products");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod, notes } = req.body;

    // Validate products array
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Products array is required and must not be empty",
      });
    }

    // Calculate total amount and validate products
    let totalAmount = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          status: false,
          message: `Product not found with ID: ${item.productId}`,
        });
      }
      totalAmount += product.price * item.quantity;
    }

    const order = new Order({
      userId: req.user._id,
      products,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes,
    });

    await order.save();

    res.status(201).json({
      status: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while creating the order",
    });
  }
};

// Get all orders for the logged-in user
const getMyOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      search,
    } = req.query;

    // Build query
    let query = { userId: req.user._id };

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Search in products
    if (search) {
      query.$or = [
        {
          "products.productId.productId.name": {
            $regex: search,
            $options: "i",
          },
        },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    console.log(query, "qqqqqqqqqqqq");
    const orders = await Order.find(query)
      .populate({
        path: "products.productId",
        model: "Products",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      status: true,
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching orders",
    });
  }
};

// Get a specific order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        status: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    }).populate({
      path: "products.productId",
      model: "Products",
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    res.json({
      status: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching the order",
    });
  }
};

// Update an order (admin only)
const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    if (!validateObjectId(orderId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    // Update fields
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    await order.save();

    res.json({
      status: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while updating the order",
    });
  }
};

// Cancel an order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!orderId) {
      return res.status(400).json({
        status: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (!["created", "in_progress"].includes(order.status)) {
      return res.status(400).json({
        status: false,
        message: "Order cannot be cancelled in its current status",
      });
    }

    order.status = "cancelled";
    order.notes = reason || "Cancelled by user";
    await order.save();

    res.json({
      status: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while cancelling the order",
    });
  }
};

// Return an order
const returnOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!orderId) {
      return res.status(400).json({
        status: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    // Check if order can be returned
    if (order.status !== "completed") {
      return res.status(400).json({
        status: false,
        message: "Only completed orders can be returned",
      });
    }

    order.status = "returned";
    order.returnReason = reason;
    await order.save();

    res.json({
      status: true,
      message: "Return request submitted successfully",
      data: order,
    });
  } catch (error) {
    console.error("Return order error:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while processing the return request",
    });
  }
};

// Request refund
const requestRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!orderId) {
      return res.status(400).json({
        status: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Order not found",
      });
    }

    // Check if order can be refunded
    if (!["completed", "returned"].includes(order.status)) {
      return res.status(400).json({
        status: false,
        message: "Order cannot be refunded in its current status",
      });
    }

    order.status = "refunded";
    order.refundReason = reason;
    order.paymentStatus = "refunded";
    await order.save();

    res.json({
      status: true,
      message: "Refund request submitted successfully",
      data: order,
    });
  } catch (error) {
    console.error("Refund request error:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while processing the refund request",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrder,
  cancelOrder,
  returnOrder,
  requestRefund,
};
