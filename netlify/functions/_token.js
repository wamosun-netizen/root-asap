// netlify/functions/_token.js
//
// Stateless, signed email-verification tokens.
//
// Root ASAP has no real backend database (accounts live in the browser's
// localStorage), so verification state can't be looked up server-side.
// Instead we sign the account details directly into the token: anyone
// holding a valid, unexpired token is proven to have received it via the
// email we sent to that address. The client (verify.html) is responsible
// for applying that proof to its own local account record.
//
// Token shape: base64url(JSON payload) + "." + base64url(HMAC-SHA256 signature)

const crypto = require("crypto");

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlToBuffer(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64");
}

function sign(payload, secret) {
  const body = base64url(JSON.stringify(payload));
  const sig = base64url(crypto.createHmac("sha256", secret).update(body).digest());
  return body + "." + sig;
}

function verify(token, secret) {
  if (!token || typeof token !== "string" || token.indexOf(".") === -1) {
    return { valid: false, reason: "malformed" };
  }
  const parts = token.split(".");
  if (parts.length !== 2) return { valid: false, reason: "malformed" };
  const [body, sig] = parts;

  const expectedSig = base64url(crypto.createHmac("sha256", secret).update(body).digest());

  const sigBuf = base64urlToBuffer(sig);
  const expectedBuf = base64urlToBuffer(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, reason: "bad_signature" };
  }

  let payload;
  try {
    payload = JSON.parse(base64urlToBuffer(body).toString("utf8"));
  } catch (e) {
    return { valid: false, reason: "bad_payload" };
  }

  if (!payload.exp || Date.now() > payload.exp) {
    return { valid: false, reason: "expired", payload: payload };
  }

  return { valid: true, payload: payload };
}

module.exports = { sign, verify };
