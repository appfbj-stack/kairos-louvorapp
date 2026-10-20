/**
 * AuthContext.tsx — Sessão real (JWT) em vez da troca de perfil do navegador.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '../types';
import { authApi, getToken, setToken, onUnauthorized } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Restaura a sessão ao abrir o app (token ainda válido?)
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        setToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Token expirou no meio da sessão → volta pro login
  useEffect(() => {
    onUnauthorized.handler = () => setUser(null);
    return () => {
      onUnauthorized.handler = null;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { user: me } = await authApi.login(email, password);
      setUser(me);
    } catch (e: any) {
      const msg = e?.message || 'Não foi possível entrar';
      setError(msg);
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};