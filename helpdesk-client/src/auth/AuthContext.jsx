import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On startup, restore session from localStorage if present.
  useEffect(() => {
    const stored = localStorage.getItem("helpdesk_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      api.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`;
    }
    setLoading(false);
  }, []);

  const signIn = (authData) => {
    // authData = { token, displayName, role, username }
    setUser(authData);
    localStorage.setItem("helpdesk_auth", JSON.stringify(authData));
    api.defaults.headers.common["Authorization"] = `Bearer ${authData.token}`;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("helpdesk_auth");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}