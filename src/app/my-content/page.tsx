"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import apiService from '@/lib/bookapi';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  MessageSquare, 
  Play, 
  Pause,
  Filter,
  Search,
  BookOpen,
  Mic,
  Video,
  Image,
  FileText,
  Calendar,
  TrendingUp,
  Users
} from "lucide-react";

// Language translations
const translations = {
  en: {
    title: "My Content",
    subtitle: "Manage and track your creative works",
    createNew: "Create New",
    totalContent: "Total Content",
    totalViews: "Total Views",
    totalLikes: "Total Likes",
    totalComments: "Total Comments",
    searchPlaceholder: "Search your content...",
    allStatus: "All Status",
    published: "Published",
    draft: "Draft",
    archived: "Archived",
    allTypes: "All Types",
    poems: "Poems",
    stories: "Stories",
    audio: "Audio",
    video: "Video",
    images: "Images",
    articles: "Articles",
    newestFirst: "Newest First",
    oldestFirst: "Oldest First",
    mostViews: "Most Views",
    mostLikes: "Most Likes",
    noContentFound: "No content found",
    tryAdjustingFilters: "Try adjusting your filters or search terms.",
    startCreating: "Start creating your first piece of content!",
    createFirstContent: "Create Your First Content",
    view: "View",
    edit: "Edit",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this content?",
    poem: "Poem",
    story: "Story",
    article: "Article"
  },
  rw: {
    title: "Ibintu Byanjye",
    subtitle: "Gukurikirana no gucunga ibintu byawe by'ubuhanzi",
    createNew: "Kurema Gishya",
    totalContent: "Ibintu Byose",
    totalViews: "Kureba Byose",
    totalLikes: "Gukunda Byose",
    totalComments: "Ibiganiro Byose",
    searchPlaceholder: "Shakisha ibintu byawe...",
    allStatus: "Imimerere Yose",
    published: "Byashyizwemo",
    draft: "Inyandiko",
    archived: "Byabikwa",
    allTypes: "Ubwoko Bwose",
    poems: "Inkuru",
    stories: "Amagambo",
    audio: "Ijwi",
    video: "Video",
    images: "Ifoto",
    articles: "Inyandiko",
    newestFirst: "Gishya Mbere",
    oldestFirst: "Gishaje Mbere",
    mostViews: "Kureba Byinshi",
    mostLikes: "Gukunda Byinshi",
    noContentFound: "Ntibiboneka",
    tryAdjustingFilters: "Gerageza guhindura ibintu byawe cyangwa amagambo yo gushakisha.",
    startCreating: "Tangira kurema igice cyawe cya mbere!",
    createFirstContent: "Reka Igice Cyawe Cya Mbere",
    view: "Reba",
    edit: "Hindura",
    delete: "Siba",
    deleteConfirm: "Uzi neza ko ushaka gusiba iki gice?",
    poem: "Inkuru",
    story: "Amagambo",
    article: "Inyandiko"
  }
};

interface ContentItem {
  id: string;
  title: string;
  type: 'poem' | 'story' | 'audio' | 'video' | 'image' | 'article' | 'book';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  thumbnail?: string;
  excerpt?: string;
  tags: string[];
}

