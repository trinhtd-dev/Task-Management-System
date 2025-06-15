import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import apiV1Routes from "../api/v1/routes/index.route";
import User from "../api/v1/models/user.model";
import Task from "../api/v1/models/task.model";
import Comment from "../api/v1/models/comment.model";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
apiV1Routes(app);

let mongoServer: MongoMemoryServer;

// User variables
let authorToken: string, otherUserToken: string, adminToken: string;
let authorId: any;

// Resource variables
let taskId: any;
let commentId: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // 1. Setup users
  const password = await bcrypt.hash("password", 10);
  const author = await User.create({
    fullName: "Comment Author",
    email: "author@test.com",
    password,
    role: "member",
  });
  await User.create({
    fullName: "Other User",
    email: "other@test.com",
    password,
    role: "member",
  });
  await User.create({
    fullName: "Admin User",
    email: "admin-comment@test.com",
    password,
    role: "admin",
  });
  authorId = author._id;

  // 2. Login users
  const authorLoginRes = await request(app)
    .post("/api/v1/user/login")
    .send({ email: "author@test.com", password: "password" });
  authorToken = authorLoginRes.body.token;
  const otherUserLoginRes = await request(app)
    .post("/api/v1/user/login")
    .send({ email: "other@test.com", password: "password" });
  otherUserToken = otherUserLoginRes.body.token;
  const adminLoginRes = await request(app)
    .post("/api/v1/user/login")
    .send({ email: "admin-comment@test.com", password: "password" });
  adminToken = adminLoginRes.body.token;

  // 3. Setup a task and a comment
  const task = await Task.create({
    title: "Task for comments",
    content: "...",
    createdBy: authorId,
  });
  taskId = task._id;
  const comment = await Comment.create({
    content: "Original comment",
    taskId,
    userId: authorId,
  });
  commentId = comment._id;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Comments API", () => {
  it("should allow a user to create a comment on a task", async () => {
    const res = await request(app)
      .post(`/api/v1/task/${taskId}/comments`)
      .set("Authorization", `Bearer ${otherUserToken}`)
      .send({ content: "A new comment" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty("content", "A new comment");
  });

  // --- UPDATE TESTS ---
  it("should ALLOW the author to update their own comment", async () => {
    const res = await request(app)
      .patch(`/api/v1/task/${taskId}/comments/${commentId}`)
      .set("Authorization", `Bearer ${authorToken}`)
      .send({ content: "Updated by author" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("content", "Updated by author");
  });

  it("should ALLOW an admin to update a comment", async () => {
    const res = await request(app)
      .patch(`/api/v1/task/${taskId}/comments/${commentId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ content: "Updated by admin" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("content", "Updated by admin");
  });

  it("should FORBID another user from updating a comment", async () => {
    const res = await request(app)
      .patch(`/api/v1/task/${taskId}/comments/${commentId}`)
      .set("Authorization", `Bearer ${otherUserToken}`)
      .send({ content: "Should not update" });

    expect(res.statusCode).toBe(403);
  });

  // --- DELETE TESTS ---
  it("should FORBID another user from deleting a comment", async () => {
    const res = await request(app)
      .delete(`/api/v1/task/${taskId}/comments/${commentId}`)
      .set("Authorization", `Bearer ${otherUserToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("should ALLOW the author to delete their own comment", async () => {
    // Create a new comment to delete
    const newComment = await Comment.create({
      content: "To be deleted by author",
      taskId,
      userId: authorId,
    });

    const res = await request(app)
      .delete(`/api/v1/task/${taskId}/comments/${newComment._id}`)
      .set("Authorization", `Bearer ${authorToken}`);

    expect(res.statusCode).toBe(200);
  });

  it("should ALLOW an admin to delete a comment", async () => {
    // The main comment is still available for the admin to delete
    const res = await request(app)
      .delete(`/api/v1/task/${taskId}/comments/${commentId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });
});
