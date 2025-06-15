
import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavigationHistoryContextType {
  push: (path: string) => void;
  pop: () => string | undefined;
  getPrevious: () => string | undefined;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

export const NavigationHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<string[]>([]);
  const lastPathRef = useRef<string | null>(null);
  const { pathname } = useLocation();

  React.useEffect(() => {
    if (lastPathRef.current !== pathname) {
      setHistory(prev =>
        prev.length > 0 && prev[prev.length - 1] === pathname
          ? prev // prevent duplicate at top
          : [...prev, pathname]
      );
      lastPathRef.current = pathname;
    }
  }, [pathname]);

  const push = useCallback((path: string) => {
    setHistory(prev => [...prev, path]);
  }, []);

  const pop = useCallback(() => {
    let popped: string | undefined;
    setHistory(prev => {
      if (prev.length > 1) {
        popped = prev[prev.length - 2];
        return prev.slice(0, -1);
      }
      return prev;
    });
    return popped;
  }, []);

  const getPrevious = useCallback(() => {
    if (history.length > 1) {
      return history[history.length - 2];
    }
    return undefined;
  }, [history]);

  return (
    <NavigationHistoryContext.Provider value={{ push, pop, getPrevious }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
};

export function useNavigationHistory() {
  const ctx = useContext(NavigationHistoryContext);
  if (!ctx) throw new Error("Must be used within NavigationHistoryProvider");
  return ctx;
}
