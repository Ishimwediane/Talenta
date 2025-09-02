"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, AlertCircle, Eye, BookOpen } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000";

interface Book {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  coverImage?: string | null;
}

export default function MyBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMyBooks = async () => {
      const token = localStorage.getItem("token");
      if (!token) { 
        setIsLoading(false); 
        setError("Please log in to view your books.");
        return; 
      }
      
      try {
        setError(null);
        const res = await fetch(`${API_BASE_URL}/api/books/my-books`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch books.");
        }
        
        const booksData = await res.json();
        setBooks(booksData);
      } catch (error) { 
        setError((error as Error).message);
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchMyBooks();
  }, []);

  const handleDelete = async (bookId: string) => {
    if (!window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;
    
    setDeletingId(bookId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/books/${bookId}`, { 
        method: 'DELETE', 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete book.");
      }
      
      setBooks(prev => prev.filter(book => book.id !== bookId));
      // Show success message
      alert("Book deleted successfully!");
    } catch (error) { 
      alert((error as Error).message);
    } finally { 
      setDeletingId(null); 
    }
  };

  const handleEdit = (bookId: string) => {
    router.push(`/admin/book-editor/${bookId}`);
  };

  const handleView = (bookId: string) => {
    router.push(`/admin/books/${bookId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your books...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Books</h1>
          <p className="text-gray-600 mt-1">Manage your published and draft books</p>
        </div>
        <Link href="/admin/book-editor/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Book
          </Button>
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books yet</h3>
            <p className="text-gray-600 mb-6">Start creating your first book to get started.</p>
            <Link href="/admin/book-editor/new">
              <Button>Create Your First Book</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {books.map(book => (
            <Card key={book.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex-shrink-0">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
                  <Badge 
                    variant={book.status === 'PUBLISHED' ? 'default' : 'secondary'}
                    className="flex-shrink-0"
                  >
                    {book.status}
                  </Badge>
                </div>
                <CardDescription>
                  Updated: {new Date(book.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col flex-grow">
                {book.coverImage ? (
                  <img 
                    src={`${API_BASE_URL}${book.coverImage}`} 
                    alt={book.title} 
                    className="mb-4 w-full h-48 object-cover rounded-md" 
                  />
                ) : (
                  <div className="mb-4 w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                    No Cover Image
                  </div>
                )}
                
                <div className="flex gap-2 mt-auto pt-4">
                  {book.status === 'DRAFT' ? (
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-2"
                      onClick={() => handleEdit(book.id)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-2"
                      onClick={() => handleView(book.id)}
                    >
                      <Eye className="h-4 w-4" />
                      Read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/admin/books/${book.id}/chapters`)}
                    className="flex-shrink-0"
                    title="View Chapters"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(book.id)}
                    disabled={deletingId === book.id}
                    className="flex-shrink-0"
                  >
                    {deletingId === book.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}