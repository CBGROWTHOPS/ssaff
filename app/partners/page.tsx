import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Partners — SSAFF",
  description:
    "Information for advertisers, networks, and publishers evaluating SSAFF as a media partner.",
};

export default function PartnersPage() {
  return (
    <LegalShell
      eyebrow="For Partners"
      title="Partnerships"
      updated="May 22, 2026"
    >
      <p>
        SSAFF operates a portfolio of{" "}
        <Link href="/properties" style={{ color: "inherit" }}>
          owned brands
        </Link>{" "}
        across lead generation, e-commerce, and content. We run our own
        media, our own lists, and our own infrastructure end to end.
      </p>

      <h2>How we work with partners</h2>
      <p>
        We work directly with advertisers, networks, and operators on a
        few defined shapes:
      </p>
      <ul>
        <li>
          <strong>Direct advertiser deals.</strong> CPL, CPA, or revenue
          share against our own traffic. Tier 1 geos. Volume scales with
          payout and offer fit.
        </li>
        <li>
          <strong>Affiliate network publisher.</strong> Active publisher
          across major performance networks. Compliance information below.
        </li>
        <li>
          <strong>Operator-to-operator.</strong> Bespoke arrangements with
          other publishers, agencies, or media buyers — co-buys, list
          rentals, traffic swaps. Inbound by referral.
        </li>
      </ul>

      <h2>What we run</h2>
      <p>
        Three shapes of work: lead generation against our owned media,
        pay-per-call campaigns, and lead generation for local services
        businesses on a client basis. Common categories include health
        &amp; subsidy, financial services, home services, gig economy,
        and consumer rewards. Tier 1 geos (US, CA, UK, AU, NZ).
        Compliance posture is tightest in regulated verticals — we do
        not run anything that requires licensure we do not hold.
      </p>

      <h2>Channels</h2>
      <p>
        We operate paid social, email (owned lists, verified opt-in),
        organic and paid search, and a small set of arbitrage channels.
        Traffic is server-side tracked end to end with conversion data
        flowing to first-party warehouses and CAPI.
      </p>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>No incentivized opt-ins without disclosure at the point of capture.</li>
        <li>No iframe, popunder, toolbar, or PPV traffic.</li>
        <li>No co-registration or list rentals without explicit partner sign-off.</li>
        <li>No SMS or outbound dialing from SSAFF directly.</li>
        <li>No traffic from sources we cannot audit end to end.</li>
      </ul>

      <h2>Compliance</h2>
      <p>
        <strong>CAN-SPAM:</strong> All commercial email includes a physical
        address and one-click unsubscribe. Suppression lists are honored
        across every property within 24 hours.<br />
        <strong>TCPA:</strong> Where phone consent applies, we collect
        named-seller consent with audit trails. We do not place outbound
        calls from SSAFF directly.<br />
        <strong>State privacy laws:</strong> CCPA / CPA / CTDPA opt-out
        and deletion requests routed through{" "}
        <a href="mailto:privacy@ssaff.co">privacy@ssaff.co</a>.<br />
        <strong>Incentives:</strong> Where used, fully disclosed at the
        point of opt-in per FTC guidance.
      </p>

      <h2>Business information</h2>
      <p>
        <strong>Legal name:</strong> SSAFF LLC<br />
        <strong>Entity type:</strong> Florida limited liability company<br />
        <strong>Address:</strong> 407 Lincoln Rd, Suite 6H PMB 1834, Miami
        Beach, FL 33139<br />
        <strong>Phone:</strong>{" "}
        <a href="tel:+17547577436">(754) 757-7436</a><br />
        <strong>Website:</strong>{" "}
        <a href="https://ssaff.co">ssaff.co</a>
      </p>

      <h2>Contact</h2>
      <p>
        Advertiser and partnership inquiries:{" "}
        <a href="mailto:chris@ssaff.co">chris@ssaff.co</a> or{" "}
        <a href="tel:+17547577436">(754) 757-7436</a>. Compliance and
        privacy: <a href="mailto:privacy@ssaff.co">privacy@ssaff.co</a>.
        We reply to qualified inquiries within two business days.
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
