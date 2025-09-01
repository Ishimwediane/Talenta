'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApiService, User as UserType, UserContent } from "@/lib/adminApi";
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Mic2, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  Tag, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Download,
  ExternalLink
} from "lucide-react";



export default function UserContentPage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser, isAdmin } = useUser();
  const [user, setUser] = useState<UserType | null>(null);
  const [userContent, setUserContent] = useState<UserContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('books');

  const userId = params.id as string;

  // Check if current user is admin
  useEffect(() => {
    if (currentUser && !isAdmin()) {
      router.push('/dashboard');
    }
  }, [currentUser, isAdmin, router]);

  // Fetch user data and content on component mount
  useEffect(() => {
    if (isAdmin() && userId) {
      fetchUserData();
    }
  }, [isAdmin, userId]);

  // Fetch content when tab changes
  useEffect(() => {
    if (isAdmin() && userId && activeTab) {
      fetchUserContent();
    }
  }, [isAdmin, userId, activeTab]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userData = await adminApiService.getUserById(userId);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserContent = async () => {
    try {
      const contentData = await adminApiService.getUserContent(userId, activeTab as any);
      setUserContent(contentData);
    } catch (error) {
      console.error('Error fetching user content:', error);
      setError('Failed to load user content. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'PUBLISHED') {
      return <Badge className="bg-green-100 text-green-700">Published</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'FILM': return <Eye className="h-4 w-4" />;
      case 'PODCAST': return <Mic2 className="h-4 w-4" />;
      case 'POETRY': return <BookOpen className="h-4 w-4" />;
      case 'MUSIC': return <Play className="h-4 w-4" />;
      case 'PHOTOGRAPHY': return <Eye className="h-4 w-4" />;
      case 'ART': return <Eye className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!currentUser || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h3>
            <p className="text-gray-500 mb-6">The user you are looking for could not be found.</p>
            <Button onClick={() => router.push('/admin/users')} className="bg-orange-500 hover:bg-orange-600">
              Back to Users
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/users')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">User Content</h1>
              <p className="text-gray-600">View all content created by {user.firstName} {user.lastName}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Header */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center">
              <span className="text-xl font-medium text-white">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'default'}>
                  {user.role}
                </Badge>
                <div className="flex items-center gap-2">
                  {user.isActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {user.isVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
              {user.bio && (
                <p className="text-gray-600 mt-2">{user.bio}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                     <TabsList className="grid w-full grid-cols-3">
             <TabsTrigger value="books" className="flex items-center gap-2">
               <BookOpen className="h-4 w-4" />
               Books ({userContent?.books?.length || 0})
             </TabsTrigger>
             <TabsTrigger value="audio" className="flex items-center gap-2">
               <Mic2 className="h-4 w-4" />
               Audio ({userContent?.audio?.length || 0})
             </TabsTrigger>
             <TabsTrigger value="contents" className="flex items-center gap-2">
               <User className="h-4 w-4" />
               Content ({userContent?.contents?.length || 0})
             </TabsTrigger>
           </TabsList>

                     {/* Books Tab */}
           <TabsContent value="books" className="space-y-4">
             {!userContent?.books || userContent.books.length === 0 ? (
               <div className="text-center py-12">
                 <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No Books Found</h3>
                 <p className="text-gray-500">This user hasn't created any books yet.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {userContent.books.map((book) => (
                  <Card key={book.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        {getStatusBadge(book.status)}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {book.title}
                      </h3>
                      
                      {book.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {book.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        {book.category && (
                          <div className="flex items-center gap-2">
                            <Tag className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{book.category}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(book.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

                     {/* Audio Tab */}
           <TabsContent value="audio" className="space-y-4">
             {!userContent?.audio || userContent.audio.length === 0 ? (
               <div className="text-center py-12">
                 <Mic2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No Audio Found</h3>
                 <p className="text-gray-500">This user hasn't created any audio content yet.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {userContent.audio.map((audio) => (
                  <Card key={audio.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Mic2 className="h-6 w-6 text-green-600" />
                        </div>
                        {getStatusBadge(audio.status)}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {audio.title}
                      </h3>
                      
                      {audio.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {audio.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        {audio.category && (
                          <div className="flex items-center gap-2">
                            <Tag className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{audio.category}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Play className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Duration: {formatDuration(audio.totalDuration)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(audio.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

                     {/* Content Tab */}
           <TabsContent value="contents" className="space-y-4">
             {!userContent?.contents || userContent.contents.length === 0 ? (
               <div className="text-center py-12">
                 <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
                 <p className="text-gray-500">This user hasn't created any other content yet.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {userContent.contents.map((content) => (
                  <Card key={content.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          {getContentTypeIcon(content.type)}
                        </div>
                        {getStatusBadge(content.status)}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {content.title}
                      </h3>
                      
                      {content.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {content.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{content.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(content.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/users/edit/${userId}`)}
            className="flex-1"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit User Profile
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/admin/users')}
            className="flex-1"
          >
            Back to Users List
          </Button>
        </div>
      </div>
    </div>
  );
}
