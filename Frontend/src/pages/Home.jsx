import React, { useState, useEffect } from "react";
import { IoHomeSharp } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "../assets/new.png";
import { Search, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import CreateNoteBar from "./CreateNoteBar";
import Card from "./Card";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import NoteModal from "./NoteModal";


const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [favourite, setFavourite] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.token;

  const handleToggle = () => {
    setOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
  }

  const handleCreateNote = (note) => {
    setNotes((prevNotes) => [...prevNotes, note]);
  };

  const fetchNotes = async () => {
    console.log(userInfo);
    setLoading(true);
    try {
      const { data } = await axios.get("/api/v1/notes", {
        params: { page, limit: 8, search, sort, order, favourite: undefined },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotes(data.data.notes);
      setTotalPages(data.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error Occured!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setLoading(false);
    }
  };

  const updateNoteState = (noteId, updatedNote) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note._id === noteId ? updatedNote : note))
    );
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchNotes();
    }, 300); // Debounce for better performance

    return () => clearTimeout(delayDebounce);
  }, [page, search, sort, order, favourite]);

  return (
    <div className="flex h-screen overflow-y-hidden max-w-screen-2xl m-4 gap-6">
      <ToastContainer />
      {/* Sidebar */}
      <aside className="w-96 px-3 border border-gray-300 rounded-3xl">
        <div className="border-b border-gray-300 flex items-center gap-3 h-16 px-3">
          <img
            src={logo}
            alt="logo"
            width={30}
            height={30}
            className="rounded-full"
          />
          <h1 className='font-["SquadaOne"] text-2xl font-bold'>AI Notes</h1>
        </div>

        <div className="h-[100%] overflow-hidden flex-col justify-between">
          <nav className='h-1/2 py-4 font-["Roboto"]'>
            <ul>
              <li>
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    `${isActive
                      ? "bg-purple-300/50 text-purple-800"
                      : "text-gray-400"
                    } p-3 text-lg font-medium flex items-center gap-2 rounded-3xl outline-none`
                  }
                >
                  <IoHomeSharp size={22} />
                  <p>Home</p>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/favourites"
                  className={({ isActive }) =>
                    `${isActive
                      ? "bg-purple-300/50 text-purple-800"
                      : "text-gray-500"
                    } p-3 text-lg font-medium flex items-center gap-2 rounded-3xl`
                  }
                >
                  <FaStar size={22} />
                  Favourites
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className='h-[273px] p-3 flex-col items-center place-content-end gap-4 text-lg font-["Roboto"]'>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center bg-black rounded-full text-white">
                {userInfo.data.user.username.charAt(0).toUpperCase()}
              </div>
              <p>{userInfo.data.user.username}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-between pb-6 overflow-y-scroll w-full">
        <div className="w-full  items-center justify-between bg-gray-50/50">
          <div className='flex w-full font-["Roboto"] tracking-wide gap-5 pt-1'>
            <div className="relative flex-1 max-w-5xl ml-1">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-5 pl-12  bg-white rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <Button
              variant="ghost"
              className=" flex items-center gap-2 border border-gray-300 rounded-3xl p-5 text-gray-600"
              onClick={handleToggle}
            >
              {/* <SortDesc className="h-6 w-6" />
              Sort */}
              <SortDesc className={`h-6 w-6 transform ${order === "asc" ? "rotate-180" : ""}`} />
              {/* {order === "asc" ? "Sort: Oldest" : "Sort: Newest"} */}
              <p className="text-sm font-medium tracking-normal">Sort</p>
            </Button>
          </div>

          {/* cards */}
          <div className="w-full flex flex-wrap gap-6 mt-7 px-4 items-center min-sm:justify-center ">
            {loading ? (
              <p className="mt-6 text-gray-500">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="mt-6 text-gray-500">No notes found.</p>
            ) : (
              notes.map((note) =>(
                <div key={note._id} onClick={() => setSelectedNote(note)} >
                    <Card key={note._id} note={note} />
                </div>
                
              ) )
            )}
          </div>

          {/* Note Modal */}
          <NoteModal note={selectedNote} onClose={() => setSelectedNote(null)} updateNoteState={updateNoteState} />
  

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-6 mb-24">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border rounded-md bg-purple-800 text-white disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border rounded-md bg-purple-800 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div> 
        </div>

        <div className="fixed bottom-5 z-50 w-[60%] rounded-3xl">
          <CreateNoteBar onCreateNote={handleCreateNote} />
        </div>
      </div>

      
    </div>
  );
};

export default Home;
