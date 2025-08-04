'use client';

import { useState } from 'react';
import apiService from '../../lib/api';

export default function TestApiPage() {
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await apiService.healthCheck();
      setHealthStatus(`✅ Backend is running! Status: ${response.message}`);
    } catch (error) {
      setHealthStatus(`❌ Backend connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="glass-effect p-8 rounded-2xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">API Connection Test</h1>
        
        <button
          onClick={testHealthCheck}
          disabled={loading}
          className="w-full glass-effect py-3 rounded-lg text-white hover:glow-effect transition-all disabled:opacity-50 mb-6"
        >
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </button>

        {healthStatus && (
          <div className={`p-4 rounded-lg text-sm ${
            healthStatus.includes('✅') 
              ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}>
            {healthStatus}
          </div>
        )}

        <div className="mt-6 text-gray-300 text-sm">
          <p>This page tests the connection between your frontend and backend.</p>
          <p className="mt-2">Make sure your backend server is running on port 5000.</p>
        </div>
      </div>
    </div>
  );
} 