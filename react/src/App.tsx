import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { EventsPage } from "./pages/EventsPage";
import { PaketPage } from "./pages/PaketPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { UmkmListPage } from "./pages/UmkmListPage";
import { UMKMDetailPage } from "./pages/UMKMDetailPage";
import { AdminUmkmDetailPage } from "./pages/AdminUmkmDetailPage";
import { UMKMOrdersPage } from "./pages/UMKMOrdersPage";
import { UMKMDashboardPage } from "./pages/UMKMDashboardPage";
import NotificationsPage from "./pages/NotificationsPage";
import { CartSidebarGrouped } from "./components/CartSidebarGrouped";
import { LoginModal } from "./components/LoginModal";
import { AdminPanel } from "./components/AdminPanel";
// import { AdminPanel } from "./components/AdminPanelDebug";
import { SubmitBusinessModal } from "./components/SubmitBusinessModal";
import RoleUpgradeModal from "./components/RoleUpgradeModal";
import { ProfileModal } from "./components/ProfileModal";
import { UmkmStatusModal } from "./components/UmkmStatusModal";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isRoleUpgradeOpen, setIsRoleUpgradeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStatusCheckOpen, setIsStatusCheckOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("pasar_umkm_dark_mode");
    if (savedDarkMode === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Listen for open-login-modal event (triggered from CartContext when user not logged in)
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginOpen(true);
    };

    window.addEventListener("open-login-modal", handleOpenLoginModal);
    return () => {
      window.removeEventListener("open-login-modal", handleOpenLoginModal);
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("pasar_umkm_dark_mode", newDarkMode.toString());

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Toaster position="top-center" richColors />

      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        onSubmitClick={() => setIsSubmitOpen(true)}
        onRoleUpgradeClick={() => setIsRoleUpgradeOpen(true)}
        onUMKMDashboardClick={() => navigate('/umkm-dashboard')}
        onUMKMOrdersClick={() => navigate('/umkm-orders')}
        onProfileClick={() => setIsProfileOpen(true)}
        onStatusCheckClick={() => setIsStatusCheckOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/paket" element={<PaketPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/umkm" element={<UmkmListPage />} />
        <Route path="/umkm/:id" element={<UMKMDetailPage />} />
        <Route path="/admin/umkm/:id" element={<AdminUmkmDetailPage />} />
        <Route path="/umkm-orders" element={<UMKMOrdersPage />} />
        <Route path="/umkm-dashboard" element={<UMKMDashboardPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>

      {/* Global Modals */}
      <CartSidebarGrouped isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {user && (
        <>
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            onDataUpdate={() => { }}
          />
          <SubmitBusinessModal
            isOpen={isSubmitOpen}
            onClose={() => setIsSubmitOpen(false)}
          />
          <RoleUpgradeModal
            isOpen={isRoleUpgradeOpen}
            onClose={() => setIsRoleUpgradeOpen(false)}
          />
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />
          <UmkmStatusModal
            isOpen={isStatusCheckOpen}
            onClose={() => setIsStatusCheckOpen(false)}
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SiteSettingsProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
