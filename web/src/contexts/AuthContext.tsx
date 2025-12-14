import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error?: { message: string } }>;
  signUp: (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    phone_number: string,
  ) => Promise<{ error?: { message: string } }>;
  createInitialAdmin: (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    phone_number: string,
  ) => Promise<{ error?: { message: string } }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.getMe();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.signIn(email, password);
      localStorage.setItem("auth_token", response.data.token);
      setUser(response.data.user);
      return {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        error: {
          message:
            error?.response?.data?.error ||
            error?.message ||
            "Failed to sign in",
        },
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    phone_number: string,
  ) => {
    try {
      await api.signUp(email, password, first_name, last_name, phone_number);
      return {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        error: {
          message:
            error?.response?.data?.error ||
            error?.message ||
            "Failed to create account",
        },
      };
    }
  };

  const signOut = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const createInitialAdmin = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
  ) => {
    try {
      const { data } = await api.setupAdmin(
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
      );

      setUser(data.admin);
      localStorage.setItem("auth_token", data.token);
      return {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Create initial admin error:", error);
      return {
        error: {
          message:
            error?.response?.data?.error ||
            error?.message ||
            "Failed to create initial admin",
        },
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        createInitialAdmin,
        isAdmin: user?.role === "admin",
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
