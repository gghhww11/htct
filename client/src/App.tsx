import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import "@/i18n";

// Public Pages
import {
  HomePage,
  DiplomasPage,
  DiplomaDetailsPage,
  StaffPage,
  GalleryPage,
  AboutPage,
  ContactPage,
} from "@/pages";
import NotFound from "@/pages/NotFound";

// Admin Pages
import { ProtectedRoute } from "@/admin/components";
import {
  AdminLoginPage,
  AdminDashboardPage,
  AdminDiplomasPage,
  AdminDiplomaEditPage,
  AdminStaffPage,
  AdminStaffEditPage,
  AdminGalleryPage,
  AdminMessagesPage,
} from "@/admin/pages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
      refetchOnReconnect: true,

      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/diplomas" element={<DiplomasPage />} />
            <Route path="/diplomas/:slug" element={<DiplomaDetailsPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/diplomas"
              element={
                <ProtectedRoute>
                  <AdminDiplomasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/diplomas/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminDiplomaEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute>
                  <AdminStaffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminStaffEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute>
                  <AdminGalleryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute>
                  <AdminMessagesPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
