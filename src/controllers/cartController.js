const Cart = require("../models/Cart");
const { sendResponse } = require("../utils");
const Address = require("../models/userAddress");
const Payment = require("../models/paymentdetails");

// ✅ Add Product to Cart
const addProductToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price discount sellerDiscount image'
    });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    
    // Populate the product details after saving
    cart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price discount sellerDiscount image'
    });

    sendResponse(res, 200, "Product added to cart", cart);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, error.message);
  }
};

// ✅ Update Cart Item Quantity
const updateCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return sendResponse(res, 404, "Cart not found");

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) return sendResponse(res, 404, "Product not in cart");

    item.quantity = quantity;
    cart.updatedAt = Date.now();

    await cart.save();

    sendResponse(res, 200, "Cart item updated", cart);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, error.message);
  }
};

// ✅ Delete Cart Item
const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return sendResponse(res, 404, "Cart not found");

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    cart.updatedAt = Date.now();
    await cart.save();

    sendResponse(res, 200, "Product removed from cart", cart);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, error.message);
  }
};

// ✅ Get All Cart Items for User
const getAllCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name price discount sellerDiscount image stockQuantity'
    });

    if (!cart) {
      return sendResponse(res, 404, "Cart not found");
    }

    sendResponse(res, 200, "Cart items retrieved successfully", cart);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, error.message);
  }
};

// Save Address
const saveAddress = async (req, res) => {
  try {
    const {
      userId,
      name,
      mobileNo,
      email,
      city,
      pincode,
      state,
      houseNumber,
      landmark,
      type,
    } = req.body;

    // Validate required fields
    if (!userId || !name || !mobileNo || !city || !pincode || !state || !houseNumber || !type) {
      return sendResponse(res, 400, "All required fields must be provided.");
    }

    const newAddress = new Address({
      userId,
      name,
      mobileNo,
      email,
      city,
      pincode,
      state,
      houseNumber,
      landmark,
      type,
    });

    await newAddress.save();
    return sendResponse(res, 201, "Address saved successfully", newAddress);
  } catch (error) {
    console.error("Failed to save address:", error);
    sendResponse(res, 500, error.message);
  }
};


// Get all addresses for a user
const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return sendResponse(res, 400, "User ID is required.");
    }

    const addresses = await Address.find({ userId });

    if (!addresses.length) {
      return sendResponse(res, 404, "No addresses found.");
    }

    return sendResponse(res, 200, "Addresses fetched successfully", addresses);
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    sendResponse(res, 500, error.message);
  }
};


// Delete Address
const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (!userId || !addressId) {
      return sendResponse(res, 400, "User ID and Address ID are required.");
    }

    const deletedAddress = await Address.findOneAndDelete({
      _id: addressId,
      userId,
    });

    if (!deletedAddress) {
      return sendResponse(res, 404, "Address not found.");
    }

    return sendResponse(res, 200, "Address deleted successfully");
  } catch (error) {
    console.error("Failed to delete address:", error);
    sendResponse(res, 500, error.message);
  }
};

// Save Payment Details
const savePayment = async (req, res) => {
  try {
    const { userId, cardHolderName, cardNumber, expMonth, expYear, cvv } =
      req.body;

    const existingPayment = await Payment.findOne({ userId, cardNumber });

    if (existingPayment) {
      return sendResponse(res, 400, "Card already exists");
    }

    const newPayment = new Payment({
      userId,
      cardHolderName,
      cardNumber,
      expMonth,
      expYear,
      cvv,
    });

    await newPayment.save();
    return sendResponse(res, 201, "Payment saved successfully", newPayment);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, error.message);
  }
};

// Get all payment details for a user
const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ userId });

    return sendResponse(res, 200, "Payments fetched successfully", payments);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, error.message);
  }
};

module.exports = {
  addProductToCart,
  updateCartItem,
  deleteCartItem,
  getAllCartItems,
  saveAddress,
  getUserAddresses,
  deleteAddress,
  savePayment,
  getUserPayments,
};
