import React, { useState, useRef } from "react";
import { Mic, Image, PencilLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import axios from "axios";

const CreateNoteBar = ({ onCreateNote }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioDuration, setAudioDuration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);

  const handleRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Calculate and set duration
        const audio = new Audio();
        audio.src = url;

        // Wait for metadata to load before getting duration
        audio.onloadedmetadata = () => {
          console.log("Metadata loaded, duration:", audio.duration);
          if (!isNaN(audio.duration) && isFinite(audio.duration)) {
            setAudioDuration(audio.duration);
          } else {
            console.warn("Duration is Infinity, retrying...");
            setTimeout(() => {
              console.log("Retrying duration:", audio.duration);
              if (!isNaN(audio.duration) && isFinite(audio.duration)) {
                setAudioDuration(audio.duration);
              }
            }, 500);
          }
        };

        // Force browser to recognize the audio file
        audio.load();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
    } catch (error) {
      toast.error("Failed to access microphone. Please check permissions.");
      return;
    }

    // Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let speechToText = "";
      for (let i = 0; i < event.results.length; i++) {
        speechToText += event.results[i][0].transcript + " ";
      }
      setTranscript(speechToText.trim());
    };

    recognition.onerror = () => {
      toast.error("Microphone access denied or an error occurred.");
      stopRecording();
    };

    recognition.onend = stopRecording;
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);

    // Auto-stop recording after 1 minute
    recordingTimeoutRef.current = setTimeout(stopRecording, 60000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    setIsRecording(false);
    clearTimeout(recordingTimeoutRef.current);
  };

  const handleCreateNote = async () => {
    if (!transcript.trim()) {
      toast.warn("Note is empty. Please add some text.");
      return;
    }

    setIsLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const { data } = await axios.post(
        "api/v1/notes",
        {
          title: "New Note",
          content: transcript,
          isVoiceNote: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      onCreateNote({ ...data.data, audioUrl, audioDuration }); // Attach in-memory audio data
      setTranscript("");
      setAudioUrl(null);
      setAudioDuration(null);

      toast.success("Note created successfully!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });

    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full flex items-center justify-between bg-white p-3 rounded-full border">
      <div className="flex items-center gap-4">
        <PencilLine className="w-6 h-6 cursor-pointer text-gray-500" />
        <Image className="w-6 h-6 cursor-pointer text-gray-500" />
        <Input
          className="w-[500px] p-5 border-none outline-none shadow-none"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Type or start recording..."
          disabled={isLoading}
        />
      </div>

      <button
        onClick={handleRecording}
        className={`px-4 py-2 rounded-full flex items-center gap-2 justify-center text-white ${isRecording ? "bg-gray-400" : "bg-red-500"
          }`}
        disabled={isLoading}
      >
        <div className="bg-white w-2 h-2 rounded-full"></div>
        {isRecording ? "Recording..." : "Start Recording"}
      </button>

      <button
        onClick={handleCreateNote}
        className={`px-4 py-2 rounded-full text-white -ml-10 shadow-lg ${isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500"
          }`}
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Create"}
      </button>
    </div>
  );
};

export default CreateNoteBar;
