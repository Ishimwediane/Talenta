"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Edit3, Plus, ArrowLeft, BookOpen, Save, X } from 'lucide-react';
import apiService from '@/lib/bookapi';
import { Book, Chapter } from '@/lib/types';
import Link from 'next/link';
import { TiptapEditor } from '@/components/TiptapEditor';

export default function BookChaptersPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = React.use(params).id as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // New chapter state
  const [showNewChapterForm, setShowNewChapterForm] = useState(false);
  const [newChapter, setNewChapter] = useState({ title: '', content: '' });
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  
  // Edit chapter state
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isUpdatingChapter, setIsUpdatingChapter] = useState(false);
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookAndChapters = async () => {
      try {
        setIsLoading(true);
        const bookData = await apiService.getBookById(bookId);
        console.log('📚 Book data received:', bookData);
        console.log('📚 Book data type:', typeof bookData);
        console.log('📚 Book data keys:', Object.keys(bookData));
        setBook(bookData);
        
        if (bookData.chapters) {
          console.log('📚 Chapters found:', bookData.chapters);
          console.log('📚 Chapters type:', typeof bookData.chapters);
          console.log('📚 Chapters length:', bookData.chapters.length);
          setChapters(bookData.chapters);
          if (bookData.chapters.length > 0) {
            setSelectedChapter(bookData.chapters[0]);
          }
        } else {
          console.log('❌ No chapters found in book data');
          console.log('❌ Book data structure:', JSON.stringify(bookData, null, 2));
        }
        
        // Check if current user is the book owner
        const token = localStorage.getItem('token');
        if (token && bookData.userId) {
          // For now, we'll check if the book has chapters (indicating it's editable)
          // In a real app, you'd compare the current user ID with bookData.userId
          setIsOwner(true); // Temporarily set to true for testing
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) {
      fetchBookAndChapters();
    }
  }, [bookId]);

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  const handleEditBook = () => {
    router.push(`/admin/book-editor/${bookId}`);
  };

  const handleAddChapter = () => {
    setShowNewChapterForm(true);
    setNewChapter({ title: '', content: '' });
  };

  const handleCreateChapter = async () => {
    if (!newChapter.title.trim() || !newChapter.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsCreatingChapter(true);
    try {
           // Calculate the next available order by finding the highest order and adding 1
     // Also handle cases where there might be gaps in order numbers
     let nextOrder = 1;
     if (chapters.length > 0) {
       const existingOrders = chapters.map(ch => ch.order).sort((a, b) => a - b);
       console.log('📝 Existing chapter orders:', existingOrders);
       
       // Find the first gap in order numbers, or use the next number after the highest
       for (let i = 1; i <= existingOrders[existingOrders.length - 1] + 1; i++) {
         if (!existingOrders.includes(i)) {
           nextOrder = i;
           break;
         }
       }
     }
     
     console.log('📝 Creating chapter with order calculation:', {
       chaptersLength: chapters.length,
       existingOrders: chapters.map(ch => ch.order),
       calculatedNextOrder: nextOrder,
       chapterData
     });
     
     const chapterData = {
       title: newChapter.title,
       content: newChapter.content,
       order: nextOrder, // Calculated order to avoid conflicts
       status: 'DRAFT',
       isPublished: false
     };

      const createdChapter = await apiService.createChapter(bookId, chapterData);
      console.log('✅ New chapter created:', createdChapter);
      
      // Refresh chapters
      const updatedBookData = await apiService.getBookById(bookId);
      setChapters(updatedBookData.chapters || []);
      setSelectedChapter(createdChapter);
      
             // Reset form
       setShowNewChapterForm(false);
       setNewChapter({ title: '', content: '' });
       
       // Show success message
       setSuccessMessage('🎉 Chapter created successfully!');
       setTimeout(() => setSuccessMessage(null), 5000);
     } catch (error) {
       console.error('❌ Error creating chapter:', error);
       
       // Show more specific error message
       let errorMessage = 'Failed to create chapter. Please try again.';
       if (error.message.includes('order already exists')) {
         errorMessage = 'A chapter with this order already exists. The system will automatically assign the correct order.';
       } else if (error.message.includes('400')) {
         errorMessage = 'Chapter creation failed. Please check your input and try again.';
       }
       
       alert(errorMessage);
     } finally {
       setIsCreatingChapter(false);
     }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
  };

  const handleUpdateChapter = async () => {
    if (!editingChapter || !editingChapter.title.trim() || !editingChapter.content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setIsUpdatingChapter(true);
    try {
      const chapterData = {
        title: editingChapter.title,
        content: editingChapter.content,
        order: editingChapter.order,
        status: editingChapter.status,
        isPublished: editingChapter.isPublished
      };

      const updatedChapter = await apiService.updateChapter(editingChapter.id, chapterData);
      console.log('✅ Chapter updated:', updatedChapter);
      
      // Update local state
      setChapters(prev => prev.map(ch => ch.id === editingChapter.id ? updatedChapter : ch));
      setSelectedChapter(updatedChapter);
      
             // Reset editing state
       setEditingChapter(null);
       
       // Show success message
       setSuccessMessage('✅ Chapter updated successfully!');
       setTimeout(() => setSuccessMessage(null), 5000);
     } catch (error) {
       console.error('❌ Error updating chapter:', error);
       alert('Failed to update chapter. Please try again.');
     } finally {
       setIsUpdatingChapter(false);
     }
  };

  const handleCancelEdit = () => {
    setEditingChapter(null);
  };

  const handleCancelNew = () => {
    setShowNewChapterForm(false);
    setNewChapter({ title: '', content: '' });
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteChapter(chapterId);
      console.log('✅ Chapter deleted successfully');
      
      // Refresh chapters
      const updatedBookData = await apiService.getBookById(bookId);
      const updatedChapters = updatedBookData.chapters || [];
      setChapters(updatedChapters);
      
      // If the deleted chapter was selected, clear selection
      if (selectedChapter?.id === chapterId) {
        setSelectedChapter(updatedChapters.length > 0 ? updatedChapters[0] : null);
      }
      
      // If the deleted chapter was being edited, clear editing state
      if (editingChapter?.id === chapterId) {
        setEditingChapter(null);
      }
    } catch (error) {
      console.error('❌ Error deleting chapter:', error);
      alert('Failed to delete chapter. Please try again.');
    }
  };

  const handleReorderChapters = async (chapterId: string, newOrder: number) => {
    try {
      // Find the chapter to reorder
      const chapterToReorder = chapters.find(ch => ch.id === chapterId);
      if (!chapterToReorder) return;

      // Update the chapter order
      const updatedChapter = await apiService.updateChapter(chapterId, {
        ...chapterToReorder,
        order: newOrder
      });

      // Refresh chapters to get the new order
      const updatedBookData = await apiService.getBookById(bookId);
      const updatedChapters = updatedBookData.chapters || [];
      setChapters(updatedChapters);
      
      // Update selected chapter if needed
      if (selectedChapter?.id === chapterId) {
        setSelectedChapter(updatedChapter);
      }
    } catch (error) {
      console.error('❌ Error reordering chapter:', error);
      alert('Failed to reorder chapter. Please try again.');
    }
  };

  // Function to automatically reorder chapters to fix any order conflicts
  const reorderChaptersSequentially = async () => {
    try {
      const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);
      let hasChanges = false;
      
      for (let i = 0; i < sortedChapters.length; i++) {
        const expectedOrder = i + 1;
        if (sortedChapters[i].order !== expectedOrder) {
          hasChanges = true;
          console.log(`🔄 Reordering chapter "${sortedChapters[i].title}" from order ${sortedChapters[i].order} to ${expectedOrder}`);
          
          await apiService.updateChapter(sortedChapters[i].id, {
            ...sortedChapters[i],
            order: expectedOrder
          });
        }
      }
      
      if (hasChanges) {
        // Refresh chapters after reordering
        const updatedBookData = await apiService.getBookById(bookId);
        setChapters(updatedBookData.chapters || []);
        setSuccessMessage('🔄 Chapters have been automatically reordered to fix conflicts!');
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (error) {
      console.error('❌ Error reordering chapters:', error);
      alert('Failed to reorder chapters automatically. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book chapters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Book</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Book Not Found</h2>
          <p className="text-gray-600 mb-4">The book you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
             {/* Success Message */}
       {successMessage && (
         <div className="bg-green-50 border-b border-green-200">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
             <div className="flex items-center justify-center">
               <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg font-medium">
                 {successMessage}
               </div>
             </div>
           </div>
         </div>
       )}
       
       {/* Header */}
       <div className="bg-white border-b">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/books/${bookId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Book
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                <p className="text-gray-600">by {book.author}</p>
              </div>
            </div>
            
                         {isOwner && (
               <div className="flex gap-2">
                 <Button onClick={handleAddChapter} variant="outline">
                   <Plus className="h-4 w-4 mr-2" />
                   Add Chapter
                 </Button>
                 <Button onClick={handleEditBook}>
                   <Edit3 className="h-4 h-4 mr-2" />
                   Edit Book
                 </Button>
               </div>
             )}
           </div>
           
           {/* New Chapter Form */}
           {showNewChapterForm && (
             <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-lg">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold text-blue-900">✨ Add New Chapter</h3>
                 <Button onClick={handleCancelNew} variant="ghost" size="sm">
                   <X className="h-5 w-5" />
                 </Button>
               </div>
               <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-semibold text-blue-800 mb-3">📖 Chapter Title</label>
                   <input
                     type="text"
                     value={newChapter.title}
                     onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
                     className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                     placeholder="Enter an engaging chapter title..."
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-blue-800 mb-3">✍️ Chapter Content</label>
                   <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
                     <TiptapEditor
                       content={newChapter.content}
                       onChange={(newContent: string) => setNewChapter(prev => ({ ...prev, content: newContent }))}
                     />
                   </div>
                 </div>
                 <div className="flex gap-3 pt-4">
                   <Button 
                     onClick={handleCreateChapter} 
                     disabled={isCreatingChapter}
                     className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                   >
                     {isCreatingChapter ? (
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                     ) : (
                       <Save className="h-5 w-5 mr-3" />
                     )}
                     {isCreatingChapter ? 'Creating Chapter...' : 'Create Chapter'}
                   </Button>
                   <Button onClick={handleCancelNew} variant="outline" size="lg" className="px-8 py-3 text-lg">
                     Cancel
                   </Button>
                 </div>
                 
                 <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                   <p className="text-xs text-blue-700 text-center">
                     💡 <strong>Tip:</strong> Write engaging content that keeps readers hooked!
                   </p>
                 </div>
               </div>
             </div>
           )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                     {/* Chapter List Sidebar */}
           <div className="lg:col-span-1">
             <Card className="shadow-lg border-0">
               <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                 <CardTitle className="flex items-center gap-3 text-lg">
                   <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg">
                     <BookOpen className="h-5 w-5 text-white" />
                   </div>
                   <div>
                     <div className="font-bold text-gray-900">Chapters</div>
                     <div className="text-sm font-normal text-gray-600">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</div>
                   </div>
                 </CardTitle>
                 
                 {/* Reorder button - only show if there are chapters */}
                 {isOwner && chapters.length > 1 && (
                   <Button 
                     onClick={reorderChaptersSequentially}
                     variant="ghost" 
                     size="sm"
                     className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                     title="Fix chapter order conflicts"
                   >
                     🔄 Fix Order
                   </Button>
                 )}
               </CardHeader>
               <CardContent className="p-4">
                 {chapters.length === 0 ? (
                   <div className="text-center py-8">
                     <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                       <FileText className="w-8 h-8 text-gray-400" />
                     </div>
                     <p className="text-gray-500 font-medium">No chapters yet</p>
                     <p className="text-gray-400 text-sm mt-1">Start building your story!</p>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {chapters.map((chapter) => (
                       <div key={chapter.id} className="relative group">
                         <button
                           onClick={() => handleChapterSelect(chapter)}
                           className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                             selectedChapter?.id === chapter.id
                               ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md scale-[1.02]'
                               : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
                           }`}
                         >
                           <div className="flex items-start justify-between mb-2">
                             <div className="flex-1">
                               <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                                 {chapter.title}
                               </div>
                               <div className="flex items-center gap-3 text-xs text-gray-500">
                                 <div className="flex items-center gap-1">
                                   <FileText className="w-3 h-3 text-blue-500" />
                                   <span className="font-medium">{chapter.wordCount || 0} words</span>
                                 </div>
                                 <div className="flex items-center gap-1">
                                   <Clock className="w-3 h-3 text-green-500" />
                                   <span className="font-medium">{chapter.readingTime || 0} min</span>
                                 </div>
                               </div>
                             </div>
                             <Badge 
                               variant={chapter.status === 'PUBLISHED' ? 'default' : 'secondary'}
                               className={`text-xs font-semibold ${
                                 chapter.status === 'PUBLISHED' 
                                   ? 'bg-green-100 text-green-800 border-green-200' 
                                   : 'bg-gray-100 text-gray-800 border-gray-200'
                               }`}
                             >
                               {chapter.status}
                             </Badge>
                           </div>
                           
                           {/* Chapter number indicator */}
                           <div className="absolute top-2 left-2">
                             <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                               {chapter.order}
                             </div>
                           </div>
                         </button>
                         
                         {/* Delete button - only visible on hover for selected chapter or always for others */}
                         {isOwner && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteChapter(chapter.id);
                             }}
                             className={`absolute top-3 right-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-all duration-200 ${
                               selectedChapter?.id === chapter.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                             }`}
                             title="Delete Chapter"
                           >
                             <X className="h-4 w-4" />
                           </button>
                         )}
                       </div>
                     ))}
                   </div>
                 )}
                 
                                    {/* Chapter order info */}
                   {chapters.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-gray-200">
                       <div className="text-xs text-gray-500 mb-2">
                         <strong>Chapter Order:</strong> {chapters.map(ch => ch.order).sort((a, b) => a - b).join(' → ')}
                       </div>
                       
                       {/* Quick add chapter button */}
                       {isOwner && (
                         <Button 
                           onClick={handleAddChapter} 
                           variant="outline" 
                           className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-300"
                         >
                           <Plus className="h-4 w-4 mr-2" />
                           Add Another Chapter
                         </Button>
                       )}
                     </div>
                   )}
               </CardContent>
             </Card>
           </div>

                     {/* Chapter Content */}
           <div className="lg:col-span-3">
             {selectedChapter ? (
               <Card className="shadow-lg border-0">
                 <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                   <div className="flex items-center justify-between mb-4">
                     <div>
                       <div className="flex items-center gap-3 mb-2">
                         <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50">
                           Chapter {selectedChapter.order}
                         </Badge>
                         <h2 className="text-2xl font-bold text-gray-900">{selectedChapter.title}</h2>
                       </div>
                       <div className="flex items-center gap-6 text-sm text-gray-600">
                         <div className="flex items-center gap-2">
                           <FileText className="w-4 h-4 text-blue-500" />
                           <span className="font-medium">{selectedChapter.wordCount || 0} words</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <Clock className="w-4 h-4 text-green-500" />
                           <span className="font-medium">{selectedChapter.readingTime || 0} min read</span>
                         </div>
                         <Badge 
                           variant={selectedChapter.status === 'PUBLISHED' ? 'default' : 'secondary'}
                           className="font-medium"
                         >
                           {selectedChapter.status}
                         </Badge>
                       </div>
                     </div>
                     {isOwner && !editingChapter && (
                       <Button 
                         onClick={() => handleEditChapter(selectedChapter)}
                         className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                       >
                         <Edit3 className="h-4 w-4 mr-2" />
                         Edit Chapter
                       </Button>
                     )}
                   </div>
                 </CardHeader>
                 <CardContent className="p-8">
                   {editingChapter && editingChapter.id === selectedChapter.id ? (
                     <div className="space-y-6">
                       <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                         <div className="flex">
                           <div className="flex-shrink-0">
                             <Edit3 className="h-5 w-5 text-yellow-400" />
                           </div>
                           <div className="ml-3">
                             <p className="text-sm text-yellow-700">
                               <strong>Editing Mode:</strong> You're now editing this chapter. Make your changes below.
                             </p>
                           </div>
                         </div>
                       </div>
                       
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-3">📖 Chapter Title</label>
                         <input
                           type="text"
                           value={editingChapter.title}
                           onChange={(e) => setEditingChapter(prev => prev ? { ...prev, title: e.target.value } : null)}
                           className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                         />
                       </div>
                       
                       <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-3">✍️ Chapter Content</label>
                         <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                           <TiptapEditor
                             content={editingChapter.content}
                             onChange={(newContent: string) => setEditingChapter(prev => prev ? { ...prev, content: newContent } : null)}
                           />
                         </div>
                       </div>
                       
                       <div className="flex gap-3 pt-4 border-t pt-6">
                         <Button 
                           onClick={handleUpdateChapter} 
                           disabled={isUpdatingChapter}
                           className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                         >
                           {isUpdatingChapter ? (
                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                           ) : (
                             <Save className="h-5 w-5 mr-3" />
                           )}
                           {isUpdatingChapter ? 'Updating Chapter...' : 'Save Changes'}
                         </Button>
                         <Button onClick={handleCancelEdit} variant="outline" size="lg" className="px-8 py-3 text-lg">
                           Cancel Editing
                         </Button>
                       </div>
                       
                       <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                         <p className="text-xs text-gray-600 text-center">
                           💡 <strong>Tip:</strong> Your changes are automatically saved when you click "Save Changes"
                         </p>
                       </div>
                     </div>
                   ) : (
                     <div className="reading-mode">
                       <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                         <div className="flex">
                           <div className="flex-shrink-0">
                             <FileText className="h-5 w-5 text-blue-400" />
                           </div>
                           <div className="ml-3">
                             <p className="text-sm text-blue-700">
                               <strong>Reading Mode:</strong> You're now reading this chapter. Click "Edit Chapter" above to make changes.
                             </p>
                           </div>
                         </div>
                       </div>
                       
                       <div 
                         className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900"
                         dangerouslySetInnerHTML={{ __html: selectedChapter.content }}
                       />
                     </div>
                   )}
                 </CardContent>
               </Card>
             ) : (
               <Card className="shadow-lg border-0">
                 <CardContent className="text-center py-16">
                   <div className="bg-gradient-to-r from-blue-100 to-indigo-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                     <FileText className="w-12 h-12 text-blue-600" />
                   </div>
                   <h3 className="text-xl font-semibold text-gray-900 mb-3">Select a Chapter to Read</h3>
                   <p className="text-gray-600 mb-6">Choose a chapter from the sidebar to start reading, or create a new one to get started!</p>
                   {isOwner && (
                     <Button onClick={handleAddChapter} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                       <Plus className="h-4 w-4 mr-2" />
                       Create Your First Chapter
                     </Button>
                   )}
                 </CardContent>
               </Card>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
