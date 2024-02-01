import mongoose from "mongoose";
import validator from 'validator'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    googleId: {    
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    role: {
        type: String,
        default: "user"
    },
    // This is not strictly necessary, but if you want to manually define it:
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // This will automatically add `createdAt` and `updatedAt` fields
});

export default mongoose.model("User", userSchema);