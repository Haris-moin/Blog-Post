import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import CustomError from "../classes/error";
import { badReq } from "../utils/utils";
import { ERROR_MESSAGE, STATUS } from "../utils/constant";
import { STATES } from "mongoose";
const Post = require("../models/post.model");
const logger = require("../log/index");

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userSchema = Joi.object().keys({
    postId: Joi.string().required(),
    comment: Joi.string().required(),
  });

  try {
    const { error, value } = userSchema.validate({ ...req.body });
    if (error && Object.keys(error).length) {
      logger.log("error", `${error} error on addComment validation`);
      const err = new CustomError(error.toString());
      err.statusCode = 422;
      throw err;
    }
    const postId = value.postId;
    const comment = value.comment;
    const creator = (req as Request & { userId: string }).userId;
    const post = await Post.findById(postId);

    if (!post) throw badReq(ERROR_MESSAGE.POST_NOT_FOUND, STATUS.NOT_FOUND);

    /* add comment on post */
    post.comments.push({ creator, comment });
    const result = await post.save();
    logger.log("debug ", `added comment on post ${result}`);

    res.status(STATUS.SUCCESS).json({
      message: "Commented on Post",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    next(err);
  }
};
