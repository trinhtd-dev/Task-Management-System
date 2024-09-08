import mongoose from "mongoose";

const forgotPasswordSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiredAt: {
        type: Date,
        default: Date.now() + 5 * 60 * 1000,
    },
  
});

export default mongoose.model("ForgotPassword", forgotPasswordSchema, "forgot-passwords");