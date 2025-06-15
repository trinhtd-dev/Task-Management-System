import request from "supertest";
import express from "express";
import apiV1Routes from "../api/v1/routes/index.route";
import Task from "../api/v1/models/task.model";
import { connectDB, disconnectDB } from "./helpers/database.helper";
import { createUserAndLogin } from "./helpers/auth.helper";

const app = express();
app.use(express.json());
apiV1Routes(app);

let adminToken: string;
let memberToken: string;
let taskId: any;

beforeAll(async () => {
  await connectDB();

  // 1. Create admin and member users and get tokens
  const adminData = await createUserAndLogin(app, {
    email: "admin@test.com",
    role: "admin",
  });
  adminToken = adminData.token;

  const memberData = await createUserAndLogin(app, {
    email: "member@test.com",
    role: "member",
  });
  memberToken = memberData.token;
  const memberUserId = memberData.userId;

  // 2. Create a task as the member user
  const task = await Task.create({
    title: "Test Task",
    content: "A task to be deleted",
    createdBy: memberUserId,
  });
  taskId = task._id;
});

afterAll(async () => {
  await disconnectDB();
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
