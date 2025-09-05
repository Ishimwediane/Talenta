'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TiptapEditor } from '@/components/TiptapEditor';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import apiService from '@/lib/bookapi';

export default function EditChapterPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const bookId = params.id as string;
  const chapterId = params.chapterId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState<number | null>(null);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchChapter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, chapterId]);

  const fetchChapter = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const chapter = await apiService.getChapter(chapterId);
      setTitle(chapter.title || '');
      setContent(chapter.content || '');
      setOrder(chapter.order ?? null);
      setStatus(chapter.status || 'DRAFT');
      setIsPublished(!!chapter.isPublished);
    } catch (err) {
      console.error('Error loading chapter:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chapter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        order: order ?? undefined,
        status,
        isPublished,
      };
      const updated = await apiService.updateChapter(chapterId, payload);
      // After save go back to chapters list
      router.push(`/dashboard/books/${bookId}/chapters`);
    } catch (err) {
      console.error('Error saving chapter:', err);
      setError(err instanceof Error ? err.message : 'Failed to save chapter');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/books/${bookId}/chapters`)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Chapters
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chapter Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Chapter Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter chapter title..." className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order">Order</Label>
                    <Input id="order" type="number" value={order ?? ''} readOnly disabled className="mt-1 bg-gray-100 text-gray-700" />
                    <p className="mt-1 text-xs text-gray-500">Order is assigned automatically to avoid gaps.</p>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chapter Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TiptapEditor content={content} onChange={setContent} placeholder="Edit your chapter..." />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <input id="isPublished" type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                  <Label htmlFor="isPublished">Publish</Label>
                </div>
                <Button onClick={handleSave} disabled={isSaving || !title.trim()} className="w-full">
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}



