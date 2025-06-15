import mongoose from "mongoose";

const forgotPasswordSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    token: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ForgotPassword",
  forgotPasswordSchema,
  "forgot-password"
);
