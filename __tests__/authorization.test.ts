import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import apiV1Routes from "../api/v1/routes/index.route";
import User from "../api/v1/models/user.model";
import Task from "../api/v1/models/task.model";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
apiV1Routes(app);

let mongoServer: MongoMemoryServer;
let adminToken: string;
let memberToken: string;
let memberUserId: any;
let taskId: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // 1. Create admin and member users with hashed passwords
  const password = await bcrypt.hash("password", 10);
  const admin = await User.create({
    fullName: "Admin User",
    email: "admin@test.com",
    password: password,
    role: "admin",
  });
  const member = await User.create({
    fullName: "Member User",
    email: "member@test.com",
    password: password,
    role: "member",
  });
  memberUserId = member._id;

  // 2. Login to get tokens (using original unhashed password)
  const adminLoginRes = await request(app)
    .post("/api/v1/user/login")
    .send({ email: "admin@test.com", password: "password" });
  adminToken = adminLoginRes.body.token;

  const memberLoginRes = await request(app)
    .post("/api/v1/user/login")
    .send({ email: "member@test.com", password: "password" });
  memberToken = memberLoginRes.body.token;

  // 3. Create a task as the member user
  const task = await Task.create({
    title: "Test Task",
    content: "A task to be deleted",
    createdBy: memberUserId,
  });
  taskId = task._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Authorization Middleware", () => {
  it("should FORBID a member from deleting a task", async () => {
    const res = await request(app)
      .delete(`/api/v1/task/delete/${taskId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty(
      "message",
      "Forbidden: You do not have the required role"
    );
  });

  it("should ALLOW an admin to delete a task", async () => {
    const res = await request(app)
      .delete(`/api/v1/task/delete/${taskId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Task deleted successfully");
  });
});
