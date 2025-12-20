import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Use VERIFICATION_BASE_URL for email links - defaults to vikendmajstor.rs in production
// For Replit development, set this to your Replit deployment URL
const getBaseUrl = () => {
  if (process.env.VERIFICATION_BASE_URL) {
    return process.env.VERIFICATION_BASE_URL;
  }
  // In development on Replit, use the dev domain if available
  if (process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}:5000`;
  }
  // Default to main domain for production
  return 'https://vikendmajstor.rs';
};

export async function sendVerificationEmail(to: string, verificationToken: string, userName: string): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/verify?token=${verificationToken}`;
  
  const mailOptions = {
    from: `"VikendMajstor" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Potvrdite svoju email adresu - VikendMajstor',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifikacija email adrese</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                    <h1 style="color: #FFCC00; margin: 0; font-size: 28px; font-weight: bold;">VikendMajstor</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1A1A1A; margin: 0 0 20px; font-size: 24px;">Dobrodošli, ${userName}!</h2>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Hvala vam što ste se registrovali na VikendMajstor platformi. Da biste aktivirali svoj nalog i počeli da koristite sve funkcije, potrebno je da potvrdite svoju email adresu.
                    </p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                      Kliknite na dugme ispod da potvrdite vašu email adresu:
                    </p>
                    
                    <!-- Button -->
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 8px; background-color: #FFCC00;">
                          <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; color: #1A1A1A; text-decoration: none; font-size: 18px; font-weight: bold;">
                            Potvrdi email adresu
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                      Ako dugme ne radi, kopirajte i nalepite sledeći link u vaš pretraživač:
                    </p>
                    <p style="color: #FFCC00; font-size: 14px; word-break: break-all; margin: 10px 0 0;">
                      <a href="${verificationUrl}" style="color: #FFCC00;">${verificationUrl}</a>
                    </p>
                    
                    <p style="color: #999999; font-size: 12px; margin: 30px 0 0;">
                      Ovaj link ističe za 24 sata. Ako niste vi kreirali nalog na VikendMajstor, možete ignorisati ovaj email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f5f5f5; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      &copy; ${new Date().getFullYear()} VikendMajstor. Sva prava zadržana.
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 5px 0 0;">
                      Ovo je automatska poruka. Molimo vas da ne odgovarate na ovaj email.
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
    text: `Dobrodošli na VikendMajstor, ${userName}!\n\nHvala vam što ste se registrovali. Da biste aktivirali svoj nalog, potvrdite svoju email adresu klikom na sledeći link:\n\n${verificationUrl}\n\nOvaj link ističe za 24 sata.\n\nAko niste vi kreirali nalog, možete ignorisati ovaj email.\n\nSrdačan pozdrav,\nVikendMajstor tim`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Verification email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send verification email to ${to}:`, error);
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<boolean> {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"VikendMajstor" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Resetovanje lozinke - VikendMajstor',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resetovanje lozinke</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                    <h1 style="color: #FFCC00; margin: 0; font-size: 28px; font-weight: bold;">VikendMajstor</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1A1A1A; margin: 0 0 20px; font-size: 24px;">Zdravo, ${userName}!</h2>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Primili smo zahtev za resetovanje lozinke vašeg VikendMajstor naloga.
                    </p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                      Kliknite na dugme ispod da kreirate novu lozinku:
                    </p>
                    
                    <!-- Button -->
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 8px; background-color: #FFCC00;">
                          <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; color: #1A1A1A; text-decoration: none; font-size: 18px; font-weight: bold;">
                            Resetuj lozinku
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                      Ako dugme ne radi, kopirajte i nalepite sledeći link u vaš pretraživač:
                    </p>
                    <p style="color: #FFCC00; font-size: 14px; word-break: break-all; margin: 10px 0 0;">
                      <a href="${resetUrl}" style="color: #FFCC00;">${resetUrl}</a>
                    </p>
                    
                    <p style="color: #999999; font-size: 12px; margin: 30px 0 0;">
                      Ovaj link ističe za 1 sat. Ako niste vi zatražili resetovanje lozinke, možete ignorisati ovaj email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f5f5f5; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      &copy; ${new Date().getFullYear()} VikendMajstor. Sva prava zadržana.
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 5px 0 0;">
                      Ovo je automatska poruka. Molimo vas da ne odgovarate na ovaj email.
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
    text: `Zdravo ${userName}!\n\nPrimili smo zahtev za resetovanje lozinke vašeg VikendMajstor naloga.\n\nKliknite na sledeći link da kreirate novu lozinku:\n\n${resetUrl}\n\nOvaj link ističe za 1 sat.\n\nAko niste vi zatražili resetovanje lozinke, možete ignorisati ovaj email.\n\nSrdačan pozdrav,\nVikendMajstor tim`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Password reset email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send password reset email to ${to}:`, error);
    return false;
  }
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('[EMAIL] SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('[EMAIL] SMTP connection failed:', error);
    return false;
  }
}
