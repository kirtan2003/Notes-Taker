import { Router } from "express";
import { createNote, getAllNotes, updateNote, deleteNote, getNoteById, toggleFavourite, deleteImage } from '../controllers/noteController.js';
import { upload } from '../middlewares/multerMiddleware.js';
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(verifyJWT);

router.post(
    '/',
    upload.fields([{name: 'attachments', maxCount : 3}]),
    createNote
);

// Get all notes for the authenticated user
router.get('/', getAllNotes);

// get note by id
router.get('/:noteId', getNoteById);

// Update a note by ID
router.patch(
    '/:noteId',
    upload.single('attachments'), 
    updateNote
);

router.route("/:noteId/attachment").delete(deleteImage)

// Delete a note by ID
router.delete('/:noteId', deleteNote);
router.route("/toggle/favourite/:noteId").patch(toggleFavourite);


export default router;