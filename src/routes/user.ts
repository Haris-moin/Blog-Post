import express from "express";
import { Router } from "express";
import isAuth from "../middlewares/isAuth.middleware";
import {
  create,
  deleteUser,
  login,
  update,
  getUserById,
} from "../controllers/user.controller";

const router: Router = express.Router();

router.get("/:userId", isAuth, getUserById);

router.post("/create", create);

router.post("/login", login);

router.put("/update/:userId", isAuth, update);

router.delete("/delete/:userId", isAuth, deleteUser);

export default router;
