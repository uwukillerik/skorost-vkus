import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicOnlyRoute } from "@/components/PublicOnlyRoute";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderDetail from "./pages/OrderDetail";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Product from "./pages/Product";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCategories from "./pages/admin/Categories";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminOrderDetail from "./pages/admin/OrderDetail";
import { useScrollToTopOnNavigate } from "@/hooks/use-scroll-to-top";

const queryClient = new QueryClient();

function AppRoutes() {
  useScrollToTopOnNavigate();
  return (
            <Routes>
              <Route
                path="/"
                element={
                  <PublicOnlyRoute>
                    <Index />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/menu"
                element={
                  <PublicOnlyRoute>
                    <Menu />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/product/:slug"
                element={
                  <PublicOnlyRoute>
                    <Product />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/about"
                element={
                  <PublicOnlyRoute>
                    <About />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/contact"
                element={
                  <PublicOnlyRoute>
                    <Contact />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <PublicOnlyRoute>
                    <Cart />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <PublicOnlyRoute>
                    <Checkout />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/order/:id"
                element={
                  <PublicOnlyRoute>
                    <OrderDetail />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" richColors />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
