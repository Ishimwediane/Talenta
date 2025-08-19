"use client";

import React, { useEffect, useState } from 'react';
import { BookEditorForm } from "../_components/BookEditorForm";

interface PageProps {
  params: { id: string };
}

interface Book {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  coverImage?: string | null;
  bookFile?: string | null;
}

const API_BASE_URL = "http://localhost:5000";

export default function EditBookPage({ params }: PageProps) {
  const { id } = params;
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchBookData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required.");

        const res = await fetch(`${API_BASE_URL}/api/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
             throw new Error("Book not found or you don't have permission to edit it.");
        }
        if (!res.ok) {
             throw new Error("Failed to fetch book data.");
        }
        
        const data = await res.json();
        setBook(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookData();
  }, [id]);

  if (isLoading) {
    return <div className="p-6 text-center">Loading editor...</div>;
  }

  if (error) {
     return <div className="p-6 text-center text-red-500">{error}</div>;
  }
  
  if (!book) {
     return <div className="p-6 text-center">Book could not be loaded.</div>
  }

  return (
    <BookEditorForm formType="edit" initialData={book} />
  );
}