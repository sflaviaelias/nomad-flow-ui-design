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
import OnboardingFlow from "./features/onboarding/OnboardingFlow";
import AuthAccessScreen from "./features/auth/AuthAccessScreen";
import LoginScreen from "./features/auth/LoginScreen";
import SignupScreen from "./features/auth/SignupScreen";
import ProfileScreen from "./features/profile/ProfileScreen";
import EditProfileScreen from "./features/profile/EditProfileScreen";
import TripSummaryPage from "./pages/TripSummaryPage";
import TripSmartSummaryPage from "./pages/TripSmartSummaryPage";
import { NavigationHistoryProvider } from "@/contexts/NavigationHistoryContext";
import PlaceDetailsPage from "./pages/PlaceDetailsPage";
import RequireAuth from "./features/auth/RequireAuth";
import PoliciesPage from "./pages/PoliciesPage";
import SettingsPage from "./pages/SettingsPage";
import "./i18n/config";

import { useEffect, useState } from "react";
import i18n from "@/i18n/config";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

// Utilitário centralizado para onboarding (com localStorage)
function useShouldShowOnboarding() {
  const { user, loading } = useSupabaseAuth();
  const [checked, setChecked] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Onboarding já feito nesse dispositivo
    const onboardingDone = localStorage.getItem("onboarding_done") === "1";

    // Só mostra onboarding se não autenticado e ainda não exibiu onboarding nesse device
    if (!user && !onboardingDone) {
      setShow(true);
    } else {
      setShow(false);
    }
    setChecked(true);
  }, [user, loading]);

  // Função para marcar como feito (chamada ao finalizar onboarding)
  const finishOnboarding = () => {
    localStorage.setItem("onboarding_done", "1");
    setShow(false);
  };

  return { show, checked, finishOnboarding };
}

const queryClient = new QueryClient();

function AppWrapper() {
  const onboarding = useShouldShowOnboarding();

  // Enquanto não checou, não renderiza para evitar flicker
  if (!onboarding.checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3EC] text-terra-700">
        <span className="animate-pulse text-lg">Carregando...</span>
      </div>
    );
  }

  if (onboarding.show) {
    // Renderiza diretamente o onboarding
    return <OnboardingFlow onFinish={onboarding.finishOnboarding} />;
  }

  return (
    <BrowserRouter>
      <TooltipProvider>
        <NavigationHistoryProvider>
          <Routes>
            {/* Mantém rota onboarding acessível, mas fluxo é controlado no App */}
            <Route path="/onboarding" element={<OnboardingFlow onFinish={onboarding.finishOnboarding} />} />
            {/* Rotas abertas */}
            <Route path="/auth/access" element={<AuthAccessScreen />} />
            <Route path="/auth/signup" element={<SignupScreen />} />
            <Route path="/auth/login" element={<LoginScreen />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Rotas privadas (precisam de login) */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Index />
                </RequireAuth>
              }
            />
            <Route
              path="/concierge"
              element={
                <RequireAuth>
                  <ConciergePage />
                </RequireAuth>
              }
            />
            <Route
              path="/trip/active"
              element={
                <RequireAuth>
                  <ActiveTripDetailsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/trips/upcoming"
              element={
                <RequireAuth>
                  <NextTripsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/trip/new"
              element={
                <RequireAuth>
                  <NewTripPage />
                </RequireAuth>
              }
            />
            <Route
              path="/discovery/:category"
              element={
                <RequireAuth>
                  <DiscoveryPage />
                </RequireAuth>
              }
            />
            <Route
              path="/trip/add-expense"
              element={
                <RequireAuth>
                  <AddExpensePage />
                </RequireAuth>
              }
            />
            <Route
              path="/feedback/:placeId"
              element={
                <RequireAuth>
                  <FeedbackPage />
                </RequireAuth>
              }
            />
            <Route
              path="/community"
              element={
                <RequireAuth>
                  <CommunityPage />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfileScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <RequireAuth>
                  <EditProfileScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/place/:placeId"
              element={
                <RequireAuth>
                  <PlaceDetailsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/trip/summary"
              element={
                <RequireAuth>
                  <TripSummaryPage />
                </RequireAuth>
              }
            />
            <Route
              path="/trip/smart-summary"
              element={
                <RequireAuth>
                  <TripSmartSummaryPage />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <SettingsPage />
                </RequireAuth>
              }
            />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NavigationHistoryProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

const App = () => {
  useEffect(() => {
    // detect browser language if no saved user preference
    const userLang = localStorage.getItem("language") || navigator.language;
    if (["pt-BR", "en-US", "es-ES"].includes(userLang)) {
      i18n.changeLanguage(userLang);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <AppWrapper />
    </QueryClientProvider>
  );
};

export default App;
