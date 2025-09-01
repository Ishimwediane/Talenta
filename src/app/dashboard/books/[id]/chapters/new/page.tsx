'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/TiptapEditor";
import { 
  ArrowLeft, 
  Save, 
  Eye,
  BookOpen,
  FileText,
  Clock
} from "lucide-react";

export default function CreateChapterPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState<number | null>(null);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [isPublished, setIsPublished] = useState(false);

  const bookId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchNextChapterOrder();
  }, [isAuthenticated, router, bookId]);

  const fetchNextChapterOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/books/${bookId}/chapters`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const chapters = data.data.chapters || [];
        const maxOrder = chapters.reduce((max: number, chapter: any) => 
          Math.max(max, chapter.order || 0), 0);
        setOrder(maxOrder + 1);
      }
    } catch (error) {
      console.error('Error fetching chapter order:', error);
      setOrder(1); // Default to 1 if we can't fetch
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Chapter title is required');
      return;
    }

    if (!content.trim()) {
      setError('Chapter content is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/books/${bookId}/chapters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          order: order,
          status: status,
          isPublished: isPublished
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create chapter');
      }

      const data = await response.json();
      router.push(`/dashboard/books/${bookId}/chapters`);
    } catch (error) {
      console.error('Error creating chapter:', error);
      setError(error instanceof Error ? error.message : 'Failed to create chapter');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWordCount = (content: string) => {
    return content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  };

  const calculateReadingTime = (wordCount: number) => {
    return Math.ceil(wordCount / 200); // Assuming 200 words per minute
  };

  const wordCount = calculateWordCount(content);
  const readingTime = calculateReadingTime(wordCount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Chapter</h1>
              <p className="text-gray-600">Add a new chapter to your collaborative book</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Chapter Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Chapter Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Chapter Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter chapter title..."
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order">Chapter Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={order || ''}
                      onChange={(e) => setOrder(parseInt(e.target.value) || null)}
                      placeholder="Chapter number..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isPublished">Publish immediately</Label>
                </div>
              </CardContent>
            </Card>

            {/* Chapter Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chapter Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your chapter..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Chapter Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chapter Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    {wordCount} words
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {readingTime} min read
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !title.trim() || !content.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Chapter
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            {isPreviewMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-2">{title || 'Untitled Chapter'}</h3>
                    <div 
                      dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500">No content yet...</p>' }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

