'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApiService, User as UserType, UserStats } from "@/lib/adminApi";
import { 
  Search, 
  User, 
  Calendar, 
  Shield, 
  Eye, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Mic2, 
  CheckCircle, 
  AlertCircle,
  Lock,
  Unlock
} from "lucide-react";



export default function UsersManagementPage() {
  const router = useRouter();
  const { user: currentUser, isAdmin } = useUser();
  const [users, setUsers] = useState<UserType[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);


  // Check if current user is admin
  useEffect(() => {
    if (currentUser && !isAdmin()) {
      router.push('/dashboard');
    }
  }, [currentUser, isAdmin, router]);

  // Fetch users and stats on component mount
  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
      fetchUserStats();
    }
  }, [isAdmin]);

  // Fetch users when search or filters change
  useEffect(() => {
    if (isAdmin()) {
      setCurrentPage(1); // Reset to first page when filters change
      fetchUsers();
    }
  }, [searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminApiService.getUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const stats = await adminApiService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };



  const handleUserAction = async (action: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      switch (action) {
        case 'edit':
          // Navigate to user edit page
          router.push(`/admin/users/edit/${userId}`);
          break;
        case 'deactivate':
          // Toggle user active status
          const updatedUser = await adminApiService.updateUser(userId, {
            isActive: !user.isActive
          });
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, isActive: updatedUser.isActive } : u
          ));
          break;
        case 'delete':
          // Show confirmation dialog and delete user
          if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
            await adminApiService.deleteUser(userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            setTotalCount(prev => prev - 1);
          }
          break;
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      setError('Failed to perform action. Please try again.');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'MODERATOR': return 'secondary';
      case 'CREATOR': return 'default';
      default: return 'outline';
    }
  };

  const getStatusIcon = (user: UserType) => {
    if (!user.isActive) return <Lock className="h-4 w-4 text-red-500" />;
    if (!user.isVerified) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  if (!currentUser || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button onClick={fetchUsers} className="bg-orange-500 hover:bg-orange-600">
              Try Again
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
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users, view their content, and control access</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 {/* Stats Overview */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <Card>
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Total Users</p>
                   <p className="text-2xl font-bold text-gray-900">
                     {userStats?.totalUsers || 0}
                   </p>
                 </div>
                 <User className="h-8 w-8 text-blue-500" />
               </div>
             </CardContent>
           </Card>
           
           <Card>
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Active Users</p>
                   <p className="text-2xl font-bold text-gray-900">
                     {userStats?.activeUsers || 0}
                   </p>
                 </div>
                 <CheckCircle className="h-8 w-8 text-green-500" />
               </div>
             </CardContent>
           </Card>
           
           <Card>
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Verified Users</p>
                   <p className="text-2xl font-bold text-gray-900">
                     {userStats?.verifiedUsers || 0}
                   </p>
                 </div>
                 <Shield className="h-8 w-8 text-purple-500" />
               </div>
             </CardContent>
           </Card>
           
           <Card>
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Content Creators</p>
                   <p className="text-2xl font-bold text-gray-900">
                     {userStats?.creators || 0}
                   </p>
                 </div>
                 <BookOpen className="h-8 w-8 text-orange-500" />
               </div>
             </CardContent>
           </Card>
         </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="USER">User</option>
                <option value="CREATOR">Creator</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
                     <div className="px-6 py-4 border-b bg-gray-50">
             <h2 className="text-lg font-medium text-gray-900">
               Users ({totalCount})
             </h2>
           </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                 {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email || user.phone}
                          </div>
                          {user.location && (
                            <div className="text-xs text-gray-400">
                              📍 {user.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user)}
                        <div>
                          <div className="text-sm text-gray-900">
                            {user.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span>{user._count?.books || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mic2 className="h-4 w-4 text-green-500" />
                          <span>{user._count?.audio || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-purple-500" />
                          <span>{user._count?.contents || 0}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/users/content/${user.id}`)}
                          className="h-8 px-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction('edit', user.id)}
                          className="h-8 px-2"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUserAction('deactivate', user.id)}
                          className={`h-8 px-2 ${!user.isActive ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}
                        >
                          {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        {user.role !== 'ADMIN' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction('delete', user.id)}
                            className="h-8 px-2 text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
                     {users.length === 0 && !isLoading && (
             <div className="text-center py-12">
               <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
               <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
             </div>
           )}
        </div>
      </div>


    </div>
  );
}
