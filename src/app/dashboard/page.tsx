'use client';

import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, User, Upload, Eye, Heart } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-2xl font-bold gradient-text"
            >
              Talenta
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <span className="text-white">Welcome, {user?.firstName}!</span>
              <button
                onClick={handleLogout}
                className="glass-effect px-4 py-2 rounded-lg text-white hover:glow-effect transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Your Creative Dashboard</h1>
          <p className="text-gray-300 text-lg">Manage your content and track your success</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-white">{user?.stats?.totalViews || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Likes</p>
                <p className="text-3xl font-bold text-white">{user?.stats?.totalLikes || 0}</p>
              </div>
              <Heart className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Content</p>
                <p className="text-3xl font-bold text-white">{user?.stats?.totalContent || 0}</p>
              </div>
              <Upload className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="glass-effect p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Upload New Content</h3>
            <p className="text-gray-300 mb-6">Share your creativity with the world</p>
            <button
              onClick={() => router.push('/upload')}
              className="glass-effect px-6 py-3 rounded-lg text-white hover:glow-effect transition-all flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Start Uploading
            </button>
          </div>

          <div className="glass-effect p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Discover Content</h3>
            <p className="text-gray-300 mb-6">Explore amazing content from other creators</p>
            <button
              onClick={() => router.push('/discover')}
              className="glass-effect px-6 py-3 rounded-lg text-white hover:glow-effect transition-all flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Browse Content
            </button>
          </div>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 glass-effect p-8 rounded-2xl"
        >
          <h3 className="text-2xl font-bold text-white mb-6">Your Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-sm">Name</p>
              <p className="text-white text-lg">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="text-white text-lg">{user?.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Phone</p>
              <p className="text-white text-lg">{user?.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Role</p>
              <p className="text-white text-lg capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 