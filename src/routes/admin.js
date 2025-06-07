const express = require("express");
const {
  login,
  forgotPassword,
  resetPassword,
  getAllUsers,
  adminLogin,
} = require("../controllers/user");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} = require("../controllers/admin/products");
const { setQueryType } = require("../middlewares/middle");
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  createContact,
} = require("../controllers/admin/feedback");
const categoryRoutes = require("./admin/categories");
const { checkAuth } = require("../middlewares/auth");
const { getAllAppointments } = require("../controllers/admin/appointments");

const router = express.Router();

// router.get("/plans", getPlans);
router.post("/login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);

// router.put("/suspend-account/:id", checkAdminAuth, suspendUser);

// pharmacy products
router.post("/product", createProduct);
router.get("/products", getProducts);
router.get("/product/:id", getProductById);
router.put("/product/:id", updateProduct);
router.delete("/product/:id", deleteProduct);
router.patch("/product-status/:id", updateProductStatus);

// get all users
router.get("/all-patients", setQueryType("patient"), getAllUsers);
router.get("/all-doctors", setQueryType("doctor"), getAllUsers);

// contact us
router.post("/contact", createContact);

//  Apply for Team
router.post("/apply", createApplication);
router.get("/applications", getAllApplications);
router.get("/applications/:id", getApplicationById);
router.put("/applications/:id", updateApplication);

// Add this new route before the category routes
router.get("/appointments", checkAuth, getAllAppointments);

// Category routes
router.use("/categories", categoryRoutes);

module.exports = router;
