import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "initial",
    },
    deleted: {
        type: Boolean,
        default: false,
    },
    createdBy: String,
    parentId: String,
    participants: [String], 
    },
    { timestamps: true }
);

export default mongoose.model("Task", taskSchema, "tasks");