import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { SkeletonLoader } from "./components/SkeletonLoader";

// Lazy load route components
const Index = lazy(() => import("./pages/Index"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const Categories = lazy(() => import("./pages/Categories"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<SkeletonLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/event/:slug" element={<EventDetail />} />
                <Route path="/category" element={<Categories />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;