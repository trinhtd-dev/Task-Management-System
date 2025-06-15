import request from "supertest";
import { Express } from "express";
import bcrypt from "bcrypt";
import User from "../../api/v1/models/user.model";

interface UserCredentials {
  email: string;
  password?: string;
  role?: "admin" | "member";
  fullName?: string;
}

export const createUserAndLogin = async (
  app: Express,
  credentials: UserCredentials
) => {
  const password = credentials.password || "password";
  const role = credentials.role || "member";
  const fullName = credentials.fullName || "Test User";

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    email: credentials.email,
    password: hashedPassword,
    role,
  });

  const loginRes = await request(app)
    .post("/api/v1/user/login")
    .send({ email: credentials.email, password: password });

  return {
    token: loginRes.body.token,
    userId: user._id,
  };
};
