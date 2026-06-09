"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="flex items-center justify-center gap-2 bg-amber-500/90 px-3 py-2 text-center text-sm font-medium text-bg-primary"
      role="status"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      Sin conexión — datos guardados en caché
    </div>
  );
}
