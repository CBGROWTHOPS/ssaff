import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

// OAuth-app home page for Google Cloud project 128180589945 ("SSAFF Ads Tools").
// Google's brand verification requires the app name on this page to match the
// consent screen and the page to state what the app does. Unlinked from nav.
export const metadata: Metadata = {
  title: "SSAFF Ads Tools — SSAFF",
  description:
    "SSAFF Ads Tools is SSAFF LLC's internal software for managing SSAFF's own Google Ads accounts.",
};

export default function AdsToolsPage() {
  return (
    <LegalShell
      eyebrow="Internal software"
      title="SSAFF Ads Tools"
      updated="September 18, 2026"
    >
      <p>
        SSAFF Ads Tools is internal software built and operated by SSAFF LLC
        (&ldquo;SSAFF,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). It is used
        only by SSAFF staff to manage Google Ads accounts owned by SSAFF. It is
        not offered to the public and has no external users.
      </p>

      <h2>What the app does</h2>
      <p>
        SSAFF Ads Tools connects to the Google Ads API and the Google Data
        Manager API on behalf of SSAFF&rsquo;s own Google Ads manager account in
        order to:
      </p>
      <ul>
        <li>
          Import offline conversions (for example, a sign-up completed on a
          partner site) into SSAFF&rsquo;s Google Ads accounts so campaign
          reporting and bidding reflect real results.
        </li>
        <li>
          Read campaign, keyword, search-term, and performance reports for
          SSAFF&rsquo;s accounts.
        </li>
        <li>
          Create and update campaigns, ad groups, keywords, negative keywords,
          ads, and ad assets in SSAFF&rsquo;s accounts.
        </li>
        <li>Research keyword ideas and volume for SSAFF&rsquo;s campaigns.</li>
      </ul>

      <h2>How it uses Google data</h2>
      <p>
        Access is granted through Google sign-in by an SSAFF staff member using
        the <code>adwords</code> and <code>datamanager</code> scopes. The data
        accessed is limited to advertising data in Google Ads accounts SSAFF
        owns. The app does not collect data about members of the public, does
        not access any Google Ads account SSAFF does not own, and does not
        share, sell, or transfer Google user data to third parties. Data is
        used solely to operate SSAFF&rsquo;s own advertising.
      </p>

      <h2>Privacy and terms</h2>
      <p>
        Use of SSAFF Ads Tools is governed by the SSAFF{" "}
        <a href="/privacy">Privacy Policy</a> and{" "}
        <a href="/terms">Terms of Service</a>.
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
