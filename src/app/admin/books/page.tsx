"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// --- FIX #1: Define a consistent base URL for your API ---
// Use your actual backend server address. It's likely http, not https for local dev.
const API_BASE_URL = "http://localhost:5000";

interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  isbn?: string;
  tags?: string[];
  publishedAt?: string;
  coverImage?: string | null;
  bookFile?: string | null;
}

export default function BookManagement() {
  const [books, setBooks] = useState<Book[]>([]);

  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [tags, setTags] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- FIX #4: Add a ref to the form for easy resetting ---
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch books on mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token");
        // Use the consistent API_BASE_URL
        const res = await fetch(`${API_BASE_URL}/api/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch books");
        const data = await res.json();
        setBooks(data);
      } catch (error) {
        console.error(error);
        alert("Could not load books");
      }
    };
    fetchBooks();
  }, []);

  // Upload handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!title.trim() || !author.trim()) {
      alert("Title and author are required.");
      return;
    }
    if (!bookFile) {
      alert("Book file is required.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    if (isbn) formData.append("isbn", isbn);
    // Your backend correctly handles a JSON string of tags, so this is good.
    if (tags) formData.append("tags", tags);
    if (publishedAt) formData.append("publishedAt", publishedAt);
    if (coverImageFile) formData.append("coverImage", coverImageFile);
    formData.append("bookFile", bookFile);

    try {
      const token = localStorage.getItem("token");
      
      // --- FIX #2: Use the correct endpoint and base URL ---
      // The endpoint is /api/books, NOT /api/books/upload
      const res = await fetch(`${API_BASE_URL}/api/books`, {
        method: "POST",
        headers: {
          // IMPORTANT: Do NOT set 'Content-Type'. The browser sets it
          // automatically for FormData, including the required boundary.
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload book");
      }

      const newBook = await res.json();
      setBooks((prev) => [...prev, newBook]);

      // --- FIX #4 (cont.): Reset the form properly ---
      formRef.current?.reset();
      setTitle("");
      setAuthor("");
      setDescription("");
      setIsbn("");
      setTags("");
      setPublishedAt("");
      setCoverImageFile(null);
      setBookFile(null);
      
      alert("Book uploaded successfully!");

    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Books</h1>

      {/* Upload Form */}
      <form ref={formRef} onSubmit={handleUpload}>
        <section className="mb-10 space-y-4 border p-6 rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4">Upload New Book</h2>

          {/* ... all your input fields ... */}
          <Input placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input placeholder="Author *" value={author} onChange={(e) => setAuthor(e.target.value)} required />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input placeholder="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
          <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
          <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />

          <label className="block text-sm font-medium text-gray-700">
            Cover Image (optional)
            <input type="file" accept="image/*" onChange={(e) => setCoverImageFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Book File (PDF, required)
            <input type="file" accept="application/pdf,.epub,.mobi" required onChange={(e) => setBookFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
          </label>

          <Button type="submit" variant="default" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload Book"}
          </Button>
        </section>
      </form>

      {/* Books List */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Uploaded Books</h2>
        {books.length === 0 && <p>No books uploaded yet.</p>}

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id}>
              <CardHeader>
                <CardTitle>{book.title}</CardTitle>
                <CardDescription>{book.author}</CardDescription>
              </CardHeader>
              <CardContent>
                {book.coverImage && (
                   // --- FIX #3: Prepend the base URL to image and file links ---
                  <img
                    src={`${API_BASE_URL}${book.coverImage}`}
                    alt={`Cover for ${book.title}`}
                    className="mb-3 w-full h-48 object-cover rounded-md"
                  />
                )}
                <p className="mb-2 text-sm text-gray-600 line-clamp-3">{book.description}</p>
                {book.tags && book.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {book.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <a
                  href={book.bookFile ? `${API_BASE_URL}${book.bookFile}` : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Download Book
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}