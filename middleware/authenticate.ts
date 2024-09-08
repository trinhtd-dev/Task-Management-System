import { Request, Response, NextFunction } from "express";
import User from "../api/v1/models/user.model";

interface AuthRequest extends Request {
    user?: any; 
  }

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if(!req.headers.authorization){
            return res.status(400).json({
                code: 400,
                message: "Unauthorized",
            });
        }
        const token = req.headers.authorization.split(" ")[1];
        const user = await User.findOne({ token : token }).select("-password -token");
        if (!user) {
            return res.status(400).json({
                code: 400,
                message: "Unauthorized",
            });
        }
      
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            code: 500,
            message: "Internal server error",
            error: error,
        });
    }
}