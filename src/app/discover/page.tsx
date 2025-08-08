"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import React from "react";
import Link from "next/link";
import { Play, Mic, PenTool, Heart, Share2, Search } from "lucide-react";

export default function DiscoverPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Content" },
    { id: "film", name: "Short Films", icon: Play },
    { id: "podcast", name: "Podcasts", icon: Mic },
    { id: "poetry", name: "Poetry", icon: PenTool },
  ];

  // Mock data for demonstration
  const contentItems = [
    {
      id: 1,
      title: "The Streets of Kigali",
      creator: "Aisha Uwimana",
      type: "film",
      thumbnail: "/api/placeholder/400/300",
      duration: "5:32",
      views: 1247,
      likes: 89,
      category: "Personal Story"
    },
    {
      id: 2,
      title: "Voices of Tomorrow",
      creator: "Jean Pierre",
      type: "podcast",
      thumbnail: "/api/placeholder/400/300",
      duration: "23:15",
      views: 892,
      likes: 156,
      category: "Social Commentary"
    },
    {
      id: 3,
      title: "Mountains in My Heart",
      creator: "Grace Mutoni",
      type: "poetry",
      thumbnail: "/api/placeholder/400/300",
      duration: "2:45",
      views: 567,
      likes: 234,
      category: "Inspiration"
    },
    {
      id: 4,
      title: "Tech Dreams",
      creator: "David Nshuti",
      type: "film",
      thumbnail: "/api/placeholder/400/300",
      duration: "8:12",
      views: 2034,
      likes: 312,
      category: "Education"
    },
    {
      id: 5,
      title: "Cultural Heritage",
      creator: "Marie Claire",
      type: "podcast",
      thumbnail: "/api/placeholder/400/300",
      duration: "45:20",
      views: 1456,
      likes: 278,
      category: "Education"
    },
    {
      id: 6,
      title: "Hope in Darkness",
      creator: "Emmanuel",
      type: "poetry",
      thumbnail: "/api/placeholder/400/300",
      duration: "3:18",
      views: 789,
      likes: 445,
      category: "Inspiration"
    }
  ];

  const filteredContent = contentItems.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.type === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.creator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "film": return Play;
      case "podcast": return Mic;
      case "poetry": return PenTool;
      default: return Play;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "film": return "from-purple-500 to-pink-500";
      case "podcast": return "from-blue-500 to-cyan-500";
      case "poetry": return "from-green-500 to-emerald-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold gradient-text"
            >
              Talenta
            </motion.div>
            <Link href="/" className="text-white hover:text-gray-300 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
              Discover Stories
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore the voices of Rwandan youth. Every story has the power to inspire.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stories, creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass-effect pl-10 pr-4 py-3 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      selectedCategory === category.id
                        ? 'glass-effect text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {category.icon && <category.icon className="w-4 h-4" />}
                    {category.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Content Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredContent.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-effect rounded-2xl overflow-hidden hover:glow-effect transition-all cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getTypeColor(item.type)} flex items-center justify-center`}>
                      {React.createElement(getTypeIcon(item.type), { className: "w-8 h-8 text-white" })}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 px-2 py-1 rounded text-white text-sm">
                    {item.duration}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-white text-sm">
                    {item.category}
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gray-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 mb-4">by {item.creator}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        {item.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {item.likes}
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredContent.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 text-lg mb-4">
                No content found matching your criteria.
              </div>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="glass-effect px-6 py-3 rounded-full text-white hover:glow-effect transition-all"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 