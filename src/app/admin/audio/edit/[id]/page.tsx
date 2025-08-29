'use client';

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, Mic, Square, Trash2, Save, Upload, AlertCircle, CheckCircle, Plus, X, ArrowUp, ArrowDown, Edit3 } from "lucide-react";

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
  segmentUrls?: string[];
  segmentPublicIds?: string[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const AudioRecorder: React.FC<{ 
  onRecordingComplete: (audioBlob: Blob) => void 
}> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
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
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        onRecordingComplete(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions and try again.');
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
    <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-gray-800">Record New Segment</h4>
        </div>
        {(isRecording || recordingTime > 0) && (
          <div className="text-lg font-mono font-bold text-red-600 bg-white px-3 py-1 rounded-lg shadow-sm">
            {formatRecordingTime(recordingTime)}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          className={isRecording ? "animate-pulse" : ""}
        >
          {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
        
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="font-medium">Recording...</span>
          </div>
        )}
      </div>
      
      {recordedAudioUrl && (
        <div className="mt-4 p-3 bg-white rounded-lg border">
          <h5 className="font-medium mb-2 text-gray-700">Preview Recording</h5>
          <audio controls className="w-full">
            <source src={recordedAudioUrl} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default function EditAudioPage() {
  const router = useRouter();
  const params = useParams();
  const audioId = params.id as string;
  
  const [audio, setAudio] = useState<Audio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSegments, setNewSegments] = useState<(File | Blob)[]>([]);
  const [recordedSegments, setRecordedSegments] = useState<Blob[]>([]);

  useEffect(() => {
    if (audioId) {
      fetchAudio();
    }
  }, [audioId]);

  const fetchAudio = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await fetch(`${API_BASE_URL}/api/audio/${audioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch audio: ${res.status}`);
      }

      const data = await res.json();
      setAudio(data.audio);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load audio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!audio) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      // Update basic info
      const updateRes = await fetch(`${API_BASE_URL}/api/audio/${audioId}`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: audio.title,
          description: audio.description,
          tags: audio.tags,
          category: audio.category
        })
      });

      if (!updateRes.ok) {
        throw new Error("Failed to update audio");
      }

      // Upload new segments if any
      if (newSegments.length > 0 || recordedSegments.length > 0) {
        const formData = new FormData();
        
        newSegments.forEach((segment, index) => {
          formData.append('segments', segment, `segment_${Date.now()}_${index}.webm`);
        });
        
        recordedSegments.forEach((segment, index) => {
          formData.append('segments', segment, `recorded_${Date.now()}_${index}.webm`);
        });

        const segmentRes = await fetch(`${API_BASE_URL}/api/audio/${audioId}/segments`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (!segmentRes.ok) {
          throw new Error('Failed to upload segments');
        }

        // Refresh audio after upload
        await fetchAudio();
      }

      // Clear pending segments after successful save
      setNewSegments([]);
      setRecordedSegments([]);

      alert('Audio saved successfully!');
    } catch (error) {
      alert(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!audio) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      // First save any pending changes
      await handleSave();

      // Then ensure status is set to draft
      const draftRes = await fetch(`${API_BASE_URL}/api/audio/${audioId}`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: "draft"
        })
      });

      if (!draftRes.ok) {
        throw new Error("Failed to save as draft");
      }

      alert('Audio saved as draft successfully!');
      router.push('/admin/audio');
    } catch (error) {
      alert(`Failed to save as draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSegment = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/audio/${audioId}/segments`, {
        method: 'DELETE',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicId })
      });

      if (!res.ok) throw new Error('Failed to delete segment');
      
      // Refresh audio to get updated segments
      await fetchAudio();
    } catch (error) {
      alert(`Failed to delete segment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleMoveSegment = async (index: number, direction: 'up' | 'down') => {
    if (!audio || !audio.segmentUrls || !audio.segmentPublicIds) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= audio.segmentUrls.length) return;

    // Create new arrays with reordered segments
    const newSegmentUrls = [...audio.segmentUrls];
    const newSegmentPublicIds = [...audio.segmentPublicIds];
    
    // Swap the segments
    [newSegmentUrls[index], newSegmentUrls[newIndex]] = [newSegmentUrls[newIndex], newSegmentUrls[index]];
    [newSegmentPublicIds[index], newSegmentPublicIds[newIndex]] = [newSegmentPublicIds[newIndex], newSegmentPublicIds[index]];

    // Update local state immediately for better UX
    setAudio(prev => prev ? {
      ...prev,
      segmentUrls: newSegmentUrls,
      segmentPublicIds: newSegmentPublicIds
    } : null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/audio/${audioId}/segments/reorder`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          segmentUrls: newSegmentUrls,
          segmentPublicIds: newSegmentPublicIds
        })
      });

      if (!res.ok) throw new Error('Failed to reorder segments');
    } catch (error) {
      alert(`Failed to reorder: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Revert on error
      await fetchAudio();
    }
  };

  const handlePublishWithMerge = async () => {
    if (!audio) return;

    if (!confirm('This will publish the audio and merge all segments into a single file. Continue?')) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      
      // First save any pending changes
      await handleSave();
      
      // Then publish and merge
      const res = await fetch(`${API_BASE_URL}/api/audio/${audioId}/publish-merge`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publish: true })
      });

      if (!res.ok) throw new Error('Failed to publish and merge');
      
      alert('Audio published and segments merged successfully!');
      router.push('/admin/audio');
    } catch (error) {
      alert(`Failed to publish: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-700">Loading Audio Editor...</h2>
              <p className="text-gray-500 mt-2">Preparing your workspace</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !audio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Error Loading Audio</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error || 'Audio not found'}</p>
            <Button 
              onClick={() => router.push('/admin/audio')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Audio Management
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Edit Audio</h1>
                <p className="text-gray-600 text-lg">Manage your audio content and playlist segments</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => router.push('/admin/audio')} 
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  variant="outline"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  onClick={handleSaveAsDraft} 
                  disabled={saving}
                  variant="secondary"
                  size="lg"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save as Draft'}
                </Button>
                {audio.status === 'DRAFT' && (
                  <Button 
                    onClick={handlePublishWithMerge} 
                    disabled={saving}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Publish & Auto-Merge
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info & Recording */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-700 font-medium">Title</Label>
                    <Input
                      id="title"
                      value={audio.title || ''}
                      onChange={(e) => setAudio(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter audio title..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={audio.description || ''}
                      onChange={(e) => setAudio(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe your audio content..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags" className="text-gray-700 font-medium">Tags</Label>
                    <Input
                      id="tags"
                      value={audio.tags?.join(', ') || ''}
                      onChange={(e) => setAudio(prev => prev ? { ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : null)}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="tag1, tag2, tag3..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-gray-700 font-medium">Category</Label>
                    <Input
                      id="category"
                      value={audio.category || ''}
                      onChange={(e) => setAudio(prev => prev ? { ...prev, category: e.target.value } : null)}
                      className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., Podcast, Music, Interview..."
                    />
                  </div>

                  <div className="pt-2">
                    <Badge 
                      variant={audio.status === 'PUBLISHED' ? 'default' : 'secondary'}
                      className="text-sm font-medium"
                    >
                      {audio.status || 'DRAFT'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recording Section */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Record New Segment
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Add new audio segments to your playlist
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <AudioRecorder 
                    onRecordingComplete={(blob) => {
                      setRecordedSegments(prev => [...prev, blob]);
                    }}
                  />
                </CardContent>
              </Card>

              {/* File Upload */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Audio Files
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Upload existing audio files as segments
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div>
                    <Label htmlFor="segment-file" className="text-gray-700 font-medium">Select Audio File</Label>
                    <Input
                      id="segment-file"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewSegments(prev => [...prev, file]);
                        }
                      }}
                      className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pending Segments */}
              {(newSegments.length > 0 || recordedSegments.length > 0) && (
                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Pending Segments ({newSegments.length + recordedSegments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {newSegments.map((segment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-3">
                            <Upload className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-gray-700">
                              {segment instanceof File ? segment.name : 'Uploaded file'}
                            </span>
                          </div>
                          <Button
                            onClick={() => setNewSegments(prev => prev.filter((_, i) => i !== index))}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-800 border-red-300"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {recordedSegments.map((_, index) => (
                        <div key={`recorded-${index}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <Mic className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-gray-700">Recorded Segment {index + 1}</span>
                          </div>
                          <Button
                            onClick={() => setRecordedSegments(prev => prev.filter((_, i) => i !== index))}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-800 border-red-300"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Playlist Management */}
            <div className="space-y-6">
              {/* Current Playlist */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Current Playlist
                  </CardTitle>
                  <CardDescription className="text-indigo-100">
                    Manage the order of audio segments. They will be merged in this order when published.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Main Audio */}
                  <div className="border-2 border-blue-200 rounded-lg p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">Main Audio</div>
                          <div className="text-sm text-gray-600">Original recording</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        Original
                      </Badge>
                    </div>
                  </div>

                  {/* Segments */}
                  {audio.segmentUrls && audio.segmentUrls.length > 0 ? (
                    <div className="space-y-3">
                      {audio.segmentUrls.map((url, index) => (
                        <div key={index} className="border-2 border-gray-200 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-slate-50 hover:border-green-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{index + 2}</span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">Segment {index + 1}</div>
                                <div className="text-sm text-gray-600">Additional audio</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleMoveSegment(index, 'up')}
                                size="sm"
                                variant="outline"
                                disabled={index === 0}
                                className="border-gray-300 hover:border-blue-400"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => handleMoveSegment(index, 'down')}
                                size="sm"
                                variant="outline"
                                disabled={index === audio.segmentUrls!.length - 1}
                                className="border-gray-300 hover:border-blue-400"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteSegment(audio.segmentPublicIds?.[index] || '')}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-800 border-red-300 hover:border-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Volume2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Additional Segments</h3>
                      <p className="text-sm">Add segments using the recording and upload tools on the left</p>
                    </div>
                  )}

                  {audio.segmentUrls && audio.segmentUrls.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-3 text-yellow-800">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-semibold">Auto-merge on Publish</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">
                        When you publish this audio, all segments will be automatically merged into a single file in the order shown above.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Audio Preview */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="bg-gradient-to-r from-gray-600 to-slate-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Audio Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                    <audio controls className="w-full">
                      <source src={audio.fileUrl} />
                      Your browser does not support the audio element.
                    </audio>
                    <div className="mt-3 text-sm text-gray-600 text-center">
                      Main audio file - additional segments will be appended when published
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

