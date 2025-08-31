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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium">Your Personal Writing Studio</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">My Books</h1>
            <p className="text-base text-orange-100 max-w-2xl mx-auto">
              Create, write, and manage your personal book library with professional tools
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500 bg-white shadow-sm" 
                    placeholder="Search your books..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      className="pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent" 
                      placeholder="Search your book content..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                  </div>
                </div>
                <Button className="px-6 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors font-medium">
                  Search Books
                </Button>
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
                  <Card className="border bg-white">
                    <CardHeader className="bg-amber-800 text-white rounded-t-lg">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <Edit3 className="h-5 w-5" />
                        </div>
                        Create New Book
                      </CardTitle>
                      <CardDescription className="text-amber-100">
                        Start writing your next masterpiece with our powerful editor
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/dashboard/write/new">
                          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                            <CardContent className="p-6 text-center">
                              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 transition-colors">
                                <Plus className="h-8 w-8 text-white" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">Write New Book</h3>
                              <p className="text-gray-600">Start writing your book directly on our platform using our powerful editor</p>
                            </CardContent>
                          </Card>
                        </Link>

                        <Link href="/dashboard/write/upload">
                          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                            <CardContent className="p-6 text-center">
                              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 transition-colors">
                                <Upload className="h-8 w-8 text-white" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Existing Book</h3>
                              <p className="text-gray-600">Upload your existing book files and share them with the community</p>
                            </CardContent>
                          </Card>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="manage" className="mt-6">
                  {/* User's Book Content */}
                  {fetchError && (
                    <div className="text-red-600 p-6 bg-red-50 rounded-2xl mb-8 flex items-center gap-3 border border-red-200 shadow-lg">
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
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                            <Edit3 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">Your Drafts</h2>
                            <p className="text-gray-600">Work in progress - {sortedDrafts.length} item{sortedDrafts.length !== 1 ? 's' : ''}</p>
                          </div>
                          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm px-3 py-1">
                            {sortedDrafts.length}
                          </Badge>
                        </div>
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                          {sortedDrafts.map((draft) => (
                            <Card key={draft.id} className="group hover:shadow-md transition-all duration-300 border-0 bg-white hover:-translate-y-1">
                              <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <BookOpen className="h-4 w-4" />
                                      </div>
                                      {draft.title}
                                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Draft</Badge>
                                    </CardTitle>
                                    <CardDescription className="text-orange-100 mt-2 flex items-center gap-4">
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(draft.updatedAt).toLocaleDateString()}
                                      </span>
                                    </CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-6 space-y-4">
                                {draft.description && (
                                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-orange-400">
                                    {draft.description}
                                  </p>
                                )}
                                
                                {draft.tags && draft.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {draft.tags.map((tag, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleEditBook(draft.id)}
                                  >
                                    <Edit3 className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Publish
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    );
                  })()}

                  {/* Published Books Section */}
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Published Books</h2>
                        <p className="text-gray-600">Live content - {filterAndSortBooks(books, 'PUBLISHED').length} item{filterAndSortBooks(books, 'PUBLISHED').length !== 1 ? 's' : ''}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1">
                        {filterAndSortBooks(books, 'PUBLISHED').length}
                      </Badge>
                    </div>
                    
                    {filterAndSortBooks(books, 'PUBLISHED').length === 0 && !fetchError && (
                      <div className="text-center py-20 bg-white rounded-lg">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Published Books Yet</h3>
                            <p className="text-gray-500 max-w-md">
                              Start writing your first book to build your personal library!
                            </p>
                          </div>
                          <Button 
                            onClick={() => setActiveTab('write')}
                            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Start Writing
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {filterAndSortBooks(books, 'PUBLISHED').length > 0 && (
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {filterAndSortBooks(books, 'PUBLISHED').map((book) => (
                          <Card key={book.id} className="group hover:shadow-md transition-all duration-300 border-0 bg-white hover:-translate-y-1">
                            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                      <BookOpen className="h-4 w-4" />
                                    </div>
                                    {book.title}
                                  </CardTitle>
                                  <CardDescription className="text-orange-100 mt-2 flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(book.updatedAt).toLocaleDateString()}
                                    </span>
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                              {book.description && (
                                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-orange-400">
                                  {book.description}
                                </p>
                              )}
                              
                              {book.tags && book.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {book.tags.map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleViewBook(book.id)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Read
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
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
                            </CardContent>
                          </Card>
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
