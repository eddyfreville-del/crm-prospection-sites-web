"use client";

import * as React from "react";
import type netlifyIdentity from "netlify-identity-widget";

type User = netlifyIdentity.User;

interface IdentityContextValue {
  user: User | null;
  ready: boolean;
  login: () => void;
  logout: () => void;
  /** `fetch` qui ajoute automatiquement le jeton Netlify Identity courant. */
  authFetch: (input: string, init?: RequestInit) => Promise<Response>;
}

const IdentityContext = React.createContext<IdentityContextValue | null>(null);

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [ready, setReady] = React.useState(false);
  const widgetRef = React.useRef<typeof netlifyIdentity | null>(null);

  React.useEffect(() => {
    let mounted = true;
    // Filet de sécurité : si Netlify Identity ne répond jamais (souci
    // réseau, service down), on ne reste jamais bloqué sur "Chargement…" —
    // on bascule en "non connecté", ce qui renvoie vers /login. Ça ne
    // révèle jamais de contenu par défaut, seulement le contraire.
    const timeout = setTimeout(() => {
      if (mounted) setReady((r) => r || true);
    }, 8000);

    import("netlify-identity-widget").then((mod) => {
      if (!mounted) return;
      const widget = mod.default;
      widgetRef.current = widget;

      widget.on("init", (u) => {
        clearTimeout(timeout);
        setUser(u ?? null);
        setReady(true);
      });
      widget.on("login", (u) => {
        setUser(u);
        widget.close();
      });
      widget.on("logout", () => setUser(null));
      widget.on("error", (err) => {
        console.error("Netlify Identity:", err);
        clearTimeout(timeout);
        setReady(true);
      });

      widget.init();
    });
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, []);

  const login = React.useCallback(() => widgetRef.current?.open("login"), []);
  const logout = React.useCallback(() => widgetRef.current?.logout(), []);

  const authFetch = React.useCallback(
    async (input: string, init: RequestInit = {}) => {
      const current = widgetRef.current?.currentUser();
      // `.jwt()` rafraîchit le jeton s'il est expiré ; les types publiés du
      // widget ne le déclarent pas encore, alors qu'il existe bien à
      // l'exécution — d'où le cast local.
      const token = current
        ? await (current as unknown as { jwt: () => Promise<string> }).jwt()
        : null;
      return fetch(input, {
        ...init,
        headers: {
          ...(init.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
      });
    },
    []
  );

  return (
    <IdentityContext.Provider value={{ user, ready, login, logout, authFetch }}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity() {
  const ctx = React.useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity doit être utilisé sous IdentityProvider.");
  return ctx;
}
