
import mongoose from "mongoose";
import Note from "../models/Note.js";

// GET: All notes with filters and search
export const getNotes = async (req, res) => {
  try {
    const filter = {};
    const { search, category, favourite, archived, deleted } = req.query;

    if (category) filter.category = category;

    if (favourite !== undefined) {
      filter.favourite = favourite === "true";
    }

    if (archived !== undefined) {
      filter.archived = archived === "true";
    }

    if (deleted !== undefined) {
      filter.deleted = deleted === "true";
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const notes = await Note.find(filter).sort({
      pinned: -1,
      updatedAt: -1,
    });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET: Single note
export const getNoteById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Create note
export const createNote = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        message: "Note title is required",
      });
    }

    const note = await Note.create({
      ...req.body,
      title: String(title).trim(),
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT: Update note
export const updateNote = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const updates = { ...req.body };

    delete updates._id;
    delete updates.id;
    delete updates.createdAt;
    delete updates.updatedAt;

    if (
      updates.title !== undefined &&
      !String(updates.title).trim()
    ) {
      return res.status(400).json({
        message: "Note title cannot be empty",
      });
    }

    if (updates.title !== undefined) {
      updates.title = String(updates.title).trim();
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE: Permanently delete note
export const deleteNote = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH: Toggle favourite, pinned, archived or deleted
export const toggleFlag = async (req, res) => {
  try {
    const allowedFlags = [
      "favourite",
      "pinned",
      "archived",
      "deleted",
    ];

    const { id, flag } = req.params;

    if (!allowedFlags.includes(flag)) {
      return res.status(400).json({
        message: "Invalid note flag",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    note[flag] = !note[flag];
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
