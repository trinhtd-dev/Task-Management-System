import express from "express";

const router = express.Router();

import * as userController from "../controllers/user.controller";

import { authenticate } from "../../../middleware/authenticate";
import { checkRole } from "../../../middleware/auth.middleware";

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.post("/password/forgot", userController.forgotPassword);

router.post("/password/otp", userController.otp);

router.post("/password/reset", userController.resetPassword);

router.get("/profile", authenticate, userController.getProfile);

router.get("/logout", authenticate, userController.logout);

router.patch(
  "/update-role/:id",
  authenticate,
  checkRole(["admin"]),
  userController.updateUserRole
);

export default router;
