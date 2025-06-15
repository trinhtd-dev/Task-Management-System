import { Request, Response } from "express";
import Notification from "../models/notification.model";

interface RequestWithUser extends Request {
  user?: any;
}

// [GET] /api/v1/notifications
export const getNotifications = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      code: 200,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [PATCH] /api/v1/notifications/:id/read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        code: 404,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      code: 200,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};

// [PATCH] /api/v1/notifications/read-all
export const markAllAsRead = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { userId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      code: 200,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error,
    });
  }
};
