import { Resend } from "resend";

// Design tokens (email-safe hex equivalents of globals.css values)
// --orbit-brand: oklch(0.6 0.22 264) → #6b6fe8
// --foreground:  oklch(0.145 0 0)    → #1a1a1a
// --muted-fg:    oklch(0.556 0 0)    → #737373
// --border:      oklch(0.922 0 0)    → #e4e4e7
const T = {
  brand: "#6b6fe8",
  fg: "#1a1a1a",
  muted: "#737373",
  border: "#e4e4e7",
  bg: "#f4f4f5",
  card: "#ffffff",
  btnFg: "#ffffff",
};

const FROM =
  process.env.RESEND_FROM_EMAIL
    ? `Orbit <${process.env.RESEND_FROM_EMAIL}>`
    : "Orbit <onboarding@resend.dev>";

function emailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${T.bg};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${T.bg};padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${T.card};border:1px solid ${T.border};border-radius:10px;padding:40px;">
        <tr><td>

          <!-- Wordmark -->
          <div style="margin-bottom:32px;">
            <span style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:18px;font-weight:700;color:${T.fg};letter-spacing:-0.3px;">Orbit</span>
          </div>

          ${content}

          <!-- Footer -->
          <div style="margin-top:40px;padding-top:24px;border-top:1px solid ${T.border};">
            <p style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:12px;color:${T.muted};margin:0;line-height:1.5;">
              You received this email because an action was taken on your Orbit account.<br>
              © ${new Date().getFullYear()} Orbit
            </p>
          </div>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:11px 22px;background:${T.brand};color:${T.btnFg};text-decoration:none;border-radius:8px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:14px;font-weight:500;letter-spacing:-0.1px;">${label}</a>`;
}

function p(text: string): string {
  return `<p style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;color:${T.fg};line-height:1.6;margin:0 0 12px;">${text}</p>`;
}

function h1(text: string): string {
  return `<h1 style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:22px;font-weight:700;color:${T.fg};letter-spacing:-0.4px;margin:0 0 20px;">${text}</h1>`;
}

export async function sendInviteEmail(
  to: string,
  inviterName: string | null,
  workspaceName: string,
  token: string
) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/invite/${token}`;
  const from = inviterName ?? "Someone";

  const html = emailShell(`
    ${h1("You've been invited")}
    ${p(`<strong>${from}</strong> has invited you to join <strong>${workspaceName}</strong> on Orbit.`)}
    ${p(`Click the button below to accept. This invite expires in 7 days.`)}
    ${ctaButton(link, "Accept invitation →")}
    <p style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:13px;color:${T.muted};margin:16px 0 0;line-height:1.5;">
      Or copy this link: <a href="${link}" style="color:${T.brand};text-decoration:none;">${link}</a>
    </p>
  `);

  const text = `${from} invited you to join ${workspaceName} on Orbit.\n\nAccept: ${link}\n\nThis invite expires in 7 days.`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${from} invited you to ${workspaceName}`,
    html,
    text,
  });
}

export async function sendWelcomeEmail(
  to: string,
  fullName: string | null,
  workspaceName: string
) {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const name = fullName ?? "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/dashboard`;

  const html = emailShell(`
    ${h1(`Welcome to Orbit, ${name}!`)}
    ${p(`Your workspace <strong>${workspaceName}</strong> is ready. Orbit helps your team ship faster — create boards, track issues, and keep everything in one place.`)}
    ${p(`Here's what you can do to get started:`)}
    <ul style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;color:${T.fg};line-height:1.8;margin:0 0 4px;padding-left:20px;">
      <li>Create a board for your project</li>
      <li>Invite your team members</li>
      <li>Add issues and assign them</li>
    </ul>
    ${ctaButton(link, "Open your workspace →")}
  `);

  const text = `Welcome to Orbit, ${name}!\n\nYour workspace ${workspaceName} is ready.\n\nOpen it here: ${link}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to Orbit, ${name}!`,
    html,
    text,
  });
}
