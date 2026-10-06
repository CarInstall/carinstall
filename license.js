/* CarInstall Activation Gate
   Backend URL will be filled after Cloudflare Worker is deployed.
*/
const CARINSTALL_LICENSE_API = "https://nameless-darkness-1b75.mahmutfezlek.workers.dev";

async function carInstallFingerprint(info = {}) {
  const raw = [
    info.model || document.getElementById("model")?.textContent || "",
    info.android || document.getElementById("android")?.textContent || "",
    info.abi || document.getElementById("abi")?.textContent || "",
    info.sdk || document.getElementById("sdk")?.textContent || "",
    navigator.userAgent || ""
  ].join("|");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2,"0")).join("");
}

async function carInstallActivate(code, info = {}) {
  if (CARINSTALL_LICENSE_API.includes("REPLACE_WITH_WORKER_URL")) {
    throw new Error("Backend henüz bağlanmadı.");
  }
  const fingerprint = await carInstallFingerprint(info);
  const r = await fetch(CARINSTALL_LICENSE_API + "/api/activate", {
    method: "POST",
    headers: {"content-type":"application/json"},
    body: JSON.stringify({code: code.trim().toUpperCase(), fingerprint})
  });
  const result = await r.json();
  if (!result.ok) throw new Error(result.error || "Aktivasyon reddedildi.");
  localStorage.setItem("carinstall_license", JSON.stringify({
    code: result.code, fingerprint
  }));
  return result;
}
