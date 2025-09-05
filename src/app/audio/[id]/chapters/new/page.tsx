'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';
import apiService from '@/lib/api';

interface Audio {
  id: string;
  title: string;
  user: {
    id: string;
  };
}

export default function CreateAudioChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { id: audioId } = params as { id: string };

  const [audio, setAudio] = useState<Audio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    duration: '',
    wordCount: ''
  });

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
        
        // Get next chapter order
        const nextOrder = await fetchNextChapterOrder();
        setFormData(prev => ({ ...prev, order: nextOrder }));
        
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

  const fetchNextChapterOrder = async (): Promise<number> => {
    try {
      const response = await apiService.getAudioChapters(audioId, true);
      const existingChapters = response.chapters || [];
      
      if (existingChapters.length === 0) {
        return 1;
      }
      
      // Find the first missing sequential order
      const existingOrders = existingChapters.map(c => c.order).sort((a, b) => a - b);
      let nextOrder = 1;
      
      for (let i = 0; i < existingOrders.length; i++) {
        if (existingOrders[i] !== i + 1) {
          nextOrder = i + 1;
          break;
        }
        nextOrder = i + 2; // If no gap, next order is after the last
      }
      
      return nextOrder;
    } catch (err) {
      console.error('Failed to fetch next chapter order:', err);
      return 1;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Chapter title is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const chapterData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        order: formData.order,
        status: formData.status,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        wordCount: formData.wordCount ? parseInt(formData.wordCount) : undefined
      };

      await apiService.createAudioChapter(audioId, chapterData);
      
      // Redirect to chapters page
      router.push(`/audio/${audioId}/chapters`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Failed to create chapter:', err);
    } finally {
      setSaving(false);
    }
  };

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
          <p className="text-gray-600 mb-4">You don't have permission to create chapters for this audio.</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Create New Chapter</h1>
                <p className="text-gray-600 mt-1">Add a new chapter to "{audio.title}"</p>
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

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter chapter title"
                required
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
                placeholder="Optional chapter description"
              />
            </div>

            {/* Order */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Order
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                readOnly
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">
                Order is assigned automatically to avoid gaps
              </p>
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

            {/* Word Count */}
            <div>
              <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-2">
                Word Count
              </label>
              <input
                type="number"
                id="wordCount"
                name="wordCount"
                value={formData.wordCount}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Optional word count for transcript"
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
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Creating...' : 'Create Chapter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


