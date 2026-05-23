import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Partners — SSAFF",
  description:
    "Information for advertisers, networks, and publishers evaluating SSAFF as a marketing partner.",
};

export default function PartnersPage() {
  return (
    <LegalShell
      eyebrow="For Partners"
      title="Partnerships"
      updated="May 22, 2026"
    >
      <p>
        Information for partner compliance and onboarding review.
      </p>

      <h2>Business information</h2>
      <p>
        <strong>Legal name:</strong> SSAFF LLC<br />
        <strong>Entity type:</strong> Florida limited liability company<br />
        <strong>Address:</strong> 407 Lincoln Rd, Suite 6H PMB 1834, Miami
        Beach, FL 33139<br />
        <strong>Contact:</strong>{" "}
        <a href="mailto:chris@ssaff.co">chris@ssaff.co</a>
        <br />
        <strong>Website:</strong>{" "}
        <a href="https://ssaff.co">ssaff.co</a>
      </p>

      <h2>Compliance</h2>
      <p>
        Where SSAFF collects or transmits consumer information on behalf of a
        partner, we comply with applicable federal and state law, including
        the TCPA, CAN-SPAM Act, CCPA and other state privacy laws, and the
        FTC&rsquo;s Endorsement Guides. Consumer consents are captured and
        retained at the point of collection. Do-not-call and unsubscribe
        requests are honored within the statutory window.
      </p>

      <h2>Contact</h2>
      <p>
        For partnership or compliance inquiries, email{" "}
        <a href="mailto:chris@ssaff.co">chris@ssaff.co</a>.
      </p>
    </LegalShell>
  );
}
