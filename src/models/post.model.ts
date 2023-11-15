import mongoose from "mongoose";
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // createdAt: {
    //   type: String,
    // },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: {
      type: Array,
      schema: [
        {
          comment: String,
          user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
