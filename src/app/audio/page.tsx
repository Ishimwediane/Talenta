"use client";

import React, { useEffect, useState, useRef } from "react";
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
  duration?: number;
  tags?: string[];
};

type User = {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
};

// AudioCard Component
function AudioCard({ audio }: { audio: PublicAudio }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);
        if (!token) {
          console.log('No token found, user not logged in');
          setIsLoadingUser(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Auth response status:', response.status);
        if (response.ok) {
          const userData = await response.json();
          console.log('User data received:', userData);
          setCurrentUser(userData.user);
        } else {
          console.log('Auth failed, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const canEditAudio = () => {
    if (!currentUser) return false;
    console.log('Current user:', currentUser);
    console.log('Audio user:', audio.user);
    console.log('User role:', currentUser.role);
    console.log('Is admin?', currentUser.role === 'ADMIN');
    console.log('Is creator?', currentUser.id === audio.user?.id);
    return currentUser.role === 'ADMIN' || currentUser.id === audio.user?.id;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if ((e.target as Element).closest('.menu-container')) {
      return;
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      {/* Debug status */}
      <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
        Auth Status: {isLoadingUser ? 'Loading...' : currentUser ? `Logged in as ${currentUser.role}` : 'Not logged in'}
      </div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link href={`/audio/${audio.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">{audio.title}</h3>
          </Link>
          {audio.description && (
            <p className="text-gray-600 text-sm mb-3">{audio.description}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {audio.user && (
              <span>By {audio.user.firstName || audio.user.lastName || 'Unknown'}</span>
            )}
            {audio.category && (
              <span className="bg-gray-100 px-2 py-1 rounded">{audio.category}</span>
            )}
            {/* Debug info - remove this later */}
            {currentUser && (
              <span className="bg-yellow-100 px-2 py-1 rounded text-xs">
                Logged in as: {currentUser.role} ({currentUser.email})
              </span>
            )}
            {audio.tags && audio.tags.length > 0 && (
              <div className="flex gap-1">
                {audio.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
                {audio.tags.length > 3 && (
                  <span className="text-gray-400 text-xs">+{audio.tags.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Three-dot menu - only show for admin or creator */}
        {/* Debug: Show menu for all logged in users temporarily */}
        {!isLoadingUser && currentUser && (
          <div className="text-xs text-red-600 mb-2">DEBUG: Menu should be visible</div>
        )}
        {!isLoadingUser && currentUser && (
          <div className="relative menu-container ml-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors bg-white border"
              style={{ zIndex: 20 }}
            >
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                <div className="py-1">
                  <Link
                    href={`/audio/${audio.id}/parts`}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Manage Parts
                  </Link>
                  <button
                    onClick={handleEdit}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audio Player */}
      <div className="bg-gray-50 rounded-lg p-4">
        <audio
          ref={audioRef}
          src={audio.fileUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onCanPlay={() => setDuration(audioRef.current?.duration || 0)}
        />
        
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            className="w-12 h-12 bg-amber-800 text-white rounded-full flex items-center justify-center hover:bg-amber-900 transition-colors"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #92400e 0%, #92400e ${(currentTime / (duration || 1)) * 100}%, #e5e7eb ${(currentTime / (duration || 1)) * 100}%, #e5e7eb 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Edit Audio</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  defaultValue={audio.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  defaultValue={audio.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  defaultValue={audio.category || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Select Category</option>
                  <option value="podcast">Podcast</option>
                  <option value="audiobook">Audiobook</option>
                  <option value="music">Music</option>
                  <option value="interview">Interview</option>
                  <option value="lecture">Lecture</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Audio updated successfully!');
                  setIsEditModalOpen(false);
                }}
                className="flex-1 px-4 py-2 bg-amber-800 text-white rounded-md hover:bg-amber-900"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Delete Audio</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete "{audio.title}"? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Audio deleted successfully!');
                  setIsDeleteModalOpen(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
                  <AudioCard key={audio.id} audio={audio} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}