"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/TiptapEditor"; // Assuming you have this
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, FileText, Edit3, FileUp, Plus, Trash2, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiService from '@/lib/bookapi';
import { Book } from "@/lib/types"; // Assuming you have this type defined

interface Chapter {
  id?: string;
  title: string;
  content: string;
  order: number;
  wordCount?: number;
  readingTime?: number;
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
  const [category, setCategory] = useState<string>("");
  const [subCategories, setSubCategories] = useState<string>("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [existingBookFileName, setExistingBookFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentMethod, setContentMethod] = useState<'text' | 'file' | 'chapters'>('text');
  const [activeTab, setActiveTab] = useState('details');
  
  // Chapter management
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter>({
    title: '',
    content: '',
    order: 1
  });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setContent(initialData.content || "");
      setCategory(initialData.category || "");
      if (initialData.subCategories && initialData.subCategories.length) {
        setSubCategories(initialData.subCategories.join(", "));
      }
      if (initialData.coverImage) setCoverImagePreview(initialData.coverImage);
      if (initialData.bookFile) {
        setExistingBookFileName(initialData.bookFile.split('/').pop()?.split('-').slice(1).join('-') || 'Existing File');
        // If there's existing content, prefer text method to allow editing
        if (initialData.content && initialData.content.trim()) {
          setContentMethod('text');
        } else {
          setContentMethod('file');
        }
      } else {
        setContentMethod('text');
      }
      
      // Handle existing chapters
      if (initialData.chapters && initialData.chapters.length > 0) {
        setChapters(initialData.chapters);
        setContentMethod('chapters');
      }
    }
  }, [initialData]);

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
      // Don't clear existing content when editing - let user choose
      if (formType === 'new') {
        setContent('');
      }
    }
  };

  const handleContentMethodChange = (method: 'text' | 'file' | 'chapters') => {
    setContentMethod(method);
    if (method === 'text') {
      setBookFile(null);
      // Don't clear content when switching to text method during editing
    } else if (method === 'file') {
      // Only clear content if it's a new book or if user explicitly wants to switch
      if (formType === 'new') {
        setContent('');
      }
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

    // Determine order: when adding a new chapter, always append with next sequential order
    const nextOrder = currentChapter.id ? currentChapter.order : chapters.length + 1;

    const newChapter: Chapter = {
      ...currentChapter,
      order: nextOrder,
      wordCount,
      readingTime
    };

    let updatedChapters: Chapter[];
    if (currentChapter.id) {
      // Editing existing chapter
      updatedChapters = chapters.map(ch => ch.id === currentChapter.id ? newChapter : ch);
    } else {
      // Adding new chapter
      updatedChapters = [...chapters, newChapter];
    }
    setChapters(updatedChapters);

    // After adding/updating, prepare a fresh chapter with the next sequential order
    setCurrentChapter({
      title: '',
      content: '',
      order: updatedChapters.length + 1
    });
    setError(null);
  };

  const removeChapter = async (index: number) => {
    const chapterToRemove = chapters[index];
    
    // If the chapter has an ID, delete it from the database
    if (chapterToRemove.id && formType === 'edit') {
      try {
        await apiService.deleteChapter(chapterToRemove.id);
        console.log('✅ Chapter deleted from database:', chapterToRemove.title);
      } catch (error) {
        console.error('❌ Failed to delete chapter from database:', error);
        setError('Failed to delete chapter from database');
        return;
      }
    }
    
    const updatedChapters = chapters.filter((_, i) => i !== index);
    // Update order numbers
    const reorderedChapters = updatedChapters.map((chapter, i) => ({
      ...chapter,
      order: i + 1
    }));
    setChapters(reorderedChapters);
  };

  const editChapter = (chapter: Chapter) => {
    setCurrentChapter(chapter);
  };

  const cancelEdit = () => {
    setCurrentChapter({
      title: '',
      content: '',
      order: chapters.length + 1
    });
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

    if (contentMethod === 'file' && !bookFile && !existingBookFileName) {
        setError("Please upload a book file or write content manually.");
        return;
    }

    if (contentMethod === 'chapters' && chapters.length === 0) {
        setError("Please add at least one chapter.");
        return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
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

      let bookResponse;
      if (formType === 'new') {
        bookResponse = await apiService.createBook(formData);
      } else {
        bookResponse = await apiService.updateBook(initialData!.id, formData);
      }

      // If using chapters method, create chapters
      if (contentMethod === 'chapters' && chapters.length > 0) {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error('Authentication required');
        }

        const bookId = formType === 'new' ? bookResponse.id : initialData!.id;
        console.log('📚 Creating chapters for book:', bookId);
        console.log('📚 Chapters to create:', chapters);

        // Handle chapters - create new ones and update existing ones
        for (const chapter of chapters) {
          console.log('📝 Processing chapter:', chapter.title);
          const chapterData = {
            title: chapter.title,
            content: chapter.content,
            order: chapter.order,
            status: status,
            isPublished: status === 'PUBLISHED'
          };
          console.log('📝 Chapter data:', chapterData);
          
          if (chapter.id) {
            // Update existing chapter
            const updatedChapter = await apiService.updateChapter(chapter.id, chapterData);
            console.log('✅ Chapter updated successfully:', updatedChapter);
          } else {
            // Create new chapter
            const createdChapter = await apiService.createChapter(bookId, chapterData);
            console.log('✅ Chapter created successfully:', createdChapter);
          }
        }
      }

      alert(`Book successfully ${status.toLowerCase()}!`);
      router.push("/admin/books");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {formType === "new" ? "Create a New Book" : "Edit Book"}
        </h1>
        {formType === "edit" && initialData && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-4">
              <p className="text-gray-600">
                Current status: <span className="font-semibold">{initialData.status}</span>
              </p>
              <p className="text-gray-600">
                Last updated: {new Date(initialData.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">
                <strong>Editing mode:</strong> You can modify existing content, add new content, or replace files. 
                Your changes will be saved when you click "Save as Draft" or "Update & Publish".
              </p>
            </div>
          </div>
        )}
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>Book Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Book Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Adventure Begins" required />
              </div>
              <div>
                <Label htmlFor="description">Short Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short summary of your book..." />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Books & Novels" />
              </div>
              <div>
                <Label htmlFor="subCategories">Subcategories (comma separated)</Label>
                <Input id="subCategories" value={subCategories} onChange={(e) => setSubCategories(e.target.value)} placeholder="e.g., Romance, Adult" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {coverImagePreview ?
                <img src={coverImagePreview} alt="Cover preview" className="w-full h-auto object-cover rounded-md aspect-[2/3]" />
                : <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center text-gray-500"><UploadCloud className="w-8 h-8" /></div>}
              <Input id="coverImage" type="file" accept="image/*" onChange={handleCoverImageChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Method</CardTitle>
              <CardDescription>
                {formType === 'edit' 
                  ? "Choose how you want to work with your book content" 
                  : "Choose how you want to add your book content"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={contentMethod === 'text' ? 'default' : 'outline'}
                  onClick={() => handleContentMethodChange('text')}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {formType === 'edit' ? 'Edit Content' : 'Write Content'}
                </Button>
                <Button
                  type="button"
                  variant={contentMethod === 'file' ? 'default' : 'outline'}
                  onClick={() => handleContentMethodChange('file')}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  {formType === 'edit' ? 'Replace File' : 'Upload File'}
                </Button>
                <Button
                  type="button"
                  variant={contentMethod === 'chapters' ? 'default' : 'outline'}
                  onClick={() => handleContentMethodChange('chapters')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Chapters
                </Button>
              </div>

              {contentMethod === 'file' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted min-h-[40px]">
                    <FileText className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate text-sm">{bookFile?.name || existingBookFileName || "No file selected"}</span>
                  </div>
                  <Input 
                    id="bookFile" 
                    type="file" 
                    accept=".docx,.txt,.epub" 
                    onChange={handleBookFileChange}
                    placeholder="Upload your book file"
                  />
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Supported formats:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>.docx</strong> - Microsoft Word documents</li>
                      <li><strong>.txt</strong> - Plain text files</li>
                      <li><strong>.epub</strong> - E-book format</li>
                    </ul>
                    <p className="mt-2 text-blue-600">
                      {formType === 'edit' 
                        ? "Uploading a new file will replace the existing one and extract new content."
                        : "Content will be automatically extracted when you save."
                      }
                    </p>
                  </div>
                </div>
              )}

              {contentMethod === 'chapters' && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Create your book with multiple chapters. Each chapter will be saved separately and can be read in order.</p>
                  </div>
                  <div className="text-sm text-blue-600">
                    <p><strong>Chapters added:</strong> {chapters.length}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {contentMethod === 'text' ? (
            <Card>
              <CardHeader>
                <CardTitle>Write Your Book Content</CardTitle>
                <CardDescription>
                  {formType === 'edit' && initialData?.content 
                    ? "Edit and add to your existing content below" 
                    : "Use the rich text editor below to write your book content"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formType === 'edit' && initialData?.content && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-800 text-sm">
                      <strong>Existing content loaded:</strong> You can edit and add to your existing content below.
                    </p>
                  </div>
                )}
                <TiptapEditor content={content} onChange={(newContent: string) => setContent(newContent)} />
              </CardContent>
            </Card>
          ) : contentMethod === 'file' ? (
            <Card>
              <CardHeader>
                <CardTitle>Upload Book from Device</CardTitle>
                <CardDescription>
                  {formType === 'edit' && existingBookFileName 
                    ? "Replace or update your book file" 
                    : "Upload a file and the content will be automatically extracted"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {bookFile ? bookFile.name : existingBookFileName || "Upload your book file"}
                  </p>
                  <p className="text-gray-600 mb-4">
                    {formType === 'edit' && existingBookFileName 
                      ? "Upload a new file to replace the existing one, or switch to text mode to edit content"
                      : "Drag and drop your file here, or click to browse"
                    }
                  </p>
                  <Input 
                    type="file" 
                    accept=".docx,.txt,.epub" 
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
                  {formType === 'edit' && existingBookFileName && !bookFile && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800 text-sm">
                        📄 Current file: {existingBookFileName}
                      </p>
                      <p className="text-yellow-600 text-xs mt-1">
                        Upload a new file to replace it, or switch to text mode to edit content
                      </p>
                    </div>
                  )}
                  <div className="mt-4 text-xs text-gray-500">
                    <p><strong>Supported:</strong> DOCX, TXT, EPUB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create Book Chapters</CardTitle>
                <CardDescription>Add chapters to your book. Each chapter will be saved separately.</CardDescription>
              </CardHeader>
              <CardContent>
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
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={addChapter}
                          className="flex-1"
                          disabled={!currentChapter.title.trim() || !currentChapter.content.trim()}
                        >
                          {currentChapter.id ? (
                            <>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Update Chapter
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Chapter
                            </>
                          )}
                        </Button>
                        {currentChapter.id && (
                          <Button 
                            variant="outline"
                            onClick={cancelEdit}
                            className="px-4"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
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
                          <div key={chapter.id || index} className="border rounded-lg p-4 bg-gray-50">
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
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editChapter(chapter)}
                                  className="ml-4"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
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
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline" onClick={() => handleSubmit('DRAFT')} disabled={isSubmitting || !title}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save as Draft
        </Button>
        <Button onClick={() => handleSubmit('PUBLISHED')} disabled={isSubmitting || !title}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {formType === 'new' ? 'Publish Book' : 'Update & Publish'}
        </Button>
      </div>
    </div>
  );
}