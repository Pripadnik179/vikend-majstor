import { Request, Response, NextFunction, Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { storage } from "./storage";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";
import { logLoginAttempt, validateLogin, validateRegistration, handleValidationErrors } from "./security";
import type { User } from "@shared/schema";

const APPLE_JWKS_URL = new URL('https://appleid.apple.com/auth/keys');
const appleJWKS = createRemoteJWKSet(APPLE_JWKS_URL);

function getVerificationPage(success: boolean, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verifikacija - VikendMajstor</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1A1A1A 0%, #333 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 40px;
        }
        .icon.success { background: #FFCC00; }
        .icon.error { background: #ff4444; }
        h1 { color: #1A1A1A; margin-bottom: 16px; font-size: 24px; }
        p { color: #666; font-size: 16px; line-height: 1.5; }
        .logo { font-size: 28px; font-weight: 700; color: #FFCC00; margin-bottom: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">VikendMajstor</div>
        <div class="icon ${success ? 'success' : 'error'}">
          ${success ? '✓' : '✕'}
        </div>
        <h1>${success ? 'Uspešno!' : 'Greška'}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}

const scryptAsync = promisify(scrypt);

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedPasswordBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

function generateAuthToken(userId: string, secret: string): string {
  return Buffer.from(`${userId}:${secret}`).toString('base64');
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
  }

  const replitDomains = process.env.REPLIT_DOMAINS || '';
  const isProduction = process.env.NODE_ENV === 'production' || 
                       replitDomains.includes('vikendmajstor.rs') ||
                       process.env.REPLIT_DEPLOYMENT === '1';
  
  console.log(`[AUTH] Session config: isProduction=${isProduction}, NODE_ENV=${process.env.NODE_ENV}`);
  
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: isProduction ? "none" : "lax",
        domain: isProduction ? ".vikendmajstor.rs" : undefined,
      },
    })
  );

  app.use(async (req, res, next) => {
    // First check session cookie
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = user;
      }
    }
    
    // Then check Authorization header (for mobile apps)
    if (!req.user) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Token format: base64(userId:sessionSecret)
        try {
          const decoded = Buffer.from(token, 'base64').toString('utf-8');
          const [userId, secret] = decoded.split(':');
          if (secret === sessionSecret && userId) {
            const user = await storage.getUser(userId);
            if (user) {
              req.user = user;
              req.session.userId = userId;
            }
          }
        } catch (e) {
          // Invalid token format, ignore
        }
      }
    }
    
    next();
  });

  app.post("/api/auth/register", validateRegistration, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Korisnik sa ovim emailom već postoji" });
      }

      const earlyAdopterCount = await storage.getEarlyAdopterCount();
      const isEarlyAdopter = earlyAdopterCount < 100;

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        role: role || "renter",
        isEarlyAdopter,
        subscriptionType: isEarlyAdopter ? "premium" : "free",
        subscriptionStatus: isEarlyAdopter ? "active" : undefined,
        subscriptionEndDate: isEarlyAdopter ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      });

      req.session.userId = user.id;
      
      const verificationToken = await storage.createVerificationToken(user.id, 'email');
      sendVerificationEmail(user.email, verificationToken.token, user.name).catch(err => {
        console.error('Failed to send verification email:', err);
      });
      
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.status(201).json({ ...userWithoutPassword, authToken });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Greška pri registraciji" });
    }
  });

  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).send(getVerificationPage(false, 'Nevažeći link za verifikaciju'));
      }
      
      const verificationToken = await storage.getVerificationToken(token);
      
      if (!verificationToken) {
        return res.status(400).send(getVerificationPage(false, 'Link za verifikaciju je istekao ili je već iskorišćen'));
      }
      
      if (new Date() > verificationToken.expiresAt) {
        await storage.deleteVerificationToken(token);
        return res.status(400).send(getVerificationPage(false, 'Link za verifikaciju je istekao'));
      }
      
      await storage.verifyUserEmail(verificationToken.userId);
      await storage.deleteVerificationToken(token);
      
      res.send(getVerificationPage(true, 'Vaš email je uspešno verifikovan! Možete zatvoriti ovu stranicu.'));
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).send(getVerificationPage(false, 'Došlo je do greške. Pokušajte ponovo.'));
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      let user;
      
      if (req.body.email) {
        user = await storage.getUserByEmail(req.body.email);
        if (!user) {
          return res.json({ success: true, message: "Ako nalog postoji, verifikacioni email je poslat" });
        }
      } else if (req.user) {
        user = req.user;
      } else {
        return res.status(400).json({ error: "Email adresa je obavezna" });
      }
      
      if (user.emailVerified) {
        return res.json({ success: true, message: "Ako nalog postoji, verifikacioni email je poslat" });
      }
      
      const verificationToken = await storage.createVerificationToken(user.id, 'email');
      const sent = await sendVerificationEmail(user.email, verificationToken.token, user.name);
      
      console.log(`[EMAIL] Resend verification to ${user.email}: ${sent ? 'SUCCESS' : 'FAILED'}`);
      
      res.json({ success: true, message: "Ako nalog postoji, verifikacioni email je poslat" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ error: "Greška pri slanju emaila" });
    }
  });

  app.post("/api/auth/login", validateLogin, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        logLoginAttempt(req, false, email);
        return res.status(401).json({ error: "Pogrešan email ili lozinka" });
      }

      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        logLoginAttempt(req, false, email);
        return res.status(401).json({ error: "Pogrešan email ili lozinka" });
      }

      if (!user.emailVerified) {
        return res.status(403).json({ 
          error: "Morate potvrditi email adresu pre prijave", 
          code: "EMAIL_NOT_VERIFIED",
          email: user.email 
        });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Vaš nalog je deaktiviran" });
      }

      logLoginAttempt(req, true, email);
      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.json({ ...userWithoutPassword, authToken });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Greška pri prijavi" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Greška pri odjavi" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email je obavezan" });
      }

      const user = await storage.getUserByEmail(email);
      if (user) {
        const resetToken = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        
        await storage.createVerificationToken(user.id, resetToken, "password_reset", expiresAt);
        await sendPasswordResetEmail(email, resetToken, user.name);
      }

      // Always return success to prevent email enumeration
      res.json({ success: true });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.json({ success: true });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: "Token i nova lozinka su obavezni" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Lozinka mora imati najmanje 6 karaktera" });
      }

      const tokenRecord = await storage.getVerificationToken(token);
      if (!tokenRecord || tokenRecord.type !== "password_reset") {
        return res.status(400).json({ error: "Nevazeci ili istekli link za resetovanje" });
      }

      if (new Date() > tokenRecord.expiresAt) {
        await storage.deleteVerificationToken(token);
        return res.status(400).json({ error: "Link za resetovanje je istekao" });
      }

      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(tokenRecord.userId, hashedPassword);
      await storage.deleteVerificationToken(token);

      res.json({ success: true });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Greska pri resetovanju lozinke" });
    }
  });

  app.get("/reset-password", async (req, res) => {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.send(getVerificationPage(false, 'Nevazeci link za resetovanje lozinke.'));
    }

    const tokenRecord = await storage.getVerificationToken(token);
    if (!tokenRecord || tokenRecord.type !== "password_reset") {
      return res.send(getVerificationPage(false, 'Nevazeci link za resetovanje lozinke.'));
    }

    if (new Date() > tokenRecord.expiresAt) {
      await storage.deleteVerificationToken(token);
      return res.send(getVerificationPage(false, 'Link za resetovanje je istekao. Zatrazite novi link.'));
    }

    // Show password reset form
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resetovanje lozinke - VikendMajstor</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1A1A1A 0%, #333 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          }
          .logo { font-size: 28px; font-weight: 700; color: #FFCC00; margin-bottom: 24px; text-align: center; }
          h1 { color: #1A1A1A; margin-bottom: 16px; font-size: 24px; text-align: center; }
          p { color: #666; font-size: 14px; margin-bottom: 24px; text-align: center; }
          .form-group { margin-bottom: 16px; position: relative; }
          label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; }
          input[type="password"], input[type="text"] {
            width: 100%;
            padding: 12px 40px 12px 16px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
          }
          .toggle-password {
            position: absolute;
            right: 12px;
            top: 38px;
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            font-size: 18px;
          }
          button[type="submit"] {
            width: 100%;
            padding: 14px;
            background: #FFCC00;
            color: #1A1A1A;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          }
          button[type="submit"]:hover { background: #E6B800; }
          button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }
          .error { color: #ff4444; font-size: 14px; margin-top: 8px; display: none; }
          .success { color: #22C55E; font-size: 14px; margin-top: 8px; display: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">VikendMajstor</div>
          <h1>Nova lozinka</h1>
          <p>Unesite novu lozinku za vas nalog</p>
          <form id="resetForm">
            <div class="form-group">
              <label for="password">Nova lozinka</label>
              <input type="password" id="password" name="password" required minlength="6" placeholder="Najmanje 6 karaktera">
              <button type="button" class="toggle-password" onclick="togglePassword('password', this)">👁</button>
            </div>
            <div class="form-group">
              <label for="confirmPassword">Potvrdite lozinku</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Ponovite lozinku">
              <button type="button" class="toggle-password" onclick="togglePassword('confirmPassword', this)">👁</button>
            </div>
            <div class="error" id="error"></div>
            <div class="success" id="success"></div>
            <button type="submit" id="submitBtn">Resetuj lozinku</button>
          </form>
        </div>
        <script>
          function togglePassword(fieldId, btn) {
            const field = document.getElementById(fieldId);
            if (field.type === 'password') {
              field.type = 'text';
              btn.textContent = '🙈';
            } else {
              field.type = 'password';
              btn.textContent = '👁';
            }
          }
          
          document.getElementById('resetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorEl = document.getElementById('error');
            const successEl = document.getElementById('success');
            const submitBtn = document.getElementById('submitBtn');
            
            errorEl.style.display = 'none';
            successEl.style.display = 'none';
            
            if (password !== confirmPassword) {
              errorEl.textContent = 'Lozinke se ne podudaraju';
              errorEl.style.display = 'block';
              return;
            }
            
            if (password.length < 6) {
              errorEl.textContent = 'Lozinka mora imati najmanje 6 karaktera';
              errorEl.style.display = 'block';
              return;
            }
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Resetovanje...';
            
            try {
              const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', password })
              });
              
              const data = await res.json();
              
              if (res.ok) {
                successEl.textContent = 'Lozinka je uspesno resetovana! Mozete se prijaviti sa novom lozinkom.';
                successEl.style.display = 'block';
                document.getElementById('resetForm').style.display = 'none';
              } else {
                errorEl.textContent = data.error || 'Greska pri resetovanju lozinke';
                errorEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Resetuj lozinku';
              }
            } catch (err) {
              errorEl.textContent = 'Greska pri povezivanju sa serverom';
              errorEl.style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Resetuj lozinku';
            }
          });
        </script>
      </body>
      </html>
    `);
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Niste prijavljeni" });
    }
    
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/google", async (req, res) => {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        return res.status(400).json({ error: "Access token je obavezan" });
      }

      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        return res.status(401).json({ error: "Neispravan Google token" });
      }

      const googleUser = await response.json();
      const { email, name, picture } = googleUser;

      if (!email) {
        return res.status(400).json({ error: "Nije moguće dobiti email sa Google naloga" });
      }

      let user = await storage.getUserByEmail(email);
      let isNewUser = false;
      let emailVerificationSent = false;

      if (!user) {
        isNewUser = true;
        const earlyAdopterCount = await storage.getEarlyAdopterCount();
        const isEarlyAdopter = earlyAdopterCount < 100;

        const randomPassword = randomBytes(32).toString("hex");
        const hashedPassword = await hashPassword(randomPassword);
        user = await storage.createUser({
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          role: "renter",
          avatarUrl: picture || undefined,
          isEarlyAdopter,
          subscriptionType: isEarlyAdopter ? "premium" : "free",
          subscriptionStatus: isEarlyAdopter ? "active" : undefined,
          subscriptionEndDate: isEarlyAdopter ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        });

        // Automatically send verification email for new Google users
        const verificationToken = await storage.createVerificationToken(user.id, 'email');
        sendVerificationEmail(user.email, verificationToken.token, user.name).then(sent => {
          emailVerificationSent = sent;
          console.log(`[GOOGLE AUTH] Verification email ${sent ? 'sent' : 'failed'} to ${user!.email}`);
        }).catch(err => {
          console.error('[GOOGLE AUTH] Failed to send verification email:', err);
        });
        emailVerificationSent = true; // Assume success for immediate response
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.json({ 
        ...userWithoutPassword, 
        authToken,
        isNewUser,
        emailVerificationSent: isNewUser ? emailVerificationSent : undefined
      });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ error: "Greška pri Google prijavi" });
    }
  });

  app.post("/api/auth/apple", async (req, res) => {
    try {
      const { identityToken, fullName } = req.body;

      if (!identityToken) {
        return res.status(400).json({ error: "Identity token je obavezan" });
      }

      let payload;
      try {
        const { payload: verifiedPayload } = await jwtVerify(identityToken, appleJWKS, {
          issuer: 'https://appleid.apple.com',
        });
        payload = verifiedPayload;
      } catch (jwtError: any) {
        console.error("Apple JWT verification failed:", jwtError);
        return res.status(401).json({ error: "Neispravan ili istekao Apple token" });
      }
      
      const appleUserId = payload.sub as string;
      const email = payload.email as string | undefined;

      if (!appleUserId) {
        return res.status(400).json({ error: "Nije moguće dobiti Apple korisnički ID" });
      }

      const userEmail = email || `apple_${appleUserId}@privaterelay.appleid.com`;

      let user = await storage.getUserByEmail(userEmail);
      let isNewUser = false;
      let emailVerificationSent = false;

      if (!user) {
        isNewUser = true;
        const earlyAdopterCount = await storage.getEarlyAdopterCount();
        const isEarlyAdopter = earlyAdopterCount < 100;

        const randomPassword = randomBytes(32).toString("hex");
        const hashedPassword = await hashPassword(randomPassword);
        const userName = fullName && fullName.trim() ? fullName.trim() : 'Apple User';
        user = await storage.createUser({
          email: userEmail,
          password: hashedPassword,
          name: userName,
          role: "renter",
          isEarlyAdopter,
          subscriptionType: isEarlyAdopter ? "premium" : "free",
          subscriptionStatus: isEarlyAdopter ? "active" : undefined,
          subscriptionEndDate: isEarlyAdopter ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        });

        // Automatically send verification email for new Apple users (if real email)
        if (email && !userEmail.includes('privaterelay.appleid.com')) {
          const verificationToken = await storage.createVerificationToken(user.id, 'email');
          sendVerificationEmail(user.email, verificationToken.token, user.name).then(sent => {
            console.log(`[APPLE AUTH] Verification email ${sent ? 'sent' : 'failed'} to ${user!.email}`);
          }).catch(err => {
            console.error('[APPLE AUTH] Failed to send verification email:', err);
          });
          emailVerificationSent = true;
        }
      } else if (fullName && fullName.trim() && user.name === 'Apple User') {
        await storage.updateUser(user.id, { name: fullName.trim() });
        user = { ...user, name: fullName.trim() };
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.json({ 
        ...userWithoutPassword, 
        authToken,
        isNewUser,
        emailVerificationSent: isNewUser ? emailVerificationSent : undefined
      });
    } catch (error) {
      console.error("Apple auth error:", error);
      res.status(500).json({ error: "Greška pri Apple prijavi" });
    }
  });
}

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Morate biti prijavljeni" });
  }
  next();
}

export function isVerifiedUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: "Morate biti prijavljeni" });
  }
  if (!req.user.emailVerified) {
    return res.status(403).json({ 
      error: "Molimo vas da prvo potvrdite svoju email adresu kako biste nastavili.",
      code: "EMAIL_NOT_VERIFIED"
    });
  }
  next();
}
