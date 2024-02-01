import express from "express"
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";
import { deleteOrder, getAllOrder, getSingleOrder, myOrder, newOrder, updateOrder } from "../controller/orderController.js";

const router = express.Router()

router.post("/order/new", isAuthenticated, newOrder)

router.get("/order/:id", isAuthenticated, getSingleOrder)

router.get("/orders/me", isAuthenticated, myOrder)

router.get("/admin/orders", isAuthenticated, authorizeRoles, getAllOrder)

router.route("/admin/order/:id")
    .put(isAuthenticated, authorizeRoles, updateOrder)
    .delete(isAuthenticated, authorizeRoles, deleteOrder)

export default router