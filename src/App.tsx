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
import LogoProcessorPage from "./pages/LogoProcessorPage";
import { NavigationHistoryProvider } from "@/contexts/NavigationHistoryContext";
import PlaceDetailsPage from "./pages/PlaceDetailsPage";
import RequireAuth from "./features/auth/RequireAuth";
import GuestOrAuthRoute from "./features/auth/GuestOrAuthRoute";
import PoliciesPage from "./pages/PoliciesPage";
import SettingsPage from "./pages/SettingsPage";
import "./i18n/config";

import { useEffect } from "react";
import i18n from "@/i18n/config";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function getInitialLanguage() {
  const saved = localStorage.getItem("language");
  if (saved) return saved;
  const userLang = navigator.language;
  if (["pt-BR", "en-US", "es-ES"].includes(userLang)) return userLang;
  return "pt-BR";
}

function AppWrapper() {
  const onboarding = useOnboardingFlow();

  // Debug logs temporários
  console.log("[App] Deploy Debug - AppWrapper carregado em:", new Date().toISOString());
  console.log("[App] Deploy Debug - Onboarding status:", { 
    checked: onboarding.checked, 
    show: onboarding.show 
  });

  if (!onboarding.checked) {
    console.log("[App] Deploy Debug - Aguardando verificação de onboarding");
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF3EC] text-terra-700">
        <span className="animate-pulse text-lg">Carregando...</span>
      </div>
    );
  }

  if (onboarding.show) {
    console.log("[App] Deploy Debug - Mostrando onboarding");
    return <OnboardingFlow onFinish={onboarding.finishOnboarding} />;
  }

  console.log("[App] Deploy Debug - Renderizando rotas principais");

  return (
    <TooltipProvider>
      <NavigationHistoryProvider>
        <Routes>
          <Route path="/onboarding" element={<OnboardingFlow onFinish={onboarding.finishOnboarding} />} />
          <Route path="/auth/access" element={<AuthAccessScreen />} />
          <Route path="/auth/signup" element={<SignupScreen />} />
          <Route path="/auth/login" element={<LoginScreen />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Rota principal que permite tanto usuários autenticados quanto convidados */}
          <Route
            path="/"
            element={
              <GuestOrAuthRoute>
                <Index />
              </GuestOrAuthRoute>
            }
          />
          
          {/* Nova rota para prompt de nova viagem */}
          <Route path="/new-trip" element={<NewTripAuthPrompt />} />
          
          {/* Rota do processador de logo - deploy forçado */}
          <Route path="/logo-processor" element={<LogoProcessorPage />} />
          
          {/* Rotas que permitem modo convidado */}
          <Route
            path="/concierge"
            element={
              <GuestOrAuthRoute>
                <ConciergePage />
              </GuestOrAuthRoute>
            }
          />
          <Route
            path="/discovery/:category"
            element={
              <GuestOrAuthRoute>
                <DiscoveryPage />
              </GuestOrAuthRoute>
            }
          />
          <Route
            path="/place/:placeId"
            element={
              <GuestOrAuthRoute>
                <PlaceDetailsPage />
              </GuestOrAuthRoute>
            }
          />
          <Route
            path="/community"
            element={
              <GuestOrAuthRoute>
                <CommunityPage />
              </GuestOrAuthRoute>
            }
          />

          {/* Rotas que realmente precisam de autenticação */}
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
  );
}

const App = () => {
  console.log("[App] Deploy Debug - App component iniciado em:", new Date().toISOString());

  useEffect(() => {
    console.log("[App] Deploy Debug - useEffect iniciado, verificando usuário e idioma");
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data?.user;
      console.log("[App] Deploy Debug - Usuário obtido:", !!user);
      let set = false;
      if (user?.id) {
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
      if (!set) {
        const lang = getInitialLanguage();
        i18n.changeLanguage(lang);
      }
      console.log("[App] Deploy Debug - Idioma configurado");
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
