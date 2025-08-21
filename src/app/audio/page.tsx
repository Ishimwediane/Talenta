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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-white">
      <section className="py-12 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Audio</h1>
          <p className="text-gray-600 mt-2">Listen to published recordings.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {audios.length === 0 ? (
            <p className="text-gray-500">No audio found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {audios.map((a) => (
                <div key={a.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{a.title}</h3>
                      {a.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{a.description}</p>
                      )}
                      {a.user && (
                        <p className="text-xs text-gray-500 mt-1">
                          {a.user.firstName || a.user.lastName ? `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() : 'Creator'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <audio controls className="w-full">
                      <source src={a.fileUrl} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


