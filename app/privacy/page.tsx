import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — SSAFF",
  description: "How SSAFF LLC collects, uses, and protects information.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Privacy Policy"
      updated="May 22, 2026"
    >
      <p>
        This Privacy Policy explains how SSAFF LLC
        (&ldquo;SSAFF,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) collects,
        uses, and shares personal information.
      </p>

      <h2>Information we collect</h2>
      <p>
        Information you provide to us directly (such as name, email address,
        phone number, and postal address when you contact us).
      </p>
      <p>
        Information collected automatically when you visit ssaff.co,
        including IP address, browser type, referring URL, pages visited, and
        timestamps.
      </p>

      <h2>How we use information</h2>
      <p>
        To respond to inquiries, operate and improve ssaff.co, comply with
        legal obligations, and protect our rights.
      </p>

      <h2>How we share information</h2>
      <p>
        With service providers acting on our behalf under contract, with
        successors in the event of a merger or sale of assets, and with
        authorities when required by law.
      </p>
      <p>
        We do not sell personal information for monetary consideration.
      </p>

      <h2>Cookies</h2>
      <p>
        ssaff.co uses cookies and similar technologies for analytics and to
        improve the site. You can disable cookies in your browser settings.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access,
        correct, delete, or limit our use of your personal information. To
        exercise these rights, email{" "}
        <a href="mailto:chris@ssaff.co">chris@ssaff.co</a> with the subject
        line &ldquo;Privacy Request.&rdquo;
      </p>

      <h2>Children</h2>
      <p>
        ssaff.co is not directed to children under 13, and we do not
        knowingly collect personal information from children under 13.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. The &ldquo;Last
        updated&rdquo; date above reflects the most recent change.
      </p>

      <h2>Contact</h2>
      <p>
        SSAFF LLC<br />
        407 Lincoln Rd, Suite 6H PMB 1834<br />
        Miami Beach, FL 33139<br />
        <a href="mailto:chris@ssaff.co">chris@ssaff.co</a>
      </p>
    </LegalShell>
  );
}
