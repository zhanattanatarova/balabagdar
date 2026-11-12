import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/useLanguage";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Index from "./pages/Index";
import ClubDetailPage from "./pages/ClubDetailPage";
import AdminPage from "./pages/AdminPage";
import LegalPage from "./pages/LegalPage";
import NotFound from "./pages/NotFound";
import FavoritesPage from "./pages/FavoritesPage";
import HistoryPage from "./pages/HistoryPage";
import SearchPage from "./pages/SearchPage";
import SecurityPage from "./pages/SecurityPage";
import PublicationPage from "./pages/PublicationPage";
import CollectionsPage from "./pages/sections/CollectionsPage";
import HolidaysPage from "./pages/sections/HolidaysPage";
import DealsPage from "./pages/sections/DealsPage";
import BlogPage from "./pages/sections/BlogPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SiteHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/map" element={<Index />} />
            <Route path="/clubs" element={<Index />} />
            <Route path="/news" element={<Navigate to="/" replace />} />
            <Route path="/board" element={<Index />} />
            <Route path="/publication/:id" element={<PublicationPage />} />
            <Route path="/profile" element={<Index />} />
            <Route path="/notifications" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/club/edit" element={<Index />} />
            <Route path="/club/:id" element={<ClubDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:slug" element={<CollectionsPage />} />
            <Route path="/holidays" element={<HolidaysPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SiteFooter />
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
