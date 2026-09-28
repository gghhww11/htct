import { api } from './client';
import type {
  Diploma,
  Staff,
  GalleryItem,
  ContactFormData,
  DashboardStats,
  Message,
  User,
  Category,
} from '@/lib/types';

// ==================== PUBLIC API ====================

export const publicApi = {
  // Diplomas
  getDiplomas: () => api.get<Diploma[]>('/public/diplomas'),
  getDiplomaBySlug: (slug: string) => api.get<Diploma>(`/public/diplomas/${slug}`),
  
  // Staff
  getStaff: () => api.get<Staff[]>('/public/staff'),
  
  // Gallery
  getGallery: () => api.get<GalleryItem[]>('/public/gallery'),

  // Categories
  getCategories: () => api.get<Category[]>('/public/categories'),
  
  // Contact
  sendContact: (data: ContactFormData) => 
    api.post<{ message: string }>('/public/contact', data),

};

// ==================== AUTH API ====================

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ message: string }>('/auth/login', { email, password }),
  
  logout: () => api.post<{ message: string }>('/auth/logout'),
  
  check: () => api.get<{ user: User }>('/auth/check'),
  
  refresh: () => api.post<{ message: string }>('/auth/refresh'),
};

// ==================== ADMIN API ====================

export const adminApi = {
  // Dashboard
  getStats: () => api.get<DashboardStats>('/admin/stats'),
  
  // Diplomas
  getDiplomas: () => api.get<Diploma[]>('/admin/diplomas'),
  createDiploma: (data: Partial<Diploma>) =>
    api.post<Diploma>('/admin/diplomas', data),
  updateDiploma: (id: number, data: Partial<Diploma>) =>
    api.put<Diploma>(`/admin/diplomas/${id}`, data),
  deleteDiploma: (id: number) =>
    api.delete<{ message: string }>(`/admin/diplomas/${id}`),
  uploadDiplomaImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.upload<{ diploma: Diploma }>(`/admin/diplomas/${id}/image`, formData);
  },
  
  // Staff
  getStaff: () => api.get<Staff[]>('/admin/staff'),
  createStaff: (data: Partial<Staff>) =>
    api.post<Staff>('/admin/staff', data),
  updateStaff: (id: number, data: Partial<Staff>) =>
    api.put<Staff>(`/admin/staff/${id}`, data),
  deleteStaff: (id: number) =>
    api.delete<{ message: string }>(`/admin/staff/${id}`),
  uploadStaffImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.upload<{ staff: Staff }>(`/admin/staff/${id}/image`, formData);
  },
  
  // Gallery
  getGallery: () => api.get<GalleryItem[]>('/admin/gallery'),
  createGalleryItem: (file: File, data: { category: string; captionAr: string; captionEn: string }) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', data.category);
    formData.append('captionAr', data.captionAr);
    formData.append('captionEn', data.captionEn);
    return api.upload<GalleryItem>('/admin/gallery', formData);
  },
  updateGalleryItem: (id: number, data: { category: string; captionAr: string; captionEn: string }) =>
    api.put<GalleryItem>(`/admin/gallery/${id}`, data),
  deleteGalleryItem: (id: number) =>
    api.delete<{ message: string }>(`/admin/gallery/${id}`),

  // Categories
  getCategories: () => api.get<Category[]>('/admin/categories'),
  createCategory: (data: { key: string; nameAr: string; nameEn: string }) =>
    api.post("/admin/categories", data),
  deleteCategory: (id: number) =>
    api.delete<{ message?: string }>(`/admin/categories/${id}`),


  // Messages
  getMessages: () => api.get<Message[]>('/admin/messages'),
  updateMessageStatus: (id: number, isRead: boolean) =>
    api.patch<Message>(`/admin/messages/${id}`, { isRead }),
  deleteMessage: (id: number) =>
    api.delete<{ message?: string }>(`/admin/messages/${id}`),
  



};
