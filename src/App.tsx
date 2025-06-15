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
import RequireAuth from "./features/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <TooltipProvider>
        <NavigationHistoryProvider>
          <Routes>
            {/* Rotas abertas */}
            <Route path="/onboarding" element={<OnboardingFlow />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NavigationHistoryProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
