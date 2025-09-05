'use client';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Play, Pause, Volume2, Mic, Square, Trash2, Save, Upload, AlertCircle, CheckCircle, Edit3 } from "lucide-react";

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
  const [recordingCategory, setRecordingCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [microphoneAccess, setMicrophoneAccess] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [showMetadataForm, setShowMetadataForm] = useState(true);
  const [metadataCompleted, setMetadataCompleted] = useState(false);
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

  const handleMetadataComplete = () => {
    if (!recordingTitle.trim()) {
      setSaveMessage({
        type: 'error',
        message: 'Please enter a title for your audio recording.'
      });
      return;
    }
    setMetadataCompleted(true);
    setShowMetadataForm(false);
    setSaveMessage(null);
  };

  const startRecording = async () => {
    if (!metadataCompleted) {
      setSaveMessage({
        type: 'error',
        message: 'Please complete the audio information form first.'
      });
      return;
    }

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
    setRecordingSubCategories("");
    setRecordingCategory("");
    setSaveMessage(null);
    setShowMetadataForm(true);
    setMetadataCompleted(false);
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
    if (recordingCategory.trim()) {
      formData.append("category", recordingCategory);
    }
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

      {/* Metadata Form - Show First */}
      {showMetadataForm && (
        <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Edit3 className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Audio Information</h4>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            Please fill in the audio details before starting your recording. This information will be used when saving your audio.
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <Input 
                placeholder="Enter audio title..." 
                value={recordingTitle} 
                onChange={(e) => setRecordingTitle(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                placeholder="Enter audio description (optional)..." 
                value={recordingDescription} 
                onChange={(e) => setRecordingDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={recordingCategory} 
                  onChange={(e) => setRecordingCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category (optional)</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="News">News</option>
                  <option value="Music">Music</option>
                  <option value="Podcast">Podcast</option>
                  <option value="Interview">Interview</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <Input 
                  placeholder="Enter tags (optional)..." 
                  value={recordingTags} 
                  onChange={(e) => setRecordingTags(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-categories</label>
              <Input 
                placeholder="Enter sub-categories (optional)..." 
                value={recordingSubCategories} 
                onChange={(e) => setRecordingSubCategories(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple sub-categories with commas</p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleMetadataComplete}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Continue to Recording
            </Button>
          </div>
        </div>
      )}

      {/* Recording Interface - Show After Metadata */}
      {!showMetadataForm && (
        <>
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
            
            <Button 
              onClick={() => {
                setShowMetadataForm(true);
                setMetadataCompleted(false);
              }}
              variant="outline" 
              size="sm"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit Info
            </Button>
          </div>
        </>
      )}
      
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
      const publishedAudios = allAudios.filter((audio: Audio) => {
        const status = (audio.status || '').toString().toUpperCase();
        return status === 'PUBLISHED';
      });
      const draftAudios = allAudios.filter((audio: Audio) => {
        const status = (audio.status || '').toString().toUpperCase();
        return status === 'DRAFT';
      });
      
      setAudios(publishedAudios);
      setDrafts(draftAudios);
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
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        throw new Error('Cannot upload in server environment.');
      }
      
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
    router.push(`/admin/audio/edit/${audioId}`);
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
                      <Link
                        href={`/audio/${audio.id}/parts`}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Manage Parts
                      </Link>
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
        
        {/* Manage Parts Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center mb-3">
            <p className="text-xs text-gray-600 mb-2">
              💡 <strong>Tip:</strong> Break your audio into parts for better organization
            </p>
          </div>
          <Link href={`/audio/${audio.id}/parts`}>
            <Button variant="outline" size="sm" className="w-full">
              <Volume2 className="h-4 w-4 mr-2" />
              Manage Parts
            </Button>
          </Link>
        </div>
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

  const filterAndSortAudios = (audios: Audio[], status: "all" | "draft" | "published") => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...audios].sort((a,b) => {
      if (sortBy === 'title') return (a.title||'').localeCompare(b.title||'');
      const aTime = new Date(a.createdAt || '').getTime();
      const bTime = new Date(b.createdAt || '').getTime();
      return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
    }).filter(a => {
      // First filter by status
      const statusMatch = status === 'all' || 
        (status === 'draft' && a.status?.toLowerCase() === 'draft') ||
        (status === 'published' && a.status?.toLowerCase() === 'published');
      
      // Then filter by search query
      const searchMatch = !normalizedQuery ||
        a.title?.toLowerCase().includes(normalizedQuery) ||
        `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase().includes(normalizedQuery) ||
        (Array.isArray(a.tags) && a.tags.join(',').toLowerCase().includes(normalizedQuery));
      
      return statusMatch && searchMatch;
    });
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

        {/* Creation Tabs */}
        <div className="mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-white/20">
              <TabsTrigger 
                value="record" 
                className="flex items-center gap-3 py-3 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <Mic className="h-5 w-5" />
                <span className="font-semibold">Record Audio</span>
              </TabsTrigger>
              <TabsTrigger 
                value="upload" 
                className="flex items-center gap-3 py-3 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <Upload className="h-5 w-5" />
                <span className="font-semibold">Upload File</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="record" className="mt-6">
              <AudioRecorder 
                onRecordingComplete={setRecordedBlob} 
                onRecordingSaved={fetchAudios}
              />
            </TabsContent>
            
            <TabsContent value="upload" className="mt-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Upload className="h-5 w-5" />
                    </div>
                    Upload Audio File
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Upload your existing audio files and add metadata
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Input 
                        placeholder="Audio title *" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isLoading}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Input 
                        placeholder="Description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isLoading}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Input 
                        placeholder="Category (e.g., Podcast, Music)"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isLoading}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div className="space-y-4">
                      <Input 
                        placeholder="Tags (comma separated)" 
                        value={tags} 
                        onChange={(e) => setTags(e.target.value)}
                        disabled={isLoading}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      <Input 
                        placeholder="Subcategories (comma separated)" 
                        value={subCategories} 
                        onChange={(e) => setSubCategories(e.target.value)}
                        disabled={isLoading}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Audio File (MP3, WAV, WebM, etc.) *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)}
                            disabled={isLoading}
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-600 file:text-white hover:file:from-purple-600 hover:file:to-pink-700 file:cursor-pointer file:shadow-md disabled:opacity-50 border border-gray-300 rounded-xl p-3 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {uploadMessage && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${
                      uploadMessage.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {uploadMessage.type === 'success' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      <span className="font-medium">{uploadMessage.message}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <Button 
                      onClick={() => handleUpload(true)} 
                      variant="outline" 
                      disabled={isLoading}
                      className="flex-1 border-gray-300 hover:border-purple-400 hover:text-purple-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? "Saving..." : "Save as Draft"}
                    </Button>
                    <Button 
                      onClick={() => handleUpload(false)} 
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isLoading ? "Publishing..." : "Publish Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {fetchError && (
          <div className="text-red-600 p-6 bg-red-50 rounded-2xl mb-8 flex items-center gap-3 border border-red-200 shadow-lg">
            <AlertCircle className="h-6 w-6" />
            <div>
              <div className="font-semibold">Connection Error</div>
              <div className="text-sm">{fetchError}</div>
            </div>
          </div>
        )}

        {/* Drafts Section */}
        {(() => {
          const sortedDrafts = filterAndSortAudios(drafts, 'draft');
          if (sortedDrafts.length === 0) return null;
          
          return (
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Draft Collection</h2>
                  <p className="text-gray-600">Work in progress - {sortedDrafts.length} item{sortedDrafts.length !== 1 ? 's' : ''}</p>
                </div>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-3 py-1 shadow-md">
                  {sortedDrafts.length}
                </Badge>
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {sortedDrafts.map((draft) => renderAudioCard(draft, true))}
              </div>
            </section>
          );
        })()}
        
        {/* Published Audio Section */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Published Library</h2>
              <p className="text-gray-600">Live content - {filterAndSortAudios(audios, 'published').length} item{filterAndSortAudios(audios, 'published').length !== 1 ? 's' : ''}</p>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1 shadow-md">
              {filterAndSortAudios(audios, 'published').length}
            </Badge>
          </div>
          
          {audios.length === 0 && !fetchError && (
            <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-inner">
                  <Volume2 className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Published Audio Yet</h3>
                  <p className="text-gray-500 max-w-md">
                    Record or upload your first audio file to get started with your audio library!
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveTab('record')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              </div>
            </div>
          )}
          
          {filterAndSortAudios(audios, 'published').length > 0 && (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filterAndSortAudios(audios, 'published').map((audio) => renderAudioCard(audio))}
            </div>
          )}
        </section>
      </div>
    
  );
}