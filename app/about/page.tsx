import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "About — SSAFF",
  description:
    "SSAFF LLC is a media company operating a portfolio of owned consumer brands across health, personal finance, e-commerce, and gaming.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <LegalShell eyebrow="About" title="SSAFF" updated="2026-06-27">
      <p>
        SSAFF LLC is a media company operating a portfolio of owned
        consumer brands across health, personal finance, e-commerce, and
        gaming. Our properties reach U.S. consumers through editorial
        content, email, and paid social.
      </p>

      <h2>Who runs it</h2>
      <p>
        Founded and operated by <strong>Christopher Brown</strong>, based in
        Miami Beach, Florida. Background spans a decade in performance
        marketing across insurance, personal finance, gig economy, and
        e-commerce verticals.
      </p>
      <p>
        You can reach Chris directly at{" "}
        <a href="mailto:chris@ssaff.co">chris@ssaff.co</a> or{" "}
        <a href="tel:+17547577436">(754) 757-7436</a>. On social:{" "}
        <a
          href="https://www.facebook.com/ssaff"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>{" "}
        and{" "}
        <a
          href="https://www.linkedin.com/company/ssaff"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        .
      </p>

      <h2>How we work with partners</h2>
      <p>
        We work with advertiser networks, direct brands, and
        performance-marketing platforms on CPL, CPA, and CPS engagements
        across our owned property portfolio. See{" "}
        <a href="/partners">Partners</a> for the specifics vetting teams
        typically request, and <a href="/properties">Properties</a> for the
        active brand roster.
      </p>

      <h2>Where we are</h2>
      <p>
        SSAFF LLC<br />
        407 Lincoln Rd, Suite 6H PMB 1834<br />
        Miami Beach, FL 33139<br />
        <a href="tel:+17547577436">(754) 757-7436</a>
        {" · "}
        <a href="mailto:chris@ssaff.co">chris@ssaff.co</a>
      </p>
    </LegalShell>
  );
}
