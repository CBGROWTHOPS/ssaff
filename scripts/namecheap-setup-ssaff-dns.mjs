/**
 * Namecheap API: set DNS for ssaff.co → Vercel
 * A @ 76.76.21.21, CNAME www cname.vercel-dns.com
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PERMISSIONS_PATH = path.join(
  process.env.HOME,
  "Documents/permissions/internal/namecheap api_cashbreasy_account.txt"
);
const DOMAIN = "ssaff.co";
const SLD = "ssaff";
const TLD = "co";
const VERCEL_A = "76.76.21.21";
const VERCEL_CNAME = "cname.vercel-dns.com.";

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

function parseHosts(xml) {
  const records = [];
  const hostRegex = /<Host[^>]*HostId="[^"]*"[^>]*Name="([^"]*)"[^>]*Type="([^"]*)"[^>]*Address="([^"]*)"[^>]*MXPref="([^"]*)"[^>]*TTL="([^"]*)"[^/]*\/>/g;
  let m;
  while ((m = hostRegex.exec(xml)) !== null) {
    records.push({ Name: m[1], Type: m[2], Address: m[3], MXPref: m[4], TTL: m[5] });
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
  throw new Error(`Namecheap API ${m?.[1] || "?"}: ${m?.[2]?.trim() || xml.slice(0, 200)}`);
}

async function main() {
  const apiKey = loadApiKey();
  const apiUser = process.env.NAMECHEAP_API_USER || "cashbreasy";
  let clientIp = process.env.NAMECHEAP_CLIENT_IP;
  if (!clientIp) {
    clientIp = await getPublicIp();
    console.log("Using IP:", clientIp);
  }

  console.log("Fetching existing DNS for", DOMAIN, "...");
  const getXml = await namecheapReq(
    apiUser,
    apiKey,
    clientIp,
    "namecheap.domains.dns.getHosts",
    { SLD, TLD }
  );
  checkError(getXml);

  const existing = parseHosts(getXml);
  const records = [
    { Name: "@", Type: "A", Address: VERCEL_A, TTL: "1800" },
    { Name: "www", Type: "CNAME", Address: VERCEL_CNAME, TTL: "1800" },
  ];

  const keepTypes = new Set(["MX", "TXT", "CAA", "NS"]);
  const skipNames = new Set(["@", "www"]);
  for (const r of existing) {
    if (keepTypes.has(r.Type) && !skipNames.has(r.Name)) {
      records.push(r);
    }
  }

  const params = { ApiUser: apiUser, ApiKey: apiKey, UserName: apiUser, Command: "namecheap.domains.dns.setHosts", ClientIp: clientIp, SLD, TLD };
  records.forEach((r, i) => {
    const n = i + 1;
    params[`HostName${n}`] = r.Name;
    params[`RecordType${n}`] = r.Type;
    params[`Address${n}`] = r.Address;
    params[`TTL${n}`] = r.TTL;
    if (r.MXPref) params[`MXPref${n}`] = r.MXPref;
  });

  console.log("Setting", records.length, "DNS record(s)...");
  const setXml = await namecheapReq(apiUser, apiKey, clientIp, "namecheap.domains.dns.setHosts", params);
  checkError(setXml);

  console.log("Done. ssaff.co DNS configured for Vercel:");
  console.log("  @   A      ", VERCEL_A);
  console.log("  www CNAME  ", VERCEL_CNAME);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
