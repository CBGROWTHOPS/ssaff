import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// The favicon is the coral core of the neural form, on ink — the site's
// own visual language reduced to a single mark.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#16161A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 26,
            background: "#F0594B",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
