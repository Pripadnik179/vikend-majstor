import { Request, Response, NextFunction, Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { storage } from "./storage";
import { sendVerificationEmail } from "./email";
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

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
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
      if (!req.user) {
        return res.status(401).json({ error: "Morate biti prijavljeni" });
      }
      
      if (req.user.emailVerified) {
        return res.status(400).json({ error: "Email je već verifikovan" });
      }
      
      const verificationToken = await storage.createVerificationToken(req.user.id, 'email');
      const sent = await sendVerificationEmail(req.user.email, verificationToken.token, req.user.name);
      
      if (sent) {
        res.json({ success: true, message: "Verifikacioni email je poslat" });
      } else {
        res.status(500).json({ error: "Greška pri slanju emaila" });
      }
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

      const googleUser = await response.json() as { email?: string; name?: string; picture?: string };
      const { email, name, picture } = googleUser;

      if (!email) {
        return res.status(400).json({ error: "Nije moguće dobiti email sa Google naloga" });
      }

      let user = await storage.getUserByEmail(email);

      if (!user) {
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
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.json({ ...userWithoutPassword, authToken });
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

      if (!user) {
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
      } else if (fullName && fullName.trim() && user.name === 'Apple User') {
        await storage.updateUser(user.id, { name: fullName.trim() });
        user = { ...user, name: fullName.trim() };
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.json({ ...userWithoutPassword, authToken });
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
