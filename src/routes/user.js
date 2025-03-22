const express = require("express");
const router = express.Router();

const {
  signUp,
  login,
  updateUser,
  updateDp,
  getUser,
  forgotPassword,
  getUpdatedProfile,
  verifyOtp,
  resetPassword,
  deleteUserDp,
} = require("../controllers/user");
const { upload } = require("../middlewares/multerS3");
const { checkAuth } = require("../middlewares/auth");
const { uploadFile } = require("../middlewares/uploadfile");
const {
  addProductToCart,
  updateCartItem,
  deleteCartItem,
  getAllCartItems,
} = require("../controllers/cartController");

router.post("/register", signUp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/verify-otp", verifyOtp);
router.put("/reset-password", resetPassword);
router.put("/update/:userId", updateUser);
router.delete("/delete-dp/:userId", deleteUserDp);

router.put(
  "/change-dp",
  checkAuth,
  // upload.single("dp"),
  updateDp
);
router.post("/upload-file", upload.single("file"), uploadFile);
router.get("/", checkAuth, getUser);
router.get("/:userId", getUpdatedProfile);

//  cart items
router.post("/cart/:userId", addProductToCart); // Add product to cart
router.put("/cart/:userId/:productId", updateCartItem); // Update product quantity
router.delete("/cart/:userId/:productId", deleteCartItem); // Delete product from cart
router.get("/cart/:userId", getAllCartItems); // Get all cart items for a user

module.exports = router;
