import express from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { addToCart, getProductCart, removeFromCart } from "../controller/cartController.js"

const router = express.Router()

router.post("/me/add/product/cart", isAuthenticated, addToCart)

router.get("/me/product/cart", isAuthenticated, getProductCart)

router.delete("/me/delete/product/cart", isAuthenticated, removeFromCart)

export default router