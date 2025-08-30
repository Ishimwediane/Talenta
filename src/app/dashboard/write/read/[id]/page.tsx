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
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/write" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Books Dashboard
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-orange-200 shadow-lg mb-6">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Reading Your Book</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {book.title}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge variant={book.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                {book.status}
              </Badge>
              <span className="text-gray-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(book.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Sidebar - Book Info */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  Book Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
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
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Book Content */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  Book Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
