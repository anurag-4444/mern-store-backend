import express from "express";
import product from "./routes/productRoute.js"
import { errorMiddleware } from "./middleware/error.js";
import user from "./routes/userRoute.js"
import cart from "./routes/cartRoute.js"
import wishlist from "./routes/wishlistRoute.js"
import cookieParser from "cookie-parser";
import order from "./routes/orderRoute.js"
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import path from 'path'
import cors from 'cors'
import { fileURLToPath } from "url";

const app = express();

// "build": "npm run build:prod"
// app.use(cors({
//     origin: 'https://mern-project-ecommerce-alpha.vercel.app',
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// app.use(cors())
app.use(cors({
    origin: 'http://localhost:3000', // Specify the origin of your frontend
    credentials: true, // Allow credentials (cookies)
  }));


// app.use((req, res, next) => {
//     res.setHeader('Cache-Control', 'no-store');
//     next();
// });

// To send the json over the server
app.use(express.json())

// To get the token in the cookie
app.use(cookieParser())

// for uploading image
app.use(bodyParser.urlencoded({ extended: true }))
app.use(fileUpload())


// const __filename = new URL(import.meta.url).pathname;
// const __dirname = path.dirname(__filename);

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

app.use("/api/v1", product)
app.use("/api/v1", user)
app.use("/api/v1", order)
app.use("/api/v1", cart)
app.use("/api/v1", wishlist)

// const rootDir = "C:\\project\\E-Commerce app"; // Specify the root directory

// const absolutePath = path.resolve(__dirname, "frontend", "build");

// app.use(express.static(absolutePath));
// app.get("/", (req, res) => {
//     res.sendFile(path.join(absolutePath, "index.html"));
// });


// {
//   "rewrites": [
//       {"source": "/(.*)", "destination": "/"}
//   ]
// }

// app.get('/favicon.ico', (req, res) => {
//   res.json("hello favicon")
// });

// app.get('/', (req, res) => {
//   res.json("hello")
// });

// app.get("*", (req, res) => {
//   res.setHeader("Content-Type", "text/html");
//   const filePath = path.join(rootDir, "frontend/build/index.html");
//   res.sendFile(filePath);
// });

// app.get("*", (req, res) => {
//   const excludedPaths = [
//     "/",
//     "/product/:id",
//     "/auth/google",
//     // Add other frontend routes here, based on your React app's configuration
//     "/account",
//     "/wishlist",
//     "/myorders",
//     "/mycart",
//     "/checkout",
//     "/payment",
//     "/admin/*",
//     "/*"
//   ];

//   if (!excludedPaths.includes(req.path)) {
//     const filePath = path.join(rootDir, "frontend/build/index.html");
//     res.setHeader("Content-Type", "text/html");
//     res.sendFile(filePath);
//   } else {
//     // Handle as a backend request or pass it to other middleware
//     // Adjust this logic based on your requirements for excluded paths
//     console.log("Backend request:", req.path);
//     res.status(404).send("Not found"); // Example: Return a 404 status code
//   }
// });



// Using Error Middleware
app.use(errorMiddleware)

export default app; 