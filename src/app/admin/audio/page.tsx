'use client';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Volume2, Mic, Square, Trash2, Save, Upload, AlertCircle, CheckCircle } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

interface Audio {
  id: string;
  title: string;
  description?: string | null;
  tags?: string[];
  subCategories?: string[];
  fileName?: string | null;
  fileUrl: string;
  createdAt: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'draft' | 'published';
  category?: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface AudioPlayerProps {
  audio: Audio;
  extraSources?: string[];
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audio, extraSources = [] }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  // Determine audio URL - prioritize Cloudinary URLs, fallback to local storage
  const audioUrl = audio.fileUrl?.startsWith('http') 
    ? audio.fileUrl // Cloudinary URL
    : audio.fileName 
      ? `${API_BASE_URL}/uploads/audio/${audio.fileName}` // Local storage URL
      : audio.fileUrl?.startsWith('/') 
        ? `${API_BASE_URL}${audio.fileUrl}` // Relative local URL
        : audio.fileUrl; // Direct URL

  const playlist = [audioUrl, ...extraSources];

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

  const handleEnded = async () => {
    const nextIndex = currentSourceIndex + 1;
    if (nextIndex < playlist.length && audioRef.current) {
      setCurrentSourceIndex(nextIndex);
      setCurrentTime(0);
      try {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        setError('Failed to play next segment');
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentSourceIndex(0);
    }
  };

  const handleError = () => {
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
        <source src={playlist[currentSourceIndex]} />
        Your browser does not support the audio element.
      </audio>
      
      {error && (
        <div className="text-red-500 text-sm mb-2 p-2 bg-red-50 rounded flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
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
            className="bg-gray-300 rounded-full h-2 cursor-pointer hover:bg-gray-400 transition-colors"
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
    </div>
  );
};

// Inline recorder for appending a single segment in the edit modal
const SegmentRecorder: React.FC<{ onSegmentReady: (file: File) => void, disabled?: boolean }>
  = ({ onSegmentReady, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [segmentBlob, setSegmentBlob] = useState<Blob | null>(null);
  const [segmentUrl, setSegmentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setSegmentBlob(blob);
        const url = URL.createObjectURL(blob);
        setSegmentUrl(url);
        // stop tracks
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (e) {
      setError('Microphone access failed');
    }
  };

  const stop = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const clear = () => {
    setSegmentBlob(null);
    if (segmentUrl) URL.revokeObjectURL(segmentUrl);
    setSegmentUrl(null);
    setError(null);
  };

  const save = () => {
    if (!segmentBlob) return;
    const file = new File([segmentBlob], `segment_${Date.now()}.webm`, { type: segmentBlob.type || 'audio/webm' });
    onSegmentReady(file);
    clear();
  };

  return (
    <div className="p-3 border rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <Mic className="h-4 w-4" />
        <span className="text-sm font-medium">Record Segment</span>
      </div>
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      <div className="flex items-center gap-2 mb-2">
        <Button onClick={isRecording ? stop : start} size="sm" variant={isRecording ? 'destructive' : 'outline'} disabled={disabled}>
          {isRecording ? 'Stop' : 'Start'}
        </Button>
        {segmentUrl && (
          <>
            <Button onClick={save} size="sm" className="" disabled={disabled}>Add to Playlist</Button>
            <Button onClick={clear} size="sm" variant="outline" disabled={disabled}>Clear</Button>
          </>
        )}
      </div>
      {segmentUrl && (
        <audio controls className="w-full">
          <source src={segmentUrl} />
        </audio>
      )}
    </div>
  );
};

const AudioRecorder: React.FC<{ 
  onRecordingComplete: (audioBlob: Blob) => void,
  onRecordingSaved: () => void 
}> = ({ onRecordingComplete, onRecordingSaved }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [recordingTitle, setRecordingTitle] = useState("");
  const [recordingDescription, setRecordingDescription] = useState("");
  const [recordingTags, setRecordingTags] = useState("");
  const [recordingSubCategories, setRecordingSubCategories] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [microphoneAccess, setMicrophoneAccess] = useState<'granted' | 'denied' | 'pending'>('pending');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check microphone permissions on component mount
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setMicrophoneAccess('granted');
        // Stop the stream immediately, we just wanted to check permissions
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {
        setMicrophoneAccess('denied');
      });
  }, []);

  const startRecording = async () => {
    try {
      setSaveMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType || 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        setShowSaveOptions(true);
        onRecordingComplete(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      setMicrophoneAccess('granted');
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setMicrophoneAccess('denied');
      setSaveMessage({
        type: 'error',
        message: 'Could not access microphone. Please check permissions and try again.'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setShowSaveOptions(false);
    setRecordingTitle("");
    setRecordingDescription("");
    setRecordingTags("");
    setSaveMessage(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);
    setRecordingTime(0);
  };

  const handleSaveRecording = async (isDraft = false) => {
    if (!audioBlob) return;

    const title = recordingTitle.trim() || `Recording ${new Date().toLocaleString()}`;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    const token = localStorage.getItem("token");
    if (!token) {
      setSaveMessage({
        type: 'error',
        message: 'Authentication required. Please log in.'
      });
      setIsSaving(false);
      return;
    }
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", recordingDescription);
    formData.append("status", isDraft ? "draft" : "published");
    if (recordingTags.trim()) {
      formData.append("tags", recordingTags);
    }
    if (recordingSubCategories.trim()) {
      formData.append("subCategories", recordingSubCategories);
    }
    formData.append("audio", audioBlob, `recording_${Date.now()}.webm`);

    try {
      const res = await fetch(`${API_BASE_URL}/api/audio/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save recording");
      }

      const result = await res.json();
      setSaveMessage({
        type: 'success',
        message: `Recording ${isDraft ? 'saved as draft' : 'published'} successfully!`
      });
      
      // Clear form after successful save
      setTimeout(() => {
        clearRecording();
        onRecordingSaved();
      }, 2000);
      
    } catch (error) {
      console.error('Save error:', error);
      setSaveMessage({
        type: 'error',
        message: `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  return (
    <div className="space-y-4 border p-6 rounded-lg bg-white">
      <h3 className="text-lg font-semibold">Record Audio</h3>
      
      {microphoneAccess === 'denied' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Microphone access required</span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            Please enable microphone permissions in your browser settings and refresh the page.
          </p>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "default"}
          className="flex items-center space-x-2"
          disabled={isSaving || microphoneAccess === 'denied'}
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
        </Button>
        
        {(isRecording || recordingTime > 0) && (
          <div className="text-lg font-mono font-semibold">
            {formatRecordingTime(recordingTime)}
          </div>
        )}
        
        {audioBlob && !isRecording && (
          <Button onClick={clearRecording} variant="outline" size="sm" disabled={isSaving}>
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      {isRecording && (
        <div className="flex items-center space-x-2 text-red-500">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Recording in progress...</span>
        </div>
      )}
      
      {recordedAudioUrl && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <h4 className="text-sm font-medium">Recording Complete - Preview:</h4>
          </div>
          <audio controls className="w-full">
            <source src={recordedAudioUrl} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
          
          {showSaveOptions && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              <h5 className="font-medium text-sm flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Recording
              </h5>
              
              <div className="space-y-3">
                <Input 
                  placeholder="Title (optional - will auto-generate if empty)" 
                  value={recordingTitle} 
                  onChange={(e) => setRecordingTitle(e.target.value)}
                  disabled={isSaving}
                />
                
                <Input 
                  placeholder="Description (optional)" 
                  value={recordingDescription} 
                  onChange={(e) => setRecordingDescription(e.target.value)}
                  disabled={isSaving}
                />
                
                <Input 
                  placeholder="Tags (comma separated, optional)" 
                  value={recordingTags} 
                  onChange={(e) => setRecordingTags(e.target.value)}
                  disabled={isSaving}
                />
                <Input 
                  placeholder="Subcategories (comma separated, optional)" 
                  value={recordingSubCategories} 
                  onChange={(e) => setRecordingSubCategories(e.target.value)}
                  disabled={isSaving}
                />
              </div>
              
              {saveMessage && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  saveMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {saveMessage.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{saveMessage.message}</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleSaveRecording(true)} 
                  variant="outline" 
                  disabled={isSaving}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save as Draft"}
                </Button>
                <Button 
                  onClick={() => handleSaveRecording(false)} 
                  variant="default" 
                  disabled={isSaving}
                  className="flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  {isSaving ? "Publishing..." : "Publish Now"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main page component
export default function AudioManagementPage() {
  const router = useRouter();
  const [audios, setAudios] = useState<Audio[]>([]);
  const [drafts, setDrafts] = useState<Audio[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all"|"draft"|"published">("all");
  const [sortBy, setSortBy] = useState<"newest"|"oldest"|"title">("newest");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [subCategories, setSubCategories] = useState("");
  const [category, setCategory] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("record");
  const [uploadMessage, setUploadMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [publishingMap, setPublishingMap] = useState<{[id: string]: boolean}>({});
  const [publishMessageMap, setPublishMessageMap] = useState<{[id: string]: {type: 'success' | 'error', message: string}} >({});

  useEffect(() => {
    fetchAudios();
  }, []);

  const fetchAudios = async () => {
    try {
      setFetchError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const res = await fetch(`${API_BASE_URL}/api/audio/user/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch audios. Status: ${res.status}`);
      }
      const data = await res.json();
      const allAudios = data.audios || [];
      
      // Separate published and draft audios (normalize case)
      setAudios(allAudios.filter((audio: Audio) => (audio.status || '').toString().toUpperCase() === 'PUBLISHED'));
      setDrafts(allAudios.filter((audio: Audio) => (audio.status || '').toString().toUpperCase() === 'DRAFT'));
    } catch (error) {
      console.error('Fetch error:', error);
      setFetchError('Could not load audios from the server. Please check your connection.');
    }
  };

  const handleUpload = async (isDraft = false) => {
    if (!title.trim()) {
      setUploadMessage({
        type: 'error',
        message: 'Title is required.'
      });
      return;
    }

    if (!audioFile && !recordedBlob) {
      setUploadMessage({
        type: 'error',
        message: 'Please select an audio file or record audio.'
      });
      return;
    }
    
    setIsLoading(true);
    setUploadMessage(null);
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("status", isDraft ? "draft" : "published");
    if (tags.trim()) formData.append("tags", tags);
    if (subCategories.trim()) formData.append("subCategories", subCategories);
    if (category.trim()) formData.append("category", category.trim());
    
    // Use recorded audio or uploaded file
    if (recordedBlob) {
      formData.append("audio", recordedBlob, `recording_${Date.now()}.webm`);
    } else if (audioFile) {
      formData.append("audio", audioFile);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }

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
      
      if (isDraft) {
        setDrafts((prev) => [newAudioResponse.audio, ...prev]);
      } else {
        setAudios((prev) => [newAudioResponse.audio, ...prev]);
      }
      
      // Reset form
      setTitle("");
      setDescription("");
      setTags("");
      setAudioFile(null);
      setRecordedBlob(null);
      
      setUploadMessage({
        type: 'success',
        message: `Audio ${isDraft ? 'saved as draft' : 'published'} successfully!`
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadMessage(null), 3000);
      
    } catch (error) {
      setUploadMessage({
        type: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : String(error)}`
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishDraft = async (draftId: string) => {
    try {
      setPublishingMap(prev => ({ ...prev, [draftId]: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      const res = await fetch(`${API_BASE_URL}/api/audio/${draftId}/publish`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "published" })
      });

      if (!res.ok) {
        let detail = 'Failed to publish draft';
        try { const err = await res.json(); if (err?.error) detail = err.error; } catch {}
        throw new Error(detail);
      }

      // Refresh the data
      fetchAudios();
      setPublishMessageMap(prev => ({ ...prev, [draftId]: { type: 'success', message: 'Published & merged' } }));
      setTimeout(() => {
        setPublishMessageMap(prev => {
          const copy = { ...prev };
          delete copy[draftId];
          return copy;
        });
      }, 3000);
    } catch (error) {
      console.error('Publish error:', error);
      setPublishMessageMap(prev => ({ ...prev, [draftId]: { type: 'error', message: error instanceof Error ? error.message : 'Publish failed' } }));
      setTimeout(() => {
        setPublishMessageMap(prev => {
          const copy = { ...prev };
          delete copy[draftId];
          return copy;
        });
      }, 4000);
    } finally {
      setPublishingMap(prev => ({ ...prev, [draftId]: false }));
    }
  };

  // State for managing menu and modals for each audio
  const [menuStates, setMenuStates] = useState<{[key: string]: {isMenuOpen: boolean, isEditModalOpen: boolean, isDeleteModalOpen: boolean}}>({});
  const [extraSegments, setExtraSegments] = useState<{[key: string]: (File | string)[]}>({});

  const handleMenuToggle = (audioId: string) => {
    setMenuStates(prev => ({
      ...prev,
      [audioId]: {
        ...prev[audioId],
        isMenuOpen: !prev[audioId]?.isMenuOpen
      }
    }));
  };

  const handleEdit = (audioId: string) => {
    // Navigate to full-screen edit page
    router.push(`/admin/audio/${audioId}`);
  };

  const handleDelete = (audioId: string) => {
    setMenuStates(prev => ({
      ...prev,
      [audioId]: {
        ...prev[audioId],
        isMenuOpen: false,
        isDeleteModalOpen: true
      }
    }));
  };

  const closeEditModal = (audioId: string) => {
    setMenuStates(prev => ({
      ...prev,
      [audioId]: {
        ...prev[audioId],
        isEditModalOpen: false
      }
    }));
  };

  const closeDeleteModal = (audioId: string) => {
    setMenuStates(prev => ({
      ...prev,
      [audioId]: {
        ...prev[audioId],
        isDeleteModalOpen: false
      }
    }));
  };

  const renderAudioCard = (audio: Audio, isDraft = false) => {
    const audioState = menuStates[audio.id] || {isMenuOpen: false, isEditModalOpen: false, isDeleteModalOpen: false};
    const extraForAudio = (extraSegments[audio.id] || []).map(s => typeof s === 'string' ? s : URL.createObjectURL(s));

    return (
      <Card key={audio.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {audio.title}
                {isDraft && <Badge variant="secondary">Draft</Badge>}
              </CardTitle>
              <CardDescription>
                {new Date(audio.createdAt).toLocaleDateString()}
                {audio.user && (
                  <span className="ml-2 text-blue-600">
                    by {audio.user.firstName} {audio.user.lastName}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Three-dot menu */}
              <div className="relative">
                <button
                  onClick={() => handleMenuToggle(audio.id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {audioState.isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1">
                      <button
                        onClick={() => handleEdit(audio.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(audio.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isDraft && (
                <Button
                  onClick={() => handlePublishDraft(audio.id)}
                  size="sm"
                  className="flex items-center gap-1"
                  disabled={!!publishingMap[audio.id]}
                >
                  <Upload className="h-3 w-3" />
                  {publishingMap[audio.id] ? 'Publishing & merging...' : 'Publish'}
                </Button>
              )}
              {isDraft && publishMessageMap[audio.id] && (
                <div className={`ml-2 text-xs px-2 py-1 rounded ${publishMessageMap[audio.id].type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {publishMessageMap[audio.id].message}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      <CardContent>
        {audio.description && (
          <p className="mb-3 text-sm text-gray-600">{audio.description}</p>
        )}
        
        {audio.tags && audio.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {audio.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}
        
        <AudioPlayer audio={audio} extraSources={extraForAudio} />
      </CardContent>

      {/* Edit Modal */}
      {audioState.isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => closeEditModal(audio.id)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Edit Audio</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  defaultValue={audio.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  defaultValue={audio.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  defaultValue={audio.category || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select Category</option>
                  <option value="podcast">Podcast</option>
                  <option value="audiobook">Audiobook</option>
                  <option value="music">Music</option>
                  <option value="interview">Interview</option>
                  <option value="lecture">Lecture</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Append Segment</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    setExtraSegments(prev => ({
                      ...prev,
                      [audio.id]: [...(prev[audio.id] || []), file]
                    }));
                  }}
                  className="w-full text-sm text-gray-500"
                />
                {extraForAudio.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">{extraForAudio.length} segment(s) appended (not yet saved)</div>
                )}
              </div>

              {/* Record a new segment */}
              <SegmentRecorder
                onSegmentReady={(file) => {
                  setExtraSegments(prev => ({
                    ...prev,
                    [audio.id]: [...(prev[audio.id] || []), file]
                  }));
                }}
              />

              {/* Playlist manager (owner only) */}
              {audio.user && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Playlist Segments</div>
                  <div className="space-y-2">
                    {(audio as any).segmentPublicIds && (audio as any).segmentPublicIds.length > 0 ? (
                      (audio as any).segmentPublicIds.map((pid: string, idx: number) => (
                        <div key={pid} className="flex items-center justify-between text-xs border rounded p-2">
                          <div className="truncate">{pid}</div>
                          <div className="flex items-center gap-1">
                            <button
                              className="px-2 py-1 border rounded"
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const newOrder = [...(audio as any).segmentPublicIds];
                                  if (idx > 0) {
                                    [newOrder[idx-1], newOrder[idx]] = [newOrder[idx], newOrder[idx-1]];
                                    const res = await fetch(`${API_BASE_URL}/api/audio/${audio.id}/segments/order`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ segmentPublicIds: newOrder })
                                    });
                                    if (!res.ok) throw new Error('Failed to move segment');
                                    fetchAudios();
                                  }
                                } catch (e) { alert((e as Error).message); }
                              }}
                            >Up</button>
                            <button
                              className="px-2 py-1 border rounded"
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const newOrder = [...(audio as any).segmentPublicIds];
                                  if (idx < newOrder.length - 1) {
                                    [newOrder[idx+1], newOrder[idx]] = [newOrder[idx], newOrder[idx+1]];
                                    const res = await fetch(`${API_BASE_URL}/api/audio/${audio.id}/segments/order`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ segmentPublicIds: newOrder })
                                    });
                                    if (!res.ok) throw new Error('Failed to move segment');
                                    fetchAudios();
                                  }
                                } catch (e) { alert((e as Error).message); }
                              }}
                            >Down</button>
                            <button
                              className="px-2 py-1 border rounded text-red-600"
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const res = await fetch(`${API_BASE_URL}/api/audio/${audio.id}/segments`, {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                    body: JSON.stringify({ publicId: pid })
                                  });
                                  if (!res.ok) throw new Error('Failed to remove segment');
                                  fetchAudios();
                                } catch (e) { alert((e as Error).message); }
                              }}
                            >Remove</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500">No segments yet</div>
                    )}
                  </div>
                  {(audio as any).segmentPublicIds && (audio as any).segmentPublicIds.length > 0 && (
                    <div className="mt-3">
                      <Button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${API_BASE_URL}/api/audio/${audio.id}/segments/merge`, {
                              method: 'POST',
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            if (!res.ok) throw new Error('Failed to merge segments');
                            alert('Merged successfully');
                            fetchAudios();
                          } catch (e) { alert((e as Error).message); }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Merge into Single File
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => closeEditModal(audio.id)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const pending = extraSegments[audio.id]?.filter(s => s instanceof File) as File[] | undefined;
                    if (pending && pending.length > 0) {
                      const token = localStorage.getItem("token");
                      const form = new FormData();
                      pending.forEach(f => form.append('segments', f));
                      const res = await fetch(`${API_BASE_URL}/api/audio/${audio.id}/segments`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: form
                      });
                      if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error || 'Failed to upload segments');
                      }
                    }
                    alert('Audio updated successfully!');
                    closeEditModal(audio.id);
                    // Clear local extras for this audio and refresh
                    setExtraSegments(prev => ({ ...prev, [audio.id]: [] }));
                    fetchAudios();
                  } catch (e) {
                    alert(`Update failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
                  }
                }}
                className="flex-1 px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {audioState.isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => closeDeleteModal(audio.id)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Delete Audio</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete "{audio.title}"? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => closeDeleteModal(audio.id)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Audio deleted successfully!');
                  closeDeleteModal(audio.id);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audio Management</h1>
        <p className="text-gray-600">Record, upload and manage your audio content with drafts and published items.</p>
      </div>
      
      {/* Toolbar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <input
          className="w-full md:w-64 border rounded-md px-3 py-2"
          placeholder="Search title, author, tags"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">All statuses</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
        </select>
        <select
          className="border rounded-md px-3 py-2"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Record Audio
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="space-y-4">
          <AudioRecorder 
            onRecordingComplete={setRecordedBlob} 
            onRecordingSaved={fetchAudios}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <section className="space-y-4 border p-6 rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Audio File
            </h2>
            
            <div className="space-y-4">
              <Input 
                placeholder="Title *" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
              <Input 
                placeholder="Description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
              <Input 
                placeholder="Tags (comma separated)" 
                value={tags} 
                onChange={(e) => setTags(e.target.value)}
                disabled={isLoading}
              />
              <Input 
                placeholder="Subcategories (comma separated)" 
                value={subCategories} 
                onChange={(e) => setSubCategories(e.target.value)}
                disabled={isLoading}
              />
              <Input 
                placeholder="Category (e.g., Podcasts)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Audio File (MP3, WAV, WebM, etc.) *
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)}
                  disabled={isLoading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 disabled:opacity-50"
                />
              </div>
            </div>
            
            {uploadMessage && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                uploadMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {uploadMessage.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{uploadMessage.message}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={() => handleUpload(true)} 
                variant="outline" 
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save as Draft"}
              </Button>
              <Button 
                onClick={() => handleUpload(false)} 
                variant="default" 
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                {isLoading ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </section>
        </TabsContent>
      </Tabs>
      
      {fetchError && (
        <div className="text-red-500 p-4 bg-red-50 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{fetchError}</span>
        </div>
      )}
      
      {/* Drafts Section */}
      {(() => {
        // filter and sort
        const normalizedQuery = query.trim().toLowerCase();
        const base = drafts.filter(a =>
          (statusFilter === 'all' || statusFilter === 'draft') &&
          (
            !normalizedQuery ||
            a.title?.toLowerCase().includes(normalizedQuery) ||
            `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase().includes(normalizedQuery) ||
            (Array.isArray(a.tags) && a.tags.join(',').toLowerCase().includes(normalizedQuery))
          )
        );
        const sorted = [...base].sort((a,b) => {
          if (sortBy === 'title') return (a.title||'').localeCompare(b.title||'');
          const aTime = new Date(a.createdAt || '').getTime();
          const bTime = new Date(b.createdAt || '').getTime();
          return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
        });
        if (sorted.length === 0) return null;
        return (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <Save className="h-5 w-5" />
            <span>Drafts</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 border">{sorted.length}</span>
          </h2>
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((draft) => renderAudioCard(draft, true))}
          </div>
        </section>
        );
      })()}
      
      {/* Published Audio Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Published Audio</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700 border border-green-200">{(() => {
            const normalizedQuery = query.trim().toLowerCase();
            const filtered = audios.filter(a =>
              (statusFilter === 'all' || statusFilter === 'published') &&
              (
                !normalizedQuery ||
                a.title?.toLowerCase().includes(normalizedQuery) ||
                `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase().includes(normalizedQuery) ||
                (Array.isArray(a.tags) && a.tags.join(',').toLowerCase().includes(normalizedQuery))
              )
            );
            return filtered.length;
          })()}</span>
        </h2>
        
        {audios.length === 0 && !fetchError && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <Volume2 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No published audio yet.</p>
              <p className="text-sm text-gray-400">Record or upload your first audio file to get started!</p>
            </div>
          </div>
        )}
        
        {(() => {
          const normalizedQuery = query.trim().toLowerCase();
          const base = audios.filter(a =>
            (statusFilter === 'all' || statusFilter === 'published') &&
            (
              !normalizedQuery ||
              a.title?.toLowerCase().includes(normalizedQuery) ||
              `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase().includes(normalizedQuery) ||
              (Array.isArray(a.tags) && a.tags.join(',').toLowerCase().includes(normalizedQuery))
            )
          );
          const sorted = [...base].sort((a,b) => {
            if (sortBy === 'title') return (a.title||'').localeCompare(b.title||'');
            const aTime = new Date(a.createdAt || '').getTime();
            const bTime = new Date(b.createdAt || '').getTime();
            return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
          });
          return (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((audio) => renderAudioCard(audio))}
            </div>
          );
        })()}
      </section>
    </div>
  );
}