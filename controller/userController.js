import { catchAsyncError } from "../middleware/catchAsyncError.js"
import ErrorHandler from "../utils/errorHandler.js"
import User from "../model/userModel.js"
import bcrypt from "bcryptjs"
import sendCookie from "../utils/cookieFeature.js"
import sendEmail from "../utils/sendEmail.js"
import jwt_decode from "jwt-decode"
import cloudinary from 'cloudinary'
// import { promisify } from 'util'
import streamifier from 'streamifier'

// Register a User
export const registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
        name, email, password: hashedPassword,
        avatar: {
            public_id: "this is a sample id",
            url: "samplePicture"
        }
    })

    sendCookie(user, res, 201, "Successfully SignUp")
})

// Login a User
export const loginSignup = catchAsyncError(async (req, res, next) => {

    const { token } = req.body

    const userObj = jwt_decode(token)

    // console.log(userObj);
    const { email, name, sub, picture } = userObj

    let user = await User.findOne({ email })

    if (!user) {

        const myCloud = await cloudinary.v2.uploader.upload(picture, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        })

        user = await User.create({
            name, email, googleId: sub,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        })
    }
    sendCookie(user, res, 200, token, `Welcome back ${name}`)
})

// Logout a User
export const logout = catchAsyncError(async (req, res, next) => {

    res
        .cookie("token", null, {
            expires: new Date(Date.now()),
            sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
            secure: process.env.NODE_ENV === "Development" ? false : true,
        })
        .status(200)
        .json({
            success: true,
            message: "Successfully Logged Out"
        })
})



// Forgot Password
export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) return next(new ErrorHandler("User Not Found", 404))
    // console.log(user);
    // Get ResetPassword Token 
    const resetToken = user.getResetPasswordToken()
    cons / ole.log(resetToken);
    await user.save({ validateBeforeSave: false })
    // console.log(user);
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it`

    try {
        await sendEmail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message,
        })

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))
    }

    // console.log('end');
})

// Reset Password
export const resetPassword = catchAsyncError(async (req, res, next) => {

    //     // creating token hash
    //     const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    //     const user = await User.findOne({
    //         resetPasswordToken,
    //         resetPasswordExpire: { $gt: Date.now() }
    //     })

    //     if (!user) return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 404))

    //     if (req.body.password !== req.body.confirmPassword) {
    //         return next(new ErrorHandler("Password does not match", 404))
    //     }

    //     user.password = req.body.password

    //     user.resetPasswordToken = undefined
    //     user.resetPasswordExpire = undefined
    //     await user.save()

    //     sendCookie(user, res, 200, `Welcome back ${user.name}`)
})

// get user detail
export const getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user,
    })
})


// Update User Password
export const updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")
    console.log(user.password);
    const isPasswordMatched = await bcrypt.compare(req.body.oldPassword, user.password)

    if (!isPasswordMatched) return next(new ErrorHandler("Invalid Email or Password", 401))

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 404))
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10)

    user.password = hashedPassword

    await user.save()

    sendCookie(user, res, 200, `Password Updated Successfully`)
})

// Update User Profile Name
export const updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserName = {
        name: req.body.name
    }

    await User.findByIdAndUpdate(req.user.id, newUserName, {
        new: true,
        runValidators: true,
        useFindAndModify: false,   
    })

    res.status(200).json({
        success: true,
    })
})

// Update User Profile Avatar
// export const updateAvatar = catchAsyncError(async (req, res, next) => {

//     console.log('inside backend');
//     // console.log(req.body);
//     console.log(req.files.avatar);

//     const myCloud = await cloudinary.v2.uploader.upload(req.files.avatar, {
//         folder: "avatars",
//         width: 150,
//         crop: "scale",
//     })

//     const newUserAvatar = {
//         avatar: {
//             public_id: myCloud.public_id,
//             url: myCloud.secure_url,
//         }
//     }

//     await User.findByIdAndUpdate(req.user.id, newUserAvatar, {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//     })

//     res.status(200).json({
//         success: true,
//         message: "avatar updated",
//     })
// })

const uploadImageToCloudinary = async (file) => {
    try {
        if (!file || !file.data) {
            throw new Error('Invalid file');
        }

        // Use cloudinary.uploader.upload to upload the base64-encoded image
        const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.data.toString('base64')}`, {
            folder: "products",
            resource_type: "image",
        });

        const uploadedImage = {
            public_id: result.public_id,
            url: result.secure_url,
        };

        return uploadedImage;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};


export const updateAvatar = catchAsyncError(async (req, res, next) => {
    // console.log(req.files);

    const file = req.files.image;
    const uploadedImage = await uploadImageToCloudinary(file);

//     // Check if the user has an existing avatar
    const user = await User.findById(req.user.id);

//     // If an avatar exists, delete it from Cloudinary
    if (user.avatar && user.avatar.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }

//     // Upload the new avatar to Cloudinary
//     const result = await cloudinary.uploader.upload(file.tempFilePath, {
//         folder: 'avatars', // Set your desired folder in Cloudinary
//     });

//     // Update the user's avatar information in the database
    const newUserAvatar = {
        avatar: {
            public_id: uploadedImage.public_id,
            url: uploadedImage.url,
        },
    };

    await User.findByIdAndUpdate(req.user.id, newUserAvatar, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: 'Avatar updated',
    });
});

// // Get all users (admin)
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
})

// Get Single User (admin)
export const getSingleUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) return next(new ErrorHandler(`User does not exit with id: ${req.params.id}`))

    res.status(200).json({
        success: true,
        user,
    })
})

// Update User Role (admin)
export const updatUsereRole = catchAsyncError(async (req, res, next) => {
    console.log(req.body);
    const newUserDetail = {
        // name: req.body.name,
        // email: req.body.email,
        role: req.body.role,
    }

    let user = await User.findById(req.params.id)
    if (!user) return next(new ErrorHandler(`User does not exit with id: ${req.params.id}`))
    user = await User.findByIdAndUpdate(req.params.id, newUserDetail, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })


    res.status(200).json({
        success: true,
        message: "User Role Updated Successfully"
    })
})


// Delete User (admin)
export const deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id)

    if (!user) return next(new ErrorHandler(`User does not exit with id: ${req.params.id}`))

    await cloudinary.v2.uploader.destroy(user.avatar.public_id)

    await user.deleteOne()

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    })
})