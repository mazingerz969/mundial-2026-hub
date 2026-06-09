import { Suspense } from "react";

import { CalendarioView } from "@/components/data/CalendarioView";

export default function CalendarioPage() {
  return (
    <Suspense fallback={<p className="text-text-secondary">Cargando calendario…</p>}>
      <CalendarioView />
    </Suspense>
  );
}
