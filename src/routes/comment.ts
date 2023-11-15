import express from "express";
import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware";
import { addComment } from "../controllers/comment.controller";

const router: Router = express.Router();

router.post("/", isAuth, addComment);

export default router;
