import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLocalMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.error("Redirect Login Error:", error);
      }

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });

      return unsubscribe;
    };

    let unsubscribeRef: (() => void) | undefined;

    initAuth().then((unsubscribe) => {
      unsubscribeRef = unsubscribe;
    });

    return () => {
      if (unsubscribeRef) unsubscribeRef();
    };
  }, []);

  const login = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      console.warn("Login not available in local mode.");
      return;
    }

    try {
      setLoading(true);
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured || !auth) return;

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isLocalMode: !isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};