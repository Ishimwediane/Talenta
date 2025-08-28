"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Play, Clock, User } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type PublicAudio = {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  category?: string | null;
  subCategories?: string[];
  status: 'PUBLISHED' | 'DRAFT';
  createdAt?: string;
  user?: { id: string; firstName?: string | null; lastName?: string | null };
};

export default function AudioPage() {
  const [audios, setAudios] = useState<PublicAudio[]>([]);
  const [filteredAudios, setFilteredAudios] = useState<PublicAudio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories from audios
  const categories = React.useMemo(() => {
    const cats = audios.map(a => a.category).filter((cat): cat is string => Boolean(cat));
    return Array.from(new Set(cats));
  }, [audios]);

  useEffect(() => {
    const fetchAudios = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/audio`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load audio records');
        const data = await res.json();
        setAudios(Array.isArray(data?.audios) ? data.audios : []);
      } catch (err) {
        setError((err as Error).message || 'Failed to load audio records');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAudios();
  }, []);

  // Filter audios based on search and filters
  useEffect(() => {
    let filtered = audios;

    if (searchQuery) {
      filtered = filtered.filter(audio =>
        audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audio.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(audio => audio.category === selectedCategory);
    }

    setFilteredAudios(filtered);
  }, [audios, searchQuery, selectedCategory]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audio library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Audio Library</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Discover stories, voices, and inspiration through our curated collection of audio content
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search audio recordings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-4 items-center">
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <button
                  onClick={resetFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredAudios.length} audio recording{filteredAudios.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Audio Grid */}
        {filteredAudios.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No audio found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAudios.map((audio) => (
              <div key={audio.id} className="bg-white rounded-xl border hover:shadow-lg transition-all duration-200 overflow-hidden group">
                {/* Audio Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {audio.title}
                      </h3>
                      {audio.user && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          <span>
                            {audio.user.firstName || audio.user.lastName 
                              ? `${audio.user.firstName || ''} ${audio.user.lastName || ''}`.trim() 
                              : 'Creator'}
                          </span>
                        </div>
                      )}
                    </div>
                    {audio.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 ml-2">
                        {audio.category}
                      </span>
                    )}
                  </div>

                  {audio.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {audio.description}
                    </p>
                  )}

                  {/* Audio Player */}
                  <div className="mb-4">
                    <audio controls className="w-full">
                      <source src={audio.fileUrl} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        Audio
                      </span>
                      {audio.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(audio.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}