"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

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
  const [selectedDuration, setSelectedDuration] = useState<string>("");

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
    setSelectedDuration("");
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-600">
        Loading audio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Audio Library</h1>
          <p className="text-gray-600 mt-1">Discover and listen to published recordings</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filter Audio</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Reset Filters
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search audio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    Categories
                    <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={selectedCategory === ""}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">All Categories</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Duration Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  Duration
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="duration"
                      value=""
                      checked={selectedDuration === ""}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Any Duration</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="duration"
                      value="short"
                      checked={selectedDuration === "short"}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Under 5 minutes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="duration"
                      value="medium"
                      checked={selectedDuration === "medium"}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">5-30 minutes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="duration"
                      value="long"
                      checked={selectedDuration === "long"}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Over 30 minutes</span>
                  </label>
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
                  <input
                    type="text"
                    placeholder="Search audio recordings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <button className="px-6 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition-colors font-medium">
                  Search Audio
                </button>
              </div>
            </div>

            {/* Results */}
            {filteredAudios.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <p className="text-gray-500">No audio recordings found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAudios.map((audio) => (
                  <div key={audio.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {audio.title}
                            </h3>
                            <div className="text-sm text-gray-600 mb-2">
                              {audio.user && (
                                <span>
                                  {audio.user.firstName || audio.user.lastName 
                                    ? `${audio.user.firstName || ''} ${audio.user.lastName || ''}`.trim() 
                                    : 'Creator'}
                                </span>
                              )}
                              {audio.category && (
                                <span className="mx-2">•</span>
                              )}
                              {audio.category}
                            </div>
                            {audio.description && (
                              <p className="text-gray-600 mb-4 line-clamp-2">
                                {audio.description}
                              </p>
                            )}
                          </div>
                          {audio.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-4">
                              {audio.category}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <audio controls className="w-full">
                            <source src={audio.fileUrl} />
                            Your browser does not support the audio element.
                          </audio>
                        </div>

                        <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">Audio</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">Published</span>
                            {audio.createdAt && (
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {new Date(audio.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}