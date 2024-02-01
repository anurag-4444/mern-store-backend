import { catchAsyncError } from "../middleware/catchAsyncError.js";
import Wishlist from "../model/wishlistModel.js";

// adding product to the cart
export const addToWishlist = catchAsyncError(async (req, res) => {

    // console.log('add wishlist');

    const { productId } = req.body
    let userCart = await Wishlist.findOne({ user: req.user._id });
// console.log(userCart);
    if (!userCart) {
        // If user doesn't have a cart yet, create one
        userCart = await Wishlist.create({
            user: req.user._id, 
            products: [productId],
        });
    } else {
        // Check if the product already exists in the cart
        const existingProduct = userCart.products.find(item => item.equals(productId));

        if (existingProduct) {
            // If the product exists, update the quantity
            // existingProduct.quantity += quantity;
        } else {
            // If the product doesn't exist, add it to the cart
            userCart.products.push(productId);
        }

        // Save the changes to the cart
        await userCart.save();
    }

    res.status(200).json({ success: true, message: "Product added to wishlist successfully", userCart })

})

// getting product form user cart
export const getProductWishlist = catchAsyncError(async (req, res) => {
    const userWishlist = await Wishlist.findOne({ user: req.user }).populate('products');
    if (!userWishlist) return res.status(200).json({ success: true, wishlistProducts: [] })

    res.status(200).json({ success: true, wishlistProducts: userWishlist.products })

})

// deleting product from user cart
export const removeFromWishlist = catchAsyncError(async (req, res) => {

    const { productId } = req.body

    const userWishlist = await Wishlist.findOne({ user: req.user });

    userWishlist.products = userWishlist.products.filter(
        (item) => item.toString() !== productId
    );

    await userWishlist.save();

    res.status(200).json({ success: true, message: "Product removed from cart successfully" })

})