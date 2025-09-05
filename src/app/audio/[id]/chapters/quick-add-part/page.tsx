'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X, Upload, FileAudio, ChevronDown } from 'lucide-react';
import apiService from '@/lib/api';

interface AudioChapter {
  id: string;
  title: string;
  order: number;
}

interface Audio {
  id: string;
  title: string;
  user: {
    id: string;
  };
}

export default function QuickAddPartPage() {
  const params = useParams();
  const router = useRouter();
  const { id: audioId } = params as { id: string };

  const [audio, setAudio] = useState<Audio | null>(null);
  const [chapters, setChapters] = useState<AudioChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [showChapterDropdown, setShowChapterDropdown] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    duration: ''
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const userResponse = await apiService.getCurrentUser();
        setCurrentUser(userResponse.user);
        
        // Get audio details
        const audioResponse = await apiService.getAudioById(audioId);
        const audioData = audioResponse.audio;
        setAudio(audioData);
        setIsOwner(userResponse.user?.id === audioData.user?.id);
        
        if (!isOwner) {
          router.push(`/audio/${audioId}/chapters`);
          return;
        }
        
        // Get chapters
        const chaptersResponse = await apiService.getAudioChapters(audioId, true);
        setChapters(chaptersResponse.chapters);
        
        // Auto-select first chapter if available
        if (chaptersResponse.chapters.length > 0) {
          setSelectedChapterId(chaptersResponse.chapters[0].id);
        }
        
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (audioId) {
      fetchData();
    }
  }, [audioId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const uploadFile = async (): Promise<string> => {
    if (!file) {
      throw new Error('No file selected');
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChapterId) {
      setError('Please select a chapter');
      return;
    }

    if (!file) {
      setError('Audio file is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Upload file first
      const fileUrl = await uploadFile();
      
      const partData = {
        title: formData.title.trim() || undefined,
        description: formData.description.trim() || undefined,
        status: formData.status,
        fileName: file.name,
        fileUrl: fileUrl,
        duration: formData.duration ? parseInt(formData.duration) : undefined
      };

      await apiService.createAudioPart(selectedChapterId, partData);
      
      // Redirect to chapters page
      router.push(`/audio/${audioId}/chapters`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Failed to create part:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedChapter = chapters.find(c => c.id === selectedChapterId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!audio || !isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to add parts to this audio.</p>
          <Link
            href={`/audio/${audioId}/chapters`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Chapters
          </Link>
        </div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Chapters Available</h1>
          <p className="text-gray-600 mb-6">You need to create chapters first before adding parts.</p>
          <div className="flex items-center gap-4 justify-center">
            <Link
              href={`/audio/${audioId}/chapters/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Chapter
            </Link>
            <Link
              href={`/audio/${audioId}/chapters`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Chapters
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/audio/${audioId}/chapters`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Chapters
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quick Add Part</h1>
                <p className="text-gray-600 mt-1">Add a new part to any chapter in "{audio.title}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Chapter Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Chapter *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className={selectedChapterId ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedChapter 
                      ? `Chapter ${selectedChapter.order}: ${selectedChapter.title}`
                      : 'Select a chapter'
                    }
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showChapterDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showChapterDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        type="button"
                        onClick={() => {
                          setSelectedChapterId(chapter.id);
                          setShowChapterDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">
                          Chapter {chapter.order}: {chapter.title}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Part Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Optional part title (will use filename if empty)"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Optional part description"
              />
            </div>

            {/* Audio File Upload */}
            <div>
              <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 mb-2">
                Audio File *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <FileAudio className="w-8 h-8 text-blue-500" />
                      <span className="font-medium">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
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

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Optional duration in seconds"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Link
                href={`/audio/${audioId}/chapters`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || uploading || !file || !selectedChapterId}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {saving ? 'Creating...' : 'Create Part'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


