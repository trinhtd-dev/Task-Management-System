import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  content: string;
  taskId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
}

const commentSchema: Schema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>("Comment", commentSchema, "comments");
