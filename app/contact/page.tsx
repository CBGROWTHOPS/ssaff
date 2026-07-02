import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Contact — SSAFF",
  description: "How to reach SSAFF LLC.",
};

export default function ContactPage() {
  return (
    <LegalShell
      eyebrow="Get in touch"
      title="Contact"
      updated="May 22, 2026"
    >
      <p>
        For partnership, vendor onboarding, or compliance inquiries, email{" "}
        <a href="mailto:chris@ssaff.co">chris@ssaff.co</a> or call{" "}
        <a href="tel:+17547577436">(754) 757-7436</a>.
      </p>
      <p>
        We respond to qualified inquiries within two business days.
      </p>

      <h2>Mailing address</h2>
      <p>
        SSAFF LLC<br />
        407 Lincoln Rd, Suite 6H PMB 1834<br />
        Miami Beach, FL 33139
      </p>

      <h2>Social</h2>
      <p>
        <a href="https://www.facebook.com/ssaff" target="_blank" rel="noopener noreferrer">Facebook</a>
        {" · "}
        <a href="https://www.linkedin.com/company/ssaff" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </p>
    </LegalShell>
  );
}
