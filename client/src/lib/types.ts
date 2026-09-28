// Diploma
export interface Diploma {
  id: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  durationMonths: number;
  requirementsAr?: string | null;
  requirementsEn?: string | null;
  curriculumAr?: string | null;
  curriculumEn?: string | null;
  objectivesAr?: string | null;
  objectivesEn?: string | null;
  outcomesAr?: string | null;
  outcomesEn?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  careerEnabled: boolean;
  careerOpportunitiesEn: string[];
  careerOpportunitiesAr: string[];
  advantagesEnabled: boolean;
  diplomaAdvantagesEn: string[];
  diplomaAdvantagesAr: string[];
  topStudentsRewardEnabled: boolean;
  topStudentsRewardEn: string[];
  topStudentsRewardAr: string[];

}

// Staff
export type StaffRole = "MANAGER" | "TEACHER";

export interface Staff {
  id: number;
  nameAr: string;
  nameEn: string;
  role: StaffRole;
  bioAr: string;
  bioEn: string;
  expertiseTags: string[];
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}



// Gallery
export interface GalleryItem {
  id: number;
  imageUrl: string;
  thumbnailUrl: string;
  captionAr: string;
  captionEn: string;
  category: string;
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

// Category
export interface Category {
  id: number;
  key: string;
  nameAr: string;
  nameEn: string;
  createdAt: string;
}

// Message
export interface Message {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalMessages: number;
  unreadMessages: number;
  totalDiplomas: number;
  totalStaff: number;
  totalGalleryItems: number;
}

// Contact Form
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Auth
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API Response
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
