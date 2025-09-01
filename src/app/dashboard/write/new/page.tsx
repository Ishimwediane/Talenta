'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TiptapEditor } from "@/components/TiptapEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, BookOpen, Edit3, FileUp, Plus, Trash2, FileText, Clock } from "lucide-react";
import Link from "next/link";
import apiService from '@/lib/bookapi';

interface Chapter {
  id?: string;
  title: string;
  content: string;
  order: number;
  wordCount?: number;
  readingTime?: number;
}

export default function CreateNewBook() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentMethod, setContentMethod] = useState<'text' | 'file' | 'chapters'>('text');
  const [activeTab, setActiveTab] = useState('details');
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [subCategories, setSubCategories] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  
  // Chapter management
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter>({
    title: '',
    content: '',
    order: 1
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, router]);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBookFile(file);
      setContentMethod('file');
      setContent('');
    }
  };

  const handleContentMethodChange = (method: 'text' | 'file' | 'chapters') => {
    setContentMethod(method);
    if (method === 'file') {
      setContent('');
    }
  };

  // Chapter management functions
  const calculateWordCount = (content: string) => {
    return content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
  };

  const calculateReadingTime = (wordCount: number) => {
    return Math.ceil(wordCount / 200); // Assuming 200 words per minute
  };

  const addChapter = () => {
    if (!currentChapter.title.trim() || !currentChapter.content.trim()) {
      setError('Chapter title and content are required');
      return;
    }

    const wordCount = calculateWordCount(currentChapter.content);
    const readingTime = calculateReadingTime(wordCount);

    const newChapter: Chapter = {
      ...currentChapter,
      wordCount,
      readingTime
    };

    setChapters([...chapters, newChapter]);
    setCurrentChapter({
      title: '',
      content: '',
      order: chapters.length + 2
    });
    setError(null);
  };

  const removeChapter = (index: number) => {
    const updatedChapters = chapters.filter((_, i) => i !== index);
    // Update order numbers
    const reorderedChapters = updatedChapters.map((chapter, i) => ({
      ...chapter,
      order: i + 1
    }));
    setChapters(reorderedChapters);
  };

  const updateChapter = (index: number, updatedChapter: Chapter) => {
    const updatedChapters = [...chapters];
    updatedChapters[index] = updatedChapter;
    setChapters(updatedChapters);
  };

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!title) {
      setError("Title is required.");
      return;
    }

    if (contentMethod === 'text' && !content.trim()) {
      setError("Please write some content or upload a file.");
      return;
    }

    if (contentMethod === 'file' && !bookFile) {
      setError("Please upload a book file or write content manually.");
      return;
    }

    if (contentMethod === 'chapters' && chapters.length === 0) {
      setError("Please add at least one chapter.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First create the book
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("status", status);
      if (category) formData.append("category", category);
      if (subCategories.trim()) formData.append("subCategories", subCategories);
      
      // Only add content if using text method
      if (contentMethod === 'text') {
        formData.append("content", content);
      }
      
      if (coverImageFile) formData.append("coverImage", coverImageFile);
      if (bookFile) formData.append("bookFile", bookFile);

      const bookResponse = await apiService.createBook(formData);
      const bookId = bookResponse.id;

      // If using chapters method, create chapters
      if (contentMethod === 'chapters' && chapters.length > 0) {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error('Authentication required');
        }

        // Create each chapter
        for (const chapter of chapters) {
          await fetch(`/api/books/${bookId}/chapters`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: chapter.title,
              content: chapter.content,
              order: chapter.order,
              status: status,
              isPublished: status === 'PUBLISHED'
            })
          });
        }
      }

      alert(`Book successfully ${status.toLowerCase()}!`);
      router.push("/dashboard/write");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard/write" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Books Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Write Your Book</h1>
          <p className="text-gray-600 mt-1">Start writing your book directly here, or upload an existing file</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Book Details */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Book Details</h2>
                <p className="text-gray-600">Add your book information and metadata</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                    Book Title *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="The Adventure Begins"
                    required
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    Short Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A short summary of your book..."
                    rows={3}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Books & Novels"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subCategories" className="text-sm font-semibold text-gray-700">
                    Subcategories (comma separated)
                  </Label>
                  <Input
                    id="subCategories"
                    value={subCategories}
                    onChange={(e) => setSubCategories(e.target.value)}
                    placeholder="e.g., Romance, Adult"
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                                  </div>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-white rounded-lg border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Cover Image</h2>
                <p className="text-gray-600">Upload a cover image for your book</p>
              </div>
              <div className="space-y-4">
                {coverImagePreview ? (
                  <img src={coverImagePreview} alt="Cover preview" className="w-full h-auto object-cover rounded-md aspect-[2/3]" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                <p className="text-xs text-gray-500">Recommended: 1200x1800 pixels, JPG or PNG</p>
              </div>
            </div>

            {/* Content Method Selection */}
            <div className="bg-white rounded-lg border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Content Method</h2>
                <p className="text-gray-600">Choose how you want to add your book content</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={contentMethod === 'text' ? 'default' : 'outline'}
                    onClick={() => handleContentMethodChange('text')}
                    className="bg-orange-500 hover:bg-orange-600 border-orange-500"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Write Here
                  </Button>
                  <Button
                    type="button"
                    variant={contentMethod === 'file' ? 'default' : 'outline'}
                    onClick={() => handleContentMethodChange('file')}
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={contentMethod === 'chapters' ? 'default' : 'outline'}
                    onClick={() => handleContentMethodChange('chapters')}
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Chapters
                  </Button>
                </div>

                {contentMethod === 'file' && (
                  <div className="space-y-4">
                    <Input 
                      id="bookFile" 
                      type="file" 
                      accept=".docx,.txt,.epub,.pdf" 
                      onChange={handleBookFileChange}
                      placeholder="Upload your book file"
                      className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Supported formats:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>.docx</strong> - Microsoft Word documents</li>
                        <li><strong>.txt</strong> - Plain text files</li>
                        <li><strong>.epub</strong> - E-book format</li>
                        <li><strong>.pdf</strong> - PDF documents</li>
                      </ul>
                      <p className="mt-2 text-orange-600">
                        Content will be automatically extracted when you save.
                      </p>
                    </div>
                  </div>
                )}

                {contentMethod === 'chapters' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p>Create your book with multiple chapters. Each chapter will be saved separately and can be read in order.</p>
                    </div>
                    <div className="text-sm text-orange-600">
                      <p><strong>Chapters added:</strong> {chapters.length}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Content Editor or File Upload */}
          <div className="lg:col-span-2">
            {contentMethod === 'text' ? (
              <div className="bg-white rounded-lg border p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Write Your Book Content</h2>
                  <p className="text-gray-600">Use the rich text editor below to write your book content</p>
                </div>
                <div>
                  <TiptapEditor content={content} onChange={(newContent: string) => setContent(newContent)} />
                </div>
              </div>
            ) : contentMethod === 'file' ? (
              <div className="bg-white rounded-lg border p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Book from Device</h2>
                  <p className="text-gray-600">Upload a file and the content will be automatically extracted</p>
                </div>
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {bookFile ? bookFile.name : "Upload your book file"}
                    </p>
                    <p className="text-gray-600 mb-4">
                      Drag and drop your file here, or click to browse
                    </p>
                    <Input 
                      type="file" 
                      accept=".docx,.txt,.epub,.pdf" 
                      onChange={handleBookFileChange}
                      className="max-w-xs mx-auto"
                    />
                    {bookFile && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800 text-sm">
                          ✓ File selected: {bookFile.name}
                        </p>
                        <p className="text-green-600 text-xs mt-1">
                          Content will be extracted automatically when you save
                        </p>
                      </div>
                    )}
                    <div className="mt-4 text-xs text-gray-500">
                      <p><strong>Supported:</strong> DOCX, TXT, EPUB, PDF</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Book Chapters</h2>
                  <p className="text-gray-600">Add chapters to your book. Each chapter will be saved separately.</p>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create Chapter</TabsTrigger>
                    <TabsTrigger value="list">Chapters ({chapters.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="create" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="chapterTitle" className="text-sm font-semibold text-gray-700">
                          Chapter Title *
                        </Label>
                        <Input
                          id="chapterTitle"
                          value={currentChapter.title}
                          onChange={(e) => setCurrentChapter({...currentChapter, title: e.target.value})}
                          placeholder="e.g., Chapter 1: The Beginning"
                          className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="chapterContent" className="text-sm font-semibold text-gray-700">
                          Chapter Content *
                        </Label>
                        <div className="mt-2">
                          <TiptapEditor 
                            content={currentChapter.content} 
                            onChange={(newContent: string) => setCurrentChapter({...currentChapter, content: newContent})} 
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={addChapter}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={!currentChapter.title.trim() || !currentChapter.content.trim()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Chapter
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="list" className="space-y-4">
                    {chapters.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No chapters added yet. Create your first chapter!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {chapters.map((chapter, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Chapter {chapter.order}: {chapter.title}</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    <span>{chapter.wordCount || 0} words</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{chapter.readingTime || 0} min</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeChapter(index)}
                                className="ml-4"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleSubmit('DRAFT')} 
            disabled={isLoading || !title}
            className="border-gray-300 hover:border-orange-400 hover:text-orange-600"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </>
            )}
          </Button>
          <Button 
            onClick={() => handleSubmit('PUBLISHED')} 
            disabled={isLoading || !title}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publishing...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Publish Book
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}