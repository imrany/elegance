import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuestRoute } from "@/components/GuestRoute";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductsPage from "./pages/admin/ProductsPage";
import OrdersAdminPage from "./pages/admin/OrdersAdminPage";
import SettingsPage from "./pages/admin/SettingsPage";
import NotFound from "./pages/NotFound";
import SetupPage from "./pages/SetupPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import AccountSettings from "./pages/admin/AccountSettings";
import OrdersPage from "./pages/OrdersPage";
import { useEffect, useState } from "react";
import { api } from "./lib/api";
import UsersPage from "./pages/admin/UsersPage";
import AccountPage from "./pages/AccountPage";
import WebsiteBuilder from "./pages/admin/website-builder/WebsiteBuilder";
import { GeneralProvider } from "./contexts/GeneralContext";
import AboutUs from "./pages/AboutUs";
import { ProductListingPage } from "./pages/ProductListingPage";
import { FAQsPage } from "./pages/FAQsPage";
import { GuidePage } from "./pages/GuidePage";
import PageBuilder from "./pages/admin/page-builder/PageBuilder";
import PageEditor from "./pages/admin/page-builder/PageEditor";
import PageRenderer from "./pages/admin/page-builder/PageRender";

const App = () => {
  const [setupNeeded, setSetupNeeded] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkIfSetupNeeded();
  }, []);

  const checkIfSetupNeeded = async () => {
    try {
      const data = await api.getSetupStatus();
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
    <GeneralProvider>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
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

                      {/* Public Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/faqs" element={<FAQsPage />} />
                      <Route path="/guide" element={<GuidePage />} />
                      <Route path="/about-us" element={<AboutUs />} />
                      <Route
                        path="/products"
                        element={<ProductListingPage />}
                      />
                      <Route
                        path="/category/:slug"
                        element={<CategoryPage />}
                      />
                      <Route path="/products/:slug" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />

                      {/* Home page - uses PageRenderer with slug="/" */}
                      <Route path="/render" element={<PageRenderer />} />
                      {/* Dynamic pages - catches all other routes */}
                      <Route path="/render/:slug" element={<PageRenderer />} />
                      {/* Nested page routes if needed */}
                      <Route
                        path="/render/:category/:slug"
                        element={<PageRenderer />}
                      />

                      {/* Guest Only Routes (redirect to home if logged in) */}
                      <Route
                        path="/auth"
                        element={
                          <GuestRoute>
                            <AuthPage />
                          </GuestRoute>
                        }
                      />

                      {/* Protected Customer Routes (require login) */}
                      <Route
                        path="/account"
                        element={
                          <ProtectedRoute>
                            <AccountPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute>
                            <CheckoutPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/orders"
                        element={
                          <ProtectedRoute>
                            <OrdersPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/order-confirmation/:orderId"
                        element={
                          <ProtectedRoute>
                            <OrderConfirmationPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Routes (require admin role) */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminLayout />
                          </ProtectedRoute>
                        }
                      >
                        <Route index element={<DashboardPage />} />
                        <Route path="products" element={<ProductsPage />} />
                        <Route path="orders" element={<OrdersAdminPage />} />
                        <Route
                          path="website-builder"
                          element={<WebsiteBuilder />}
                        />
                        <Route path="users" element={<UsersPage />} />
                        <Route path="account" element={<AccountSettings />} />
                        <Route path="settings" element={<SettingsPage />} />
                        {/* Page Builder Routes */}
                        <Route path="pages" element={<PageBuilder />} />
                        <Route
                          path="pages/:pageId/edit"
                          element={<PageEditor />}
                        />
                      </Route>

                      {/* Catch-all 404 */}
                      <Route path="*" element={<NotFound />} />
                    </>
                  )}
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </GeneralProvider>
  );
};

export default App;
