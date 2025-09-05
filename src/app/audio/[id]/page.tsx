"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit3, 
  Volume2, 
  Clock, 
  User, 
  Calendar,
  Play,
  Pause,
  FileAudio,
  Settings,
  BookOpen,
  Plus
} from 'lucide-react';
import apiService from '@/lib/api';

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
  createdAt: string;
  updatedAt: string;
  category?: string;
  subCategories?: string[];
  tags?: string[];
}

export default function AudioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id: audioId } = params as { id: string };
  
  const [audio, setAudio] = useState<Audio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchAudioData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const userResponse = await apiService.getCurrentUser();
        const currentUser = userResponse.user;
        setCurrentUser(currentUser);
        
        // Get audio details
        const audioResponse = await apiService.getAudioById(audioId);
        const audioData = audioResponse.audio;
        setAudio(audioData);
        
        // Check if current user is the audio owner
        setIsOwner(currentUser?.id === audioData.user.id);
        
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        console.error('Failed to fetch audio data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (audioId) {
      fetchAudioData();
    }
  }, [audioId]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalDuration = (): number => {
    if (!audio?.parts) return 0;
    return audio.parts.reduce((total, part) => total + (part.duration || 0), 0);
  };

  const getPublishedPartsCount = (): number => {
    if (!audio?.parts) return 0;
    return audio.parts.filter(part => part.status === 'PUBLISHED').length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audio...</p>
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
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/audio">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Audio
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{audio.title}</h1>
                <p className="text-gray-600">by {audio.user.firstName} {audio.user.lastName}</p>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex gap-2">
                <Link href={`/audio/${audioId}/parts`}>
                  <Button variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Parts
                  </Button>
                </Link>
                <Button>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Audio
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Info Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg">
                    <Volume2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Audio Information</div>
                    <div className="text-sm font-normal text-gray-600">Details about this audio content</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {audio.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{audio.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500">Total Duration</p>
                        <p className="font-semibold text-gray-900">{formatDuration(getTotalDuration())}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileAudio className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500">Parts</p>
                        <p className="font-semibold text-gray-900">{audio.parts?.length || 0} total</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-500">Author</p>
                        <p className="font-semibold text-gray-900">{audio.user.firstName} {audio.user.lastName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-semibold text-gray-900">{formatDate(audio.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={audio.status === 'PUBLISHED' ? 'default' : 'secondary'}
                      className={`font-medium ${
                        audio.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {audio.status}
                    </Badge>
                    {audio.category && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                        {audio.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parts Preview */}
            {audio.parts && audio.parts.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                        <FileAudio className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">Audio Parts</div>
                        <div className="text-sm font-normal text-gray-600">{getPublishedPartsCount()} published, {audio.parts.length} total</div>
                      </div>
                    </CardTitle>
                    <Link href={`/audio/${audioId}/parts`}>
                      <Button variant="outline" size="sm">
                        View All Parts
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {audio.parts.slice(0, 3).map((part) => (
                      <div key={part.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-4 flex-1">
                          <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-200">
                            <Play className="w-4 h-4 text-blue-600" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              Part {part.order}: {part.title}
                            </p>
                            {part.description && (
                              <p className="text-xs text-gray-500 mt-1">{part.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              {part.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(part.duration)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <FileAudio className="w-3 h-3" />
                                {part.fileName}
                              </span>
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
                    ))}
                    
                    {audio.parts.length > 3 && (
                      <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          And {audio.parts.length - 3} more parts...
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            {isOwner && (
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Quick Actions</div>
                      <div className="text-sm font-normal text-gray-600">Manage your audio</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Link href={`/audio/${audioId}/parts`} className="block">
                      <Button className="w-full justify-start" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Manage Parts
                      </Button>
                    </Link>
                    <Button className="w-full justify-start" variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Audio
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Audio Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audio Stats */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg">
                    <FileAudio className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Audio Stats</div>
                    <div className="text-sm font-normal text-gray-600">Content statistics</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Parts</span>
                    <span className="font-semibold text-gray-900">{audio.parts?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Published Parts</span>
                    <span className="font-semibold text-gray-900">{getPublishedPartsCount()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Duration</span>
                    <span className="font-semibold text-gray-900">{formatDuration(getTotalDuration())}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <Badge 
                      variant={audio.status === 'PUBLISHED' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        audio.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {audio.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* No Parts Message */}
            {(!audio.parts || audio.parts.length === 0) && isOwner && (
              <Card className="shadow-lg border-0">
                <CardContent className="text-center py-8">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileAudio className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Parts Yet</h3>
                  <p className="text-gray-600 mb-4">Start creating audio parts to build your content.</p>
                  <Link href={`/audio/${audioId}/parts`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Part
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
