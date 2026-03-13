export default function Footer() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center gap-1 py-6"
      style={{
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: 11,
        fontWeight: 400,
        color: "rgba(255, 255, 255, 0.15)",
      }}
    >
      <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        private system architecture
      </span>
      <span className="opacity-60">© 2026 SSAFF</span>
    </footer>
  );
}