export default function MyContentPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [language, setLanguage] = useState<"en" | "rw">("en");

  // Get current language translations
  const t = translations[language];

  // Mock data - replace with actual API call
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    // Simulate API call
    setTimeout(() => {
             const mockContent: ContentItem[] = language === "rw" ? [
         {
           id: "1",
           title: "Umutima wa Rwanda",
           type: "poem",
           status: "published",
           createdAt: "2024-01-15",
           updatedAt: "2024-01-20",
           views: 1247,
           likes: 89,
           comments: 23,
           excerpt: "Mu mutima wa Afurika, aho imisozi ihurira n'ikirere...",
           tags: ["Rwanda", "Isi", "Umuco"]
         },
         {
           id: "2",
           title: "Imyugariro y'Umusozi",
           type: "story",
           status: "published",
           createdAt: "2024-01-10",
           updatedAt: "2024-01-18",
           views: 892,
           likes: 67,
           comments: 15,
           excerpt: "Mu misozi y'igicu, aho imizimu ya kera ihura...",
           tags: ["Ibyishimo", "Urugano", "Imigani"]
         },
         {
           id: "3",
           title: "Ingoma za Kera",
           type: "audio",
           status: "published",
           createdAt: "2024-01-05",
           updatedAt: "2024-01-12",
           views: 2156,
           likes: 156,
           comments: 34,
           excerpt: "Amaguru y'ingoma za kera za Rwanda...",
           tags: ["Umuziki", "Kera", "Umuco"]
         },
         {
           id: "4",
           title: "Kigali mu Gitondo",
           type: "image",
           status: "draft",
           createdAt: "2024-01-25",
           updatedAt: "2024-01-25",
           views: 0,
           likes: 0,
           comments: 0,
           excerpt: "Gufata ubwiza bw'umurwa mukuru wa Rwanda igihe izuba rirashe...",
           tags: ["Ifoto", "Kigali", "Gitondo"]
         },
         {
           id: "5",
           title: "Ubuhanzi bwo Gusoma",
           type: "article",
           status: "published",
           createdAt: "2024-01-08",
           updatedAt: "2024-01-15",
           views: 567,
           likes: 45,
           comments: 12,
           excerpt: "Gusuzuma umuco utagatifu wo gusoma mu kanwa mu Rwanda...",
           tags: ["Umuco", "Amashuri", "Amateka"]
         }
       ] : [
         {
           id: "1",
           title: "Rwanda's Heart",
           type: "poem",
           status: "published",
           createdAt: "2024-01-15",
           updatedAt: "2024-01-20",
           views: 1247,
           likes: 89,
           comments: 23,
           excerpt: "In the heart of Africa, where hills embrace the sky...",
           tags: ["Rwanda", "Nature", "Culture"]
         },
         {
           id: "2",
           title: "The Mountain's Whisper",
           type: "story",
           status: "published",
           createdAt: "2024-01-10",
           updatedAt: "2024-01-18",
           views: 892,
           likes: 67,
           comments: 15,
           excerpt: "High in the misty mountains, where ancient spirits dwell...",
           tags: ["Mystery", "Adventure", "Folklore"]
         },
         {
           id: "3",
           title: "Traditional Drumming",
           type: "audio",
           status: "published",
           createdAt: "2024-01-05",
           updatedAt: "2024-01-12",
           views: 2156,
           likes: 156,
           comments: 34,
           excerpt: "The rhythmic beats of traditional Rwandan drums...",
           tags: ["Music", "Traditional", "Cultural"]
         },
         {
           id: "4",
           title: "Kigali at Dawn",
           type: "image",
           status: "draft",
           createdAt: "2024-01-25",
           updatedAt: "2024-01-25",
           views: 0,
           likes: 0,
           comments: 0,
           excerpt: "Capturing the beauty of Rwanda's capital as the sun rises...",
           tags: ["Photography", "Kigali", "Dawn"]
         },
         {
           id: "5",
           title: "The Art of Storytelling",
           type: "article",
           status: "published",
           createdAt: "2024-01-08",
           updatedAt: "2024-01-15",
           views: 567,
           likes: 45,
           comments: 12,
           excerpt: "Exploring the rich tradition of oral storytelling in Rwanda...",
           tags: ["Culture", "Education", "Heritage"]
         },
         {
           id: "6",
           title: "My First Book",
           type: "book",
           status: "published",
           createdAt: "2024-01-20",
           updatedAt: "2024-01-25",
           views: 1234,
           likes: 78,
           comments: 19,
           excerpt: "A journey through the pages of my first published book...",
           tags: ["Book", "Writing", "Publishing"]
         }
       ];
      
      setContent(mockContent);
      setFilteredContent(mockContent);
             setLoading(false);
     }, 1000);
   }, [isAuthenticated, router, language]);

  // Filter and search content
  useEffect(() => {
    let filtered = content;

    // Filter by status
    if (selectedFilter !== "all") {
      filtered = filtered.filter(item => item.status === selectedFilter);
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Search by title or tags
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort content
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most-views":
          return b.views - a.views;
        case "most-likes":
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    setFilteredContent(filtered);
  }, [content, searchTerm, selectedFilter, selectedType, sortBy]);

     const getTypeIcon = (type: string) => {
     switch (type) {
       case "poem":
         return <FileText className="w-4 h-4" />;
       case "story":
         return <BookOpen className="w-4 h-4" />;
       case "book":
         return <BookOpen className="w-4 h-4" />;
       case "audio":
         return <Mic className="w-4 h-4" />;
       case "video":
         return <Video className="w-4 h-4" />;
       case "image":
         return <Image className="w-4 h-4" />;
       case "article":
         return <FileText className="w-4 h-4" />;
       default:
         return <FileText className="w-4 h-4" />;
     }
   };

   const getTypeLabel = (type: string) => {
     switch (type) {
       case "poem":
         return t.poem;
       case "story":
         return t.story;
       case "book":
         return "Book";
       case "audio":
         return t.audio;
       case "video":
         return t.video;
       case "image":
         return t.images;
       case "article":
         return t.article;
       default:
         return type;
     }
   };

     const getStatusColor = (status: string) => {
     switch (status) {
       case "published":
         return "bg-green-100 text-green-800 border-green-200";
       case "draft":
         return "bg-yellow-100 text-yellow-800 border-yellow-200";
       case "archived":
         return "bg-gray-100 text-gray-800 border-gray-200";
       default:
         return "bg-gray-100 text-gray-800 border-gray-200";
     }
   };

   const getStatusLabel = (status: string) => {
     switch (status) {
       case "published":
         return t.published;
       case "draft":
         return t.draft;
       case "archived":
         return t.archived;
       default:
         return status;
     }
   };

  const handleEdit = (id: string) => {
    // Check if this is a book type content and route accordingly
    const item = content.find(c => c.id === id);
    if (item && item.type === 'book') {
      router.push(`/dashboard/write/edit/${id}`);
    } else {
      // For other content types, route to appropriate edit page
      router.push(`/dashboard/${item?.type}/edit/${id}`);
    }
  };

     const handleDelete = async (id: string) => {
       if (!confirm(t.deleteConfirm)) return;
       
       try {
         const item = content.find(c => c.id === id);
         if (item && item.type === 'book') {
           // Use the book API service for book deletion
           await apiService.deleteBook(id);
         }
         // Remove from local state
         setContent(prev => prev.filter(item => item.id !== id));
         setFilteredContent(prev => prev.filter(item => item.id !== id));
       } catch (error) {
         console.error('Error deleting content:', error);
         alert('Failed to delete content. Please try again.');
       }
     };

  const handleView = (id: string) => {
    const item = content.find(c => c.id === id);
    if (item && item.type === 'book') {
      router.push(`/dashboard/write/read/${id}`);
    } else {
      router.push(`/content/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 {/* Header */}
         <div className="mb-8">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
               <p className="text-gray-600 mt-2">{t.subtitle}</p>
             </div>
             <div className="flex items-center space-x-4">
               {/* Language Toggle */}
               <button
                 onClick={() => setLanguage(language === "en" ? "rw" : "en")}
                 className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
               >
                 {language === "en" ? "🇷🇼 Kinyarwanda" : "🇺🇸 English"}
               </button>
               <button
                 onClick={() => router.push("/dashboard/write")}
                 className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center space-x-2"
               >
                 <Plus className="w-5 h-5" />
                 <span>{t.createNew}</span>
               </button>
             </div>
           </div>

                     {/* Stats */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
             <div className="bg-white rounded-lg shadow p-6">
               <div className="flex items-center">
                 <div className="p-2 bg-blue-100 rounded-lg">
                   <FileText className="w-6 h-6 text-blue-600" />
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">{t.totalContent}</p>
                   <p className="text-2xl font-bold text-gray-900">{content.length}</p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg shadow p-6">
               <div className="flex items-center">
                 <div className="p-2 bg-green-100 rounded-lg">
                   <Eye className="w-6 h-6 text-green-600" />
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">{t.totalViews}</p>
                   <p className="text-2xl font-bold text-gray-900">
                     {content.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg shadow p-6">
               <div className="flex items-center">
                 <div className="p-2 bg-red-100 rounded-lg">
                   <Heart className="w-6 h-6 text-red-600" />
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">{t.totalLikes}</p>
                   <p className="text-2xl font-bold text-gray-900">
                     {content.reduce((sum, item) => sum + item.likes, 0).toLocaleString()}
                   </p>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-lg shadow p-6">
               <div className="flex items-center">
                 <div className="p-2 bg-purple-100 rounded-lg">
                   <MessageSquare className="w-6 h-6 text-purple-600" />
                 </div>
                 <div className="ml-4">
                   <p className="text-sm font-medium text-gray-600">{t.totalComments}</p>
                   <p className="text-2xl font-bold text-gray-900">
                     {content.reduce((sum, item) => sum + item.comments, 0).toLocaleString()}
                   </p>
                 </div>
               </div>
             </div>
           </div>
        </div>

                 {/* Filters and Search */}
         <div className="bg-white rounded-lg shadow mb-8">
           <div className="p-6">
             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
               {/* Search */}
               <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                 <input
                   type="text"
                   placeholder={t.searchPlaceholder}
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                 />
               </div>

               {/* Filters */}
               <div className="flex flex-wrap gap-4">
                 <select
                   value={selectedFilter}
                   onChange={(e) => setSelectedFilter(e.target.value)}
                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                 >
                   <option value="all">{t.allStatus}</option>
                   <option value="published">{t.published}</option>
                   <option value="draft">{t.draft}</option>
                   <option value="archived">{t.archived}</option>
                 </select>

                 <select
                   value={selectedType}
                   onChange={(e) => setSelectedType(e.target.value)}
                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                 >
                   <option value="all">{t.allTypes}</option>
                   <option value="poem">{t.poems}</option>
                   <option value="story">{t.stories}</option>
                   <option value="book">Books</option>
                   <option value="audio">{t.audio}</option>
                   <option value="video">{t.video}</option>
                   <option value="image">{t.images}</option>
                   <option value="article">{t.articles}</option>
                 </select>

                 <select
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                 >
                   <option value="newest">{t.newestFirst}</option>
                   <option value="oldest">{t.oldestFirst}</option>
                   <option value="most-views">{t.mostViews}</option>
                   <option value="most-likes">{t.mostLikes}</option>
                 </select>
               </div>
             </div>
           </div>
         </div>

                 {/* Content Grid */}
         {filteredContent.length === 0 ? (
           <div className="text-center py-12">
             <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <FileText className="w-12 h-12 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noContentFound}</h3>
             <p className="text-gray-600 mb-6">
               {searchTerm || selectedFilter !== "all" || selectedType !== "all"
                 ? t.tryAdjustingFilters
                 : t.startCreating}
             </p>
             {!searchTerm && selectedFilter === "all" && selectedType === "all" && (
               <button
                 onClick={() => router.push("/dashboard/write")}
                 className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
               >
                 {t.createFirstContent}
               </button>
             )}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {/* Content Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                                         <div className="flex items-center space-x-2">
                       <div className="p-1 bg-gray-100 rounded">
                         {getTypeIcon(item.type)}
                       </div>
                       <span className="text-sm font-medium text-gray-600 capitalize">{getTypeLabel(item.type)}</span>
                     </div>
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(item.status)}`}>
                       {getStatusLabel(item.status)}
                     </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  {item.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.excerpt}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Stats */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{item.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{item.comments.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                                         <div className="flex space-x-2">
                       <button
                         onClick={() => handleView(item.id)}
                         className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors flex items-center space-x-1"
                       >
                         <Eye className="w-4 h-4" />
                         <span>{t.view}</span>
                       </button>
                       <button
                         onClick={() => handleEdit(item.id)}
                         className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                       >
                         <Edit className="w-4 h-4" />
                         <span>{t.edit}</span>
                       </button>
                     </div>
                     <button
                       onClick={() => handleDelete(item.id)}
                       className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex items-center space-x-1"
                     >
                       <Trash2 className="w-4 h-4" />
                       <span>{t.delete}</span>
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
