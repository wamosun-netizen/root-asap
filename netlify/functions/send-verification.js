// netlify/functions/send-verification.js
//
// Called from auth.html right after a new account is created. Signs a
// verification token for the account, renders the welcome/verify email,
// and sends it via Resend.
//
// Requires environment variables (Netlify Project configuration >
// Environment variables):
//   RESEND_API_KEY      - API key from resend.com
//   EMAIL_TOKEN_SECRET   - any long random string, used to sign tokens
//   EMAIL_FROM           - optional, defaults to "Root ASAP <verify@rootasap.com>"
//                           (the domain must be verified in Resend)

const token = require("./_token.js");
const { renderVerifyEmail } = require("./_email-template.js");

const EXPIRY_HOURS = 24;
const VALID_ROLES = ["investor", "business", "broker"];

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET;
  const FROM = process.env.EMAIL_FROM || "Root ASAP <verify@rootasap.com>";

  if (!RESEND_API_KEY || !TOKEN_SECRET) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Email sending is not configured yet" }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const name = (data.name || "").trim();
  const email = (data.email || "").trim().toLowerCase();
  const role = VALID_ROLES.indexOf(data.role) !== -1 ? data.role : "investor";

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Invalid email address" }) };
  }

  const payload = {
    email: email,
    name: name,
    role: role,
    iat: Date.now(),
    exp: Date.now() + EXPIRY_HOURS * 60 * 60 * 1000,
  };
  const signedToken = token.sign(payload, TOKEN_SECRET);

  const origin = "https://rootasap.com";
  const verifyUrl = origin + "/verify.html?token=" + encodeURIComponent(signedToken);

  const firstName = name.split(" ")[0] || "there";
  const { subject, html } = renderVerifyEmail({
    firstName: firstName,
    verifyUrl: verifyUrl,
    role: role,
    expiryHours: EXPIRY_HOURS,
  });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: subject,
        html: html,
      }),
    });

    const resJson = await res.json().catch(function () { return {}; });

    if (!res.ok) {
      return {
        statusCode: 502,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: (resJson && resJson.message) || "Failed to send email" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sent: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to send verification email" }),
    };
  }
};
