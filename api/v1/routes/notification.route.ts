import express from "express";
const router = express.Router();

import * as notificationController from "../controllers/notification.controller";
import { authenticate } from "../../../middleware/authenticate";

// All routes in this file are protected
router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
