import express from "express";
import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getPostsByUser,
} from "../controllers/post.controller";

const router: Router = express.Router();

router.get("/", getPosts);

router.get("/user-post", isAuth, getPostsByUser);

router.get("/:postId", getPost);

router.post("/", isAuth, createPost);

router.put("/:postId", isAuth, updatePost);

router.delete("/:postId", isAuth, deletePost);

export default router;
