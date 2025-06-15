import { Request, Response } from "express";
interface RequestWithUser extends Request {
  user?: any;
}

import bcrypt from "bcrypt";

import User from "../models/user.model";
import ForgotPassword from "../models/forgot-password";

import { generateToken, generateOtp } from "../../../helpers/generate";

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
    if (!user.token) {
      const token = generateToken();
      await User.updateOne({ email }, { token: token });
    }

    res.status(200).json({
      code: 200,
      message: "Login successfully",
      token: user.token,
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
    const newForgotPassword = await ForgotPassword.create({
      email: email,
      otp: otp,
    });
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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "User not found",
      });
    }
    const forgotPassword = await ForgotPassword.findOne({ email, otp });
    if (!forgotPassword) {
      return res.status(400).json({
        code: 400,
        message: "OTP is invalid",
      });
    }
    res.status(200).json({
      code: 200,
      message: "OTP is valid",
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
export const resetPassword = async (req: RequestWithUser, res: Response) => {
  try {
    const password = req.body.password;

    if (!req.headers.authorization) {
      return res.status(400).json({
        code: 400,
        message: "Unauthorized",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: "Unauthorized",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { token: token },
      {
        password: hashedPassword,
        token: null,
      }
    );
    await ForgotPassword.deleteOne({ email: user.email });

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
