
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { LanguageProvider } from "@/contexts/language";
import { Suspense } from "react";
import Index from "./pages/Index";
import Plans from "./pages/Plans";
import ESim from "./pages/ESim";
import Purchase from "./pages/Purchase";
import Community from "./pages/Community";
import Countries from "./pages/Countries";
import Support from "./pages/Support";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

// Create QueryClient with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Error Boundary Component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('App Error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600">Something went wrong</h1>
          <p className="text-gray-600 mt-2">Please refresh the page</p>
        </div>
      </div>
    );
  }
};

// Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-lg">Loading...</div>
  </div>
);

// App Routes Component
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/plans" element={<Plans />} />
    <Route path="/esim" element={<ESim />} />
    <Route path="/purchase" element={<Purchase />} />
    <Route path="/community" element={<Community />} />
    <Route path="/countries" element={<Countries />} />
    <Route path="/support" element={<Support />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <TooltipProvider>
                <Suspense fallback={<LoadingFallback />}>
                  <AppRoutes />
                </Suspense>
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
