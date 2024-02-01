import User from "../model/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";
import jwt_decode from "jwt-decode"

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies

    // console.log(req.cookies);
    // console.log("Host:", req.headers.host);
    // console.log("Origin:", req.headers.referer);

    if (!token) return next(new ErrorHandler("Please login to access this resource"))

    // const decodedData = jwt.verify(token, process.env.JWT_SECRET)    

    const userObj = jwt_decode(token)

    req.user = await User.findOne({ googleId: userObj.sub })

    if (!req.user) {
        return next(new ErrorHandler("No User Found", 404));
    }
    next()
    // console.log("Adfadsf");
})

export const authorizeRoles = catchAsyncError(async (req, res, next) => {
    if ("admin" === req.user.role) {
        next()
    }
    else {
        next(new ErrorHandler("Only admin can access this resource", 403))
    }
})
