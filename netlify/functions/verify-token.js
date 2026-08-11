// netlify/functions/verify-token.js
//
// Checks a verification token from a verify.html?token=... link.
// Stateless (no database): validates the HMAC signature and expiry, and
// hands back the email/name/role that were signed into the token so
// verify.html can update the matching account in this browser's
// localStorage.

const token = require("./_token.js");

exports.handler = async function (event) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET;
  if (!TOKEN_SECRET) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valid: false, reason: "not_configured" }),
    };
  }

  const params = event.queryStringParameters || {};
  const t = params.token;

  const result = token.verify(t, TOKEN_SECRET);

  if (!result.valid) {
    // For an expired (but authentically signed) token, hand back the email
    // so the client can offer a one-click "resend" without asking again.
    const email = result.payload && result.reason === "expired" ? result.payload.email : undefined;
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valid: false, reason: result.reason, email: email }),
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      valid: true,
      email: result.payload.email,
      name: result.payload.name,
      role: result.payload.role,
    }),
  };
};
