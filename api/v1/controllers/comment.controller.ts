import { Request, Response } from "express";
import Comment from "../models/comment.model";
import Task from "../models/task.model";
import Notification from "../models/notification.model";

interface RequestWithUser extends Request {
  user?: any;
}

// [POST] /api/v1/task/:taskId/comments
export const createComment = async (req: RequestWithUser, res: Response) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        code: 404,
        message: "Task not found",
      });
    }

    const newComment = await Comment.create({
      content,
      taskId,
      userId,
    });

    // Create notification for task owner
    const taskOwnerId = task.createdBy.toString();
    const commenterId = req.user.id.toString();

    if (taskOwnerId !== commenterId) {
      await Notification.create({
        userId: taskOwnerId,
        message: `${req.user.fullName} has commented on your task "${task.title}"`,
        link: `/api/v1/task/detail/${taskId}`,
      });
    }

    res.status(201).json({
      code: 201,
      message: "Comment created successfully",
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [GET] /api/v1/task/:taskId/comments
export const getCommentsForTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        code: 404,
        message: "Task not found",
      });
    }

    const comments = await Comment.find({ taskId: taskId }).populate(
      "userId",
      "fullName email"
    );

    res.status(200).json({
      code: 200,
      message: "Get comments successfully",
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [PATCH] /api/v1/task/:taskId/comments/:commentId
export const updateComment = async (req: RequestWithUser, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const user = req.user;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        code: 404,
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({
        code: 403,
        message: "Forbidden: You do not have permission to update this comment",
      });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({
      code: 200,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [DELETE] /api/v1/task/:taskId/comments/:commentId
export const deleteComment = async (req: RequestWithUser, res: Response) => {
  try {
    const { commentId } = req.params;
    const user = req.user;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        code: 404,
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== user.id && user.role !== "admin") {
      return res.status(403).json({
        code: 403,
        message: "Forbidden: You do not have permission to delete this comment",
      });
    }

    await Comment.deleteOne({ _id: commentId });

    res.status(200).json({
      code: 200,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};
