import express from "express";
import { createProduct, createProductReview, deleteProduct, deleteProductReviews, getAllProductReviews, getAllProducts, getProductDetails, updateProduct } from "../controller/productController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";
import multer from 'multer';

const router = express.Router()

// Multer configuration
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage }).array('newImages[]', 3); // 'images' should match the field name in your form

router.get("/products", getAllProducts)

router.post("/admin/product/new", isAuthenticated, authorizeRoles, createProduct); // Apply the upload middleware here

router.route("/admin/product/:id")
    .put(isAuthenticated, authorizeRoles, updateProduct)
    .delete(isAuthenticated, authorizeRoles, deleteProduct)

router.get("/product/:id", getProductDetails)

router.put("/review", isAuthenticated, createProductReview)
 
router.route("/reviews")
    .get(getAllProductReviews)
    .delete(isAuthenticated, deleteProductReviews)

export default router 