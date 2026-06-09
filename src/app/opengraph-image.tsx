import { ImageResponse } from "next/og";

export const alt = "Mundial 2026 Hub — Datos y juegos del Mundial";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #0B0F14 0%, #111827 45%, #052e16 100%)",
          color: "#F9FAFB",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            color: "#22C55E",
            fontWeight: 700,
          }}
        >
          FIFA World Cup 2026
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            Mundial 2026 Hub
          </div>
          <div style={{ fontSize: 32, color: "#D1D5DB", maxWidth: 900, lineHeight: 1.35 }}>
            Equipos, calendario, quiniela y minijuegos — PWA con Next.js 15
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 24,
            color: "#9CA3AF",
          }}
        >
          <span>48 selecciones</span>
          <span>·</span>
          <span>1.248 jugadores</span>
          <span>·</span>
          <span>Reto del 11 · Trivia · Penaltis</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
