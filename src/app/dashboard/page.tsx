"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  Mic, 
  Plus, 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  MessageSquare,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Play,
  Pause
} from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  // Sample data - replace with actual API calls
  const stats = {
    totalContent: user.stats?.totalContent || 0,
    totalViews: user.stats?.totalViews || 0,
    totalLikes: user.stats?.totalLikes || 0,
    totalShares: user.stats?.totalShares || 0,
    monthlyViews: 1250,
    monthlyGrowth: 12.5
  };

  const recentContent = [
    {
      id: 1,
      title: "Rwanda's Heart",
      type: "Poetry",
      status: "published",
      views: 156,
      likes: 23,
      shares: 5,
      createdAt: "2024-01-15",
      thumbnail: "/api/placeholder/100/100"
    },
    {
      id: 2,
      title: "Morning in Kigali",
      type: "Audio",
      status: "draft",
      views: 0,
      likes: 0,
      shares: 0,
      createdAt: "2024-01-14",
      thumbnail: "/api/placeholder/100/100"
    }
  ];

  const quickActions = [
    {
      title: "Write New Content",
      description: "Create a new poem, story, or article",
      icon: Plus,
      href: "/dashboard/write",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200"
    },
    {
      title: "Record Audio",
      description: "Record a podcast or poetry reading",
      icon: Mic,
      href: "/dashboard/audio",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200"
    },
    {
      title: "Upload Book",
      description: "Share your written work with the world",
      icon: BookOpen,
      href: "/upload",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-xl text-gray-600">Welcome back, {user.firstName}! Here's what's happening with your content.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold"
              >
                View Profile
              </Link>
              <Link
                href="/dashboard/write"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <Plus className="inline w-5 h-5 mr-2" />
                Create New
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalContent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl">
                <Eye className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLikes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-3xl font-bold text-gray-900">+{stats.monthlyGrowth}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{action.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-8 px-8">
              {[
                { id: "overview", label: "Overview" },
                { id: "content", label: "My Content" },
                { id: "analytics", label: "Analytics" },
                { id: "earnings", label: "Earnings" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-6 px-1 border-b-2 font-semibold text-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentContent.map((content) => (
                    <div key={content.id} className="flex items-center space-x-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-lg">
                        {content.type === "Audio" ? (
                          <Play className="w-8 h-8 text-gray-600" />
                        ) : (
                          <BookOpen className="w-8 h-8 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{content.title}</h4>
                        <p className="text-lg text-gray-600 mb-3">{content.type} • {content.status}</p>
                        <div className="flex items-center space-x-6 text-lg text-gray-500">
                          <span className="flex items-center font-medium">
                            <Eye className="w-5 h-5 mr-2 text-blue-500" />
                            {content.views}
                          </span>
                          <span className="flex items-center font-medium">
                            <Heart className="w-5 h-5 mr-2 text-red-500" />
                            {content.likes}
                          </span>
                          <span className="flex items-center font-medium">
                            <Share2 className="w-5 h-5 mr-2 text-green-500" />
                            {content.shares}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-all duration-200">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">My Content</h3>
                  <Link
                    href="/dashboard/write"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                  >
                    <Plus className="inline w-5 h-5 mr-2" />
                    Create New
                  </Link>
                </div>
                <div className="text-center py-12">
                  <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">Content management interface will be implemented here.</p>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h3>
                <div className="text-center py-12">
                  <TrendingUp className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-600">Detailed analytics and insights will be displayed here.</p>
                </div>
              </div>
            )}

            {activeTab === "earnings" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h3>
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold text-green-600">$</span>
                  </div>
                  <p className="text-xl text-gray-600">Earnings and monetization information will be shown here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
