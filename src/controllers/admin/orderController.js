const Order = require("../../models/order");

// Get all ordered products with filters
const getAllOrderedProducts = async (req, res) => {
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
    let query = {};

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

    const orders = await Order.find(query)
      .populate({
        path: "products.productId",
        model: "Products",
      })
      .populate("userId", "name email")
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
    console.error("Get all ordered products error:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching ordered products",
    });
  }
};

// Get order analytics
const getOrderAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};

    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) {
        dateQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateQuery.createdAt.$lte = new Date(endDate);
      }
    }

    // Get total orders
    const totalOrders = await Order.countDocuments(dateQuery);

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get total revenue from completed orders
    const revenueData = await Order.aggregate([
      {
        $match: {
          ...dateQuery,
          status: "completed",
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const analytics = {
      totalOrders,
      ordersByStatus: ordersByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      totalRevenue: revenueData[0]?.totalRevenue || 0,
    };

    res.json({
      status: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get order analytics error:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching order analytics",
    });
  }
};

// Get order details by ID
const getOrderDetailsById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        status: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "products.productId",
        model: "Products",
      })
      .populate("userId", "name email phone");

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
    console.error("Get order details error:", error);
    res.status(500).json({
      status: false,
      message: "An error occurred while fetching order details",
    });
  }
};

module.exports = {
  getAllOrderedProducts,
  getOrderAnalytics,
  getOrderDetailsById,
};
