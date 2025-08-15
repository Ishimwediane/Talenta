'use client';
import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2 } from "lucide-react";

// Define a consistent base URL for your API
const API_BASE_URL = "http://localhost:5000";

interface Audio {
  id: string;
  title: string;
  description?: string | null;
  tags?: string[];
  fileName?: string | null;
  fileUrl: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface AudioPlayerProps {
  audio: Audio;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audio }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioUrl = audio.fileName 
    ? `${API_BASE_URL}/uploads/audio/${audio.fileName}`
    : audio.fileUrl.startsWith('http') 
      ? audio.fileUrl 
      : `${API_BASE_URL}${audio.fileUrl}`;

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      setError(null);
      
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Failed to play audio. Please try again.');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error('Audio error:', e);
    setError('Error loading audio file');
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const width = progressBar.offsetWidth;
    const newTime = (clickX / width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleError}
        onCanPlay={handleCanPlay}
        preload="metadata"
      >
        <source src={audioUrl} />
        Your browser does not support the audio element.
      </audio>
      
      {error && (
        <div className="text-red-500 text-sm mb-2 p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <Button
          onClick={togglePlayPause}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="flex-shrink-0"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-1">
          <div 
            className="bg-gray-300 rounded-full h-2 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        <Volume2 className="h-4 w-4 text-gray-500" />
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Source: {audioUrl}
      </div>
    </div>
  );
};

export default function AudioManagement() {
  const [audios, setAudios] = useState<Audio[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAudios = async () => {
      try {
        setFetchError(null);
        const res = await fetch(`${API_BASE_URL}/api/audio`);
        if (!res.ok) {
          throw new Error(`Failed to fetch audios. Status: ${res.status}`);
        }
        const data = await res.json();
        setAudios(data.audios || []);
      } catch (error) {
        console.error('Fetch error:', error);
        setFetchError('Could not load audios from the server. Please check your connection.');
      }
    };
    fetchAudios();
  }, []);

  const handleUpload = async () => {
    if (!title.trim() || !audioFile) {
      alert("Title and Audio File are required.");
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (tags) formData.append("tags", tags);
    formData.append("audio", audioFile);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/audio/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload audio");
      }

      const newAudioResponse = await res.json();
      setAudios((prev) => [newAudioResponse.audio, ...prev]);
      setTitle("");
      setDescription("");
      setTags("");
      setAudioFile(null);
      alert("Audio uploaded successfully!");
    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Audio</h1>
      
      <div ref={formRef}>
        <section className="mb-10 space-y-4 border p-6 rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4">Upload New Audio</h2>
          <Input 
            placeholder="Title *" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
          <Input 
            placeholder="Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
          <Input 
            placeholder="Tags (comma separated)" 
            value={tags} 
            onChange={(e) => setTags(e.target.value)} 
          />
          <div className="block text-sm font-medium text-gray-700">
            Audio File (MP3, WAV, etc. required)
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
          <Button onClick={handleUpload} variant="default" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload Audio"}
          </Button>
        </section>
      </div>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Uploaded Audio</h2>
        
        {fetchError && (
          <div className="text-red-500 p-4 bg-red-50 rounded-lg mb-4">
            {fetchError}
          </div>
        )}
        
        {audios.length === 0 && !fetchError && (
          <p className="text-gray-500">No audio uploaded yet.</p>
        )}
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {audios.map((audio) => (
            <Card key={audio.id}>
              <CardHeader>
                <CardTitle>{audio.title}</CardTitle>
                <CardDescription>
                  {new Date(audio.createdAt).toLocaleDateString()}
                  {audio.user && (
                    <span className="ml-2 text-blue-600">
                      by {audio.user.firstName} {audio.user.lastName}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {audio.description && (
                  <p className="mb-3 text-sm text-gray-600">{audio.description}</p>
                )}
                
                {audio.tags && audio.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {audio.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
                
                <AudioPlayer audio={audio} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}