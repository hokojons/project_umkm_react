import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Store,
  ShoppingCart,
  User as UserIcon,
  Settings,
  LogOut,
  Award,
  PlusCircle,
  Package,
  UserCircle,
  Moon,
  Sun,
  Home,
  Calendar,
  Menu,
  X,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  onCartClick: () => void;
  onLoginClick: () => void;
  onAdminClick: () => void;
  onSubmitClick: () => void;
  onRoleUpgradeClick: () => void;
  onUMKMDashboardClick: () => void;
  onOrderHistoryClick: () => void;
  onProfileClick: () => void;
  onStatusCheckClick?: () => void; // New prop for status check
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({
  onCartClick,
  onLoginClick,
  onAdminClick,
  onSubmitClick,
  onRoleUpgradeClick,
  onUMKMDashboardClick,
  onOrderHistoryClick,
  onProfileClick,
  onStatusCheckClick,
  isDarkMode,
  onToggleDarkMode,
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { getTotalItems } = useCart();
  const { user, signOut, refreshUser } = useAuth();
  const location = useLocation();

  const handleSignOut = () => {
    signOut();
    setShowUserMenu(false);
  };

  const handleRefreshProfile = async () => {
    if (refreshUser && !refreshing) {
      setRefreshing(true);
      try {
        await refreshUser();
      } finally {
        setRefreshing(false);
      }
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: Home },
    { path: "/products", label: "Produk", icon: Store },
    { path: "/events", label: "Event", icon: Calendar },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-xl shadow-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Pasar UMKM
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Dukung Produk Lokal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(link.path)
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-orange-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <UserIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {user.nama_lengkap || user.no_telepon}
                  </span>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="font-medium text-gray-800 dark:text-white">
                          {user.nama_lengkap || "User"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.no_telepon}
                        </div>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full">
                            <Award className="w-3 h-3" />
                            {user.role || "customer"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onProfileClick();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                      >
                        <UserCircle className="w-4 h-4" />
                        Profil Saya
                      </button>

                      <button
                        onClick={handleRefreshProfile}
                        disabled={refreshing}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Memperbarui...' : 'Perbarui Profil'}
                      </button>

                      <button
                        onClick={() => {
                          onOrderHistoryClick();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                      >
                        <Package className="w-4 h-4" />
                        Riwayat Pesanan
                      </button>

                      {user.role === "admin" && (
                        <button
                          onClick={() => {
                            onAdminClick();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </button>
                      )}

                      {user.role === "umkm_owner" && (
                        <button
                          onClick={() => {
                            onUMKMDashboardClick();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                        >
                          <Store className="w-4 h-4" />
                          Dashboard UMKM
                        </button>
                      )}

                      {/* Upgrade ke UMKM - hanya untuk customer */}
                      {user.role === "customer" && (
                        <button
                          onClick={() => {
                            onRoleUpgradeClick();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                        >
                          <Award className="w-4 h-4" />
                          Upgrade ke UMKM
                        </button>
                      )}

                      {/* Tombol Daftarkan Bisnis - hanya untuk umkm_owner */}
                      {user.role === "umkm_owner" && (
                        <>
                          <button
                            onClick={() => {
                              onSubmitClick();
                              setShowUserMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Daftarkan Bisnis
                          </button>
                          
                          {/* Check Status Button */}
                          {onStatusCheckClick && (
                            <button
                              onClick={() => {
                                onStatusCheckClick();
                                setShowUserMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                              Cek Status Pengajuan
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-red-600 dark:text-red-400 border-t border-gray-200 dark:border-gray-700 mt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="hidden md:flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <UserIcon className="w-4 h-4" />
                Masuk
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}

              {!user && (
                <button
                  onClick={() => {
                    onLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold"
                >
                  <UserIcon className="w-5 h-5" />
                  Masuk
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
