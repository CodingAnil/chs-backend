const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categories");
// const { isAdmin } = require("../../middleware/auth");

// // Apply admin middleware to all routes
// router.use(isAdmin);

// Create a new category
router.post("/", categoryController.createCategory);

// Get all categories with search and pagination
router.get("/", categoryController.getAllCategories);

// Get category by ID
router.get("/:id", categoryController.getCategoryById);

// Update category
router.put("/:id", categoryController.updateCategory);

// Delete category
router.delete("/:id", categoryController.deleteCategory);

module.exports = router; 