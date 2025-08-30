'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit, Plus, AlertCircle, Eye, BookOpen, FileText, Upload, Save, Clock, User, Search, Filter } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000";

interface Book {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  createdAt: string;
  coverImage?: string | null;
  category?: string;
  tags?: string[];
  pageCount?: number;
}

export default function UserBooksDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [drafts, setDrafts] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all"|"draft"|"published">("all");
  const [sortBy, setSortBy] = useState<"newest"|"oldest"|"title">("newest");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchUserBooks();
  }, [isAuthenticated, router]);

  const fetchUserBooks = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const res = await fetch(`${API_BASE_URL}/api/books/my-books`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch books.");
      }
      
      const booksData = await res.json();
      const allBooks = booksData || [];
      
      // Separate published and draft books
      const publishedBooks = allBooks.filter((book: Book) => book.status === 'PUBLISHED');
      const draftBooks = allBooks.filter((book: Book) => book.status === 'DRAFT');
      
      setBooks(publishedBooks);
      setDrafts(draftBooks);
    } catch (error) {
      console.error('Fetch error:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

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
      setDrafts(prev => prev.filter(book => book.id !== bookId));
      alert("Book deleted successfully!");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (bookId: string) => {
    router.push(`/dashboard/write/edit/${bookId}`);
  };

  const handleView = (bookId: string) => {
    router.push(`/dashboard/read/${bookId}`);
  };

  const filterAndSortBooks = (bookList: Book[], includeStatus: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = bookList.filter(book => {
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'draft' && includeStatus === 'draft') ||
        (statusFilter === 'published' && includeStatus === 'published');
      
      const searchMatch = !normalizedQuery ||
        book.title?.toLowerCase().includes(normalizedQuery) ||
        book.authors?.join(' ').toLowerCase().includes(normalizedQuery) ||
        (Array.isArray(book.tags) && book.tags.join(',').toLowerCase().includes(normalizedQuery));
      
      return statusMatch && searchMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      const aTime = new Date(a.updatedAt || '').getTime();
      const bTime = new Date(b.updatedAt || '').getTime();
      return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your books...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 shadow-lg mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600">Your Writing Studio</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-green-800 to-emerald-800 bg-clip-text text-transparent mb-4">
            My Books
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create, manage, and publish your personal book collection
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard/write/new">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Create New Book
            </Button>
          </Link>
          <Link href="/dashboard/write/upload">
            <Button size="lg" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 shadow-lg">
              <Upload className="h-5 w-5 mr-2" />
              Upload Existing Book
            </Button>
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white shadow-sm" 
                placeholder="Search your books..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select 
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-green-500 bg-white shadow-sm" 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Drafts Only</option>
                  <option value="published">Published Only</option>
                </select>
              </div>
              <select 
                className="px-4 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-green-500 bg-white shadow-sm" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-white/20">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-3 py-3 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <BookOpen className="h-5 w-5" />
                <span className="font-semibold">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="manage" 
                className="flex items-center gap-3 py-3 px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <FileText className="h-5 w-5" />
                <span className="font-semibold">Manage Books</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{books.length + drafts.length}</h3>
                    <p className="text-gray-600">Total Books</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{drafts.length}</h3>
                    <p className="text-gray-600">Drafts</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{books.length}</h3>
                    <p className="text-gray-600">Published</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 mb-8">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Plus className="h-5 w-5" />
                    </div>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/dashboard/write/new">
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Start Writing New Book
                      </Button>
                    </Link>
                    <Link href="/dashboard/write/upload">
                      <Button variant="outline" className="w-full border-amber-500 text-amber-600 hover:bg-amber-50">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Existing Book
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manage" className="mt-6">
              {/* Drafts Section */}
              {(() => {
                const sortedDrafts = filterAndSortBooks(drafts, 'draft');
                if (sortedDrafts.length === 0) return null;
                
                return (
                  <section className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Your Drafts</h2>
                        <p className="text-gray-600">Work in progress - {sortedDrafts.length} item{sortedDrafts.length !== 1 ? 's' : ''}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-3 py-1 shadow-md">
                        {sortedDrafts.length}
                      </Badge>
                    </div>
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                      {sortedDrafts.map((draft) => (
                        <Card key={draft.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white hover:-translate-y-1">
                          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <BookOpen className="h-4 w-4" />
                                  </div>
                                  {draft.title}
                                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Draft</Badge>
                                </CardTitle>
                                <CardDescription className="text-amber-100 mt-2 flex items-center gap-4">
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
                              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-amber-400">
                                {draft.description}
                              </p>
                            )}
                            
                            {draft.tags && draft.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {draft.tags.map((tag, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors">
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
                                onClick={() => handleEdit(draft.id)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(draft.id)}
                                disabled={deletingId === draft.id}
                              >
                                {deletingId === draft.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-1" />
                                )}
                                Delete
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
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Published Books</h2>
                    <p className="text-gray-600">Live content - {filterAndSortBooks(books, 'published').length} item{filterAndSortBooks(books, 'published').length !== 1 ? 's' : ''}</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1 shadow-md">
                    {filterAndSortBooks(books, 'published').length}
                  </Badge>
                </div>
                
                {filterAndSortBooks(books, 'published').length === 0 && (
                  <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-inner">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Published Books Yet</h3>
                        <p className="text-gray-500 max-w-md">
                          Start writing your first book or publish your drafts to see them here!
                        </p>
                      </div>
                      <Link href="/dashboard/write/new">
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg">
                          <Plus className="h-4 w-4 mr-2" />
                          Start Writing
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
                
                {filterAndSortBooks(books, 'published').length > 0 && (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {filterAndSortBooks(books, 'published').map((book) => (
                      <Card key={book.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white hover:-translate-y-1">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                                {book.title}
                              </CardTitle>
                              <CardDescription className="text-green-100 mt-2 flex items-center gap-4">
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
                            <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-green-400">
                              {book.description}
                            </p>
                          )}
                          
                          {book.tags && book.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {book.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
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
                              onClick={() => handleView(book.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Read
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEdit(book.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(book.id)}
                              disabled={deletingId === book.id}
                            >
                              {deletingId === book.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <Trash2 className="h-4 w-4 mr-1" />
                              )}
                              Delete
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
  );
}
