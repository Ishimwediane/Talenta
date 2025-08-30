'use client';
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Upload, Plus, Search, Filter, Edit3, Eye, Trash2, Calendar, User, Tag, FileText } from "lucide-react";
import Link from "next/link";
import apiService from '@/lib/bookapi';

interface Book {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  coverImage?: string | null;
}

export default function UserBooksDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'DRAFT' | 'PUBLISHED'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUserBooks();
  }, [isAuthenticated]);

  const fetchUserBooks = async () => {
    try {
      const booksData = await apiService.getMyBooks();
      setBooks(booksData);
    } catch (error) {
      console.error('Error fetching books:', error);
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

  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || book.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const stats = {
    total: books.length,
    drafts: books.filter(book => book.status === 'DRAFT').length,
    published: books.filter(book => book.status === 'PUBLISHED').length
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
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-orange-200 shadow-lg mb-6">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Book Management</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Books Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage your books, track your writing progress, and organize your content
            </p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              <p className="text-gray-600">Total Books</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.drafts}</h3>
              <p className="text-gray-600">Drafts</p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.published}</h3>
              <p className="text-gray-600">Published</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Manage Books
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-orange-500" />
                  Writing Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.total === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No books yet</h3>
                    <p className="text-gray-500 mb-6">Start your writing journey by creating your first book</p>
                    <Link href="/dashboard/write/new">
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Write Your First Book
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="font-medium">Writing Progress</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {stats.published} of {stats.total} books published
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">Active Drafts</h4>
                        <p className="text-yellow-600 text-sm">You have {stats.drafts} books in progress</p>
                      </div>
                      
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Published Works</h4>
                        <p className="text-green-600 text-sm">You have {stats.published} published books</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-orange-500" />
                  Manage Your Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search books by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | 'DRAFT' | 'PUBLISHED')}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="all">All Status</option>
                      <option value="DRAFT">Drafts</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                    
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [sort, order] = e.target.value.split('-');
                        setSortBy(sort as 'title' | 'updatedAt');
                        setSortOrder(order as 'asc' | 'desc');
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="updatedAt-desc">Latest Updated</option>
                      <option value="title-asc">Title A-Z</option>
                      <option value="title-desc">Title Z-A</option>
                    </select>
                  </div>
                </div>

                {/* Books List */}
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your books...</p>
                  </div>
                ) : filteredAndSortedBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || statusFilter !== 'all' ? 'No books found' : 'No books yet'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filters' 
                        : 'Start your writing journey by creating your first book'
                      }
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                      <Link href="/dashboard/write/new">
                        <Button className="bg-orange-500 hover:bg-orange-600">
                          <Plus className="h-4 w-4 mr-2" />
                          Write Your First Book
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAndSortedBooks.map((book) => (
                      <div key={book.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
                              <Badge variant={book.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                {book.status}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(book.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewBook(book.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Read
                            </Button>
                            <Link href={`/dashboard/write/edit/${book.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit3 className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
