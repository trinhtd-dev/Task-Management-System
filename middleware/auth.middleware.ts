import { Request, Response, NextFunction } from "express";

interface RequestWithUser extends Request {
  user?: any;
}

export const checkRole = (roles: Array<string>) => {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        code: 401,
        message: "Unauthorized: No user found",
      });
    }

    const userRole = req.user.role;
    if (roles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({
        code: 403,
        message: "Forbidden: You do not have the required role",
      });
    }
  };
};
