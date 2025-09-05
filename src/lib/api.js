const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

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

  // Authentication endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async googleLogin(token) {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }

  async forgotPassword(emailOrPhone) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ emailOrPhone })
    });
  }

  async resetPassword(token, newPassword) {
    return this.request(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  }

  async verifyEmail(token) {
    return this.request(`/auth/verify-email/${token}`, {
      method: 'GET'
    });
  }

  // User endpoints
  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async deleteAccount() {
    return this.request('/users/account', {
      method: 'DELETE'
    });
  }

  // Content endpoints
  async getContent(page = 1, limit = 10, category = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category })
    });
    return this.request(`/content?${params}`);
  }

  async getContentById(id) {
    return this.request(`/content/${id}`);
  }

  async uploadContent(contentData) {
    return this.request('/content/upload', {
      method: 'POST',
      body: JSON.stringify(contentData)
    });
  }

  async updateContent(id, contentData) {
    return this.request(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contentData)
    });
  }

  async deleteContent(id) {
    return this.request(`/content/${id}`, {
      method: 'DELETE'
    });
  }

  // Audio Chapter endpoints
  async createAudioChapter(audioId, chapterData) {
    return this.request(`/audio/${audioId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(chapterData)
    });
  }

  async getAudioChapters(audioId, includeUnpublished = false) {
    const params = new URLSearchParams();
    if (includeUnpublished) {
      params.append('includeUnpublished', 'true');
    }
    return this.request(`/audio/${audioId}/chapters?${params}`);
  }

  async getAudioChapter(chapterId) {
    return this.request(`/audio/chapters/${chapterId}`);
  }

  async updateAudioChapter(chapterId, chapterData) {
    return this.request(`/audio/chapters/${chapterId}`, {
      method: 'PATCH',
      body: JSON.stringify(chapterData)
    });
  }

  async deleteAudioChapter(chapterId) {
    return this.request(`/audio/chapters/${chapterId}`, {
      method: 'DELETE'
    });
  }

  async reorderAudioChapters(audioId, chapterOrders) {
    return this.request(`/audio/${audioId}/chapters/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ chapterOrders })
    });
  }

  // Audio endpoints
  async getAudioById(audioId) {
    return this.request(`/audio/${audioId}`);
  }

  async createAudio(audioData) {
    return this.request('/audio', {
      method: 'POST',
      body: JSON.stringify(audioData)
    });
  }

  async updateAudio(audioId, audioData) {
    return this.request(`/audio/${audioId}`, {
      method: 'PUT',
      body: JSON.stringify(audioData)
    });
  }

  async deleteAudio(audioId) {
    return this.request(`/audio/${audioId}`, {
      method: 'DELETE'
    });
  }

  // Audio Part endpoints (direct to audio, not through chapters)
  async createAudioPart(audioId, partData) {
    return this.request(`/audio/${audioId}/parts`, {
      method: 'POST',
      body: JSON.stringify(partData)
    });
  }

  async getAudioParts(audioId, includeUnpublished = false) {
    const params = new URLSearchParams();
    if (includeUnpublished) {
      params.append('includeUnpublished', 'true');
    }
    return this.request(`/audio/${audioId}/parts?${params}`);
  }

  async getAudioPart(partId) {
    return this.request(`/audio/parts/${partId}`);
  }

  async updateAudioPart(partId, partData) {
    return this.request(`/audio/parts/${partId}`, {
      method: 'PATCH',
      body: JSON.stringify(partData)
    });
  }

  async deleteAudioPart(partId) {
    return this.request(`/audio/parts/${partId}`, {
      method: 'DELETE'
    });
  }

  async reorderAudioParts(audioId, partOrders) {
    return this.request(`/audio/${audioId}/parts/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ partOrders })
    });
  }

  // Audio Chapter endpoints (legacy - for backward compatibility)
  async createAudioChapter(audioId, chapterData) {
    return this.request(`/audio/${audioId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(chapterData)
    });
  }

  async getAudioChapters(audioId, includeUnpublished = false) {
    const params = new URLSearchParams();
    if (includeUnpublished) {
      params.append('includeUnpublished', 'true');
    }
    return this.request(`/audio/${audioId}/chapters?${params}`);
  }

  async getAudioChapter(chapterId) {
    return this.request(`/audio/chapters/${chapterId}`);
  }

  async updateAudioChapter(chapterId, chapterData) {
    return this.request(`/audio/chapters/${chapterId}`, {
      method: 'PATCH',
      body: JSON.stringify(chapterData)
    });
  }

  async deleteAudioChapter(chapterId) {
    return this.request(`/audio/chapters/${chapterId}`, {
      method: 'DELETE'
    });
  }

  async reorderAudioChapters(audioId, chapterOrders) {
    return this.request(`/audio/${audioId}/chapters/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ chapterOrders })
    });
  }

  // Audio Part endpoints (within chapters - legacy)
  async createAudioPartInChapter(chapterId, partData) {
    return this.request(`/audio/chapters/${chapterId}/parts`, {
      method: 'POST',
      body: JSON.stringify(partData)
    });
  }

  async getAudioPartsInChapter(chapterId, includeUnpublished = false) {
    const params = new URLSearchParams();
    if (includeUnpublished) {
      params.append('includeUnpublished', 'true');
    }
    return this.request(`/audio/chapters/${chapterId}/parts?${params}`);
  }

  async reorderAudioPartsInChapter(chapterId, partOrders) {
    return this.request(`/audio/chapters/${chapterId}/parts/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ partOrders })
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService; 