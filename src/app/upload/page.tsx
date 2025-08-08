"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { Upload as UploadIcon, Play, Mic, PenTool, X, Check } from "lucide-react";

export default function UploadPage() {
  const [selectedType, setSelectedType] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const contentTypes = [
    {
      id: "film",
      title: "Short Film",
      description: "Share your story through video",
      icon: Play,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "podcast",
      title: "Podcast",
      description: "Share your voice and conversations",
      icon: Mic,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "poetry",
      title: "Poetry",
      description: "Express emotions through words",
      icon: PenTool,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType || !uploadedFile) return;
    
    setIsUploading(true);
    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUploading(false);
    // Handle successful upload
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
              Share Your Creation
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose your medium and let your creativity flow. Your voice matters.
            </p>
          </motion.div>

          {/* Content Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              What are you sharing today?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {contentTypes.map((type) => (
                <motion.div
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type.id)}
                  className={`glass-effect p-6 rounded-2xl cursor-pointer transition-all ${
                    selectedType === type.id ? 'ring-2 ring-white/50 glow-effect' : 'hover:glow-effect'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center mb-4`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{type.title}</h3>
                  <p className="text-gray-300 text-sm">{type.description}</p>
                  {selectedType === type.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4 flex items-center justify-center"
                    >
                      <Check className="w-6 h-6 text-green-400" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upload Section */}
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="glass-effect p-8 rounded-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                Upload Your {contentTypes.find(t => t.id === selectedType)?.title}
              </h3>
              
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center mb-6">
                {!uploadedFile ? (
                  <div>
                    <UploadIcon className="w-16 h-16 text-white/50 mx-auto mb-4" />
                    <p className="text-white text-lg mb-2">Drop your file here or click to browse</p>
                    <p className="text-gray-400 text-sm mb-4">
                      {selectedType === 'film' && 'MP4, MOV, AVI up to 500MB'}
                      {selectedType === 'podcast' && 'MP3, WAV up to 100MB'}
                      {selectedType === 'poetry' && 'TXT, DOC, PDF up to 10MB'}
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept={
                        selectedType === 'film' ? 'video/*' :
                        selectedType === 'podcast' ? 'audio/*' :
                        '.txt,.doc,.docx,.pdf'
                      }
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="glass-effect px-6 py-3 rounded-full text-white hover:glow-effect transition-all cursor-pointer inline-block"
                    >
                      Choose File
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mr-4">
                        <Check className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{uploadedFile.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content Details Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Give your creation a compelling title..."
                    className="w-full glass-effect px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-2">Description</label>
                  <textarea
                    placeholder="Tell us about your creation..."
                    rows={4}
                    className="w-full glass-effect px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Category</label>
                    <select className="w-full glass-effect px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50">
                      <option>Select a category</option>
                      <option>Personal Story</option>
                      <option>Social Commentary</option>
                      <option>Entertainment</option>
                      <option>Education</option>
                      <option>Inspiration</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white font-semibold mb-2">Tags</label>
                    <input
                      type="text"
                      placeholder="Add tags separated by commas..."
                      className="w-full glass-effect px-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!uploadedFile || isUploading}
                className={`w-full mt-8 py-4 rounded-full text-white font-semibold transition-all ${
                  uploadedFile && !isUploading
                    ? 'glass-effect hover:glow-effect'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  'Share Your Creation'
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 