import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../interfaces/error";
const { jwtConfig } = require("../config/index");

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated");
    (error as CustomError).statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  let decodedToken: any;
  try {
    decodedToken = jwt.verify(token, jwtConfig.secret);
  } catch (err) {
    (err as CustomError).statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    (error as CustomError).statusCode = 401;
    throw error;
  }

  (req as any).userId = decodedToken.userId;
  next();
};

export default authMiddleware;
