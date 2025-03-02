import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        default: "",
        trim: true,
    },
    attachments: { type: [String] },
    isFavourite: {
        type: Boolean,
        default: false,
    },
    isVoiceNote: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true })

export const Note = mongoose.model('Note', noteSchema);