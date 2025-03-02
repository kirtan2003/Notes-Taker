import { Button } from '@/components/ui/button'
import { Image } from 'lucide-react';
import React from 'react';
import { IoPlay } from "react-icons/io5";



const Card = ({ note }) => {

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "00:00";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
      };
    return (
        <div className='font-[Inter] h-80 w-[240px] border border-gray-300 rounded-xl px-5 shadow-md hover:scale-105 transition-all duration-300'>
            <div className='flex items-center justify-between mt-5'>
                <p className='text-gray-400/60 text-sm font-semibold'>
                    {new Date(note.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
                {note.audioUrl && (
                    <Button
                        className="bg-gray-100 rounded-full p-2 hover:bg-gray-300"
                        onClick={() => new Audio(note.audioUrl).play()} // Play stored audio
                    >
                        <IoPlay color="black" />
                        <span className="text-black">{formatTime(note.audioDuration)}</span>
                    </Button>
                )}
            </div>
            <h2 className=' mt-3 font-semibold text-lg'>{note.title}</h2>
            <p className='overflow-clip text-gray-500/90 mt-3 font-medium text-wrap'>
                {note.content.length > 100 ? note.content.slice(0, 100) + "..." : note.content}
            </p>

            {note.attachments?.length > 0 && (
                <div className="px-2 py-1 mt-4 flex items-center gap-1 bg-gray-100 rounded-full w-fit">
                    <img className="w-4 h-4 cursor-pointer text-gray-500" src={note.attachments[0]} alt="Attachment" />
                    <span className="font-medium text-sm">{note.attachments.length} image(s)</span>
                </div>
            )}

            <div>

            </div>
        </div>

    )
}

export default Card