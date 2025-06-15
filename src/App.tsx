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

import { useEffect } from "react";
import i18n from "@/i18n/config";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { supabase } from "@/integrations/supabase/client";

// Utilitário para controle do onboarding por dispositivo
// Função centralizada foi movida para hooks/useOnboardingFlow.ts

const queryClient = new QueryClient();

function getInitialLanguage() {
  // Retorna a ordem correta de preferências
  const saved = localStorage.getItem("language");
  if (saved) return saved;
  // Usa idioma navegador como fallback
  const userLang = navigator.language;
  if (["pt-BR", "en-US", "es-ES"].includes(userLang)) return userLang;
  return "pt-BR";
}

function AppWrapper() {
  const onboarding = useOnboardingFlow();

  // Enquanto não determinar, não renderiza nada
  if (!onboarding.checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3EC] text-terra-700">
        <span className="animate-pulse text-lg">Carregando...</span>
      </div>
    );
  }

  if (onboarding.show) {
    // Renderiza OnboardingFlow e bloqueia navegação
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
    // Aguardar autenticação do usuário
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data?.user;
      let set = false;
      if (user?.id) {
        // Busca preferências do perfil Supabase
        const { data } = await supabase
          .from("profiles")
          .select("preferences")
          .eq("id", user.id)
          .maybeSingle();
        let prefs: any = {};
        if (data?.preferences) {
          if (typeof data.preferences === "object") prefs = data.preferences;
          else if (typeof data.preferences === "string") {
            try { prefs = JSON.parse(data.preferences); } catch { prefs = {}; }
          }
        }
        if (prefs.language) {
          i18n.changeLanguage(prefs.language);
          localStorage.setItem("language", prefs.language);
          set = true;
        }
      }
      // Caso não esteja autenticado ou não tenha uma preferência no Supabase:
      if (!set) {
        const lang = getInitialLanguage();
        i18n.changeLanguage(lang);
      }
    });
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
