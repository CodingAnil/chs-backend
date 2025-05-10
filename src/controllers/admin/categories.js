const { sendResponse } = require("../../utils");
const Category = require("../../models/categories");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, subcategories } = req.body;

    // Validate that at least one subcategory is provided
    if (!subcategories || subcategories.length === 0) {
      return sendResponse(res, 400, "At least one subcategory is required");
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return sendResponse(res, 400, "Category name already exists");
    }

    const category = new Category({
      name,
      description,
      subcategories
    });

    await category.save();
    return sendResponse(res, 201, "Category created successfully", category);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Get all categories with search
exports.getAllCategories = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    // Create search query
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Pagination
    const skip = (page - 1) * limit;
    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Category.countDocuments(query);

    return sendResponse(res, 200, "Categories retrieved successfully", categories, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendResponse(res, 404, "Category not found");
    }

    return sendResponse(res, 200, "Category fetched successfully", category);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, subcategories } = req.body;

    // Check if category name already exists (excluding current category)
    if (name) {
      const existingCategory = await Category.findOne({
        name,
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return sendResponse(res, 400, "Category name already exists");
      }
    }

    // Validate that at least one subcategory is provided
    if (subcategories && subcategories.length === 0) {
      return sendResponse(res, 400, "At least one subcategory is required");
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, subcategories },
      { new: true }
    );

    if (!category) {
      return sendResponse(res, 404, "Category not found");
    }

    return sendResponse(res, 200, "Category updated successfully", category);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return sendResponse(res, 404, "Category not found");
    }

    return sendResponse(res, 200, "Category deleted successfully", category);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
}; 