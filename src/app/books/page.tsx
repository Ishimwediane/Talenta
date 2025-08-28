"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import apiService from "@/lib/bookapi";
import { PublishedBookSummary } from "@/lib/types";

export default function PublicBooksPage() {
  const [books, setBooks] = useState<PublishedBookSummary[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<PublishedBookSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");

  // Get unique genres from books (assuming you might have a genre field)
  const genres = React.useMemo(() => {
    // If you don't have genres, you could use categories or create mock genres
    return ["Fiction", "Non-Fiction", "Biography", "Science", "History", "Technology"];
  }, []);

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

  // Filter books based on search and filters
  useEffect(() => {
    let filtered = books;

    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  }, [books, searchQuery, selectedGenre]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("");
    setSelectedFormat("");
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Book Library</h1>
          <p className="text-gray-600 mt-1">Browse and discover published books</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filter Books</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset Filters
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Book Formats */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  Format
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Digital</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">PDF</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">EPUB</span>
                  </label>
                </div>
              </div>

              {/* Genres */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  Genre
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h4>
                <div className="space-y-2">
                  {genres.map((genre) => (
                    <label key={genre} className="flex items-center">
                      <input
                        type="radio"
                        name="genre"
                        value={genre}
                        checked={selectedGenre === genre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{genre}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Publication Date */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  Published
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="date"
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">This week</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="date"
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">This month</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="date"
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Last 6 months</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search books by title, author, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <button className="px-6 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors font-medium">
                  Search Books
                </button>
              </div>
            </div>

            {/* Results */}
            {filteredBooks.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <p className="text-gray-500">No books found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBooks.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="block bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden">
                          {book.coverImage ? (
                            <Image
                              src={book.coverImage}
                              alt={book.title}
                              width={64}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Cover
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {book.title}
                            </h3>
                            {book.author && (
                              <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                            )}
                            {book.description && (
                              <p className="text-gray-600 line-clamp-2 mb-3">
                                {book.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">Digital</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">Published</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {new Date(book.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}