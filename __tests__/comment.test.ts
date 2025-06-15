import request from "supertest";
import express from "express";
import apiV1Routes from "../api/v1/routes/index.route";
import Task from "../api/v1/models/task.model";
import Comment from "../api/v1/models/comment.model";
import { connectDB, disconnectDB } from "./helpers/database.helper";
import { createUserAndLogin } from "./helpers/auth.helper";

const app = express();
app.use(express.json());
apiV1Routes(app);

// User variables
let authorToken: string, otherUserToken: string, adminToken: string;
let authorId: any;

// Resource variables
let taskId: any;
let commentId: any;

beforeAll(async () => {
  await connectDB();

  // 1. Setup users
  const authorData = await createUserAndLogin(app, {
    email: "author@test.com",
    fullName: "Comment Author",
  });
  authorToken = authorData.token;
  authorId = authorData.userId;

  const otherUserData = await createUserAndLogin(app, {
    email: "other@test.com",
    fullName: "Other User",
  });
  otherUserToken = otherUserData.token;

  const adminData = await createUserAndLogin(app, {
    email: "admin-comment@test.com",
    fullName: "Admin User",
    role: "admin",
  });
  adminToken = adminData.token;

  // 2. Setup a task and a comment
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
  await disconnectDB();
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
