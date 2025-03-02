import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Delete, DeleteIcon, PencilLine, Star } from "lucide-react";
import { LuNotebookPen } from "react-icons/lu";
import { CgMenuLeft } from "react-icons/cg";
import { PiStack } from "react-icons/pi";
import { MdDelete } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const NoteModal = ({ note, onClose, updateNoteState }) => {
  if (!note) return null; // Don't render modal if no note is selected
  const [fav, setFav] = useState(note.isFavourite);

  const [activeTab, setActiveTab] = useState("notes");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedNote, setEditedNote] = useState({
    title: note.title,
    content: note.content,
    attachments: note.attachments || [],
  });
  const [isUpdating, setIsUpdating] = useState(false); // Loading state

  const handleToggleFavourite = async () => {
    try {

      setFav((prevFav) => !prevFav);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const { data } = await axios.patch(
        `api/v1/notes/toggle/favourite/${note._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      setFav(data.data.isFavourite);
      updateNoteState(note._id, data.data);

      toast.success("Favourite status changed!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error toggling favourite:", error);
      toast.error("Failed to update favourite status.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

      setFav((prevFav) => !prevFav);
    }
  };

  const handleSaveTitle = async () => {
    if (!editedNote.title) {
      toast.error("Title cannot be empty.");
      return;
    }

    try {
      setIsUpdating(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const { data } = await axios.patch(
        `/api/v1/notes/${note._id}`,
        { title: editedNote.title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state with the new title
      setEditedNote((prev) => ({ ...prev, title: data.data.title }));
      updateNoteState(note._id, data.data); // Update parent state if needed
      toast.success("Title updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveContent = async () => {
    if (!editedNote.content) {
      toast.error("Content cannot be empty.");
      return;
    }

    try {
      setIsUpdating(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const { data } = await axios.patch(
        `/api/v1/notes/${note._id}`,
        { content: editedNote.content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state with the new content
      setEditedNote((prev) => ({ ...prev, content: data.data.content }));
      updateNoteState(note._id, data.data); // Update parent state if needed
      toast.success("Content updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setIsEditingContent(false);
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Failed to update content.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAttachments = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (editedNote.attachments?.length >= 3) {
      toast.error("You can only upload up to 3 attachments.");
      return;
    }

    const formData = new FormData();
    formData.append("attachments", file);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const { data } = await axios.post(
        `/api/v1/notes/${note._id}`,  // New API endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newAttachment = data.data.attachments.slice(-1)[0];

      setEditedNote((prev) => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment],
      }));

      updateNoteState(note._id, data.data);
      toast.success("Attachment added successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast.error("Failed to upload attachment.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  const handleDeleteImage = async (attachmentUrl) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const { data } = await axios.delete(`/api/v1/notes/${note._id}/attachment`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { attachmentUrl }
      });

      // Update local state
      setEditedNote((prev) => ({
        ...prev,
        attachments: prev.attachments.filter((url) => url !== attachmentUrl),
      }));

      updateNoteState(note._id, data.data); // Update parent state
      toast.success("Attachment deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("Failed to delete attachment.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  }

  return (
    <Dialog open={!!note} onOpenChange={onClose} className="relative">
      <DialogContent className="max-w-2xl rounded-lg p-6">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center space-x-4 space-y-0 pb-2">
          <div className="flex flex-col gap-0.5">
            <DialogTitle className="text-lg">
              {isEditingTitle ? (
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    value={editedNote.title}
                    onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                    className="border-2 text-gray-800 rounded-md px-2 py-1 mb-2 w-full text-base focus:outline-none focus:border-purple-500"
                  />
                  <Button onClick={handleSaveTitle} className='self-start py-1 bg-purple-600 hover:bg-purple-500' disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  {editedNote.title}
                  <Button variant="ghost" className="h-8 w-8" size="icon" onClick={() => setIsEditingTitle(true)}>
                    <PencilLine />
                  </Button>
                </div>
              )}
            </DialogTitle>
            <span className="text-xs text-muted-foreground">
              {new Date(note.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {/* <Button variant="ghost" size="icon" className="h-8 w-8 self-start" onClick={() => setIsEditingTitle(true)}>
            <PencilLine />
          </Button> */}

          <div className="absolute right-11 top-2 bg-gray-300 h-8 w-8 rounded-full flex items-center justify-center self-start" onClick={handleToggleFavourite}>
            {!fav ? <Star size={17} /> : <FaStar size={17} color="#941fbf" />}
          </div>

        </DialogHeader>


        {/* Audio Player */}
        {note.transcript && <audio controls className="w-full my-3">
          <source src={note.audioUrl} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>}

        {/* Tabs Section */}
        <div className="flex gap-3 border-b mb-3">
          <button
            className={`flex items-center justify-center gap-1 py-2 px-4 ${activeTab === "notes" ? "bg-gray-200 rounded-t-md" : "text-gray-500"}`}
            onClick={() => setActiveTab("notes")}
          >
            <LuNotebookPen /> Notes
          </button>

          <button
            className={`flex items-center justify-center gap-1 py-2 px-4 ${activeTab === "transcript" ? "bg-gray-200 rounded-t-md" : "text-gray-500"}`}
            onClick={() => setActiveTab("transcript")}
          >
            <CgMenuLeft /> Transcript
          </button>

          <button
            className={`flex items-center justify-center gap-1 py-2 px-4 ${activeTab === "create" ? "bg-gray-200 rounded-t-md" : "text-gray-500"}`}
            onClick={() => setActiveTab("create")}
          >
            <PiStack /> Create
          </button>

          <button
            className={`flex items-center justify-center gap-1 py-2 px-4 ${activeTab === "speaker" ? "bg-gray-200 rounded-t-md" : "text-gray-500"}`}
            onClick={() => setActiveTab("speaker")}
          >
            <IoPeopleOutline /> Speaker Transcript
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "notes" && (
          <div className="p-3 bg-gray-100 rounded-md text-sm flex justify-between items-center">
            {isEditingContent ? (
              <input
                type="text"
                value={editedNote.content}
                onChange={(e) =>
                  setEditedNote((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p>{editedNote.content || "No content available."}</p>
            )}

            <Button
              variant="ghost"
              className="h-8 w-8 hover:bg-gray-200"
              size="icon"
              onClick={() => {
                if (isEditingContent) {
                  handleSaveContent(); // Save content if already editing
                }
                setIsEditingContent((prev) => !prev); // Toggle edit mode
              }}
            >
              {isEditingContent ? <Check size={20} className="text-purple-500 font-semibold" /> : <PencilLine />}
            </Button>
          </div>
        )}

        {activeTab === "transcript" && (
          <div className="p-3 bg-gray-100 rounded-md text-sm">
            {note.transcript || "No transcript available."}
          </div>
        )}

        {activeTab === "create" && (
          <div className="p-3 bg-gray-100 rounded-md text-sm">
            {/* Add create functionality here */}Create some new note!
          </div>
        )}

        {activeTab === "speaker" && (
          <div className="p-3 bg-gray-100 rounded-md text-sm">
            {note.content || "No speaker transcript available."}
          </div>
        )}

        {/* Image Section */}
        <div className="mt-4 flex items-center gap-2">
          {editedNote.attachments?.slice(0, 3).map((attachment, index) => (
            <div className="relative">
              <img key={index} src={attachment} alt="Attachment" className="w-20 h-20 rounded-md object-cover" />
              <button className="absolute top-1 right-1 bg-slate-200 rounded-full p-1" onClick={()=>handleDeleteImage(attachment)}>
                <MdDelete className="" />
              </button>
            </div>
          ))}

          {editedNote.attachments.length < 3 && (
            <label className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleSaveAttachments}
              />
              +
            </label>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
};


export default NoteModal;
