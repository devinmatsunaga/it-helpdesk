import { createContext, useContext, useEffect, useState } from "react";

const PreferencesContext = createContext(null);

const DEFAULTS = {
  theme: "system",          // "light" | "dark" | "system"
  pageSize: 10,             // 10 | 25 | 50
  defaultTicketView: "all", // "all" | "unassigned"
  compact: false,
};

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem("helpdesk_prefs");
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  // Persist whenever prefs change
  useEffect(() => {
    localStorage.setItem("helpdesk_prefs", JSON.stringify(prefs));
  }, [prefs]);

  // Apply theme to the <html> element
  useEffect(() => {
    const root = document.documentElement;
    const apply = (dark) => root.classList.toggle("dark", dark);

    if (prefs.theme === "dark") apply(true);
    else if (prefs.theme === "light") apply(false);
    else {
      // system: follow OS, and react to changes
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      apply(mq.matches);
      const handler = (e) => apply(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [prefs.theme]);

  const update = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));

  return (
    <PreferencesContext.Provider value={{ prefs, update }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}