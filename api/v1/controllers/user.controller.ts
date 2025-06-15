import { Request, Response } from "express";
interface RequestWithUser extends Request {
  user?: any;
}

import bcrypt from "bcrypt";

import User from "../models/user.model";
import ForgotPassword from "../models/forgot-password";

import { generateToken, generateOtp } from "../../../helpers/generate";
import { sendMail } from "../../../helpers/mail.helper";

// [POST] /api/v1/user/register
export const registerUser = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        code: 400,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const token = generateToken();

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      token: token,
    });
    res.status(201).json({
      code: 201,
      message: "User created successfully",
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [POST] /api/v1/user/login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        message: "Invalid password",
      });
    }

    // Always generate a new token and update it in the database
    const token = generateToken();
    await User.updateOne({ email }, { token: token });

    res.status(200).json({
      code: 200,
      message: "Login successfully",
      token: token, // Return the new token
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [POST] /api/v1/user/password/forgot
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }
    const otp = generateOtp();
    await ForgotPassword.create({
      email: email,
      otp: otp,
      expiresAt: Date.now() + 3 * 60 * 1000, // OTP expires in 3 minutes
    });

    // Send email
    const subject = "OTP for password recovery";
    const html = `Your OTP is: <b>${otp}</b>. It will expire in 3 minutes.`;
    await sendMail(email, subject, html);

    res.status(200).json({
      code: 200,
      message: "Sent OTP to your email",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [POST] /api/v1/user/password/otp
export const otp = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const otp = req.body.otp;

    const forgotPasswordRecord = await ForgotPassword.findOne({ email, otp });

    if (!forgotPasswordRecord) {
      return res.status(400).json({
        code: 400,
        message: "OTP is invalid",
      });
    }

    if (forgotPasswordRecord.expiresAt < new Date()) {
      return res.status(400).json({
        code: 400,
        message: "OTP has expired",
      });
    }

    const resetToken = generateToken(); // Generate a new single-use token
    forgotPasswordRecord.token = resetToken;
    await forgotPasswordRecord.save();

    res.status(200).json({
      code: 200,
      message: "OTP is valid. Use this token to reset your password.",
      resetToken: resetToken,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [POST] /api/v1/user/password/reset
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        code: 400,
        message: "Token and password are required",
      });
    }

    const forgotPasswordRecord = await ForgotPassword.findOne({ token: token });

    if (!forgotPasswordRecord) {
      return res.status(400).json({
        code: 400,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findOne({ email: forgotPasswordRecord.email });
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
      }
    );

    // Delete the record after successful password reset
    await ForgotPassword.deleteOne({ _id: forgotPasswordRecord._id });

    res.status(200).json({
      code: 200,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [GET] /api/v1/user/profile
export const getProfile = async (req: RequestWithUser, res: Response) => {
  try {
    const user = req.user;
    res.status(200).json({
      code: 200,
      message: "Get profile successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [GET] /api/v1/user/logout
export const logout = async (req: RequestWithUser, res: Response) => {
  try {
    const user = req.user;
    await User.updateOne(
      { token: user.token },
      {
        token: null,
      }
    );
    res.status(200).json({
      code: 200,
      message: "Logout successfully",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [PATCH] /api/v1/user/update-role/:id
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role || !["admin", "member"].includes(role)) {
      return res.status(400).json({
        code: 400,
        message: "Invalid role specified. Must be 'admin' or 'member'.",
      });
    }

    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    await User.updateOne({ _id: userId }, { role: role });

    res.status(200).json({
      code: 200,
      message: "User role updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};
