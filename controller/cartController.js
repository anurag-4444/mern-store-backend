import mongoose from "mongoose";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import Cart from "../model/cartModel.js";

// adding product to the cart
export const addToCart = catchAsyncError(async (req, res) => {

    const { productId, quantity = 1 } = req.body
    let userCart = await Cart.findOne({ user: req.user._id });
  
    if (!userCart) {
        // If user doesn't have a cart yet, create one
        userCart = await Cart.create({
            user: req.user._id,
            products: [{ product: productId, quantity }],
        });
    } else {
        // Check if the product already exists in the cart
        // const existingProductIndex = userCart.products.findIndex(item => item.product.equals(productId));

        const existingProductIndex = userCart.products.findIndex(item => {
            const itemProductId = item.product instanceof mongoose.Types.ObjectId
                ? item.product.toString()
                : mongoose.Types.ObjectId(item.product).toString();

            return itemProductId === productId.toString();
        });

        if (existingProductIndex >= 0) {
            // If the product exists, update the quantity
            userCart.products[existingProductIndex].quantity = quantity;
            // console.log(existingProductIndex);
        } else {
            // If the product doesn't exist, add it to the cart
            userCart.products.push({ product: productId, quantity });
        }

        // Save the changes to the cart
        await userCart.save();
        // console.log(userCart.products);
    }

    res.status(200).json({ success: true, message: "Product added to cart successfully", userCart })

})

// getting product form user cart
export const getProductCart = catchAsyncError(async (req, res) => {

    const userCart = await Cart.findOne({ user: req.user }).populate('products.product');

    if (!userCart) return res.status(200).json({ success: true, cartProducts: [] })

    res.status(200).json({ success: true, cartProducts: userCart.products })

})

// deleting product from user cart
export const removeFromCart = catchAsyncError(async (req, res) => {

    const { productId } = req.body
    const userCart = await Cart.findOne({ user: req.user });

    userCart.products = userCart.products.filter(
        (item) => item.product.toString() !== productId
    );
    await userCart.save();

    res.status(200).json({ success: true, message: "Product removed from cart successfully" })

})