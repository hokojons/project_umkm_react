import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { API_CONFIG } from "../config/api";
import { apiClient } from "../services/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer" | "umkm_owner";
  nama_lengkap?: string;
  no_telepon?: string;
  status?: string;
  wa_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role?: "admin" | "customer" | "umkm_owner"
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("pasar_umkm_current_user");
    const savedToken = localStorage.getItem("pasar_umkm_access_token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
    }

    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting login for:", email);

      // Use axios instead of fetch for better HTTP/2 support
      const response = await apiClient.post("/auth/login", {
        credential: email,
        password: password,
      });

      console.log("Login response status:", response.status);
      console.log("Login response data:", response.data);

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Login gagal");
      }

      // Extract user info from response
      const newUser: User = {
        id: data.data.id || `user_${Date.now()}`,
        email: data.data.email || email,
        name: data.data.nama_lengkap || data.data.nama || data.data.name || email,
        role: data.data.role || "customer",
        nama_lengkap: data.data.nama_lengkap,
        no_telepon: data.data.no_telepon,
        status: data.data.status,
        wa_verified: data.data.wa_verified,
      };

      const token =
        data.data.token ||
        `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log("Login successful, user:", newUser);

      setUser(newUser);
      setAccessToken(token);

      localStorage.setItem("pasar_umkm_current_user", JSON.stringify(newUser));
      localStorage.setItem("pasar_umkm_access_token", token);
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat login";
      throw new Error(errorMessage);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role?: "admin" | "user" | "umkm"
  ) => {
    try {
      // Call Laravel API for registration
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "USER_" + Date.now(),
          nama: name,
          email: email,
          telepon: email, // Use email as phone for now
          password: password,
          password_confirmation: password,
          alamat: "",
          kota: "",
          kode_pos: "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();

      if (data.success) {
        // Save user to localStorage
        const newUser: User = {
          id: data.data.id,
          email: email,
          name: name,
          role: role || "user",
        };

        const token = `token_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        setUser(newUser);
        setAccessToken(token);

        localStorage.setItem(
          "pasar_umkm_current_user",
          JSON.stringify(newUser)
        );
        localStorage.setItem("pasar_umkm_access_token", token);
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error: any) {
      throw new Error(error.message || "Terjadi kesalahan saat mendaftar");
    }
  };

  const signOut = async () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("pasar_umkm_current_user");
    localStorage.removeItem("pasar_umkm_access_token");
  };

  const refreshUser = async () => {
    try {
      // Get current user from localStorage
      const savedUser = localStorage.getItem("pasar_umkm_current_user");
      if (!savedUser) {
        return;
      }

      const userData = JSON.parse(savedUser);

      // Fetch updated user data from backend
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userData.id,
        },
      });

      if (!response.ok) {
        console.error("Failed to refresh user data");
        return;
      }

      const data = await response.json();
      if (data.success && data.data) {
        const updatedUser: User = {
          id: data.data.id,
          email: data.data.email,
          name: data.data.name,
          role: data.data.role || "user",
        };

        setUser(updatedUser);
        localStorage.setItem(
          "pasar_umkm_current_user",
          JSON.stringify(updatedUser)
        );
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
