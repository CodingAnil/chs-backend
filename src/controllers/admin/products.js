const { sendResponse } = require("../../utils");
const Product = require("../../models/products");

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    return sendResponse(res, 201, "Product created successfully", product);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Get all products with pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      currentPage: page = 1,
      limit = 10,
      search = "",
      category = "",
      sort = "createdAt",
      order = "desc",
    } = req.query;

    // Create search query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } }, // Case-insensitive search for name
        { description: { $regex: search, $options: "i" } }, // Case-insensitive search for description
        { companyName: { $regex: search, $options: "i" } }, // Case-insensitive search for company name
      ];
    }

    if (category) {
      query.category = category; // Exact match for category
    }

    // Pagination and sorting
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    return sendResponse(res, 200, "Product retrieved successfully", products, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Get all products with pagination
exports.getProductsForUser = async (req, res) => {
  try {
    const {
      currentPage: page = 1,
      category = "",
      sort = "createdAt",
      order = "desc",
    } = req.query;

    let limit = 20;
    let status = "Published";
    // Create search query
    let query = {};


    if (category) {
      query.category = category; // Exact match for category
    }

    if (status) {
      query.status = status; // Exact match for status
    }

    // Pagination and sorting
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    return sendResponse(res, 200, "Product retrieved successfully", products, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendResponse(res, 404, "Product not found");
    }
    return sendResponse(res, 200, "Product fetched successfully", product);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Update product by ID
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!product) {
      return sendResponse(res, 404, "Product not found");
    }
    return sendResponse(res, 200, "Product updated successfully", product);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Delete product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return sendResponse(res, 404, "Product not found");
    }

    return sendResponse(res, 200, "Product deleted successfully", product);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Update product status
exports.updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Published", "Hold", "Pending"].includes(status)) {
      return sendResponse(res, 400, "Invalid status");
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!product) {
      return sendResponse(res, 404, "Product not found");
    }

    return sendResponse(res, 200, "Status updated successfully", product);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

