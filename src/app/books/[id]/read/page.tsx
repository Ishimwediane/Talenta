'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock,
  FileText,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

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
  description?: string;
  coverImage?: string;
}

export default function BookReaderPage() {
  const router = useRouter();
  const params = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookId = params.id as string;

  useEffect(() => {
    fetchBookAndChapters();
  }, [bookId]);

  const fetchBookAndChapters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch book details
      const bookResponse = await fetch(`/api/books/${bookId}`);
      if (!bookResponse.ok) {
        throw new Error('Failed to fetch book');
      }
      const bookData = await bookResponse.json();
      setBook(bookData.data);

      // Fetch published chapters only
      const chaptersResponse = await fetch(`/api/books/${bookId}/chapters`);
      if (!chaptersResponse.ok) {
        throw new Error('Failed to fetch chapters');
      }
      const chaptersData = await chaptersResponse.json();
      setChapters(chaptersData.data.chapters);
    } catch (error) {
      console.error('Error fetching book and chapters:', error);
      setError('Failed to load book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const goToChapter = (index: number) => {
    setCurrentChapterIndex(index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchBookAndChapters}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!book || chapters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Chapters Available</h3>
          <p className="text-gray-500">This book doesn't have any published chapters yet.</p>
        </div>
      </div>
    );
  }

  const currentChapter = chapters[currentChapterIndex];

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
              <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              <p className="text-gray-600">by {book.author}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chapter Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chapters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => goToChapter(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === currentChapterIndex
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Chapter {chapter.order}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{chapter.title}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{chapter.readingTime || 0} min</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Reading Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Chapter {currentChapter.order}</CardTitle>
                    <p className="text-lg text-gray-600 mt-1">{currentChapter.title}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{currentChapter.wordCount || 0} words</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{currentChapter.readingTime || 0} min read</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: currentChapter.content || '<p class="text-gray-500">No content available.</p>' 
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={goToPreviousChapter}
                disabled={currentChapterIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Chapter
              </Button>
              
              <div className="text-sm text-gray-500">
                {currentChapterIndex + 1} of {chapters.length}
              </div>
              
              <Button
                variant="outline"
                onClick={goToNextChapter}
                disabled={currentChapterIndex === chapters.length - 1}
                className="flex items-center gap-2"
              >
                Next Chapter
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

