import { Request, Response, NextFunction, Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const APPLE_JWKS_URL = new URL('https://appleid.apple.com/auth/keys');
const appleJWKS = createRemoteJWKSet(APPLE_JWKS_URL);

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
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Sva polja su obavezna" });
      }

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
      
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Greška pri registraciji" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email i lozinka su obavezni" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Pogrešan email ili lozinka" });
      }

      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Pogrešan email ili lozinka" });
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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

      const googleUser = await response.json();
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
      res.json(userWithoutPassword);
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
      res.json(userWithoutPassword);
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
