const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: 'USER' | 'CREATOR' | 'ADMIN' | 'MODERATOR';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  lastLogin?: string;
  _count?: {
    books: number;
    audio: number;
    contents: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  creators: number;
  moderators: number;
  admins: number;
}

export interface UserContent {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  books?: Array<{
    id: string;
    title: string;
    description?: string;
    status: 'DRAFT' | 'PUBLISHED';
    category?: string;
    subCategories?: string[];
    createdAt: string;
    updatedAt: string;
    coverImage?: string;
  }>;
  audio?: Array<{
    id: string;
    title?: string;
    description?: string;
    status: 'DRAFT' | 'PUBLISHED';
    category?: string;
    subCategories?: string[];
    totalDuration?: number;
    createdAt: string;
    fileUrl: string;
  }>;
  contents?: Array<{
    id: string;
    title: string;
    description?: string;
    type: 'FILM' | 'PODCAST' | 'POETRY' | 'MUSIC' | 'PHOTOGRAPHY' | 'ART';
    category: string;
    tags: string[];
    isPublished: boolean;
    isApproved: boolean;
    views: number;
    likes: number;
    shares: number;
    createdAt: string;
    updatedAt: string;
    thumbnailUrl?: string;
  }>;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  role?: 'USER' | 'CREATOR' | 'ADMIN' | 'MODERATOR';
  isVerified?: boolean;
  isActive?: boolean;
}

class AdminApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options
    };

    if (options.body && typeof options.body !== 'string') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination and filtering
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PaginatedUsers> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await this.request<{ success: boolean; data: PaginatedUsers }>(`/admin/users?${searchParams.toString()}`);
    return response.data;
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const response = await this.request<{ success: boolean; data: UserStats }>('/admin/users/stats');
    return response.data;
  }

  /**
   * Get specific user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>(`/admin/users/${id}`);
    return response.data;
  }

  /**
   * Update user details
   */
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: userData
    });
    return response.data;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    const response = await this.request<{ success: boolean; data: { message: string } }>(`/admin/users/${id}`, {
      method: 'DELETE'
    });
    return response.data;
  }

  /**
   * Get user content (books, audio, other content)
   */
  async getUserContent(id: string, type: 'all' | 'books' | 'audio' | 'content' = 'all'): Promise<UserContent> {
    const response = await this.request<{ success: boolean; data: UserContent }>(`/admin/users/${id}/content?type=${type}`);
    return response.data;
  }
}

export const adminApiService = new AdminApiService();
