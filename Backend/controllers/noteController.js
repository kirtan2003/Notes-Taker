import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Note } from "../models/noteModel.js";
// import { uploadOnCloudinary , deleteImageFromCloudinary} from "../utils/cloudinary.js";
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
    api_key: process.env.CLOUDINARY_API_KEY ,
    api_secret: process.env.CLOUDINARY_API_SECRET ,
});

const getAllNotes = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    let { page = 1, limit = 10, sort = "createdAt", order = "desc", search = "", favourite } = req.query;

    // Convert page and limit to integers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Build the query object
    const query = {
        user: userId, // Fetch only the notes of the authenticated user
    };

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } }
        ];
    }

    // Filter by favourite if specified
    if (favourite !== undefined) {
        query.isFavourite = favourite === "true";
    }

    const totalNotes = await Note.countDocuments(query);
    const notes = await Note.find(query)
        .sort({ [sort]: order === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit);

    if (notes.length === 0) {
        return res.status(404).json(new ApiResponse(404, [], "No notes found"));
    }

    res.status(200).json(
        new ApiResponse(200, {
            totalNotes,
            currentPage: page,
            totalPages: Math.ceil(totalNotes / limit),
            notes,
        }, "Notes fetched successfully")
    );
})

const createNote = asyncHandler(async (req, res) => {
    const { title, content } = req.body;

    if (!title) {
        throw new ApiError(400, "Title is required!")
    }

    const attachmentUrls = [];

    try {
        const files = req.files?.attachments;  // Access attachments array
        if (files && files.length > 0) {
            for (let file of files) {
                const uploadedFile = await cloudinary.uploader.upload(file.path, {
                    resource_type: "image"
                });

                if (!uploadedFile) {
                    fs.unlinkSync(file.path);
                    throw new ApiError(400, `Failed to upload ${file.originalname}`);
                }

                fs.unlinkSync(file.path);
                attachmentUrls.push(uploadedFile.secure_url);
            }
        }
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Failed to upload attachments.");
    }
    // Check and upload files to Cloudinary


    // Create a new note with the uploaded URLs
    const note = await Note.create({
        title,
        content,
        attachments: attachmentUrls,  // Store attachment URLs in the database
        user: req.user?._id
    });

    return res.status(200).json(
        new ApiResponse(200, note, "Note added successully!")
    )

})

const getNoteById = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
        throw new ApiError(404, "Note not found")
    }

    res.status(200).json(
        new ApiResponse(200, { note }, "Note fetched successfully!")
    )

})

const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) {
        throw new ApiError(404, "Note not found")
    }

    try {
        let url = note.attachments
        if (url.length == 0) {
            await Note.findByIdAndDelete(noteId)
        }
        for (let i = 0; i < url.length; i++) {
            let attachment = url[i];
            const parts = attachment.split("/"); // Split by '/'
            const fileNameWithExt = parts.pop(); // Get the last part (file name with extension)
            const publicId = fileNameWithExt.split(".")[0]; // Remove the extension
            // Delete the image from Cloudinary
            const result = await cloudinary.uploader.destroy(publicId,
                { resource_type: "image" }
            );
            if (!result) {
                throw new ApiError(500, "Failed to delete image")
            }
            console.log("Cloudinary response:", result);
        }

        await Note.findByIdAndDelete(noteId);
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        throw new Error("Failed to delete image from Cloudinary");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Video deleted successfully")
    )
})

const updateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { title, content } = req.body;
    const attachments = req?.file?.path;

    if (!title && !content && !attachments) {
        throw new ApiError(400, "Please provide either title or content")
    }

    let attachmentUrl;
    if (req.file) {
        try {
            const uploadedFile = await cloudinary.uploader.upload(attachments, {
                resource_type: "image"
            });

            if (!uploadedFile || !uploadedFile.secure_url) {
                throw new ApiError(500, "Failed to upload image to Cloudinary.");
            }

            attachmentUrl = uploadedFile.secure_url;
            fs.unlinkSync(attachments); // Delete the local file after uploading
        } catch (error) {
            throw new ApiError(500, "Error during file upload.");
        }
    }

    const note = await Note.findByIdAndUpdate(
        noteId,
        {
            $set: {
                title,
                content,
            },
            $push: {
                attachments: attachmentUrl
            }
        },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, note, "Note details updated successfully")
    )

})

const deleteImage = asyncHandler(async(req, res)=> {
    
})

const toggleFavourite = asyncHandler(async (req, res) => {
    const { noteId } = req.params

    const note = await Note.findById(noteId);
    if (!note) {
        throw new ApiError(404, "Note not found")
    }

    note.isFavourite = !note.isFavourite;
    await note.save()

    return res.status(200).json(
        new ApiResponse(200, note, "Note favourite status changed successfully")
    )
})

export {
    getAllNotes,
    createNote,
    deleteNote,
    updateNote,
    getNoteById,
    toggleFavourite,
    deleteImage
}