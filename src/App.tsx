
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/concierge" element={<ConciergePage />} />
          <Route path="/trip/active" element={<ActiveTripDetailsPage />} />
          <Route path="/trips/upcoming" element={<NextTripsPage />} />
          <Route path="/trip/new" element={<NewTripPage />} />
          <Route path="/discovery/:category" element={<DiscoveryPage />} />
          <Route path="/trip/add-expense" element={<AddExpensePage />} />
          <Route path="/feedback/:placeId" element={<FeedbackPage />} />
          <Route path="/community" element={<CommunityPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
