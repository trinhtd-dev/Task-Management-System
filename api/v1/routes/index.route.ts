import { Application } from "express";

import taskRoutes from "./task.route";
import userRoutes from "./user.route";
import notificationRoutes from "./notification.route";

export default (app: Application) => {
  const version = "/api/v1";
  app.use(version + "/task", taskRoutes);
  app.use(version + "/user", userRoutes);
  app.use(version + "/notifications", notificationRoutes);
};
