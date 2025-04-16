
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NotebookProvider } from "@/contexts/NotebookContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";

// Lazy-loaded components for code splitting - using direct imports for critical components
// that were causing issues with dynamic imports
const Index = lazy(() => import("./pages/Index"));
const Settings = lazy(() => import("./pages/Settings"));
const NotePage = lazy(() => import("./pages/NotePage"));
const AllNotesPage = lazy(() => import("./pages/AllNotesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WelcomePage = lazy(() => import("./pages/WelcomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const SharedNotePage = lazy(() => import("./pages/SharedNotePage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Component to handle public routes with Supabase readiness check
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isSupabaseReady } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  // Always show the children for public routes, even if Supabase isn't configured
  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <NotebookProvider>
              <NotesProvider>
                <ThemeProvider>
                  <Toaster />
                  <Sonner />
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/welcome" element={<PublicRoute><WelcomePage /></PublicRoute>} />
                      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
                      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                      <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
                      <Route path="/shared-note/:noteId" element={<PublicRoute><SharedNotePage /></PublicRoute>} />
                      
                      {/* Protected routes */}
                      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                      <Route path="/note/:noteId" element={<ProtectedRoute><NotePage /></ProtectedRoute>} />
                      <Route path="/notes" element={<ProtectedRoute><AllNotesPage /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                      
                      {/* Redirect from root to welcome if not authenticated */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ThemeProvider>
              </NotesProvider>
            </NotebookProvider>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
