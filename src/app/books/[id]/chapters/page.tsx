"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Edit3, Plus, ArrowLeft, BookOpen } from 'lucide-react';
import apiService from '@/lib/bookapi';
import { Book, Chapter } from '@/lib/types';
import Link from 'next/link';

export default function BookChaptersPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = React.use(params).id as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchBookAndChapters = async () => {
      try {
        setIsLoading(true);
        const bookData = await apiService.getBookById(bookId);
        console.log('📚 Book data received:', bookData);
        console.log('📚 Book data type:', typeof bookData);
        console.log('📚 Book data keys:', Object.keys(bookData));
        setBook(bookData);
        
        if (bookData.chapters) {
          console.log('📚 Chapters found:', bookData.chapters);
          console.log('📚 Chapters type:', typeof bookData.chapters);
          console.log('📚 Chapters length:', bookData.chapters.length);
          setChapters(bookData.chapters);
          if (bookData.chapters.length > 0) {
            setSelectedChapter(bookData.chapters[0]);
          }
        } else {
          console.log('❌ No chapters found in book data');
          console.log('❌ Book data structure:', JSON.stringify(bookData, null, 2));
        }
        
        // Check if current user is the book owner
        const token = localStorage.getItem('token');
        if (token && bookData.userId) {
          // For now, we'll check if the book has chapters (indicating it's editable)
          // In a real app, you'd compare the current user ID with bookData.userId
          setIsOwner(true); // Temporarily set to true for testing
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) {
      fetchBookAndChapters();
    }
  }, [bookId]);

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  const handleEditBook = () => {
    router.push(`/admin/book-editor/${bookId}`);
  };

  const handleAddChapter = () => {
    router.push(`/admin/book-editor/${bookId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book chapters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Book</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-4">The book you're looking for doesn't exist.</p>
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
              <Link href={`/books/${bookId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Book
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                <p className="text-gray-600">by {book.author}</p>
              </div>
            </div>
            
            {isOwner && (
              <div className="flex gap-2">
                <Button onClick={handleAddChapter} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Chapter
                </Button>
                <Button onClick={handleEditBook}>
                  <Edit3 className="h-4 h-4 mr-2" />
                  Edit Book
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chapter List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Chapters ({chapters.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chapters.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No chapters yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => handleChapterSelect(chapter)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedChapter?.id === chapter.id
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{chapter.title}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{chapter.wordCount || 0} words</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{chapter.readingTime || 0} min</span>
                          </div>
                        </div>
                        <Badge 
                          variant={chapter.status === 'PUBLISHED' ? 'default' : 'secondary'}
                          className="mt-2 text-xs"
                        >
                          {chapter.status}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chapter Content */}
          <div className="lg:col-span-3">
            {selectedChapter ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Chapter {selectedChapter.order}: {selectedChapter.title}</span>
                    {isOwner && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/admin/book-editor/${bookId}`)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Chapter
                      </Button>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{selectedChapter.wordCount || 0} words</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedChapter.readingTime || 0} min read</span>
                    </div>
                    <Badge variant={selectedChapter.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {selectedChapter.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedChapter.content }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Chapter</h3>
                  <p className="text-gray-500">Choose a chapter from the sidebar to start reading</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
