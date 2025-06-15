import request from "supertest";
import express from "express";
import apiV1Routes from "../api/v1/routes/index.route"; // Adjust path if needed
import { connectDB, disconnectDB } from "./helpers/database.helper";

const app = express();
app.use(express.json());
// Initialize routes
apiV1Routes(app);

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("User API", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/v1/user/register").send({
      fullName: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("code", 201);
    expect(res.body).toHaveProperty("message", "User created successfully");
    expect(res.body).toHaveProperty("token");
  });

  it("should not register a user with an existing email", async () => {
    // First, register a user
    await request(app).post("/api/v1/user/register").send({
      fullName: "Test User 2",
      email: "test2@example.com",
      password: "password123",
    });

    // Then, try to register with the same email
    const res = await request(app).post("/api/v1/user/register").send({
      fullName: "Another User",
      email: "test2@example.com",
      password: "password456",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("code", 400);
    expect(res.body).toHaveProperty("message", "User already exists");
  });

  it("should login an existing user successfully", async () => {
    const user = {
      fullName: "Login User",
      email: "login@example.com",
      password: "password123",
    };
    await request(app).post("/api/v1/user/register").send(user);

    const res = await request(app).post("/api/v1/user/login").send({
      email: user.email,
      password: user.password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("code", 200);
    expect(res.body).toHaveProperty("message", "Login successfully");
    expect(res.body).toHaveProperty("token");
  });
});
