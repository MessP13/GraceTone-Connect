// src/components/RegisterServiceWorker.tsx
"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registrado:", reg.scope);
        })
        .catch((err) => {
          console.warn("Erro ao registrar Service Worker:", err);
        });
    }
  }, []);

  return null;
}
