"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileAudio, Clock, Edit3, Plus, ArrowLeft, Volume2, Save, X, Play, Pause, Upload } from 'lucide-react';
import apiService from '@/lib/api';
import Link from 'next/link';

interface AudioPart {
  id: string;
  title: string;
  description?: string;
  order: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPublished: boolean;
  fileName: string;
  fileUrl: string;
  duration?: number;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Audio {
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPublished: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  parts: AudioPart[];
}

export default function AudioPartsPage() {
  const params = useParams();
  const router = useRouter();
  const { id: audioId } = params as { id: string };
  
  const [audio, setAudio] = useState<Audio | null>(null);
  const [parts, setParts] = useState<AudioPart[]>([]);
  const [selectedPart, setSelectedPart] = useState<AudioPart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // New part state
  const [showNewPartForm, setShowNewPartForm] = useState(false);
  const [newPart, setNewPart] = useState({ 
    title: '', 
    description: '',
    file: null as File | null,
    duration: ''
  });
  const [isCreatingPart, setIsCreatingPart] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Edit part state
  const [editingPart, setEditingPart] = useState<AudioPart | null>(null);
  const [isUpdatingPart, setIsUpdatingPart] = useState(false);
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioAndParts = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const userResponse = await apiService.getCurrentUser();
        const currentUser = userResponse.user;
        
        // Get audio details
        const audioResponse = await apiService.getAudioById(audioId);
        const audioData = audioResponse.audio;
        setAudio(audioData);
        
        // Check if current user is the audio owner
        setIsOwner(currentUser?.id === audioData.user.id);
        
        // Get parts for this audio
        const partsResponse = await apiService.getAudioParts(audioId);
        const partsData = partsResponse.parts || [];
        setParts(partsData);
        
        if (partsData.length > 0) {
          setSelectedPart(partsData[0]);
        }
        
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (audioId) {
      fetchAudioAndParts();
    }
  }, [audioId]);

  const handlePartSelect = (part: AudioPart) => {
    setSelectedPart(part);
  };

  const handleEditAudio = () => {
    router.push(`/audio/${audioId}/edit`);
  };

  const handleAddPart = () => {
    setShowNewPartForm(true);
    setNewPart({ title: '', description: '', file: null, duration: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setNewPart(prev => ({ ...prev, file: selectedFile }));
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('audio', file);

    try {
      setUploading(true);
      
      // For now, we'll simulate file upload
      // In a real implementation, you'd upload to your audio service
      // and get back a URL and public ID
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - replace with actual upload logic
      const mockFileUrl = `https://example.com/audio/${Date.now()}-${file.name}`;
      
      return mockFileUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePart = async () => {
    if (!newPart.title.trim()) {
      alert('Please enter a part title');
      return;
    }

    if (!newPart.file) {
      alert('Please select an audio file');
      return;
    }

    setIsCreatingPart(true);
    try {
      // Calculate the next available order
      let nextOrder = 1;
      if (parts.length > 0) {
        const existingOrders = parts.map(p => p.order).sort((a, b) => a - b);
        
        // Find the first gap in order numbers, or use the next number after the highest
        for (let i = 1; i <= existingOrders[existingOrders.length - 1] + 1; i++) {
          if (!existingOrders.includes(i)) {
            nextOrder = i;
            break;
          }
        }
      }
      
      // Upload file first
      const fileUrl = await uploadFile(newPart.file);
      
      const partData = {
        title: newPart.title,
        description: newPart.description || undefined,
        order: nextOrder,
        status: 'DRAFT',
        fileName: newPart.file.name,
        fileUrl: fileUrl,
        duration: newPart.duration ? parseInt(newPart.duration) : undefined
      };
      
      const createdPart = await apiService.createAudioPart(audioId, partData);
      console.log('✅ New part created:', createdPart);
      
      // Refresh parts
      const updatedPartsResponse = await apiService.getAudioParts(audioId);
      const updatedParts = updatedPartsResponse.parts || [];
      setParts(updatedParts);
      setSelectedPart(createdPart);
      
      // Reset form
      setShowNewPartForm(false);
      setNewPart({ title: '', description: '', file: null, duration: '' });
      
      // Show success message
      setSuccessMessage('🎉 Part created successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('❌ Error creating part:', err);
      
      const message = err instanceof Error ? err.message : String(err);
      let errorMessage = 'Failed to create part. Please try again.';
      if (message.includes('order already exists')) {
        errorMessage = 'A part with this order already exists. The system will automatically assign the correct order.';
      } else if (message.includes('400')) {
        errorMessage = 'Part creation failed. Please check your input and try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsCreatingPart(false);
    }
  };

  const handleEditPart = (part: AudioPart) => {
    setEditingPart(part);
  };

  const handleUpdatePart = async () => {
    if (!editingPart || !editingPart.title.trim()) {
      alert('Please enter a part title');
      return;
    }

    setIsUpdatingPart(true);
    try {
      const partData = {
        title: editingPart.title,
        description: editingPart.description,
        order: editingPart.order,
        status: editingPart.status,
        fileName: editingPart.fileName,
        fileUrl: editingPart.fileUrl,
        duration: editingPart.duration
      };

      const updatedPart = await apiService.updateAudioPart(editingPart.id, partData);
      console.log('✅ Part updated:', updatedPart);
      
      // Update local state
      setParts(prev => prev.map(p => p.id === editingPart.id ? updatedPart : p));
      setSelectedPart(updatedPart);
      
      // Reset editing state
      setEditingPart(null);
      
      // Show success message
      setSuccessMessage('✅ Part updated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('❌ Error updating part:', err);
      alert('Failed to update part. Please try again.');
    } finally {
      setIsUpdatingPart(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPart(null);
  };

  const handleCancelNew = () => {
    setShowNewPartForm(false);
    setNewPart({ title: '', description: '', file: null, duration: '' });
  };

  const handleDeletePart = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteAudioPart(partId);
      console.log('✅ Part deleted successfully');
      
      // Refresh parts
      const updatedPartsResponse = await apiService.getAudioParts(audioId);
      const updatedParts = updatedPartsResponse.parts || [];
      setParts(updatedParts);
      
      // If the deleted part was selected, clear selection
      if (selectedPart?.id === partId) {
        setSelectedPart(updatedParts.length > 0 ? updatedParts[0] : null);
      }
      
      // If the deleted part was being edited, clear editing state
      if (editingPart?.id === partId) {
        setEditingPart(null);
      }
    } catch (err) {
      console.error('❌ Error deleting part:', err);
      alert('Failed to delete part. Please try again.');
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audio parts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Audio</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!audio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Audio Not Found</h2>
          <p className="text-gray-600 mb-4">The audio you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center">
              <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg font-medium">
                {successMessage}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/audio/${audioId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Audio
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{audio.title}</h1>
                <p className="text-gray-600">by {audio.user.firstName} {audio.user.lastName}</p>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex gap-2">
                <Button onClick={handleAddPart} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
                <Button onClick={handleEditAudio}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Audio
                </Button>
              </div>
            )}
          </div>
          
          {/* New Part Form */}
          {showNewPartForm && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-blue-900">🎵 Add New Part</h3>
                <Button onClick={handleCancelNew} variant="ghost" size="sm">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-3">🎵 Part Title</label>
                  <input
                    type="text"
                    value={newPart.title}
                    onChange={(e) => setNewPart(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Enter a descriptive part title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-3">📝 Description</label>
                  <textarea
                    value={newPart.description}
                    onChange={(e) => setNewPart(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description for this part..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-3">🎧 Audio File *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-blue-200 border-dashed rounded-lg hover:border-blue-300 transition-colors">
                    <div className="space-y-1 text-center">
                      {newPart.file ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                          <FileAudio className="w-8 h-8 text-blue-500" />
                          <span className="font-medium">{newPart.file.name}</span>
                          <button
                            type="button"
                            onClick={() => setNewPart(prev => ({ ...prev, file: null }))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="audioFile"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Upload an audio file</span>
                              <input
                                id="audioFile"
                                name="audioFile"
                                type="file"
                                className="sr-only"
                                accept="audio/*"
                                onChange={handleFileChange}
                                required
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            MP3, WAV, OGG, M4A up to 50MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-3">⏱️ Duration (seconds)</label>
                  <input
                    type="number"
                    value={newPart.duration}
                    onChange={(e) => setNewPart(prev => ({ ...prev, duration: e.target.value }))}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional duration in seconds"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleCreatePart} 
                    disabled={isCreatingPart || uploading || !newPart.file}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    ) : (
                      <Save className="h-5 w-5 mr-3" />
                    )}
                    {uploading ? 'Uploading...' : isCreatingPart ? 'Creating Part...' : 'Create Part'}
                  </Button>
                  <Button onClick={handleCancelNew} variant="outline" size="lg" className="px-8 py-3 text-lg">
                    Cancel
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 text-center">
                    💡 <strong>Tip:</strong> Upload high-quality audio files for the best listening experience!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Parts List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                    <Volume2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Parts</div>
                    <div className="text-sm font-normal text-gray-600">{parts.length} part{parts.length !== 1 ? 's' : ''}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {parts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileAudio className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No parts yet</p>
                    <p className="text-gray-400 text-sm mt-1">Start recording your audio!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {parts.map((part) => (
                      <div key={part.id} className="relative group">
                        <button
                          onClick={() => handlePartSelect(part)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedPart?.id === part.id
                              ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md scale-[1.02]'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                                {part.title}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {part.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-green-500" />
                                    <span className="font-medium">{formatDuration(part.duration)}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <FileAudio className="w-3 h-3 text-blue-500" />
                                  <span className="font-medium">{part.fileName}</span>
                                </div>
                              </div>
                            </div>
                            <Badge 
                              variant={part.status === 'PUBLISHED' ? 'default' : 'secondary'}
                              className={`text-xs font-semibold ${
                                part.status === 'PUBLISHED' 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }`}
                            >
                              {part.status}
                            </Badge>
                          </div>
                          
                          {/* Part number indicator */}
                          <div className="absolute top-2 left-2">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {part.order}
                            </div>
                          </div>
                        </button>
                        
                        {/* Delete button - only visible on hover for selected part or always for others */}
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePart(part.id);
                            }}
                            className={`absolute top-3 right-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-all duration-200 ${
                              selectedPart?.id === part.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                            title="Delete Part"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Quick add part button */}
                {isOwner && parts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button 
                      onClick={handleAddPart} 
                      variant="outline" 
                      className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another Part
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Part Content */}
          <div className="lg:col-span-3">
            {selectedPart ? (
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                          Part {selectedPart.order}
                        </Badge>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedPart.title}</h2>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        {selectedPart.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{formatDuration(selectedPart.duration)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <FileAudio className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{selectedPart.fileName}</span>
                        </div>
                        <Badge 
                          variant={selectedPart.status === 'PUBLISHED' ? 'default' : 'secondary'}
                          className="font-medium"
                        >
                          {selectedPart.status}
                        </Badge>
                      </div>
                    </div>
                    {isOwner && !editingPart && (
                      <Button 
                        onClick={() => handleEditPart(selectedPart)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Part
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {editingPart && editingPart.id === selectedPart.id ? (
                    <div className="space-y-6">
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Edit3 className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              <strong>Editing Mode:</strong> You're now editing this part. Make your changes below.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">🎵 Part Title</label>
                        <input
                          type="text"
                          value={editingPart.title}
                          onChange={(e) => setEditingPart(prev => prev ? { ...prev, title: e.target.value } : null)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">📝 Description</label>
                        <textarea
                          value={editingPart.description || ''}
                          onChange={(e) => setEditingPart(prev => prev ? { ...prev, description: e.target.value } : null)}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">⏱️ Duration (seconds)</label>
                        <input
                          type="number"
                          value={editingPart.duration || ''}
                          onChange={(e) => setEditingPart(prev => prev ? { ...prev, duration: parseInt(e.target.value) || undefined } : null)}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4 border-t pt-6">
                        <Button 
                          onClick={handleUpdatePart} 
                          disabled={isUpdatingPart}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                        >
                          {isUpdatingPart ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          ) : (
                            <Save className="h-5 w-5 mr-3" />
                          )}
                          {isUpdatingPart ? 'Updating Part...' : 'Save Changes'}
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" size="lg" className="px-8 py-3 text-lg">
                          Cancel Editing
                        </Button>
                      </div>
                      
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          💡 <strong>Tip:</strong> Your changes are automatically saved when you click "Save Changes"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <FileAudio className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-700">
                              <strong>Audio Player:</strong> Click the play button below to listen to this part.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Audio Player */}
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-center mb-4">
                          <button className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                            <Play className="w-8 h-8" />
                          </button>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 mb-2">Ready to play: {selectedPart.title}</p>
                          <p className="text-sm text-gray-500">{selectedPart.fileName}</p>
                        </div>
                      </div>

                      {/* Description */}
                      {selectedPart.description && (
                        <div className="bg-white rounded-lg p-6 border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                          <p className="text-gray-700">{selectedPart.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="text-center py-16">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileAudio className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a Part to Listen</h3>
                  <p className="text-gray-600 mb-6">Choose a part from the sidebar to start listening, or create a new one to get started!</p>
                  {isOwner && (
                    <Button onClick={handleAddPart} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Part
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
