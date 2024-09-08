import { Request, Response } from "express";

import Task from "../models/task.model";

// [GET] /api/v1/task
export const getTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await Task.find();
        res.status(200).json({
            code: 200,
            message: "Tasks fetched successfully",
            tasks: tasks
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            error: error
        });
    }
}   

// [POST] /api/v1/task/create
export const createTask = async (req: Request, res: Response) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json({
            code: 201,
            message: "Task created successfully",
            task: task
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            error: error
        });
    }
};

// [GET] /api/v1/task/detail/:id
export const getTaskById = async (req: Request, res: Response) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                code: 404,
                message: "Task not found"
            });
        }
        res.status(200).json({
            code: 200,
            message: "Task fetched successfully",
            task: task
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            error: error
        });
    }
};

// [PATCH] /api/v1/task/update/:id
export const updateTask = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const task = await Task.findOneAndUpdate({ _id: id, deleted: false }, req.body, { new: true });
        res.status(200).json({
            code: 200,
            message: "Task updated successfully",
            task: task
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            error: error
        });
    }
};

// [DELETE] /api/v1/task/delete/:id
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await Task.findByIdAndUpdate(id, { deleted: true });
        res.status(200).json({
            code: 200,
            message: "Task deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            error: error
        });
    }
};

// [PATCH] /api/v1/task/update-status/:id
export const updateTaskStatus = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const task = await Task.findByIdAndUpdate(id, { status: req.body.status }, { new: true });
        if (!task) {
            return res.status(404).json({
                code: 404,
                message: "Task not found"
            });
        }
        res.status(200).json({
            code: 200,
            message: "Task status updated successfully",
            task: task
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            error: error
        });
    }
};

// [PATCH] /api/v1/task/update-multiple
export const updateMultipleTasks = async (req: Request, res: Response) => {
    try {
        const tasks = await Task.updateMany({ _id: { $in: req.body.ids } }, { status: req.body.status });
        res.status(200).json({
            code: 200,
            message: "Tasks updated successfully",
            tasks: tasks
        });
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            error: error
        });
    }
};

