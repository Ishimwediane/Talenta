'use client';
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit3, Download, Calendar, Tag, BookOpen, Eye, FileText } from "lucide-react";
import Link from "next/link";
import apiService from '@/lib/bookapi';

interface Book {
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  coverImage?: string | null;
  category?: string;
  subCategories?: string;
  content?: string;
  bookFileName?: string;
  readUrl?: string;
  downloadUrl?: string;
}

export default function ReadBook() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookContent, setBookContent] = useState<string>('');

  const bookId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchBook();
  }, [isAuthenticated, router, bookId]);

  const fetchBook = async () => {
    try {
      const bookData = await apiService.getBookById(bookId);
      setBook(bookData);
      
      // If book has content, fetch it
      if (bookData.bookFileName) {
        try {
          const content = await apiService.readBookContent(bookData.bookFileName);
          setBookContent(content);
        } catch (contentError) {
          console.log('No content to display or content not accessible');
        }
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      setError('Failed to load book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (book?.bookFileName) {
      const downloadUrl = apiService.getBookDownloadUrl(book.bookFileName);
      window.open(downloadUrl, '_blank');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Book Not Found</h3>
            <p className="text-gray-500 mb-6">{error || 'The book you are looking for could not be found.'}</p>
            <Link href="/dashboard/write">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard/write" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Books Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">{book.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant={book.status === 'PUBLISHED' ? 'default' : 'secondary'}>
              {book.status}
            </Badge>
            <span className="text-gray-600 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(book.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Book Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Book Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Book Information</h2>
                <p className="text-gray-600">Details about your book</p>
              </div>
              <div className="space-y-4">
                {book.description && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm">{book.description}</p>
                  </div>
                )}
                
                {book.category && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Category</h4>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">{book.category}</span>
                    </div>
                  </div>
                )}
                
                {book.subCategories && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Subcategories</h4>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">{book.subCategories}</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Link href={`/dashboard/write/edit/${book.id}`}>
                      <Button variant="outline" className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Book
                      </Button>
                    </Link>
                    {book.bookFileName && (
                      <Button 
                        variant="outline" 
                        onClick={handleDownload}
                        className="flex-1 border-gray-300 hover:border-gray-400"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Book Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Book Content</h2>
                <p className="text-gray-600">Read your book content</p>
              </div>
              <div>
                {bookContent ? (
                  <div className="prose max-w-none">
                    <div 
                      className="text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: bookContent.replace(/\n/g, '<br/>') }}
                    />
                  </div>
                ) : book.content ? (
                  <div className="prose max-w-none">
                    <div 
                      className="text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: book.content.replace(/\n/g, '<br/>') }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
                    <p className="text-gray-500 mb-6">
                      This book doesn't have any content to display yet.
                    </p>
                    <Link href={`/dashboard/write/edit/${book.id}`}>
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Add Content
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




