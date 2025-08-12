// app/admin/books/page.tsx
"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit } from "lucide-react";

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
}

export default function BooksAdminPage() {
  // Mock initial books data (replace with real fetch later)
  const [books, setBooks] = useState<Book[]>([
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", description: "Classic novel" },
    { id: 2, title: "1984", author: "George Orwell", description: "Dystopian fiction" },
  ]);

  // Form state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");

  // Edit mode state
  const [editBookId, setEditBookId] = useState<number | null>(null);

  // Add or update book handler
  const handleSave = () => {
    if (!title.trim() || !author.trim()) {
      alert("Title and author are required.");
      return;
    }

    if (editBookId !== null) {
      // Update existing book
      setBooks((prev) =>
        prev.map((b) =>
          b.id === editBookId ? { ...b, title, author, description } : b
        )
      );
      setEditBookId(null);
    } else {
      // Add new book
      const newBook: Book = {
        id: books.length > 0 ? books[books.length - 1].id + 1 : 1,
        title,
        author,
        description,
      };
      setBooks((prev) => [...prev, newBook]);
    }

    // Reset form
    setTitle("");
    setAuthor("");
    setDescription("");
  };

  // Edit button click
  const handleEdit = (book: Book) => {
    setEditBookId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setDescription(book.description);
  };

  // Delete book
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this book?")) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
      if (editBookId === id) {
        setEditBookId(null);
        setTitle("");
        setAuthor("");
        setDescription("");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Books</h1>

      {/* Book Form */}
      <Card className="mb-8 max-w-lg">
        <CardHeader>
          <CardTitle>{editBookId !== null ? "Edit Book" : "Add New Book"}</CardTitle>
          <CardDescription>
            {editBookId !== null
              ? "Edit the details and click Save."
              : "Fill the form and click Save to add a new book."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="default" onClick={handleSave}>
                Save
              </Button>
              {editBookId !== null && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditBookId(null);
                    setTitle("");
                    setAuthor("");
                    setDescription("");
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books List */}
      <div className="space-y-4 max-w-4xl">
        {books.length === 0 && (
          <p className="text-gray-600">No books found. Add some!</p>
        )}
        {books.map((book) => (
          <Card key={book.id}>
            <CardContent className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-sm text-gray-700">by {book.author}</p>
                {book.description && (
                  <p className="text-sm text-gray-500">{book.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(book)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(book.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
