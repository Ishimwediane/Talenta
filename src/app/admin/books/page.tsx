"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from 'lucide-react';

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

  useEffect(() => {
    const fetchMyBooks = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setIsLoading(false); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/api/books/my-books`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch books.");
        setBooks(await res.json());
      } catch (error) { alert((error as Error).message); } 
      finally { setIsLoading(false); }
    };
    fetchMyBooks();
  }, []);

  const handleDelete = async (bookId: string) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    setDeletingId(bookId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/books/${bookId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete.");
      setBooks(prev => prev.filter(book => book.id !== bookId));
    } catch (error) { alert((error as Error).message); } 
    finally { setDeletingId(null); }
  };

  if (isLoading) return <div className="p-6">Loading your books...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Books</h1>
        <Link href="/admin/book-editor/new"><Button>Write New Book</Button></Link>
      </div>
      {books.length === 0 ? <p>You haven't created any books yet.</p> : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {books.map(book => (
            <Card key={book.id}>
              <CardHeader>
                <div className="flex justify-between items-start"><CardTitle className="line-clamp-2">{book.title}</CardTitle><Badge variant={book.status === 'PUBLISHED' ? 'default' : 'secondary'}>{book.status}</Badge></div>
                <CardDescription>Updated: {new Date(book.updatedAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                {book.coverImage ? <img src={`${API_BASE_URL}${book.coverImage}`} alt={book.title} className="mb-4 w-full h-48 object-cover rounded-md" /> : <div className="mb-4 w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">No Cover</div>}
                <div className="flex gap-2 mt-4">
                  <Link href={`/admin/book-editor/${book.id}`} className="w-full"><Button variant="outline" className="w-full">Edit</Button></Link>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(book.id)} disabled={deletingId === book.id}>{deletingId === book.id ? '...' : <Trash2 className="h-4 w-4" />}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}