import mongoose from "mongoose"
import { catchAsyncError } from "../middleware/catchAsyncError.js"
import Product from "../model/productModel.js"
import ApiFeatures from "../utils/apiFeatures.js"
import ErrorHandler from "../utils/errorHandler.js"
import cloudinary from 'cloudinary'

// Create Product -- Admin


const uploadImageToCloudinary = async (files) => {
    const uploadPromises = [];

    for (const key in files) {
        if (Object.hasOwnProperty.call(files, key)) {
            const image = files[key];

            if (image && image.data) {
                // Use cloudinary.uploader.upload to upload the base64-encoded image
                const uploadPromise = cloudinary.uploader.upload(`data:${image.mimetype};base64,${image.data.toString('base64')}`, {
                    folder: "products",
                    resource_type: "image",
                });

                uploadPromises.push(uploadPromise);
            }
        }
    }

    try {
        const results = await Promise.all(uploadPromises);
        const uploadedImages = results.map(result => ({
            public_id: result.public_id,
            url: result.secure_url,
        }));

        return uploadedImages;
    } catch (error) {
        console.error('Error uploading images to Cloudinary:', error);
        throw error;
    }
};

export const createProduct = catchAsyncError(async (req, res) => {
    // console.log(req.files);

    const uploadedImages = await uploadImageToCloudinary(req.files);
    // console.log(uploadedImages);
    // console.log(req.body);
    const { name, price, stock, description, category } = req.body

    const product = await Product.create({ name, price, Stock: stock, description, category, images: uploadedImages, user: req.user._id });

    console.log("successfull");
    res.status(201).json({
        success: true,
        product,
    });
});

// Get All Product
export const getAllProducts = catchAsyncError(async (req, res) => {
    // const resultPerPage = 10;
    // console.log(req.query.all);
    const { all, ...otherQueryParams } = req.query;
    const resultPerPage = all ? -1 : 10;
    const productCount = await Product.countDocuments()

    const apiFeatures = new ApiFeatures(Product.find(), otherQueryParams).search().filter()
    // .pagination(resultPerPage)

    // let products = await apiFeatures.query
    // let filteredProductCount = products.length
    // apiFeatures
    // products = await apiFeatures.query

    // Get count of products after search and filter but before pagination
    const filteredProductCount = await Product.countDocuments(apiFeatures.query);
    apiFeatures.pagination(resultPerPage);

    
    const products = await apiFeatures.query
    // console.log(products);
    return res.status(200).json({
        success: true,
        products,
        productCount,
        filteredProductCount
    })

})



// Update Product -- Admin
export const updateProduct = catchAsyncError(async (req, res) => {
    // console.log(req.files);
    // console.log(req.body);

    const uploadedImages = await uploadImageToCloudinary(req.files);

    // const imageLinks = Object.keys(req.body)
    //     .filter(key => key.startsWith('images['))
    //     .map(key => req.body[key]);

    // console.log('Image Links:', imageLinks);

    const imageRemoveLinks = Object.keys(req.body)
        .filter(key => key.startsWith('removeImages['))
        .map(key => req.body[key]);

    // console.log('Image Remove Links:', imageRemoveLinks);

    // // Find the product
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    // Extract public_ids from product.images based on matching URLs
    const publicIdsToRemove = product.images
        .filter(image => imageRemoveLinks.includes(image.url))
    // .map(image => image.public_id);

    const publicIds = product.images
        .filter(image => !imageRemoveLinks.includes(image.url))

    // console.log(publicIdsToRemove);

    // Perform Cloudinary deletion based on public_id (optional)
    await Promise.all(publicIdsToRemove.map(ele => cloudinary.v2.uploader.destroy(ele.public_id)));

    // console.log(publicIds);
    // console.log(uploadedImages);
    product.images = []
    product.images.push(...uploadedImages, ...publicIds);

    const { name, price, description, category, stock } = req.body;
    product.name = name;
    product.price = price;
    product.description = description;
    product.category = category;
    product.Stock = stock;

    await product.save();

    res.status(200).json({
        success: true,
        product
    });
});



// Delete Product -- Admin
export const deleteProduct = catchAsyncError(async (req, res) => {
    let product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }

    // Delete images from cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await product.deleteOne();
    res.status(200).json({
        success: true,
        message: "Product Deleted Successfully"
    })

})

// Get Product Details
export const getProductDetails = catchAsyncError(async (req, res, next) => {

    let product = await Product.findById(req.params.id)

    const ratingCounts = {};
    product.reviews.forEach((review) => {
        const rating = review.rating;
        if (!ratingCounts[rating]) {
            ratingCounts[rating] = 1;
        } else {
            ratingCounts[rating]++;
        }
    });

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }

    console.log(product);

    res.status(200).json({
        success: true,
        product,
        ratingCounts,
    })

})

// Create New Review or Update Review
export const createProductReview = catchAsyncError(async (req, res, next) => {
    const { rating, comment, productId } = req.body

    const review = {
        user: req.user.id,
        name: req.user.name,
        image: req.user.avatar.url,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find((ele) => ele.user.toString() === req.user._id.toString())

    if (isReviewed) {
        product.reviews.forEach(ele => {
            if (ele.user.toString() === req.user._id.toString()) {
                ele.rating = rating
                ele.comment = comment
            }
        });
    } else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

    let avg = 0;
    if (product.reviews.length > 0) {
        product.reviews.forEach((element) => {
            avg += element.rating;
        })
    }

    const ratingCounts = {};
    product.reviews.forEach((review) => {
        const rating = review.rating;
        if (!ratingCounts[rating]) {
            ratingCounts[rating] = 1;
        } else {
            ratingCounts[rating]++;
        }
    });

    product.ratings = avg / product.reviews.length


    await product.save({ validateBeforeSave: false })
    res.status(200).json({
        success: true,
        ratingCounts
    })
})

// Get All Reviews of a Product
export const getAllProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id)

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }

    const ratingCounts = {};
    product.reviews.forEach((review) => {
        const rating = review.rating;
        if (!ratingCounts[rating]) {
            ratingCounts[rating] = 1;
        } else {
            ratingCounts[rating]++;
        }
    });

    res.status(200).json({
        success: true,
        reviews: product.reviews,
        ratingCounts
    })
})


// Delete Reviews of a Product
export const deleteProductReviews = catchAsyncError(async (req, res, next) => {
    // console.log(req.query.productId);
    // console.log(req.query.id);
    const product = await Product.findById(req.query.productId)

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404))
    }

    const reviews = product.reviews.filter(ele => (ele._id.toString() !== req.query.id.toString()))

    let avg = 0
    let ratings = 0

    if (reviews.length > 0) {
        reviews.forEach(element => {
            avg += element.rating
        })
        ratings = avg / reviews.length
    }

    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        ratings, numOfReviews, reviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true,
    })
})