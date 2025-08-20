"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import apiService from '@/lib/bookapi';
import { Book } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: { id: string };
}

export default function PublicBookReaderPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
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

        // Prefer rendering converted HTML from the backend if a file exists
        if (bookData.bookFile) {
          const filename = bookData.bookFile.split('/').pop();
          if (filename) {
            const htmlContent = await apiService.readBookContent(filename);
            setBookHtmlContent(htmlContent);
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

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="container mx-auto p-6 text-center text-red-500">Error: {error}</div>;
  if (!book) return <div className="container mx-auto p-6 text-center">Book not found.</div>;

  const isOwner = user && book.userId && user.id === book.userId;
  const contentToDisplay = bookHtmlContent || book.content || '<p>No content available for this book.</p>';

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <article>
        {book.coverImage && (
          <img src={book.coverImage} alt={book.title} className="w-full h-96 object-cover rounded-lg mb-8 shadow-lg" />
        )}
        <h1 className="text-4xl md:text-5xl font-bold mb-2">{book.title}</h1>
        <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-gray-500">
            Published on {new Date(book.publishedAt).toLocaleDateString()}
          </p>
          <div className="flex gap-2">
            {book.bookFile && (
              <a href={apiService.getBookDownloadUrl(book.bookFile.split('/').pop()!)} download>
                <Button><Download className="h-4 w-4 mr-2" /> Download</Button>
              </a>
            )}
            {isOwner && (
              <Button variant="outline" onClick={() => router.push(`/admin/book-editor/${book.id}`)}>Edit</Button>
            )}
          </div>
        </div>

        {book.description && (
          <p className="text-lg italic bg-gray-50 p-4 rounded-md mb-8 border-l-4 border-gray-300">
            {book.description}
          </p>
        )}

        <div 
          className="prose lg:prose-xl max-w-none"
          dangerouslySetInnerHTML={{ __html: contentToDisplay }}
        />
      </article>
    </div>
  );
}

