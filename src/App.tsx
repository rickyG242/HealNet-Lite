
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useGeocodeWorker } from "@/hooks/useGeocodeWorker";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RegisterChoice from "./pages/RegisterChoice";
import OrganizationRegister from "./pages/OrganizationRegister";
import DonorRegister from "./pages/DonorRegister";
import Dashboard from "./pages/Dashboard";
import DonationMatches from "./pages/DonationMatches";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Start the geocoding worker
  useGeocodeWorker(process.env.NODE_ENV === 'production');
  
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterChoice />} />
            <Route path="/register/organization" element={<OrganizationRegister />} />
            <Route path="/register/donor" element={<DonorRegister />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/donations/:donationId/matches" 
              element={
                <ProtectedRoute>
                  <DonationMatches />
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
};

export default App;
