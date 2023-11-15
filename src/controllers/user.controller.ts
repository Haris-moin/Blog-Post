import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Joi from "joi";
import CustomError from "../classes/error";
import { badReq, notAuthorized } from "../utils/utils";
import { ERROR_MESSAGE, STATUS } from "../utils/constant";
const logger = require("../log/index");
const User = require("../models/user.model");
const { jwtConfig } = require("../config/index");

type LoginUser = {
  _id: string;
  email: string;
  password: string;
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    password: Joi.string().required(),
  });
  const { error: err, value } = userSchema.validate({ ...req.body });

  try {
    if (err && Object.keys(err).length) {
      throw badReq(err.toString(), STATUS.UNABLE_TO_PROCESS);
    }

    const hashPassword = await bcrypt.hash(value.password, 12);

    const user = new User({
      email: value.email,
      password: hashPassword,
      name: value.name,
    });

    const userExist = await User.findOne({ email: value.email });
    if (userExist) {
      throw badReq(`E-mail address already exists.`, STATUS.INTERNAL_SERVER);
    }

    const result = await user.save();
    const token = jwt.sign(
      {
        email: result.email,
        userId: result._id.toString(),
      },
      jwtConfig.secret,
      { expiresIn: "1h" }
    );
    res.status(201).json({
      token: token,
      message: "User created!",
      userId: result._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    logger.log("error", `${err} error of on registration of user`);
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  const { error: err, value } = userSchema.validate({ ...req.body });

  let loadedUser: LoginUser;
  try {
    if (err && Object.keys(err).length) {
      throw badReq(err.toString(), STATUS.UNABLE_TO_PROCESS);
    }

    const user = await User.findOne({ email: value.email });
    if (!user) {
      throw badReq("A user with this email could not be found.", 401);
    }

    loadedUser = user;
    const isMatchPassword = await bcrypt.compare(value.password, user.password);

    if (!isMatchPassword) {
      throw badReq(ERROR_MESSAGE.WRONG_PASS, STATUS.NOT_AUTHORIZED);
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      jwtConfig.secret,
      { expiresIn: "1h" }
    );
    res
      .status(STATUS.SUCCESS)
      .json({ token: token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    logger.log("error", `${err} error of on user login`);
    next(err);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  try {
    const authUser = (req as Request & { userId: string }).userId;

    if (authUser !== userId) throw notAuthorized();

    const user = await User.findById(userId);
    if (!user) {
      const error = new CustomError("Could not find user");
      error.statusCode = 404;
      throw error;
    }
    res.status(STATUS.SUCCESS).json({
      message: "user fetched",
      user,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    logger.log("error", `${err} error of on get user by id`);
    next(err);
  }
};
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;

  const userSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string(),
    password: Joi.string(),
  });

  try {
    const { error, value } = userSchema.validate({ ...req.body });
    if (error && Object.keys(error).length) {
      throw badReq(error.toString(), STATUS.UNABLE_TO_PROCESS);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw badReq(ERROR_MESSAGE.USER_NOT_FOUND, STATUS.NOT_FOUND);
    }

    const authUser = (req as Request & { userId: string }).userId;

    if (authUser !== userId) {
      logger.log(
        "error",
        `Not Authorized!! error of user authorization on update`
      );
      throw notAuthorized();
    }

    user.email = value.email;
    if (value.name) {
      user.name = value.name;
    }

    if (value.password) {
      const hashPassword = await bcrypt.hash(value.password, 12);
      user.password = hashPassword;
    }

    const result = await user.save();
    res.status(STATUS.CREATED).json({
      message: "User updated!",
      userId: result._id,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    logger.log("error", `${err} error of on update user`);
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.userId;
  const userId = (req as Request & { userId: string }).userId;
  try {
    const user = await User.findById(id);

    if (!user) {
      throw badReq(ERROR_MESSAGE.USER_NOT_FOUND, STATUS.NOT_FOUND);
    }

    if (id !== userId) {
      logger.log(
        "error",
        `Not Authorized!! error of user authorization on deleteUser`
      );
      throw notAuthorized();
    }

    await User.findByIdAndRemove(id);

    res.status(STATUS.SUCCESS).json({
      message: "User Deleted",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    logger.log("error", `${err} error of on delete user`);
    next(err);
  }
};
