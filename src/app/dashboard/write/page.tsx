'use client';
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Upload, Plus, Search, Filter, Edit3, Eye, Trash2, Calendar, User, Tag, FileText, CheckCircle, AlertCircle, Clock, MoreVertical } from "lucide-react";
import Link from "next/link";
import apiService from '@/lib/bookapi';

interface Book {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  coverImage?: string | null;
  description?: string | null;
  tags?: string[];
}

export default function UserBooksDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [drafts, setDrafts] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'DRAFT' | 'PUBLISHED'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("write");
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchUserBooks();
  }, [isAuthenticated, router]);

  const fetchUserBooks = async () => {
    try {
      setFetchError(null);
      const booksData = await apiService.getMyBooks();
      
      // Separate published and draft books
      const publishedBooks = booksData.filter((book: Book) => book.status === 'PUBLISHED');
      const draftBooks = booksData.filter((book: Book) => book.status === 'DRAFT');
      
      setBooks(publishedBooks);
      setDrafts(draftBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
      setFetchError('Could not load your books. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;

    setDeletingId(bookId);
    try {
      await apiService.deleteBook(bookId);
      setBooks(books.filter(book => book.id !== bookId));
      setDrafts(drafts.filter(book => book.id !== bookId));
      alert('Book deleted successfully!');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditBook = (bookId: string) => {
    router.push(`/dashboard/write/edit/${bookId}`);
  };

  const handleViewBook = (bookId: string) => {
    router.push(`/dashboard/write/read/${bookId}`);
  };

  const filterAndSortBooks = (bookList: Book[], includeStatus: string) => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    const filtered = bookList.filter(book => {
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'DRAFT' && includeStatus === 'DRAFT') ||
        (statusFilter === 'PUBLISHED' && includeStatus === 'PUBLISHED');
      
      const searchMatch = !normalizedQuery ||
        book.title?.toLowerCase().includes(normalizedQuery) ||
        (Array.isArray(book.tags) && book.tags.join(',').toLowerCase().includes(normalizedQuery));
      
      return statusMatch && searchMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      const aTime = new Date(a.updatedAt || '').getTime();
      const bTime = new Date(b.updatedAt || '').getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    });
  };

  const stats = {
    total: books.length + drafts.length,
    drafts: drafts.length,
    published: books.length
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Books</h1>
          <p className="text-gray-600 mt-1">Create, write, and manage your personal book library</p>
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
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSortBy('updatedAt');
                    setSortOrder('desc');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset Filters
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search your books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  Status
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="all"
                      checked={statusFilter === "all"}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Statuses</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="DRAFT"
                      checked={statusFilter === "DRAFT"}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Drafts Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="PUBLISHED"
                      checked={statusFilter === "PUBLISHED"}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Published Only</span>
                  </label>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  Sort By
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value="updatedAt-desc"
                      checked={sortBy === "updatedAt" && sortOrder === "desc"}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        setSortBy(sort as 'title' | 'updatedAt');
                        setSortOrder(order as 'asc' | 'desc');
                      }}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Latest Updated</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value="title-asc"
                      checked={sortBy === "title" && sortOrder === "asc"}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        setSortBy(sort as 'title' | 'updatedAt');
                        setSortOrder(order as 'asc' | 'desc');
                      }}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Title A–Z</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sort"
                      value="title-desc"
                      checked={sortBy === "title" && sortOrder === "desc"}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        setSortBy(sort as 'title' | 'updatedAt');
                        setSortOrder(order as 'asc' | 'desc');
                      }}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Title Z–A</span>
                  </label>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Books:</span>
                    <span className="text-sm font-medium text-gray-900">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Drafts:</span>
                    <span className="text-sm font-medium text-orange-600">{stats.drafts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Published:</span>
                    <span className="text-sm font-medium text-green-600">{stats.published}</span>
                  </div>
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
                    placeholder="Search your book content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <button className="px-6 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors font-medium">
                  Search Books
                </button>
              </div>
            </div>

            {/* Main Content Tabs */}
            <div className="mb-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white p-1 rounded-lg border">
                  <TabsTrigger 
                    value="write" 
                    className="flex items-center gap-3 py-3 px-6 rounded-lg data-[state=active]:bg-amber-800 data-[state=active]:text-white transition-all duration-200"
                  >
                    <Edit3 className="h-5 w-5" />
                    <span className="font-semibold">Write Books</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="manage" 
                    className="flex items-center gap-3 py-3 px-6 rounded-lg data-[state=active]:bg-amber-800 data-[state=active]:text-white transition-all duration-200"
                  >
                    <BookOpen className="h-5 w-5" />
                    <span className="font-semibold">Manage Content</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="write" className="mt-6">
                  <div className="bg-white rounded-lg border p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Book</h2>
                      <p className="text-gray-600">Start writing your next masterpiece with our powerful editor</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Link href="/dashboard/write/new">
                        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 transition-colors">
                              <Plus className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Write New Book</h3>
                            <p className="text-gray-600">Start writing your book directly on our platform using our powerful editor</p>
                          </div>
                        </div>
                      </Link>

                      <Link href="/dashboard/write/upload">
                        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 transition-colors">
                              <Upload className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Existing Book</h3>
                            <p className="text-gray-600">Upload your existing book files and share them with the community</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="manage" className="mt-6">
                  {/* User's Book Content */}
                  {fetchError && (
                    <div className="text-red-600 p-6 bg-red-50 rounded-lg mb-8 flex items-center gap-3 border border-red-200">
                      <AlertCircle className="h-6 w-6" />
                      <div>
                        <div className="font-semibold">Connection Error</div>
                        <div className="text-sm">{fetchError}</div>
                      </div>
                    </div>
                  )}

                  {/* Drafts Section */}
                  {(() => {
                    const sortedDrafts = filterAndSortBooks(drafts, 'DRAFT');
                    if (sortedDrafts.length === 0) return null;
                    
                    return (
                      <section className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                          <h2 className="text-2xl font-bold text-gray-800">Your Drafts</h2>
                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                            {sortedDrafts.length} item{sortedDrafts.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-4">
                          {sortedDrafts.map((draft) => (
                            <div key={draft.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{draft.title}</h3>
                                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Draft</span>
                                  </div>
                                  
                                  {draft.description && (
                                    <p className="text-gray-600 mb-3 line-clamp-2">
                                      {draft.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(draft.updatedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  
                                  {draft.tags && draft.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {draft.tags.map((tag, i) => (
                                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditBook(draft.id)}
                                    >
                                      <Edit3 className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Upload className="h-4 w-4 mr-1" />
                                      Publish
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })()}

                  {/* Published Books Section */}
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Published Books</h2>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        {filterAndSortBooks(books, 'PUBLISHED').length} item{filterAndSortBooks(books, 'PUBLISHED').length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {filterAndSortBooks(books, 'PUBLISHED').length === 0 && !fetchError && (
                      <div className="bg-white rounded-lg border p-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Published Books Yet</h3>
                            <p className="text-gray-500">Start writing your first book to build your personal library!</p>
                          </div>
                          <Button 
                            onClick={() => setActiveTab('write')}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Start Writing
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {filterAndSortBooks(books, 'PUBLISHED').length > 0 && (
                      <div className="space-y-4">
                        {filterAndSortBooks(books, 'PUBLISHED').map((book) => (
                          <div key={book.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Published</span>
                                </div>
                                
                                {book.description && (
                                  <p className="text-gray-600 mb-3 line-clamp-2">
                                    {book.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(book.updatedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                {book.tags && book.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {book.tags.map((tag, i) => (
                                      <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewBook(book.id)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Read
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditBook(book.id)}
                                  >
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleDeleteBook(book.id)}
                                    disabled={deletingId === book.id}
                                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                                  >
                                    {deletingId === book.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-1"></div>
                                    ) : (
                                      <Trash2 className="h-4 w-4 mr-1" />
                                    )}
                                    {deletingId === book.id ? 'Deleting...' : 'Delete'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
