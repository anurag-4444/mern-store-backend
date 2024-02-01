import express from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { addToWishlist, getProductWishlist, removeFromWishlist } from "../controller/wishlistController.js"

const router = express.Router()

router.post("/me/add/product/wishlist", isAuthenticated, addToWishlist)

router.get("/me/product/wishlist", isAuthenticated, getProductWishlist)

router.delete("/me/delete/product/wishlist", isAuthenticated, removeFromWishlist)

export default router