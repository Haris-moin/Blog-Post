import { Express, Request, Response, NextFunction } from "express";
import authRoutes from "./user";
import postRoutes from "./post";
import commentRoutes from "./comment";
import { CustomError } from "../interfaces/error";

module.exports = (app: Express) => {
  app.use("/user", authRoutes);
  app.use("/post", postRoutes);
  app.use("/comment", commentRoutes);
  app.use(
    (error: CustomError, req: Request, res: Response, next: NextFunction) => {
      const status = error.statusCode || 500;
      const message = error.message;
      const data = error.data;

      res.status(status).json({
        data,
        message,
      });
    }
  );
};
