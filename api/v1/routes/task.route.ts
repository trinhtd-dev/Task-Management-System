import express from "express";

const router = express.Router();

import * as taskController from "../controllers/task.controller";   

import { authenticate } from "../../../middleware/authenticate";

router.use(authenticate);

router.get("/", taskController.getTasks);

router.get("/detail/:id", taskController.getTaskById);

router.post("/create", taskController.createTask);

router.patch("/update/:id", taskController.updateTask);

router.delete("/delete/:id", taskController.deleteTask);

router.patch("/update-status/:id", taskController.updateTaskStatus);

router.patch("/update-multiple", taskController.updateMultipleTasks);


export default router;
