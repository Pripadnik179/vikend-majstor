// Build timestamp: 2024-12-22T23:55:00Z - Embedded landing page template
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { setupSecurity } from "./security";
import { LANDING_PAGE_TEMPLATE } from "./landing-page-template";
import * as fs from "fs";
import * as path from "path";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ES module polyfill for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scryptAsync = promisify(scrypt);

async function hashPasswordForAdmin(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function initializeAdminAccount() {
  const adminEmail = "admin@vikendmajstor.rs";
  const adminPassword = "Caralazara13";
  
  try {
    const existingAdmin = await storage.getUserByEmail(adminEmail);
    if (!existingAdmin) {
      const hashedPassword = await hashPasswordForAdmin(adminPassword);
      await storage.createUser({
        email: adminEmail,
        password: hashedPassword,
        name: "Administrator",
        role: "owner",
        emailVerified: true,
        isAdmin: true,
        isActive: true,
      });
      console.log(`[ADMIN] Created admin account: ${adminEmail}`);
    } else if (!existingAdmin.isAdmin) {
      // Ensure existing user has admin privileges
      await storage.updateUserAdmin(existingAdmin.id, { isAdmin: true, isActive: true });
      console.log(`[ADMIN] Updated existing user to admin: ${adminEmail}`);
    }
  } catch (error) {
    console.error("[ADMIN] Error initializing admin account:", error);
  }
}

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origins = new Set<string>();

    if (process.env.REPLIT_DEV_DOMAIN) {
      const baseDomain = process.env.REPLIT_DEV_DOMAIN;
      origins.add(`https://${baseDomain}`);
      
      // Add port-specific domains for Replit's port routing
      // Format: xxx--PORT.spock.replit.dev
      const parts = baseDomain.split('.');
      if (parts.length >= 3) {
        // Add common ports used in development
        for (const port of ['8081', '8082', '3000', '5173']) {
          const portDomain = `${parts[0]}--${port}.${parts.slice(1).join('.')}`;
          origins.add(`https://${portDomain}`);
        }
      }
    }

    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d: string) => {
        origins.add(`https://${d.trim()}`);
      });
    }

    const origin = req.header("origin");

    // Check if origin matches any allowed origin or is a Replit domain with port
    let isAllowed = origin && origins.has(origin);
    
    // Also allow any Replit domain with port pattern
    if (!isAllowed && origin && (origin.includes('.replit.dev') || origin.includes('.repl.co'))) {
      isAllowed = true;
    }

    if (isAllowed && origin) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const customLandingPath = path.resolve(
    process.cwd(),
    "server",
    "landing",
    "index.html",
  );
  const adminPanelPath = path.resolve(
    process.cwd(),
    "server",
    "admin",
    "index.html",
  );
  // Use embedded template instead of reading from file system
  const landingPageTemplate = LANDING_PAGE_TEMPLATE;
  const appName = getAppName();
  
  const hasCustomLanding = fs.existsSync(customLandingPath);
  const hasAdminPanel = fs.existsSync(adminPanelPath);

  log("Serving static Expo files with dynamic manifest routing");
  
  // Serve admin panel at /admin
  if (hasAdminPanel) {
    app.get("/admin", (_req: Request, res: Response) => {
      res.sendFile(adminPanelPath);
    });
    app.get("/admin/*", (_req: Request, res: Response) => {
      res.sendFile(adminPanelPath);
    });
    log("Admin panel available at /admin");
  }

  // Serve favicon
  app.get("/favicon.png", (_req: Request, res: Response) => {
    const faviconPath = path.resolve(process.cwd(), "server", "templates", "favicon.png");
    if (fs.existsSync(faviconPath)) {
      res.sendFile(faviconPath);
    } else {
      res.status(404).send("Favicon not found");
    }
  });

  // Redirect /verify to /api/auth/verify-email (for email verification links)
  app.get("/verify", (req: Request, res: Response) => {
    const token = req.query.token;
    if (token) {
      return res.redirect(`/api/auth/verify-email?token=${token}`);
    }
    res.redirect("/");
  });

  // Legal pages
  app.get("/uslovi-koriscenja", (_req: Request, res: Response) => {
    const termsPath = path.resolve(process.cwd(), "server", "templates", "terms.html");
    if (fs.existsSync(termsPath)) {
      res.sendFile(termsPath);
    } else {
      res.status(404).send("Page not found");
    }
  });

  app.get("/politika-privatnosti", (_req: Request, res: Response) => {
    const privacyPath = path.resolve(process.cwd(), "server", "templates", "privacy.html");
    if (fs.existsSync(privacyPath)) {
      res.sendFile(privacyPath);
    } else {
      res.status(404).send("Page not found");
    }
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    // Check hostname to determine what to serve
    const hostname = req.hostname || req.headers.host?.split(':')[0] || '';
    const isMainLandingDomain = hostname === 'vikendmajstor.rs' || hostname === 'www.vikendmajstor.rs';
    
    if (req.path === "/") {
      // Only serve landing page on vikendmajstor.rs (not app.vikendmajstor.rs)
      if (isMainLandingDomain) {
        if (hasCustomLanding) {
          return res.sendFile(customLandingPath);
        }
        return serveLandingPage({
          req,
          res,
          landingPageTemplate,
          appName,
        });
      }
      // For app.vikendmajstor.rs and other domains, let static-build (Expo) handle it
      return next();
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  log("Expo routing: Checking expo-platform header on / and /manifest");
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    res.status(status).json({ message });

    throw err;
  });
}

(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupSecurity(app);
  setupRequestLogging(app);

  configureExpoAndLanding(app);

  const server = await registerRoutes(app);

  setupErrorHandler(app);

  try {
    const deletedCount = await storage.deleteExpiredItems();
    if (deletedCount > 0) {
      log(`Cleaned up ${deletedCount} expired items on startup`);
    }
  } catch (error) {
    console.error("Error cleaning up expired items:", error);
  }

  // Initialize admin account if it doesn't exist
  await initializeAdminAccount();

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`express server serving on port ${port}`);
    },
  );
})();
