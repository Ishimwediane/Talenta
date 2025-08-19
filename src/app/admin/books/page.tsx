"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Import our new TipTap editor
import { TiptapEditor } from "@/components/TiptapEditor";

const API_BASE_URL = "http://localhost:5000";

export default function BookEditorPage() {
  const router = useRouter();

  // State for all book properties
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // This state now holds the HTML content from our TipTap editor
  const [content, setContent] = useState("");

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!title.trim()) {
      alert("Please provide a title.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("content", content); // The content comes directly from our state
    formData.append("status", status);
    if (coverImageFile) {
      formData.append("coverImage", coverImageFile);
    }
    
    // For now, we are creating a new book. Logic to update would check for a book ID.
    const method = 'POST';
    const url = `${API_BASE_URL}/api/books`;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${status === 'DRAFT' ? 'save draft' : 'publish book'}`);
      }

      await res.json();
      alert(`Book successfully ${status === 'DRAFT' ? 'saved as draft' : 'published'}!`);
      // Redirect to a dashboard or list page after success
      router.push('/dashboard'); 

    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Write Your Book</h1>

      <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <Input 
          placeholder="Book Title *" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="text-2xl h-12 font-semibold"
          required
        />
        <Textarea 
          placeholder="Short Description or Synopsis" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image (Optional)
          </label>
          <Input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setCoverImageFile(e.target.files ? e.target.files[0] : null)} 
          />
        </div>
      </div>
      
      {/* --- The New Rich Text Editor --- */}
      <TiptapEditor
        content={content}
        onChange={(newContent: string) => setContent(newContent)}
      />

      <div className="flex items-center justify-end gap-4 pt-4">
         <Button 
          variant="outline" 
          onClick={() => handleSave('DRAFT')}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button 
          variant="default" 
          onClick={() => handleSave('PUBLISHED')}
          disabled={isLoading}
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  );
}