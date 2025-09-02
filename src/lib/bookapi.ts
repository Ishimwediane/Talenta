import { Book, MyBookSummary, PublishedBookSummary } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders(isFormData: boolean = false) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {};
    
    // The browser sets the 'Content-Type' for FormData automatically, including the boundary.
    // Manually setting it will break the upload.
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      ...options,
      headers: this.getAuthHeaders(isFormData),
    };

    if (options.body && !isFormData && typeof options.body !== 'string') {
        config.body = JSON.stringify(options.body);
    }
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'API request failed with a non-JSON response' }));
        throw new Error(errorData.message || 'API request failed');
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { message: 'Success' } as T;
      }

      return await response.json() as T;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  private async requestRaw(endpoint: string): Promise<string> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = { headers: this.getAuthHeaders() };
    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch raw content' }));
            throw new Error(errorData.message);
        }
        return response.text();
    } catch (error) {
        console.error('API Raw Error:', error);
        throw error;
    }
  }

  // --- AUTH AND USER ENDPOINTS (Your existing code) ---
  // ... (register, login, etc. - no changes needed)

  // --- BOOK ENDPOINTS ---
  getPublishedBooks = (category?: string) => this.request<PublishedBookSummary[]>(`/books${category ? `?category=${encodeURIComponent(category)}` : ''}`);
  getMyBooks = () => this.request<MyBookSummary[]>('/books/my-books');
  getBookById = (id: string) => this.request<Book>(`/books/${id}`);
  createBook = (formData: FormData) => this.request<Book>('/books', { method: 'POST', body: formData });
  updateBook = (id: string, formData: FormData) => this.request<Book>(`/books/${id}`, { method: 'PUT', body: formData });
  deleteBook = (id: string) => this.request<{ message: string }>(`/books/${id}`, { method: 'DELETE' });

  // --- BOOK FILE ENDPOINTS ---
  readBookContent = (filename: string) => this.requestRaw(`/books/read/${filename}`);
  getBookDownloadUrl = (filename: string): string => `${this.baseURL}/books/download/${filename}`;

  // --- CHAPTER ENDPOINTS ---
  createChapter = async (bookId: string, chapterData: any) => {
    const response = await this.request<any>(`/books/${bookId}/chapters`, { method: 'POST', body: chapterData });
    return response.success ? response.data : response;
  };
  
  getBookChapters = async (bookId: string) => {
    const response = await this.request<any>(`/books/${bookId}/chapters`);
    return response.success ? response.data.chapters : response;
  };
  
  getChapter = async (chapterId: string) => {
    const response = await this.request<any>(`/chapters/${chapterId}`);
    return response.success ? response.data : response;
  };
  
  updateChapter = async (chapterId: string, chapterData: any) => {
    const response = await this.request<any>(`/chapters/${chapterId}`, { method: 'PUT', body: chapterData });
    return response.success ? response.data : response;
  };
  
  deleteChapter = async (chapterId: string) => {
    const response = await this.request<{ message: string }>(`/chapters/${chapterId}`, { method: 'DELETE' });
    return response.success ? response : response;
  };
}

const apiService = new ApiService();
export default apiService;