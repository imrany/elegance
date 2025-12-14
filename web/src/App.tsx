import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductsPage from "./pages/admin/ProductsPage";
import OrdersPage from "./pages/admin/OrdersPage";
import SettingsPage from "./pages/admin/SettingsPage";
import NotFound from "./pages/NotFound";
import SetupPage from "./pages/SetupPage";
import { useEffect, useState } from "react";
import { api } from "./lib/api";

const queryClient = new QueryClient();

const App = () => {
  const [setupNeeded, setSetupNeeded] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkIfSetupNeeded();
  }, []);

  const checkIfSetupNeeded = async () => {
    try {
      const { data } = await api.getSetupStatus();
      setSetupNeeded(!data.setup_complete);
    } catch (error) {
      console.error("Error checking setup status:", error);
      setSetupNeeded(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking setup status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent-50 to-accent-100">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-accent"></div>
          <span className="text-lg text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner closeButton={true} theme="light" />
            <BrowserRouter>
              <Routes>
                {/* If setup is needed, redirect all routes to setup */}
                {setupNeeded ? (
                  <>
                    <Route path="/setup" element={<SetupPage />} />
                    <Route
                      path="*"
                      element={<Navigate to="/setup" replace />}
                    />
                  </>
                ) : (
                  <>
                    {/* Setup complete - normal routes */}
                    <Route
                      path="/setup"
                      element={<Navigate to="/" replace />}
                    />
                    <Route path="/" element={<Index />} />
                    <Route path="/category/:slug" element={<CategoryPage />} />
                    <Route path="/product/:slug" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/auth" element={<AuthPage />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="orders" element={<OrdersPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    {/* Catch-all 404 */}
                    <Route path="*" element={<NotFound />} />
                  </>
                )}
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
