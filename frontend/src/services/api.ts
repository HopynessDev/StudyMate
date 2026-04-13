import axios from 'axios';
import type {
  User,
  StudyMaterial,
  WellnessRecord,
  StudySession,
  Achievement,
  Goal,
  ApiResponse,
  ApiError
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { username: string; email: string; password: string; language?: 'en' | 'es' }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),

  getMe: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me'),

  updateProfile: (data: { username?: string; language?: 'en' | 'es'; preferences?: any }) =>
    api.put<ApiResponse<{ user: User }>>('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse<{ token: string }>>('/auth/password', data),
};

// Materials API
export const materialsApi = {
  generate: (data: {
    imageUrl: string;
    type: 'flashcard' | 'quiz' | 'summary';
    subject?: string;
    topic?: string;
    language?: 'en' | 'es';
    options?: any;
  }) =>
    api.post<ApiResponse<{ material: StudyMaterial }>>('/materials/generate', data),

  getMaterials: (params?: {
    type?: 'flashcard' | 'quiz' | 'summary';
    subject?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) =>
    api.get<ApiResponse<{
      materials: StudyMaterial[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>>('/materials', { params }),

  getMaterial: (id: string) =>
    api.get<ApiResponse<{ material: StudyMaterial }>>(`/materials/${id}`),

  updateMaterial: (id: string, data: {
    title?: string;
    subject?: string;
    topic?: string;
    tags?: string[];
    isBookmarked?: boolean;
  }) =>
    api.put<ApiResponse<{ material: StudyMaterial }>>(`/materials/${id}`, data),

  updateProgress: (id: string, data: { completedItems: number }) =>
    api.put<ApiResponse<{ material: StudyMaterial }>>(`/materials/${id}/progress`, data),

  deleteMaterial: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/materials/${id}`),

  getSubjects: () =>
    api.get<ApiResponse<{ subjects: Record<string, any> }>>('/materials/subjects'),
};

// Upload API
export const uploadApi = {
  uploadImage: (formData: FormData) =>
    api.post<ApiResponse<{
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
      url: string;
    }>>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  uploadMultipleImages: (formData: FormData) =>
    api.post<ApiResponse<Array<{
      filename: string;
      originalName: string;
      mimetype: string;
      size: number;
      url: string;
    }>>>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteFile: (filename: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/upload/file/${filename}`),
};

// Wellness API
export const wellnessApi = {
  record: (data: {
    stressLevel: number;
    mood: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';
    activities?: string[];
    notes?: string;
    sleepQuality?: number;
    relaxationSession?: {
      type: 'breathing' | 'meditation' | 'guided-relaxation';
      duration: number;
      completed: boolean;
    };
  }) =>
    api.post<ApiResponse<{ record: WellnessRecord }>>('/wellness/record', data),

  getHistory: (params?: { days?: number }) =>
    api.get<ApiResponse<{ records: WellnessRecord[]; count: number }>>('/wellness/history', { params }),

  getTrends: (params?: { days?: number }) =>
    api.get<ApiResponse<{ trends: any }>>('/wellness/trends', { params }),

  getRelaxationContent: (params?: { type?: string }) =>
    api.get<ApiResponse<{ content: any }>>('/wellness/relaxation', { params }),

  getResources: () =>
    api.get<ApiResponse<{ resources: any[] }>>('/wellness/resources'),
};

// Progress API
export const progressApi = {
  recordSession: (data: {
    materialId: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    itemsCompleted?: number;
    itemsCorrect?: number;
    mood?: 'focused' | 'distracted' | 'tired' | 'energetic' | 'neutral';
    notes?: string;
  }) =>
    api.post<ApiResponse<{ session: StudySession }>>('/progress/sessions', data),

  getSessions: (params?: {
    startDate?: string;
    endDate?: string;
    materialId?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<ApiResponse<{
      sessions: StudySession[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>>('/progress/sessions', { params }),

  getStatistics: (params?: { days?: number }) =>
    api.get<ApiResponse<{ statistics: any; period: any }>>('/progress/statistics', { params }),

  getAchievements: () =>
    api.get<ApiResponse<{ achievements: Achievement[] }>>('/progress/achievements'),

  getGoals: (params?: { status?: 'active' | 'completed' }) =>
    api.get<ApiResponse<{ goals: Goal[] }>>('/progress/goals', { params }),

  createGoal: (data: {
    type: 'daily-study-time' | 'weekly-materials' | 'quiz-accuracy' | 'study-streak';
    title: string;
    targetValue: number;
    period?: 'daily' | 'weekly' | 'monthly';
    deadline?: Date;
  }) =>
    api.post<ApiResponse<{ goal: Goal }>>('/progress/goals', data),

  updateGoalProgress: (id: string, data: { currentValue?: number; completed?: boolean }) =>
    api.put<ApiResponse<{ goal: Goal }>>(`/progress/goals/${id}`, data),

  deleteGoal: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/progress/goals/${id}`),
};

export default api;