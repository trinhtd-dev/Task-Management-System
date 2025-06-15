import express from "express";

const router = express.Router();

import * as taskController from "../controllers/task.controller";
import * as commentController from "../controllers/comment.controller";

import { authenticate } from "../../../middleware/authenticate";
import { checkRole } from "../../../middleware/auth.middleware";

router.use(authenticate);

router.get("/", taskController.getTasks);

router.get("/detail/:id", taskController.getTaskById);

router.post("/create", taskController.createTask);

router.patch("/update/:id", taskController.updateTask);

router.delete("/delete/:id", checkRole(["admin"]), taskController.deleteTask);

router.patch("/update-status/:id", taskController.updateTaskStatus);

router.patch("/update-multiple", taskController.updateMultipleTasks);

// Comment Routes
router.post("/:taskId/comments", commentController.createComment);
router.get("/:taskId/comments", commentController.getCommentsForTask);
router.patch("/:taskId/comments/:commentId", commentController.updateComment);
router.delete("/:taskId/comments/:commentId", commentController.deleteComment);

export default router;
