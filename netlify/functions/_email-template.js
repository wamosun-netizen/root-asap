// netlify/functions/_email-template.js
//
// Renders the verification email HTML. Kept in sync with
// email-templates/verify-email.html (the standalone, reviewable version of
// this same design) — if you edit one, edit the other.

const ROLE_LABELS = {
  investor: { label: "investor", article: "an" },
  business: { label: "business owner", article: "a" },
  broker: { label: "broker / agent", article: "a" },
};

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderVerifyEmail({ firstName, verifyUrl, role, expiryHours }) {
  const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.investor;
  const safeName = escapeHtml(firstName || "there");
  const safeUrl = escapeHtml(verifyUrl);

  const subject = "Verify your email — Root ASAP";

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${subject}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
  body, table, td { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
  body { margin:0; padding:0; width:100% !important; background:#F2F1ED; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  img { border:0; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; display:block; }
  table { border-collapse:collapse !important; }
  a { text-decoration:none; }
  @media screen and (max-width:600px) {
    .email-wrap { width:100% !important; }
    .fluid-pad { padding-left:20px !important; padding-right:20px !important; }
    .hero-img { height:auto !important; }
    .feature-cell { display:block !important; width:100% !important; padding-bottom:18px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#F2F1ED;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    Confirm your email to start browsing vetted diaspora investment deals on Root ASAP. This link expires in ${expiryHours} hours.
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2F1ED;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="email-wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 1px 2px rgba(15,61,40,0.05), 0 4px 14px rgba(15,61,40,0.06);">
          <tr>
            <td style="background:#0F3D28;">
              <img src="https://rootasap.com/assets/email/verify-hero.png" width="600" height="192" alt="Root ASAP — Diaspora investment, without the gatekeepers." class="hero-img" style="width:100%; height:auto; display:block;" />
            </td>
          </tr>
          <tr>
            <td class="fluid-pad" style="padding:40px 44px 8px 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:24px; line-height:1.35; font-weight:700; color:#0F3D28; padding-bottom:14px;">
                    Welcome to Root ASAP, ${safeName}.
                  </td>
                </tr>
                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:14.5px; line-height:1.65; color:#45433B; padding-bottom:6px;">
                    You're one step from joining the Root ASAP platform as ${roleInfo.article} <strong>${roleInfo.label}</strong>. We just need to confirm this is really your email address before we open up your dashboard.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="fluid-pad" style="padding:18px 44px 8px 44px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="#1F6F4A" style="border-radius:999px;">
                    <!--[if mso]>
                    <a href="${safeUrl}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="50%" strokecolor="#1F6F4A" fillcolor="#1F6F4A">
                    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Verify email address</center>
                    </a>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${safeUrl}" target="_blank" style="display:inline-block; padding:15px 40px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:14.5px; font-weight:700; color:#FFFFFF; text-decoration:none; border-radius:999px;">Verify email address →</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="fluid-pad" style="padding:14px 44px 0 44px;" align="center">
              <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12px; line-height:1.6; color:#83807A;">
                This link expires in ${expiryHours} hours. If the button doesn't work, copy and paste this URL into your browser:<br />
                <a href="${safeUrl}" style="color:#1F6F4A; word-break:break-all;">${safeUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td class="fluid-pad" style="padding:32px 44px 0 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid #E4E2DB; font-size:0; line-height:0;">&nbsp;</td></tr></table>
            </td>
          </tr>
          <tr>
            <td class="fluid-pad" style="padding:28px 44px 6px 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:Georgia, 'Times New Roman', serif; font-size:16.5px; font-weight:700; color:#0F3D28; padding-bottom:16px;">
                    What you'll get access to
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="feature-cell" width="33.33%" valign="top" style="padding:0 10px 20px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr><td width="34" style="padding-bottom:8px;">
                        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#EAF4EE" style="border-radius:9px; font-family:Georgia,serif; font-size:14px; color:#1F6F4A; font-weight:700;">✓</td></tr></table>
                      </td></tr>
                      <tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12.5px; font-weight:700; color:#2E2C27; padding-bottom:4px;">Vetted deals only</td></tr>
                      <tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12px; line-height:1.55; color:#605D52;">Every listing is reviewed before it goes live on the marketplace.</td></tr>
                    </table>
                  </td>
                  <td class="feature-cell" width="33.33%" valign="top" style="padding:0 10px 20px 10px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr><td width="34" style="padding-bottom:8px;">
                        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#EAF4EE" style="border-radius:9px; font-family:Georgia,serif; font-size:14px; color:#1F6F4A; font-weight:700;">✓</td></tr></table>
                      </td></tr>
                      <tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12.5px; font-weight:700; color:#2E2C27; padding-bottom:4px;">AI-matched introductions</td></tr>
                      <tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12px; line-height:1.55; color:#605D52;">Matched by sector, term and location — introduced with a click.</td></tr>
                    </table>
                  </td>
                  <td class="feature-cell" width="33.33%" valign="top" style="padding:0 0 20px 10px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr><td width="34" style="padding-bottom:8px;">
                        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="30" height="30" align="center" valign="middle" bgcolor="#EAF4EE" style="border-radius:9px; font-family:Georgia,serif; font-size:14px; color:#1F6F4A; font-weight:700;">✓</td></tr></table>
                      </td></tr>
                      <tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12.5px; font-weight:700; color:#2E2C27; padding-bottom:4px;">KYC-verified both sides</td></tr>
                      <tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12px; line-height:1.55; color:#605D52;">Investors and business owners are identity-checked before deals close.</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="fluid-pad" style="padding:12px 44px 36px 44px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8; border-radius:12px;">
                <tr>
                  <td style="padding:16px 18px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12px; line-height:1.6; color:#605D52;">
                    <strong style="color:#2E2C27;">Didn't sign up for Root ASAP?</strong> You can safely ignore this email — no account will be activated without verification, and your address won't be added to any list.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFAF8; padding:28px 44px; border-top:1px solid #E4E2DB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="font-family:Georgia, 'Times New Roman', serif; font-weight:700; font-size:13px; color:#0F3D28; padding-bottom:8px;">Root ASAP</td></tr>
                <tr>
                  <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:11.5px; line-height:1.7; color:#83807A;">
                    Direct diaspora investment, without the gatekeepers.<br />
                    London, United Kingdom &nbsp;·&nbsp; <a href="mailto:hello@rootasap.com" style="color:#83807A; text-decoration:underline;">hello@rootasap.com</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:14px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:11px; color:#A9A69A;">
                    You're receiving this because this address was used to create a Root ASAP account. If this wasn't you, no action is needed.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

module.exports = { renderVerifyEmail };
