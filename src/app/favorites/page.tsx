"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Heart, 
  BookOpen, 
  Mic, 
  Play, 
  Eye, 
  MessageSquare, 
  Share2,
  Filter,
  Search
} from "lucide-react";

interface FavoriteItem {
  id: string;
  type: "poem" | "story" | "audio" | "book";
  title: string;
  author: string;
  excerpt: string;
  likes: number;
  views: number;
  comments: number;
  addedAt: string;
  thumbnail?: string;
}

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [filter, setFilter] = useState<"all" | "poem" | "story" | "audio" | "book">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Simulate loading favorites
    setTimeout(() => {
      setFavorites([
        {
          id: "1",
          type: "poem",
          title: "Rwanda's Heart",
          author: "Marie Uwimana",
          excerpt: "In the heart of Africa, where hills roll like waves...",
          likes: 156,
          views: 1240,
          comments: 23,
          addedAt: "2024-01-15T10:30:00Z"
        },
        {
          id: "2",
          type: "story",
          title: "Morning in Kigali",
          author: "Jean Pierre",
          excerpt: "The sun rose over Kigali, painting the city in golden light...",
          likes: 89,
          views: 567,
          comments: 12,
          addedAt: "2024-01-14T15:20:00Z"
        },
        {
          id: "3",
          type: "audio",
          title: "Traditional Rwandan Music",
          author: "Cultural Ensemble",
          excerpt: "A beautiful collection of traditional Rwandan melodies...",
          likes: 234,
          views: 1890,
          comments: 45,
          addedAt: "2024-01-13T09:15:00Z"
        },
        {
          id: "4",
          type: "book",
          title: "Tales from the Hills",
          author: "Grace Mukamana",
          excerpt: "A collection of folk tales passed down through generations...",
          likes: 67,
          views: 423,
          comments: 8,
          addedAt: "2024-01-12T14:45:00Z"
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, [isAuthenticated, router]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "poem":
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case "story":
        return <BookOpen className="w-5 h-5 text-green-500" />;
      case "audio":
        return <Mic className="w-5 h-5 text-purple-500" />;
      case "book":
        return <BookOpen className="w-5 h-5 text-orange-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "poem":
        return "bg-blue-100 text-blue-800";
      case "story":
        return "bg-green-100 text-green-800";
      case "audio":
        return "bg-purple-100 text-purple-800";
      case "book":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  const filteredFavorites = favorites.filter(item => {
    const matchesFilter = filter === "all" || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
              <p className="text-gray-600">
                {favorites.length} favorite item{favorites.length !== 1 ? 's' : ''} • 
                Your saved content and liked items
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/explore"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Discover More
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="poem">Poems</option>
                <option value="story">Stories</option>
                <option value="audio">Audio</option>
                <option value="book">Books</option>
              </select>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filter !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Start exploring content and add items to your favorites!"
              }
            </p>
            {!searchQuery && filter === "all" && (
              <Link
                href="/explore"
                className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explore Content
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Item Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(item.type)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove from favorites"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">by {item.author}</p>
                    <p className="text-gray-700 text-sm line-clamp-3">{item.excerpt}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {item.likes}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {item.views}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {item.comments}
                      </span>
                    </div>
                    <span className="text-xs">
                      {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/content/${item.id}`}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      {item.type === "audio" ? (
                        <>
                          <Play className="inline w-4 h-4 mr-2" />
                          Listen
                        </>
                      ) : (
                        <>
                          <BookOpen className="inline w-4 h-4 mr-2" />
                          Read
                        </>
                      )}
                    </Link>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State for No Favorites */}
        {!isLoading && favorites.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring content and add items to your favorites to see them here!
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Exploring
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
