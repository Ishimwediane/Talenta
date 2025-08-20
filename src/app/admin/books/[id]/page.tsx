"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertCircle, ArrowLeft, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiService from '@/lib/bookapi';
import { Book } from '@/lib/types';

interface PageProps {
  params: { id: string };
}

export default function BookViewPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [bookHtmlContent, setBookHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      try {
        const bookData = await apiService.getBookById(id);
        setBook(bookData);

        if (bookData.bookFile) {
          const filename = bookData.bookFile.split('/').pop();
          if (filename) {
            try {
              const htmlContent = await apiService.readBookContent(filename);
              setBookHtmlContent(htmlContent);
            } catch (err) {
              console.warn('Could not load book file content:', err);
            }
          }
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Book</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Book Not Found</h2>
          <p className="text-gray-500 mb-4">The book you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const contentToDisplay = bookHtmlContent || book.content;

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="mb-6 flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Books
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/admin/book-editor/${book.id}`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Book
          </Button>
          {book.bookFile && (
            <a href={apiService.getBookDownloadUrl(book.bookFile.split('/').pop()!)} download>
              <Button className="flex items-center gap-2">
                <Download className="h-4 w-4" /> 
                Download File
              </Button>
            </a>
          )}
        </div>
      </div>

      <article>
        {book.coverImage && (
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-96 object-cover rounded-lg mb-8 shadow-lg" 
          />
        )}
        
        <h1 className="text-4xl md:text-5xl font-bold mb-2">{book.title}</h1>
        <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              Published on {new Date(book.publishedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date(book.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {book.description && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8 border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{book.description}</p>
          </div>
        )}

        {book.tags && book.tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {book.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Content</h2>
          <div 
            className="prose lg:prose-xl max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: contentToDisplay || "<p>No content available for this book.</p>" 
            }} 
          />
        </div>
      </article>
    </div>
  );
}

