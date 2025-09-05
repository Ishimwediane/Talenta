'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, Play, Pause, Volume2, Clock, User, Eye, EyeOff } from 'lucide-react';
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
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface AudioChapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPublished: boolean;
  duration?: number;
  wordCount?: number;
  parts: AudioPart[];
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
  status: 'DRAFT' | 'PUBLISHED';
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function AudioChaptersPage() {
  const params = useParams();
  const router = useRouter();
  const { id: audioId } = params as { id: string };

  const [audio, setAudio] = useState<Audio | null>(null);
  const [chapters, setChapters] = useState<AudioChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeUnpublished, setIncludeUnpublished] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await apiService.getCurrentUser();
        setCurrentUser(userResponse.user);
        
        // Check if user is the owner
        const audioResponse = await apiService.getAudioById(audioId);
        const audioData = audioResponse.audio;
        setAudio(audioData);
        setIsOwner(userResponse.user?.id === audioData.user?.id);
        
        // Get chapters
        const chaptersResponse = await apiService.getAudioChapters(audioId, includeUnpublished);
        setChapters(chaptersResponse.chapters);
        
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        console.error('Failed to fetch audio chapters:', err);
      } finally {
        setLoading(false);
      }
    };

    if (audioId) {
      fetchData();
    }
  }, [audioId, includeUnpublished]);

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteAudioChapter(chapterId);
      setChapters(chapters.filter(chapter => chapter.id !== chapterId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Failed to delete chapter:', err);
    }
  };

  const handleTogglePublish = async (chapter: AudioChapter) => {
    try {
      const newStatus = chapter.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await apiService.updateAudioChapter(chapter.id, { status: newStatus });
      
      setChapters(chapters.map(c => 
        c.id === chapter.id 
          ? { ...c, status: newStatus, isPublished: newStatus === 'PUBLISHED' }
          : c
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Failed to update chapter status:', err);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatWordCount = (count?: number) => {
    if (!count) return '0 words';
    return `${count} word${count === 1 ? '' : 's'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audio chapters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Chapters</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!audio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Audio Not Found</h1>
          <p className="text-gray-600 mb-4">The audio you're looking for doesn't exist.</p>
          <Link
            href="/audio"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Audio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{audio.title}</h1>
              <p className="text-gray-600 mt-1">
                {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} • 
                {audio.status === 'PUBLISHED' ? ' Published' : ' Draft'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isOwner && (
                <>
                  <button
                    onClick={() => setIncludeUnpublished(!includeUnpublished)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {includeUnpublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {includeUnpublished ? 'Hide Drafts' : 'Show Drafts'}
                  </button>
                  <Link
                    href={`/audio/${audioId}/chapters/new`}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Chapter
                  </Link>
                  <Link
                    href={`/audio/${audioId}/chapters/quick-add-part`}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Quick Add Part
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chapter List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapters</h3>
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`#chapter-${chapter.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Chapter {chapter.order}: {chapter.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {chapter.parts.length} part{chapter.parts.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {chapter.status === 'DRAFT' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Draft
                          </span>
                        )}
                        {chapter.status === 'PUBLISHED' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Chapter Content */}
          <div className="lg:col-span-3">
            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🎵</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters yet</h3>
                <p className="text-gray-600 mb-6">
                  {isOwner 
                    ? "Start building your audio book by adding the first chapter."
                    : "This audio book doesn't have any chapters yet."
                  }
                </p>
                {isOwner && (
                  <Link
                    href={`/audio/${audioId}/chapters/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Chapter
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    id={`chapter-${chapter.id}`}
                    className="bg-white rounded-lg shadow-sm border p-6"
                  >
                    {/* Chapter Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-semibold text-gray-900">
                            Chapter {chapter.order}: {chapter.title}
                          </h2>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            chapter.status === 'PUBLISHED' 
                              ? 'bg-green-100 text-green-800'
                              : chapter.status === 'DRAFT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {chapter.status}
                          </span>
                        </div>
                        {chapter.description && (
                          <p className="text-gray-600 text-sm">{chapter.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          {chapter.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(chapter.duration)}
                            </div>
                          )}
                          {chapter.wordCount && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {formatWordCount(chapter.wordCount)}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Volume2 className="w-4 h-4" />
                            {chapter.parts.length} part{chapter.parts.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      
                      {isOwner && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePublish(chapter)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              chapter.status === 'PUBLISHED'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {chapter.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                          </button>
                          <Link
                            href={`/audio/${audioId}/chapters/${chapter.id}/edit`}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                                         {/* Chapter Parts */}
                     <div className="space-y-3">
                       {/* Parts Header */}
                       <div className="flex items-center justify-between mb-3">
                         <h3 className="text-lg font-medium text-gray-900">
                           Parts ({chapter.parts.length})
                         </h3>
                         {isOwner && (
                           <Link
                             href={`/audio/${audioId}/chapters/${chapter.id}/parts/new`}
                             className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                           >
                             <Plus className="w-4 h-4" />
                             Add Part
                           </Link>
                         )}
                       </div>

                       {chapter.parts.length === 0 ? (
                         <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                           <div className="text-gray-400 text-4xl mb-2">🎵</div>
                           <p className="text-gray-600 mb-4">No parts added yet</p>
                           {isOwner && (
                             <Link
                               href={`/audio/${audioId}/chapters/${chapter.id}/parts/new`}
                               className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                             >
                               <Plus className="w-4 h-4" />
                               Add First Part
                             </Link>
                           )}
                         </div>
                       ) : (
                         <div className="space-y-3">
                           {chapter.parts.map((part) => (
                             <div
                               key={part.id}
                               className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                             >
                               <div className="flex items-center gap-4 flex-1">
                                 <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors border border-gray-200">
                                   <Play className="w-4 h-4 text-blue-600" />
                                 </button>
                                 <div className="flex-1 min-w-0">
                                   <p className="text-sm font-medium text-gray-900">
                                     Part {part.order}: {part.title || part.fileName}
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
                               
                               <div className="flex items-center gap-2">
                                 <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                   part.status === 'PUBLISHED' 
                                     ? 'bg-green-100 text-green-800'
                                     : part.status === 'DRAFT'
                                     ? 'bg-yellow-100 text-yellow-800'
                                     : 'bg-gray-100 text-gray-800'
                                 }`}>
                                   {part.status}
                                 </span>
                                 {isOwner && (
                                   <Link
                                     href={`/audio/${audioId}/chapters/${chapter.id}/parts/${part.id}/edit`}
                                     className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                   >
                                     <Edit className="w-4 h-4" />
                                   </Link>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
