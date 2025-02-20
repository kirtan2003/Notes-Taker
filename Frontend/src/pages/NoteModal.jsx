// import React, { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Heart, Maximize, Edit, UploadCloud, X } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";

// const NoteModal = ({ note, onClose }) => {
// //   const [isEditing, setIsEditing] = useState(false);
//   const [editedNote, setEditedNote] = useState({ ...note });
//   const [isFullscreen, setIsFullscreen] = useState(false);

//   const handleSave = () => {
//     setIsEditing(false);
//   };

//   return (
//     <Dialog onOpenChange={onClose}>
//       <DialogContent className={`${isFullscreen ? "w-screen h-screen" : "max-w-2xl"} rounded-lg p-6`}>

//         {/* Header with Title & Close Button */}
//         <DialogHeader className="flex justify-between items-center">
//           <DialogTitle>
//             {isEditing ? (
//               <Input
//                 value={editedNote.title}
//                 onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
//                 className="font-bold text-lg"
//               />
//             ) : (
//               editedNote.title
//             )}
//           </DialogTitle>
//           <Button variant="ghost" onClick={onClose}><X size={24} /></Button>
//         </DialogHeader>

//         {/* Note Content */}
//         {note.type === "audio" ? (
//           <>
//             <audio controls src={note.audioUrl} className="w-full my-2" />
//             <p className="bg-gray-100 p-3 rounded-md">{editedNote.content}</p>
//           </>
//         ) : (
//           isEditing ? (
//             <Textarea
//               value={editedNote.content}
//               onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
//               className="w-full h-32 p-2"
//             />
//           ) : (
//             <p className="bg-gray-100 p-3 rounded-md">{editedNote.content}</p>
//           )
//         )}

//         {/* Image Upload */}
//         <div className="flex items-center gap-3 mt-3">
//           <label className="flex items-center gap-2 cursor-pointer bg-gray-200 p-2 rounded-md">
//             <UploadCloud className="w-5 h-5" />
//             <span>Upload Image</span>
//             <input type="file" className="hidden" accept="image/*" />
//           </label>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-between mt-4">
//           <div className="flex gap-2">
//             <Button variant="ghost" onClick={() => setEditedNote({ ...editedNote, favorite: !editedNote.favorite })}>
//               <Heart className={editedNote.favorite ? "text-red-500" : "text-gray-500"} />
//             </Button>
//             <Button variant="ghost" onClick={() => setIsFullscreen(!isFullscreen)}>
//               <Maximize />
//             </Button>
//           </div>
//           {isEditing ? (
//             <Button onClick={handleSave}>Save</Button>
//           ) : (
//             <Button onClick={() => setIsEditing(true)}>
//               <Edit className="mr-2" /> Edit
//             </Button>
//           )}
//         </div>

//       </DialogContent>
//     </Dialog>
//   );
// };

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PencilLine, Star } from "lucide-react";
import { LuNotebookPen } from "react-icons/lu";
import { CgMenuLeft } from "react-icons/cg";
import { PiStack } from "react-icons/pi";
import { IoPeopleOutline } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const NoteModal = ({ note, onClose,updateNoteState }) => {
  if (!note) return null; // Don't render modal if no note is selected
  const [fav , setFav] = useState(note.isFavourite);
  
  
  const handleToggleFavourite = async() => {
    try {

      setFav((prevFav) => !prevFav);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const {data} = await axios.patch(
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
  }

  return (
    <Dialog open={!!note} onOpenChange={onClose} className="relative">
      <DialogContent className="max-w-2xl rounded-lg p-6">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center space-x-4 space-y-0 pb-2">
          <div className="flex flex-col gap-0.5">
            <DialogTitle className="text-lg">{note.title}</DialogTitle>
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
          <Button variant="ghost" size="icon" className="h-8 w-8 self-start" onClick={() => setIsOpen(false)}>
            <PencilLine />
          </Button>

          <div className="absolute right-11 top-2 bg-gray-300 h-8 w-8 rounded-full flex items-center justify-center self-start" onClick={handleToggleFavourite}>
            {!fav ? <Star size={17}/> : <FaStar size={17} color="#941fbf"/>}
          </div>

        </DialogHeader>


        {/* Audio Player */}
        <audio controls className="w-full my-3">
          <source src={note.audioUrl} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>

        {/* Tabs Section */}
        <div className="flex gap-3 border-b mb-3">
          <button className="flex items-center justify-center gap-1 py-2 px-4 bg-gray-200 rounded-t-md"><LuNotebookPen/>  Notes</button>
          <button className="flex items-center justify-center gap-1 py-2 px-4  text-gray-500"><CgMenuLeft/> Transcript</button>
          <button className="flex items-center justify-center gap-1 py-2 px-4 text-gray-500"><PiStack/> Create</button>
          <button className="flex items-center justify-center gap-1 py-2 px-4 text-gray-500"><IoPeopleOutline/> Speaker Transcript</button>
        </div>

        {/* Transcript */}
        <div className="p-3 bg-gray-100 rounded-md text-sm">
          {note.transcript || "No transcript available."}
        </div>

        {/* content */}
        <div className="p-3 bg-gray-100 rounded-md text-sm">
          {note.content || "No transcript available."}
        </div>

        {/* create */}
        {/* <div className="p-3 bg-gray-100 rounded-md text-sm">
        </div> */}

        {/* speaker transcript */}
        {/* <div className="p-3 bg-gray-100 rounded-md text-sm">
          {note.content || "No transcript available."}
        </div> */}


        {/* Image Section */}
        {note.attachments && (
          <div className="mt-4 flex items-center gap-3">
            <img src={note.attachments[0]} alt="Attachment" className="w-16 h-16 rounded-md object-cover" />
            <button className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">+</button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};


export default NoteModal;
