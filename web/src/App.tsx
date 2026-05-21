import { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { GeneralProvider } from "./contexts/GeneralContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuestRoute } from "@/components/GuestRoute";
import { api } from "./lib/api";

// Core Public Pages
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import AboutUs from "./pages/AboutUs";
import { ProductListingPage } from "./pages/ProductListingPage";
import { FAQsPage } from "./pages/FAQsPage";
import { GuidePage } from "./pages/GuidePage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrdersPage from "./pages/OrdersPage";
import AccountPage from "./pages/AccountPage";
import NotFound from "./pages/NotFound";
import SetupPage from "./pages/SetupPage";
import ServerError from "./pages/ServerError";

// Admin System Views
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import ProductsPage from "./pages/admin/ProductsPage";
import OrdersAdminPage from "./pages/admin/OrdersAdminPage";
import SettingsPage from "./pages/admin/SettingsPage";
import UsersPage from "./pages/admin/UsersPage";
import AccountSettings from "./pages/admin/AccountSettings";
import WebsiteBuilder from "./pages/admin/website-builder/WebsiteBuilder";
import PageBuilder from "./pages/admin/page-builder/PageBuilder";
import PageEditor from "./pages/admin/page-builder/PageEditor";
import PageRenderer from "./pages/admin/page-builder/PageRender";
import EmailSubscriptionsAdminPage from "./pages/admin/EmailSubscriptions";

export default function App() {
  const [setupNeeded, setSetupNeeded] = useState<boolean | null>(null);
  const [showErrorPage, setShowErrorPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkIfSetupNeeded = useCallback(async () => {
    try {
      const data = await api.getSetupStatus();
      setSetupNeeded(!data.setup_complete);
      setShowErrorPage(false);
    } catch (error) {
      console.error(
        "Error checking setup status:",
        error instanceof Error ? error.message : String(error),
      );
      setShowErrorPage(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkIfSetupNeeded();
  }, [checkIfSetupNeeded]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-3 p-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-accent"></div>
          <span className="text-sm font-medium text-muted-foreground">
            Initializing system configuration...
          </span>
        </div>
      </div>
    );
  }

  if (showErrorPage) {
    return <ServerError />;
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
                      {/* Setup Complete Safeguard Redirect */}
                      <Route
                        path="/setup"
                        element={<Navigate to="/" replace />}
                      />

                      {/* Public Interfaces */}
                      <Route path="/" element={<Index />} />
                      <Route path="/faqs" element={<FAQsPage />} />
                      <Route path="/guide" element={<GuidePage />} />
                      <Route path="/about-us" element={<AboutUs />} />
                      <Route
                        path="/products"
                        element={<ProductListingPage />}
                      />
                      <Route path="/cart" element={<CartPage />} />
                      <Route
                        path="/category/:slug"
                        element={<CategoryPage />}
                      />
                      <Route path="/products/:slug" element={<ProductPage />} />

                      {/* Guest Management */}
                      <Route
                        path="/auth"
                        element={
                          <GuestRoute>
                            <AuthPage />
                          </GuestRoute>
                        }
                      />

                      {/* Authenticated Client Ecosystem */}
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

                      {/* Protected Backoffice Engine */}
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
                        <Route
                          path="email-subscriptions"
                          element={<EmailSubscriptionsAdminPage />}
                        />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="pages" element={<PageBuilder />} />
                        <Route
                          path="pages/:pageId/edit"
                          element={<PageEditor />}
                        />
                      </Route>

                      {/* CMS Render Core & Custom Route Engine */}
                      <Route path="/render" element={<PageRenderer />} />
                      <Route path="/:slug" element={<PageRenderer />} />
                      <Route
                        path="/:category/:slug"
                        element={<PageRenderer />}
                      />

                      {/* Universal Root Fallback */}
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
}
