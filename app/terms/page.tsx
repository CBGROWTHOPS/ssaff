import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — SSAFF",
  description: "Terms governing use of SSAFF properties and services.",
};

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Terms of Service"
      updated="May 22, 2026"
    >
      <p>
        These Terms govern your use of ssaff.co (the &ldquo;Site&rdquo;),
        operated by SSAFF LLC, a Florida limited liability company
        (&ldquo;SSAFF,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). By using
        the Site, you agree to these Terms.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be at least 18 years old to use the Site.
      </p>

      <h2>Use of the Site</h2>
      <p>You agree not to use the Site to violate any law, gain unauthorized
        access to systems or accounts, interfere with or disrupt the Site, or
        misrepresent your identity or affiliation.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Site and its content are owned by SSAFF or its licensors. You are
        granted a limited, revocable, non-exclusive license to access and use
        the Site for its intended purpose.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The Site is provided &ldquo;as is&rdquo; without warranties of any
        kind, express or implied, to the fullest extent permitted by law.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, SSAFF will not be liable for
        any indirect, incidental, special, consequential, or punitive damages
        arising out of or related to the Site.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Florida.
        Disputes will be brought exclusively in the state or federal courts
        located in Miami-Dade County, Florida.
      </p>

      <h2>Changes</h2>
      <p>
        We may modify these Terms from time to time. The &ldquo;Last
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
