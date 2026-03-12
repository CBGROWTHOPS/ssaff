export default function Footer() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-10 flex flex-wrap items-center justify-center gap-6 py-5"
      style={{
        fontFamily: "var(--font-inter), sans-serif",
        fontSize: 12,
        fontWeight: 400,
        color: "rgba(255, 255, 255, 0.2)",
      }}
    >
      <span>© 2026 SSAFF</span>
      <a
        href="mailto:contact@ssaff.co"
        className="transition-colors hover:text-white/40"
      >
        contact@ssaff.co
      </a>
      <a href="/terms" className="transition-colors hover:text-white/40">
        Terms
      </a>
      <a href="/privacy" className="transition-colors hover:text-white/40">
        Privacy
      </a>
    </footer>
  );
}
