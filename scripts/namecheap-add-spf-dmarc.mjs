/**
 * Add SPF + DMARC TXT records to ssaff.co at Namecheap.
 * Preserves all existing DNS records (A, CNAME, MX, DKIM, etc).
 *
 * Adds:
 *   TXT @       v=spf1 include:_spf.google.com ~all
 *   TXT _dmarc  v=DMARC1; p=none; rua=mailto:chris@ssaff.co
 */
import fs from "fs";
import path from "path";

const PERMISSIONS_PATH = path.join(
  process.env.HOME,
  "Documents/permissions/internal/namecheap api_cashbreasy_account.txt"
);
const SLD = "ssaff";
const TLD = "co";
const SPF_VALUE = "v=spf1 include:_spf.google.com ~all";
const DMARC_VALUE = "v=DMARC1; p=none; rua=mailto:chris@ssaff.co";

function loadApiKey() {
  const content = fs.readFileSync(PERMISSIONS_PATH, "utf-8").trim();
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("ApiKey:")) return line.replace(/^ApiKey:\s*/i, "").trim();
    if (!line.startsWith("#") && line.length > 10 && !line.includes(":")) return line;
  }
  throw new Error("ApiKey not found");
}

async function getPublicIp() {
  const res = await fetch("https://api.ipify.org");
  return res.text();
}

function decode(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseHosts(xml) {
  const records = [];
  const hostRegex = /<host\b[^>]*\/>/gi;
  const matches = xml.match(hostRegex) || [];
  for (const tag of matches) {
    const attr = (k) => {
      const m = tag.match(new RegExp(`${k}="([^"]*)"`, "i"));
      return m ? decode(m[1]) : "";
    };
    records.push({
      Name: attr("Name"),
      Type: attr("Type"),
      Address: attr("Address"),
      MXPref: attr("MXPref") || "10",
      TTL: attr("TTL") || "1800",
    });
  }
  return records;
}

async function namecheapReq(apiUser, apiKey, clientIp, command, extra = {}) {
  const params = new URLSearchParams({
    ApiUser: apiUser,
    ApiKey: apiKey,
    UserName: apiUser,
    Command: command,
    ClientIp: clientIp,
    ...extra,
  });
  const res = await fetch(`https://api.namecheap.com/xml.response?${params}`);
  return res.text();
}

function checkError(xml) {
  if (xml.includes('Status="OK"') && !xml.includes("<Error ")) return;
  const m = xml.match(/<Error Number="(\d+)"[^>]*>([^<]*)<\/Error>/);
  throw new Error(`Namecheap API ${m?.[1] || "?"}: ${m?.[2]?.trim() || xml.slice(0, 400)}`);
}

async function main() {
  const apiKey = loadApiKey();
  const apiUser = process.env.NAMECHEAP_API_USER || "cashbreasy";
  let clientIp = process.env.NAMECHEAP_CLIENT_IP;
  if (!clientIp) {
    clientIp = await getPublicIp();
    console.log("Using IP:", clientIp);
  }

  console.log("Fetching existing DNS for ssaff.co ...");
  const getXml = await namecheapReq(
    apiUser, apiKey, clientIp, "namecheap.domains.dns.getHosts",
    { SLD, TLD }
  );
  checkError(getXml);

  const existing = parseHosts(getXml);
  console.log(`Found ${existing.length} existing records.`);
  for (const r of existing) {
    console.log(`  ${r.Type.padEnd(6)} ${r.Name.padEnd(28)} ${r.Address.slice(0, 60)}${r.Address.length > 60 ? "..." : ""}`);
  }

  // Drop any existing apex SPF or any existing DMARC, we will replace them.
  const filtered = existing.filter((r) => {
    if (r.Type === "TXT" && r.Name === "@" && /v=spf1/i.test(r.Address)) return false;
    if (r.Type === "TXT" && r.Name === "_dmarc" && /v=DMARC1/i.test(r.Address)) return false;
    return true;
  });

  const records = [
    ...filtered,
    { Name: "@", Type: "TXT", Address: SPF_VALUE, MXPref: "10", TTL: "1800" },
    { Name: "_dmarc", Type: "TXT", Address: DMARC_VALUE, MXPref: "10", TTL: "1800" },
  ];

  const params = {
    ApiUser: apiUser, ApiKey: apiKey, UserName: apiUser,
    Command: "namecheap.domains.dns.setHosts",
    ClientIp: clientIp, SLD, TLD,
  };
  records.forEach((r, i) => {
    const n = i + 1;
    params[`HostName${n}`] = r.Name;
    params[`RecordType${n}`] = r.Type;
    params[`Address${n}`] = r.Address;
    params[`TTL${n}`] = r.TTL;
    if (r.Type === "MX") params[`MXPref${n}`] = r.MXPref;
  });

  console.log(`\nPushing ${records.length} records (adding SPF + DMARC) ...`);
  const setXml = await namecheapReq(
    apiUser, apiKey, clientIp, "namecheap.domains.dns.setHosts", params
  );
  checkError(setXml);

  console.log("\n✅ Done. Added:");
  console.log(`   TXT @       ${SPF_VALUE}`);
  console.log(`   TXT _dmarc  ${DMARC_VALUE}`);
  console.log("\nDNS propagation typically takes 5-30 min.");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
