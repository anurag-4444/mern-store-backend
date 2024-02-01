import { catchAsyncError } from "../middleware/catchAsyncError.js"
import Order from "../model/orderModel.js"
import Product from "../model/productModel.js"
import ErrorHandler from "../utils/errorHandler.js"
import Cart from "../model/cartModel.js";


export const newOrder = catchAsyncError(async (req, res, next) => {
    const { shippingInfo, orderItems, itemsPrice, shippingPrice, totalPrice } = req.body

    // const stockMessage = []
    // orderItems.forEach(async (order) => {
    //     const product = await Product.findById(order.product)
    //     if (!product) return next(new ErrorHandler("Product Not Found", 404))
    //     let inStock = 0
    //     inStock = product.Stock - order.quantity
    //     if (inStock < 0) stockMessage.push({ name: product.name, message: "Not in Stock" })
    // })
    // const userCart = await Cart.findOne({ user: req.user }).populate('products.product');
    const order = await Order.create({ shippingInfo, orderItems, itemsPrice, shippingPrice, totalPrice, paidAt: Date.now(), user: req.user._id })

    res.status(201).json({
        success: true,
        order,
    })
})
// export const newOrder = catchAsyncError(async (req, res, next) => {
//     const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body

//     // const stockMessage = []
//     // orderItems.forEach(async (order) => {
//     //     const product = await Product.findById(order.product)
//     //     if (!product) return next(new ErrorHandler("Product Not Found", 404))
//     //     let inStock = 0
//     //     inStock = product.Stock - order.quantity
//     //     if (inStock < 0) stockMessage.push({ name: product.name, message: "Not in Stock" })
//     // })
//     // const userCart = await Cart.findOne({ user: req.user }).populate('products.product');
//     const order = await Order.create({ shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, paidAt: Date.now(), user: req.user._id })

//     res.status(201).json({
//         success: true,
//         order,
//     })
// })

// get Single Order
export const getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email")

    if (!order) return next(new ErrorHandler("Order not found with this id", 404))

    res.status(200).json({
        success: true,
        order,
    })
})

// Get Logged in User Orders
export const myOrder = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })

    res.status(200).json({
        success: true,
        orders,
    })
})

// get ALl Order --- Admin
export const getAllOrder = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find()

    let totalAmount = 0

    orders.forEach(order => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    })
})

// Update Order Status --- Admin
export const updateOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Order not found with this id", 404))

    if (order.orderStatus === "Delivered") return next(new ErrorHandler("You have already delivered this order", 404))

    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (element) => {
            await updateStock(element.product, element.quantity)
        })
    }

    order.orderStatus = req.body.status

    if (req.body.status === "Delivered") order.deliveredAt = Date.now()

    await order.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true,
        message: "Order Updated Successfully",
    })
})

async function updateStock(id, quantity) {
    const product = await Product.findById(id)

    product.Stock -= quantity

    await product.save({ validateBeforeSave: false })
}

// Delete Order
export const deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (!order) return next(new ErrorHandler("Order not found with this id", 404))

    await order.deleteOne()

    res.status(200).json({
        success: true,
        message: "Order Deleted Successfully",
    })
})