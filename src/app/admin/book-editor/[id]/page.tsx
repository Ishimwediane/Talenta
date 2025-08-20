"use client";

import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiService from '@/lib/bookapi';
import { Book } from '@/lib/types';
import { BookEditorForm } from '../_components/BookEditorForm';

interface PageProps {
  params: { id: string };
}

export default function EditBookPage({ params }: PageProps) {
  const { id } = params;
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBook = async () => {
      try {
        const bookData = await apiService.getBookById(id);
        setBook(bookData);
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
          <p className="text-gray-600">Loading book data...</p>
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
          <p className="text-gray-500 mb-4">The book you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return <BookEditorForm formType="edit" initialData={book} />;
}