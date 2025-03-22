const Cart = require("../models/Cart");
const { sendResponse } = require("../utils");

// ✅ Add Product to Cart
const addProductToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

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

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) return sendResponse(res, 404, "Cart not found");

    sendResponse(res, 200, "Cart items fetched", cart);
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
};
