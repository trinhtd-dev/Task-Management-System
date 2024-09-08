import { Application } from "express";

import taskRoute from "./task.route";
import userRoute from "./user.route";
export default (app: Application) => {
    const version = "/api/v1";
    app.use(version + "/task", taskRoute);
    app.use(version + "/user", userRoute);
}