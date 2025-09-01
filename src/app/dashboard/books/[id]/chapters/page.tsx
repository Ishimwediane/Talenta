'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Plus, 
  BookOpen, 
  Edit3, 
  Trash2, 
  Eye,
  Users,
  Settings,
  GripVertical,
  Clock,
  FileText
} from "lucide-react";
import Link from "next/link";

interface Chapter {
  id: string;
  title: string;
  content?: string;
  order: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPublished: boolean;
  wordCount?: number;
  readingTime?: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

interface Book {
  id: string;
  title: string;
  author: string;
}

export default function BookChaptersPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('published');

  const bookId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchBookChapters();
  }, [isAuthenticated, router, bookId]);

  const fetchBookChapters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/books/${bookId}/chapters?includeUnpublished=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }

      const data = await response.json();
      setBook(data.data.book);
      setChapters(data.data.chapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      setError('Failed to load chapters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter?')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete chapter');
      }

      // Remove chapter from state
      setChapters(chapters.filter(chapter => chapter.id !== chapterId));
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setError('Failed to delete chapter. Please try again.');
    }
  };

  const getStatusBadge = (status: string, isPublished: boolean) => {
    if (isPublished) {
      return <Badge className="bg-green-100 text-green-700">Published</Badge>;
    }
    if (status === 'DRAFT') {
      return <Badge variant="secondary">Draft</Badge>;
    }
    if (status === 'ARCHIVED') {
      return <Badge variant="outline">Archived</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const filteredChapters = chapters.filter(chapter => {
    if (activeTab === 'published') return chapter.isPublished;
    if (activeTab === 'drafts') return !chapter.isPublished && chapter.status === 'DRAFT';
    if (activeTab === 'archived') return chapter.status === 'ARCHIVED';
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chapters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchBookChapters}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold text-gray-900">{book?.title}</h1>
              <p className="text-gray-600">Manage your book chapters</p>
            </div>
          </div>

          {/* Book Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                Author: {book?.author}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push(`/dashboard/books/${bookId}/chapters/new`)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Chapter
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} total
          </div>
        </div>

        {/* Chapters Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="published" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Published ({chapters.filter(c => c.isPublished).length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Drafts ({chapters.filter(c => !c.isPublished && c.status === 'DRAFT').length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Archived ({chapters.filter(c => c.status === 'ARCHIVED').length})
            </TabsTrigger>
          </TabsList>

          {/* Published Chapters */}
          <TabsContent value="published" className="space-y-4">
            {filteredChapters.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Published Chapters</h3>
                <p className="text-gray-500">Publish some chapters to make them visible to readers.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChapters.map((chapter) => (
                  <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Chapter {chapter.order}</span>
                        </div>
                        {getStatusBadge(chapter.status, chapter.isPublished)}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{chapter.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{chapter.wordCount || 0} words</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{chapter.readingTime || 0} min read</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {chapter.author.firstName[0]}{chapter.author.lastName[0]}
                          </span>
                        </div>
                        <span className="text-gray-600">
                          {chapter.author.firstName} {chapter.author.lastName}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/books/${bookId}/chapters/${chapter.id}/read`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Read
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/books/${bookId}/chapters/${chapter.id}/edit`)}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Draft Chapters */}
          <TabsContent value="drafts" className="space-y-4">
            {filteredChapters.length === 0 ? (
              <div className="text-center py-12">
                <Edit3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Draft Chapters</h3>
                <p className="text-gray-500">Create some draft chapters to work on.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChapters.map((chapter) => (
                  <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Chapter {chapter.order}</span>
                        </div>
                        {getStatusBadge(chapter.status, chapter.isPublished)}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{chapter.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{chapter.wordCount || 0} words</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{chapter.readingTime || 0} min read</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {chapter.author.firstName[0]}{chapter.author.lastName[0]}
                          </span>
                        </div>
                        <span className="text-gray-600">
                          {chapter.author.firstName} {chapter.author.lastName}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/books/${bookId}/chapters/${chapter.id}/edit`)}
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDeleteChapter(chapter.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Archived Chapters */}
          <TabsContent value="archived" className="space-y-4">
            {filteredChapters.length === 0 ? (
              <div className="text-center py-12">
                <Trash2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Archived Chapters</h3>
                <p className="text-gray-500">Archived chapters will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChapters.map((chapter) => (
                  <Card key={chapter.id} className="hover:shadow-md transition-shadow opacity-75">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Chapter {chapter.order}</span>
                        </div>
                        {getStatusBadge(chapter.status, chapter.isPublished)}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{chapter.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{chapter.wordCount || 0} words</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{chapter.readingTime || 0} min read</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {chapter.author.firstName[0]}{chapter.author.lastName[0]}
                          </span>
                        </div>
                        <span className="text-gray-600">
                          {chapter.author.firstName} {chapter.author.lastName}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => router.push(`/dashboard/books/${bookId}/chapters/${chapter.id}/read`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDeleteChapter(chapter.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
