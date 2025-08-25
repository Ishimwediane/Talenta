"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import apiService from "@/lib/bookapi";
import { PublishedBookSummary } from "@/lib/types";

export default function PublicBooksPage() {
  const [books, setBooks] = useState<PublishedBookSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await apiService.getPublishedBooks();
        setBooks(data);
      } catch (err) {
        setError((err as Error).message || "Failed to load books");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-600">
        Loading books...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Books</h1>
          <p className="text-gray-600 mt-2">Browse all published books.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(!books || books.length === 0) ? (
            <p className="text-gray-500">No books found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                >
                  <div className="relative h-48 bg-gray-50">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
                    {book.author && (
                      <p className="text-sm text-gray-600">by {book.author}</p>
                    )}
                    {book.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{book.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(book.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}





