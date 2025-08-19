"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/TiptapEditor"; // Assuming you place your editor here
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, FileText } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

interface Book {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  coverImage?: string | null;
  bookFile?: string | null;
}

interface BookEditorFormProps {
  initialData?: Book | null;
  formType: "new" | "edit";
}

export function BookEditorForm({ initialData, formType }: BookEditorFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const [bookFile, setBookFile] = useState<File | null>(null);
  const [existingBookFileName, setExistingBookFileName] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setContent(initialData.content || "");
      if(initialData.coverImage) {
        setCoverImagePreview(`${API_BASE_URL}${initialData.coverImage}`);
      }
      if(initialData.bookFile) {
        setExistingBookFileName(initialData.bookFile.split('/').pop() || 'Existing File');
      }
    }
  }, [initialData]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("content", content);
    formData.append("status", status);
    
    if (coverImageFile) {
      formData.append("coverImage", coverImageFile);
    }
    if (bookFile) {
      formData.append("bookFile", bookFile);
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");
      
      const url = formType === 'new' ? `${API_BASE_URL}/api/books` : `${API_BASE_URL}/api/books/${initialData?.id}`;
      const method = formType === 'new' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "An unknown error occurred.");
      }

      alert(`Book successfully ${formType === 'new' ? 'created' : 'updated'}!`);
      router.push("/admin/my-books"); // Redirect to the list of books
      router.refresh(); // Refresh server components
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {formType === "new" ? "Write a New Book" : "Edit Book"}
        </h1>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata and Uploads */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>Book Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Book Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Adventure Begins" required />
              </div>
              <div>
                <Label htmlFor="description">Short Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short summary of your book..." />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {coverImagePreview ? (
                <img src={coverImagePreview} alt="Cover preview" className="file-preview" />
              ) : (
                <div className="file-preview file-placeholder"><UploadCloud className="w-8 h-8"/></div>
              )}
              <Input id="coverImage" type="file" accept="image/*" onChange={handleCoverImageChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Book File</CardTitle>
              <CardDescription>Optional. Upload a PDF, EPUB, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookFile ? (
                 <div className="flex items-center gap-2 p-2 border rounded-md bg-muted"><FileText className="w-5 h-5" /><span>{bookFile.name}</span></div>
              ) : existingBookFileName && (
                 <div className="flex items-center gap-2 p-2 border rounded-md bg-muted"><FileText className="w-5 h-5" /><span>{existingBookFileName}</span></div>
              )}
              <Input id="bookFile" type="file" accept=".pdf,.epub,.mobi" onChange={(e) => setBookFile(e.target.files?.[0] || null)} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tiptap Editor */}
        <div className="lg:col-span-2">
           <Card>
             <CardHeader><CardTitle>Write Your Content</CardTitle><CardDescription>Use the editor below to write the content of your book directly on the platform.</CardDescription></CardHeader>
             <CardContent>
                <TiptapEditor content={content} onChange={setContent} />
             </CardContent>
           </Card>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={() => handleSubmit('DRAFT')} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save as Draft
          </Button>
          <Button onClick={() => handleSubmit('PUBLISHED')} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {formType === 'new' ? 'Publish Book' : 'Update & Publish'}
          </Button>
      </div>
    </div>
  );
}