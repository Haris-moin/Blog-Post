import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import CustomError from "../classes/error";
import { badReq, notAuthorized } from "../utils/utils";
import { ERROR_MESSAGE, STATUS } from "../utils/constant";
const logger = require("../log/index");
const User = require("../models/user.model");
const Post = require("../models/post.model");

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentPage: any = req.query.page || 1;
  const perPage = 10;
  const sortBy: string = req.query.sortBy?.toString() || "createdAt";

  try {
    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .populate("creator")
      .sort({ [sortBy]: "desc" })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(STATUS.SUCCESS).json({
      message: "Posts fetched successfully",
      posts,
      totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    next(err);
  }
};

export const getPostsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as Request & { userId: string }).userId;
    const user = await User.findById(userId).populate("posts");

    if (!user) {
      logger.log(
        "error",
        `${ERROR_MESSAGE.USER_NOT_FOUND} error on getPostsByUser`
      );

      throw badReq(ERROR_MESSAGE.USER_NOT_FOUND, STATUS.NOT_FOUND);
    }

    const userBlogs = user.posts;
    res.status(STATUS.SUCCESS).json({
      data: userBlogs,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    next(err);
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postSchema = Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
  });

  try {
    const { error, value } = postSchema.validate({ ...req.body });
    if (error && Object.keys(error).length) {
      logger.log("error", `${error} on create post validation`);
      throw badReq(error.toString(), STATUS.UNABLE_TO_PROCESS);
    }
    const title = value.title;
    const content = value.content;
    const creator = (req as Request & { userId: string }).userId;

    const user = await User.findById(creator);
    if (!user) throw badReq(ERROR_MESSAGE.USER_NOT_FOUND, STATUS.NOT_FOUND);

    const post = new Post({
      title,
      content,
      creator,
    });

    await post.save();

    user.posts.push(post);
    await user.save();

    res.status(STATUS.CREATED).json({
      message: "Post created successfully",
      post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    next(err);
  }
};

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      logger.log(
        "error",
        `${ERROR_MESSAGE.POST_NOT_FOUND} on getPost validation`
      );
      throw badReq(ERROR_MESSAGE.POST_NOT_FOUND, STATUS.NOT_FOUND);
    }

    res.status(STATUS.SUCCESS).json({
      message: "Post fetched",
      post,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    next(err);
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;

  const postSchema = Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
  });

  try {
    const { error: err, value } = postSchema.validate({ ...req.body });
    if (err && Object.keys(err).length) {
      logger.log("error", `${err} error on updatePost validation`);
      throw badReq(err.toString(), STATUS.UNABLE_TO_PROCESS);
    }

    const post = await Post.findById(postId);

    if (!post) {
      throw badReq(ERROR_MESSAGE.POST_NOT_FOUND, STATUS.NOT_FOUND);
    }

    const userId = (req as Request & { userId: string }).userId;

    if (post.creator.toString() !== userId) {
      logger.log(
        "error",
        `Not Authorized!! error of user authorization on deletePost`
      );
      throw notAuthorized();
    }

    post.title = value.title;
    post.content = value.content;
    const result = await post.save();

    res.status(STATUS.SUCCESS).json({ message: "Post Updated", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    next(err);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  const userId = (req as Request & { userId: string }).userId;
  try {
    const post = await Post.findById(postId);

    if (!post) {
      logger.log(
        "error",
        `${ERROR_MESSAGE.POST_NOT_FOUND} error on post finding`
      );
      throw badReq(ERROR_MESSAGE.POST_NOT_FOUND, STATUS.NOT_FOUND);
    }

    if (post.creator.toString() !== userId) {
      logger.log(
        "error",
        `Not Authorized!! error of user authorization on deletePost`
      );
      throw notAuthorized();
    }

    await Post.findByIdAndRemove(postId);

    const user = await User.findById(userId);

    user.posts.pull(postId);
    await user.save();

    res.status(STATUS.SUCCESS).json({
      message: "Deleted Post",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS.INTERNAL_SERVER;
    }
    next(err);
  }
};
