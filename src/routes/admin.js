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
  createContact,
} = require("../controllers/admin/products");
const { setQueryType } = require("../middlewares/middle");
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

router.post("/contact", createContact);


module.exports = router;
