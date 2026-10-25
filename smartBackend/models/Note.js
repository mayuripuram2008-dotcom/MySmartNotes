import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "Untitled Note",
    },
    content: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["Personal", "Work", "Study", "Ideas"],
      default: "Personal",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    color: {
      type: String,
      enum: ["blue", "purple", "cyan", "amber", "rose"],
      default: "blue",
    },
    favourite: {
      type: Boolean,
      default: false,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    reminder: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);