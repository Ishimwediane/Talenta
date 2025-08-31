'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Volume2, Mic, Square, Trash2, Save, Upload, AlertCircle, CheckCircle, Edit3, Music, Clock, User, MoreVertical, Plus, Edit, Eye } from "lucide-react";

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

// Audio Recorder Component
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
export default function UserAudioDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [audios, setAudios] = useState<Audio[]>([]);
  const [drafts, setDrafts] = useState<Audio[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all"|"draft"|"published">("all");
  const [sortBy, setSortBy] = useState<"newest"|"oldest"|"title">("newest");
  const [activeTab, setActiveTab] = useState("record");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchUserAudios();
  }, [isAuthenticated, router]);

  const fetchUserAudios = async () => {
    try {
      setFetchError(null);
      const token = localStorage?.getItem("token");
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
      
      // Separate published and draft audios
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
      setFetchError('Could not load your audio content. Please check your connection.');
    }
  };

  const filterAndSortAudios = (audioList: Audio[], includeStatus: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = audioList.filter(a => {
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'draft' && includeStatus === 'draft') ||
        (statusFilter === 'published' && includeStatus === 'published');
      
      const searchMatch = !normalizedQuery ||
        a.title?.toLowerCase().includes(normalizedQuery) ||
        (Array.isArray(a.tags) && a.tags.join(',').toLowerCase().includes(normalizedQuery));
      
      return statusMatch && searchMatch;
    });

    return [...filtered].sort((a,b) => {
      if (sortBy === 'title') return (a.title||'').localeCompare(b.title||'');
      const aTime = new Date(a.createdAt || '').getTime();
      const bTime = new Date(b.createdAt || '').getTime();
      return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  };

  const handleEdit = (audioId: string) => {
    router.push(`/dashboard/audio/edit/${audioId}`);
  };

  const handleView = (audioId: string) => {
    router.push(`/dashboard/audio/${audioId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <span className="text-sm font-medium">Your Personal Audio Studio</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">My Audio Content</h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Create, record, and manage your personal audio library with professional tools
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 sticky top-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filter Audio</h3>
                <button
                  onClick={() => {
                    setQuery('');
                    setStatusFilter('all');
                    setSortBy('newest');
                  }}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Reset Filters
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Input 
                    className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-white shadow-sm" 
                    placeholder="Search your audio..." 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  Status
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="all"
                      checked={statusFilter === "all"}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Statuses</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={statusFilter === "draft"}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Drafts Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={statusFilter === "published"}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Published Only</span>
                  </label>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  Sort By
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value="newest"
                      checked={sortBy === "newest"}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Newest First</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value="oldest"
                      checked={sortBy === "oldest"}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Oldest First</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value="title"
                      checked={sortBy === "title"}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Title A–Z</span>
                  </label>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Audio:</span>
                    <span className="text-sm font-medium text-gray-900">{audios.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Drafts:</span>
                    <span className="text-sm font-medium text-orange-600">{drafts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Published:</span>
                    <span className="text-sm font-medium text-green-600">{filterAndSortAudios(audios, 'published').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 mb-6 shadow-lg">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <Input 
                      className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-white shadow-sm" 
                      placeholder="Search your audio content..." 
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)} 
                    />
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </Button>
              </div>
            </div>

        {/* Main Content Tabs */}
        <div className="mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-white/20">
              <TabsTrigger 
                value="record" 
                className="flex items-center gap-3 py-3 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <Mic className="h-5 w-5" />
                <span className="font-semibold">Record Audio</span>
              </TabsTrigger>
              <TabsTrigger 
                value="manage" 
                className="flex items-center gap-3 py-3 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <Music className="h-5 w-5" />
                <span className="font-semibold">Manage Content</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="record" className="mt-6">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50">
                <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Mic className="h-5 w-5" />
                    </div>
                    Record New Audio
                  </CardTitle>
                  <CardDescription className="text-orange-100">
                    Create high-quality audio recordings with built-in noise suppression
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <AudioRecorder 
                    onRecordingComplete={setRecordedBlob} 
                    onRecordingSaved={fetchUserAudios}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manage" className="mt-6">
              {/* User's Audio Content */}
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
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Edit3 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Your Drafts</h2>
                        <p className="text-gray-600">Work in progress - {sortedDrafts.length} item{sortedDrafts.length !== 1 ? 's' : ''}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm px-3 py-1 shadow-md">
                        {sortedDrafts.length}
                      </Badge>
                    </div>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                      {sortedDrafts.map((draft) => (
                        <Card key={draft.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white hover:-translate-y-1">
                          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <Music className="h-4 w-4" />
                                  </div>
                                  {draft.title}
                                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Draft</Badge>
                                </CardTitle>
                                <CardDescription className="text-orange-100 mt-2 flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(draft.createdAt).toLocaleDateString()}
                                  </span>
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6 space-y-4">
                            {draft.description && (
                              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-orange-400">
                                {draft.description}
                              </p>
                            )}
                            
                            {draft.tags && draft.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {draft.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <AudioPlayer audio={draft} />
                            
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEdit(draft.id)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Publish
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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
                    <h2 className="text-2xl font-bold text-gray-800">Published Content</h2>
                    <p className="text-gray-600">Live content - {filterAndSortAudios(audios, 'published').length} item{filterAndSortAudios(audios, 'published').length !== 1 ? 's' : ''}</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1 shadow-md">
                    {filterAndSortAudios(audios, 'published').length}
                  </Badge>
                </div>
                
                {filterAndSortAudios(audios, 'published').length === 0 && !fetchError && (
                  <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-inner">
                        <Volume2 className="h-12 w-12 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Audio Content Yet</h3>
                        <p className="text-gray-500 max-w-md">
                          Start recording your first audio to build your personal library!
                        </p>
                      </div>
                      <Button 
                        onClick={() => setActiveTab('record')}
                        className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        Start Recording
                      </Button>
                    </div>
                  </div>
                )}
                
                {filterAndSortAudios(audios, 'published').length > 0 && (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {filterAndSortAudios(audios, 'published').map((audio) => (
                      <Card key={audio.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white hover:-translate-y-1">
                        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                  <Music className="h-4 w-4" />
                                </div>
                                {audio.title}
                              </CardTitle>
                              <CardDescription className="text-orange-100 mt-2 flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(audio.createdAt).toLocaleDateString()}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          {audio.description && (
                            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-orange-400">
                              {audio.description}
                            </p>
                          )}
                          
                          {audio.tags && audio.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <div className="flex flex-wrap gap-2">
                                {audio.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <AudioPlayer audio={audio} />
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleView(audio.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEdit(audio.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>
          </Tabs>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
