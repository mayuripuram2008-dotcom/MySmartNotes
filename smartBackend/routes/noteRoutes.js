
import express from "express";

import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  toggleFlag,
} from "../controllers/noteController.js";

const router = express.Router();

// GET all notes and POST a new note
router.route("/")
  .get(getNotes)
  .post(createNote);

// GET, UPDATE and DELETE one note
router.route("/:id")
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

// Toggle note flags
router.patch("/:id/flag/:flag", toggleFlag);

export default router;
