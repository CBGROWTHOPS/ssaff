import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SSAFF — private system architecture";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFAF7",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          <div
            style={{
              fontSize: 132,
              fontWeight: 300,
              letterSpacing: "-4px",
              color: "#16161A",
            }}
          >
            SSAFF
          </div>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 18,
              background: "#F0594B",
              marginTop: 28,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            letterSpacing: "10px",
            textTransform: "uppercase",
            color: "rgba(22,22,26,0.42)",
          }}
        >
          private system architecture
        </div>
      </div>
    ),
    { ...size }
  );
}
