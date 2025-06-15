
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { NavigationHistoryProvider } from "@/contexts/NavigationHistoryContext";
import PlaceDetailsPage from "./pages/PlaceDetailsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <TooltipProvider>
        <NavigationHistoryProvider>
          <Routes>
            {/* Onboarding and auth */}
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/auth/access" element={<AuthAccessScreen />} />
            <Route path="/auth/signup" element={<SignupScreen />} />
            <Route path="/auth/login" element={<LoginScreen />} />
            <Route path="/auth" element={<AuthPage />} />
            {/* Rotas principais agora SEM ProtectedRoute */}
            <Route path="/" element={<Index />} />
            <Route path="/concierge" element={<ConciergePage />} />
            <Route path="/trip/active" element={<ActiveTripDetailsPage />} />
            <Route path="/trips/upcoming" element={<NextTripsPage />} />
            <Route path="/trip/new" element={<NewTripPage />} />
            <Route path="/discovery/:category" element={<DiscoveryPage />} />
            <Route path="/trip/add-expense" element={<AddExpensePage />} />
            <Route path="/feedback/:placeId" element={<FeedbackPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/profile/edit" element={<EditProfileScreen />} />
            {/* Rotas customizadas acima */}
            <Route path="/place/:placeId" element={<PlaceDetailsPage />} />
            <Route path="/trip/summary" element={<TripSummaryPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NavigationHistoryProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
