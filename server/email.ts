import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'VikendMajstor <onboarding@resend.dev>';

export async function sendVerificationEmail(to: string, verificationToken: string, userName: string): Promise<boolean> {
  const baseUrl = process.env.EXPO_PUBLIC_DOMAIN 
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` 
    : 'http://localhost:5000';
  
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
  
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Potvrdite vašu email adresu - VikendMajstor',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Potvrdite email</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #FFCC00 0%, #FFB800 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #1A1A1A; margin: 0; font-size: 28px; font-weight: 700;">VikendMajstor</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1A1A1A; margin: 0 0 20px 0; font-size: 24px;">Zdravo ${userName}!</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                        Hvala vam što ste se registrovali na VikendMajstor - platformu za iznajmljivanje alata od komšija.
                      </p>
                      <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                        Da biste aktivirali vaš nalog, molimo vas da potvrdite vašu email adresu klikom na dugme ispod:
                      </p>
                      <table role="presentation" style="margin: 0 auto 30px auto;">
                        <tr>
                          <td style="border-radius: 8px; background-color: #FFCC00;">
                            <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; color: #1A1A1A; text-decoration: none; font-weight: 600; font-size: 16px;">
                              Potvrdi email adresu
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 0 0 20px 0;">
                        Ako dugme ne radi, kopirajte ovaj link u pretraživač:
                      </p>
                      <p style="color: #FFCC00; font-size: 14px; word-break: break-all; margin: 0 0 30px 0;">
                        ${verificationUrl}
                      </p>
                      <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 0;">
                        Ovaj link ističe za 24 sata.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
                      <p style="color: #999999; font-size: 12px; margin: 0;">
                        Ako niste kreirali nalog na VikendMajstor, ignorišite ovaj email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return false;
    }

    console.log('Verification email sent to:', to);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<boolean> {
  const baseUrl = process.env.EXPO_PUBLIC_DOMAIN 
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` 
    : 'http://localhost:5000';
  
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Reset lozinke - VikendMajstor',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #FFCC00 0%, #FFB800 100%); padding: 30px; text-align: center;">
                      <h1 style="color: #1A1A1A; margin: 0; font-size: 28px;">VikendMajstor</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #1A1A1A; margin: 0 0 20px 0;">Zdravo ${userName}!</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 24px;">
                        Primili smo zahtev za reset vaše lozinke. Kliknite na dugme ispod da postavite novu lozinku:
                      </p>
                      <table role="presentation" style="margin: 30px auto;">
                        <tr>
                          <td style="border-radius: 8px; background-color: #FFCC00;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; color: #1A1A1A; text-decoration: none; font-weight: 600;">
                              Resetuj lozinku
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="color: #999999; font-size: 14px;">
                        Link ističe za 1 sat. Ako niste zatražili reset lozinke, ignorišite ovaj email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}
