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
import Support from "./pages/Support";

// Lazy loaded pages to keep bundle small
const Purchase = lazy(() => import("./pages/Purchase").catch(() => ({ default: () => <div className="p-20 text-center">Page missing or loading...</div> })));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess").catch(() => ({ default: () => <div className="p-20 text-center">Page missing or loading...</div> })));
const Auth = lazy(() => import("./pages/Auth").catch(() => ({ default: () => <div className="p-20 text-center">Page missing or loading...</div> })));
const Orders = lazy(() => import("./pages/Orders").catch(() => ({ default: () => <div className="p-20 text-center">Page missing or loading...</div> })));
const CompatibilityPage = lazy(() => import("./pages/CompatibilityPage").catch(() => ({ default: () => <div className="p-20 text-center">Page missing or loading...</div> })));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage").catch(() => ({ default: () => <div className="p-20 text-center">Page missing or loading...</div> })));
const NotFound = lazy(() => import("./pages/NotFound").catch(() => ({ default: () => <div className="p-20 text-center">404 Not Found</div> })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").catch(() => ({ default: () => <div className="p-20 text-center">Page missing or loading...</div> })));
const ESim = lazy(() => import("./pages/ESim").catch(() => ({ default: () => <div className="p-20 text-center">Page missing or loading...</div> })));
const Community = lazy(() => import("./pages/Community").catch(() => ({ default: () => <div className="p-20 text-center">Page missing or loading...</div> })));
const Countries = lazy(() => import("./pages/Countries").catch(() => ({ default: () => <div className="p-20 text-center">Page missing or loading...</div> })));

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
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-palop-green/20 border-t-palop-green rounded-full animate-spin"></div>
      <div className="mt-4 text-palop-dark font-display font-medium tracking-wider">LOADING</div>
    </div>
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
