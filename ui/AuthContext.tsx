"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type User = { id: string; name: string; email: string; password: string };
type AuthContextType = {
  user: User | null;
  isAuthOpen: boolean;
  openAuth: (afterLogin?: () => void) => void;
  closeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider/>");
  return ctx;
};

const LS_USERS = "np_users";
const LS_SESSION = "np_session";

function readUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  } catch {
    return [];
  }
}
function writeUsers(users: User[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}
function genId() {
  return "u_" + Math.random().toString(36).slice(2, 10);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [afterLogin, setAfterLogin] = useState<(() => void) | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(LS_SESSION);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const openAuth = (cb?: () => void) => {
    setAfterLogin(() => (cb ? cb : null));
    setIsAuthOpen(true);
  };
  const closeAuth = () => setIsAuthOpen(false);

  const login = async (email: string, password: string) => {
    const users = readUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found || found.password !== password) {
      throw new Error("Неверный email или пароль");
    }
    localStorage.setItem(LS_SESSION, JSON.stringify(found));
    setUser(found);
    setIsAuthOpen(false);
    if (afterLogin) afterLogin();
  };

  const register = async (name: string, email: string, password: string) => {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Пользователь с таким email уже существует");
    }
    const newUser: User = { id: genId(), name, email, password };
    users.push(newUser);
    writeUsers(users);
    localStorage.setItem(LS_SESSION, JSON.stringify(newUser));
    setUser(newUser);
    setIsAuthOpen(false);
    if (afterLogin) afterLogin();
  };

  const logout = () => {
    localStorage.removeItem(LS_SESSION);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthOpen, openAuth, closeAuth, login, register, logout }),
    [user, isAuthOpen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
