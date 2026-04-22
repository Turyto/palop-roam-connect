
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { LanguageProvider } from "@/contexts/language";
import { lazy, Suspense } from "react";

// Eagerly loaded — active customer funnel pages
import Index from "./pages/Index";
import Plans from "./pages/Plans";
import Purchase from "./pages/Purchase";
import OrderSuccess from "./pages/OrderSuccess";
import Support from "./pages/Support";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import CompatibilityPage from "./pages/CompatibilityPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotFound from "./pages/NotFound";

// Lazy loaded — admin: keeps recharts + all admin components out of customer bundle
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Lazy loaded — legacy/orphaned pages: keeps mapbox-gl + old content out of initial bundle
const ESim = lazy(() => import("./pages/ESim"));
const Community = lazy(() => import("./pages/Community"));
const Countries = lazy(() => import("./pages/Countries"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-lg">Loading...</div>
  </div>
);

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
    <Route path="/compatibility" element={<CompatibilityPage />} />
    <Route path="/how-it-works" element={<HowItWorksPage />} />
    <Route path="/success" element={<OrderSuccess />} />
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
