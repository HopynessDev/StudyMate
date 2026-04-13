export interface User {
  id: string;
  username: string;
  email: string;
  language: 'en' | 'es';
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    studyReminders: boolean;
  };
}

export interface StudyMaterial {
  id: string;
  user: string;
  type: 'flashcard' | 'quiz' | 'summary';
  title: string;
  subject?: string;
  topic?: string;
  content: any;
  originalText?: string;
  imageUrl?: string;
  language: 'en' | 'es';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  metadata: {
    wordCount: number;
    estimatedStudyTime: number;
    aiGenerated: boolean;
  };
  progress: {
    totalItems: number;
    completedItems: number;
    lastStudiedAt?: Date;
    studyCount: number;
  };
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Summary {
  keyPoints: string[];
  explanation: string;
}

export interface WellnessRecord {
  id: string;
  user: string;
  stressLevel: number;
  mood: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';
  activities: string[];
  notes?: string;
  sleepQuality?: number;
  relaxationSession?: {
    type: 'breathing' | 'meditation' | 'guided-relaxation';
    duration: number;
    completed: boolean;
  };
  date: Date;
  createdAt: Date;
}

export interface StudySession {
  id: string;
  user: string;
  materialId: {
    _id: string;
    title: string;
    type: string;
    subject?: string;
  };
  startTime: Date;
  endTime: Date;
  duration: number;
  itemsCompleted?: number;
  itemsCorrect?: number;
  performance?: number;
  mood?: 'focused' | 'distracted' | 'tired' | 'energetic' | 'neutral';
  notes?: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  user: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  progress: number;
  target: number;
  completed: boolean;
}

export interface Goal {
  id: string;
  user: string;
  type: 'daily-study-time' | 'weekly-materials' | 'quiz-accuracy' | 'study-streak';
  title: string;
  targetValue: number;
  currentValue: number;
  period: 'daily' | 'weekly' | 'monthly';
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

export interface ApiResponse<T> {
  success: true;
  message?: string;
  data: T;
}