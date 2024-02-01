import app from "./app.js";
import { config } from "dotenv"
import connectDatabase from "./config/database.js"
import cloudinary from 'cloudinary'
 
// Handling Uncaught Exception if someone log or put the unknown variable
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Uncaught Exception');
    process.exit(1)
})

// config

if (process.env.NODE_ENV !== "PRODUCTION") {
    config({
        path: "./config/config.env"
    })
}

// connecting to database
connectDatabase()

// to upload the image in cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
}) 
const PORT = process.env.PORT || 5000;
const server = app.listen(process.env.PORT, () => {
    console.log(`server is working on ${process.env.PORT}`);
})

// Unhandled Promise Rejection if someone try to change the database string
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Unhandled Promise Rejection');

    server.close(() => {
        process.exit(1)
    })
}) 