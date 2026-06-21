import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
  to: string,
  fullName: string | null,
  workspaceName: string
) {
  if (!process.env.RESEND_API_KEY) return;

  const name = fullName ?? "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await resend.emails.send({
    from: "Orbit <onboarding@resend.dev>",
    to,
    subject: `Welcome to Orbit, ${name}!`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h1 style="font-size:24px;font-weight:700">Welcome to Orbit!</h1>
        <p>Hi ${name},</p>
        <p>Your workspace <strong>${workspaceName}</strong> is ready. Start managing your projects with Orbit.</p>
        <a href="${appUrl}/dashboard" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px">
          Open your workspace →
        </a>
      </div>
    `,
  });
}
