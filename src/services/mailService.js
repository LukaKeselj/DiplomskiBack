import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

function buildVerificationEmailHtml(verificationUrl){
    return `<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verifikacija naloga</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@500;600&display=swap');
  @media only screen and (max-width: 480px) {
    .container { width: 100% !important; border-radius: 0 !important; border-left:none !important; border-right:none !important; }
    .pad { padding-left: 28px !important; padding-right: 28px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Inter',ui-sans-serif,system-ui,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f4f4f5;">
    Tvoj verifikacioni kod je unutra. Važi još 10 minuta.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" class="container" width="420" cellpadding="0" cellspacing="0" style="max-width:420px;width:100%;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:12px;">
          <tr>
            <td class="pad" style="padding:40px 40px 8px 40px;">

              <!-- logo / brand -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                      <td style="vertical-align:middle;padding-right:8px;">
                        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                          <td width="24" height="24" align="center" valign="middle" style="width:24px;height:24px;background-color:#18181b;border-radius:6px;font-family:Arial,sans-serif;font-size:13px;color:#fafafa;font-weight:700;">T</td>
                        </tr></table>
                      </td>
                      <td style="vertical-align:middle;font-size:14px;font-weight:600;color:#18181b;">Treniraj</td>
                    </tr></table>
                  </td>
                </tr>
              </table>

              <!-- heading -->
              <p style="margin:0 0 6px 0;font-size:22px;line-height:1.3;font-weight:700;color:#09090b;text-align:center;">Potvrdi svoj nalog</p>
              <p style="margin:0 0 32px 0;font-size:14px;line-height:1.5;color:#71717a;text-align:center;">
                Klikni na dugme ispod da potvrdiš email i završiš registraciju.
              </p>

              <!-- primary button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="background-color:#18181b;border-radius:6px;">
                  <a href="${verificationUrl}" style="display:block;padding:11px 0;font-size:14px;font-weight:500;color:#fafafa;text-decoration:none;text-align:center;">Potvrdi email</a>
                </td>
              </tr></table>
              <p style="margin:12px 0 0 0;font-size:12px;color:#a1a1aa;text-align:center;">Link ističe za 1 dan.</p>

              <!-- fallback link -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:6px;background-color:#fafafa;margin-top:20px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 4px 0;font-size:11px;color:#a1a1aa;">Ako dugme ne radi, kopiraj link u pretraživač:</p>
                    <p style="margin:0;font-size:12px;color:#3f3f46;word-break:break-all;">${verificationUrl}</p>
                  </td>
                </tr>
              </table>

              <!-- separator -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr>
                <td width="42%" style="border-top:1px solid #e4e4e7;font-size:0;line-height:0;">&nbsp;</td>
                <td width="16%" align="center" style="font-size:12px;color:#a1a1aa;">ili</td>
                <td width="42%" style="border-top:1px solid #e4e4e7;font-size:0;line-height:0;">&nbsp;</td>
              </tr></table>

              <!-- secondary note -->
              <p style="margin:0 0 40px 0;font-size:13px;line-height:1.5;color:#71717a;text-align:center;">
                Nisi tražio/la ovaj kod? Ignoriši ovaj email.
              </p>

            </td>
          </tr>
        </table>

        <p style="margin:20px 0 0 0;font-size:12px;color:#a1a1aa;text-align:center;">Treniraj · aplikacija za praćenje treninga</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(to, verificationUrl){
    await transport.sendMail({
        from: `"Treniraj" <${process.env.GMAIL_USER}>`,
        to,
        subject: "Potvrdi svoj nalog",
        text: `Dobrodošao! Potvrdi svoj email otvaranjem ovog linka: ${verificationUrl}`,
        html: buildVerificationEmailHtml(verificationUrl),
    });
}

function buildPasswordResetEmailHtml(resetUrl){
    return `<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset šifre</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@500;600&display=swap');
  @media only screen and (max-width: 480px) {
    .container { width: 100% !important; border-radius: 0 !important; border-left:none !important; border-right:none !important; }
    .pad { padding-left: 28px !important; padding-right: 28px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Inter',ui-sans-serif,system-ui,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f4f4f5;">
    Zatražio/la si reset šifre. Link važi još 30 minuta.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" class="container" width="420" cellpadding="0" cellspacing="0" style="max-width:420px;width:100%;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:12px;">
          <tr>
            <td class="pad" style="padding:40px 40px 8px 40px;">

              <!-- logo / brand -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                      <td style="vertical-align:middle;padding-right:8px;">
                        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                          <td width="24" height="24" align="center" valign="middle" style="width:24px;height:24px;background-color:#18181b;border-radius:6px;font-family:Arial,sans-serif;font-size:13px;color:#fafafa;font-weight:700;">T</td>
                        </tr></table>
                      </td>
                      <td style="vertical-align:middle;font-size:14px;font-weight:600;color:#18181b;">Treniraj</td>
                    </tr></table>
                  </td>
                </tr>
              </table>

              <!-- heading -->
              <p style="margin:0 0 6px 0;font-size:22px;line-height:1.3;font-weight:700;color:#09090b;text-align:center;">Resetuj šifru</p>
              <p style="margin:0 0 32px 0;font-size:14px;line-height:1.5;color:#71717a;text-align:center;">
                Klikni na dugme ispod da postaviš novu šifru za svoj nalog.
              </p>

              <!-- primary button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="background-color:#18181b;border-radius:6px;">
                  <a href="${resetUrl}" style="display:block;padding:11px 0;font-size:14px;font-weight:500;color:#fafafa;text-decoration:none;text-align:center;">Resetuj šifru</a>
                </td>
              </tr></table>
              <p style="margin:12px 0 0 0;font-size:12px;color:#a1a1aa;text-align:center;">Link ističe za 30 minuta.</p>

              <!-- fallback link -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:6px;background-color:#fafafa;margin-top:20px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 4px 0;font-size:11px;color:#a1a1aa;">Ako dugme ne radi, kopiraj link u pretraživač:</p>
                    <p style="margin:0;font-size:12px;color:#3f3f46;word-break:break-all;">${resetUrl}</p>
                  </td>
                </tr>
              </table>

              <!-- separator -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr>
                <td width="42%" style="border-top:1px solid #e4e4e7;font-size:0;line-height:0;">&nbsp;</td>
                <td width="16%" align="center" style="font-size:12px;color:#a1a1aa;">ili</td>
                <td width="42%" style="border-top:1px solid #e4e4e7;font-size:0;line-height:0;">&nbsp;</td>
              </tr></table>

              <!-- secondary note -->
              <p style="margin:0 0 40px 0;font-size:13px;line-height:1.5;color:#71717a;text-align:center;">
                Nisi tražio/la reset šifre? Ignoriši ovaj email, tvoja šifra ostaje nepromijenjena.
              </p>

            </td>
          </tr>
        </table>

        <p style="margin:20px 0 0 0;font-size:12px;color:#a1a1aa;text-align:center;">Treniraj · aplikacija za praćenje treninga</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail(to, resetUrl){
    await transport.sendMail({
        from: `"Treniraj" <${process.env.GMAIL_USER}>`,
        to,
        subject: "Resetuj svoju šifru",
        text: `Zatražio/la si reset šifre. Otvori ovaj link da postaviš novu šifru: ${resetUrl}`,
        html: buildPasswordResetEmailHtml(resetUrl),
    });
}
