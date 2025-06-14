import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import ConciergePage from "./pages/ConciergePage";
import ActiveTripDetailsPage from "./pages/ActiveTripDetailsPage";
import NextTripsPage from "./pages/NextTripsPage";
import NewTripPage from "./pages/NewTripPage";
import DiscoveryPage from "./pages/DiscoveryPage";
import AddExpensePage from "./pages/AddExpensePage";
import FeedbackPage from "./pages/FeedbackPage";
import CommunityPage from "./pages/CommunityPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import React from "react";
import OnboardingFlow from "./features/onboarding/OnboardingFlow";
import AuthAccessScreen from "./features/auth/AuthAccessScreen";
import LoginScreen from "./features/auth/LoginScreen";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSupabaseAuth();
  const location = useLocation();

  if (loading) {
    return <div className="w-full flex justify-center items-center min-h-screen text-lg">Carregando...</div>;
  }
  if (!session) {
    // Redireciona para Auth e preserva o destino
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Onboarding and auth */}
          <Route path="/onboarding" element={<OnboardingFlow />} />
          <Route path="/auth/access" element={<AuthAccessScreen />} />
          <Route path="/auth/login" element={<LoginScreen />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/concierge"
            element={
              <ProtectedRoute>
                <ConciergePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/active"
            element={
              <ProtectedRoute>
                <ActiveTripDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips/upcoming"
            element={
              <ProtectedRoute>
                <NextTripsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/new"
            element={
              <ProtectedRoute>
                <NewTripPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discovery/:category"
            element={
              <ProtectedRoute>
                <DiscoveryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/add-expense"
            element={
              <ProtectedRoute>
                <AddExpensePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback/:placeId"
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            }
          />
          {/* Rotas customizadas acima */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
