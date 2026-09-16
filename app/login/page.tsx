"use client";

import { useEffect } from "react";
import { useIdentity } from "@/lib/identity";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, ready, login } = useIdentity();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-sm text-inkDim">CRM — Prospection Sites Web</p>
        <h1 className="mt-3 text-2xl font-medium text-ink">Connexion</h1>
        <p className="mt-3 text-sm text-inkDim">
          Accès réservé. Connecte-toi avec le compte invité sur cet espace.
        </p>
        <button
          onClick={login}
          disabled={!ready}
          className="mt-8 w-full rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-accentStrong disabled:opacity-50"
        >
          {ready ? "Se connecter" : "Chargement…"}
        </button>
      </div>
    </div>
  );
}
