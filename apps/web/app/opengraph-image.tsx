import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Neptune by 99sols.ai — AI visibility optimization platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share image with the full brand lockup: 99sols.ai icon + NEPTUNE + "by 99sols.ai".
export default async function OpengraphImage() {
  const icon = await readFile(join(process.cwd(), "public/brand/icon-512.png"));
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg, #fbf4e3 0%, #f6ecd5 60%, #eadcbc 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconSrc} width={120} height={120} style={{ borderRadius: 28 }} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: 10, color: "#0e372d" }}>NEPTUNE</div>
            <div style={{ fontSize: 30, color: "#5d6763" }}>by 99sols.ai</div>
          </div>
        </div>
        <div style={{ marginTop: 56, fontSize: 60, fontWeight: 700, color: "#0e372d", lineHeight: 1.1, display: "flex", flexWrap: "wrap" }}>
          Turn search visibility into&nbsp;<span style={{ color: "#d35826" }}>growth.</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 30, color: "#1c2321" }}>See how your brand appears in ChatGPT answers — and what to change.</div>
      </div>
    ),
    size,
  );
}
