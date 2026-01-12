import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { EventsPage } from "./pages/EventsPage";
import { CartSidebar } from "./components/CartSidebar";
import { UMKMDashboard } from "./components/UMKMDashboard";
import { LoginModal } from "./components/LoginModal";
import { AdminPanel } from "./components/AdminPanel";
// import { AdminPanel } from "./components/AdminPanelDebug";
import { SubmitBusinessModal } from "./components/SubmitBusinessModal";
import RoleUpgradeModal from "./components/RoleUpgradeModal";
import { OrderHistoryModal } from "./components/OrderHistoryModal";
import { ProfileModal } from "./components/ProfileModal";
import { UmkmStatusModal } from "./components/UmkmStatusModal";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isRoleUpgradeOpen, setIsRoleUpgradeOpen] = useState(false);
  const [isUMKMDashboardOpen, setIsUMKMDashboardOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStatusCheckOpen, setIsStatusCheckOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user } = useAuth();

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("pasar_umkm_dark_mode");
    if (savedDarkMode === "true") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Toaster position="top-center" richColors />
      
      <Navbar
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setIsLoginOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        onSubmitClick={() => setIsSubmitOpen(true)}
        onRoleUpgradeClick={() => setIsRoleUpgradeOpen(true)}
        onUMKMDashboardClick={() => setIsUMKMDashboardOpen(true)}
        onOrderHistoryClick={() => setIsOrderHistoryOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
        onStatusCheckClick={() => setIsStatusCheckOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/events" element={<EventsPage />} />
      </Routes>

      {/* Global Modals */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {user && (
        <>
          <AdminPanel
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
            onDataUpdate={() => {}}
          />
          <SubmitBusinessModal
            isOpen={isSubmitOpen}
            onClose={() => setIsSubmitOpen(false)}
          />
          <RoleUpgradeModal
            isOpen={isRoleUpgradeOpen}
            onClose={() => setIsRoleUpgradeOpen(false)}
          />
          <UMKMDashboard
            isOpen={isUMKMDashboardOpen}
            onClose={() => setIsUMKMDashboardOpen(false)}
            onDataUpdate={() => {}}
          />
          <OrderHistoryModal
            isOpen={isOrderHistoryOpen}
            onClose={() => setIsOrderHistoryOpen(false)}
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
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
