import React, { useState } from 'react';
import { Mic, FileText, Image, PencilLine } from 'lucide-react';
import { Input } from '@/components/ui/input';

const CreateNoteBar = ({ onCreateNote }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  let recognition = null; // SpeechRecognition instance
  let recordingTimeout = null; // Timeout for auto-stop

  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    // Initialize SpeechRecognition on demand
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let speechToText = '';
      for (let i = 0; i < event.results.length; i++) {
        speechToText += event.results[i][0].transcript + ' ';
      }
      setTranscript(speechToText.trim());
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      alert("Microphone access denied or an error occurred. Please check settings.");
      stopRecording();
    };

    recognition.onend = () => {
      stopRecording();
    };

    try {
      recognition.start();
      setIsRecording(true);

      // Stop recording automatically after 1 minute
      recordingTimeout = setTimeout(() => {
        stopRecording();
      }, 60000); // 60 seconds

    } catch (error) {
      console.error("Error starting recognition:", error);
      alert("Unable to access microphone. Please check permissions.");
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
    clearTimeout(recordingTimeout);
  };

  const handleCreateNote = () => {
    if (!transcript.trim()) {
      alert("Note is empty. Please add some text before creating.");
      return;
    }

    onCreateNote({
      title: 'New Note',
      content: transcript,
      type: 'text',
    });

    setTranscript(""); // Clear the input after creating the note
  };

  return (
    <div className="w-full flex items-center justify-between bg-white p-3 rounded-full border">
      <div className="flex items-center gap-4">
        <PencilLine className="w-6 h-6 cursor-pointer text-gray-500"/>
        <Image className="w-6 h-6 cursor-pointer text-gray-500" />
        <Input
          className="w-[500px] p-5 border-none outline-none shadow-none"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Type or start recording..."
        />
      </div>
      <button
        onClick={handleRecording}
        className={`px-4 py-2 rounded-full flex items-center gap-2 justify-center text-white ${
          isRecording ? 'bg-gray-400' : 'bg-red-500'
        }`}
      >
        <div className='bg-white w-2 h-2 rounded-full'></div>
        {isRecording ? 'Recording...' : 'Start Recording'}
      </button>

      <button
          onClick={handleCreateNote}
          className="px-4 py-2 rounded-full text-white -ml-10 shadow-lg  
            bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 "
        >
          Create
      </button>
    </div>
  );
};

export default CreateNoteBar;
