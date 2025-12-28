import { Request, Response, NextFunction, Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, validationResult } from "express-validator";

const loginAttempts: Map<string, { count: number; lastAttempt: Date; blocked: boolean }> = new Map();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  let ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return ip;
}

export function logLoginAttempt(req: Request, success: boolean, email: string) {
  const ip = getClientIp(req);
  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'FAILED';
  console.log(`[AUTH] ${timestamp} | ${status} | IP: ${ip} | Email: ${email}`);
  
  if (!success) {
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: new Date(), blocked: false };
    attempts.count++;
    attempts.lastAttempt = new Date();
    
    if (attempts.count >= 5) {
      attempts.blocked = true;
      console.log(`[SECURITY] IP ${ip} blocked after ${attempts.count} failed login attempts`);
    }
    
    loginAttempts.set(ip, attempts);
  } else {
    loginAttempts.delete(ip);
  }
}

export function isIpBlocked(req: Request): boolean {
  const ip = getClientIp(req);
  const attempts = loginAttempts.get(ip);
  
  if (attempts?.blocked) {
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
    const blockDuration = 15 * 60 * 1000;
    
    if (timeSinceLastAttempt > blockDuration) {
      loginAttempts.delete(ip);
      return false;
    }
    return true;
  }
  
  return false;
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Previse zahteva. Pokusajte ponovo za 15 minuta." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Previse pokusaja prijave. Pokusajte ponovo za 15 minuta." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  validate: { xForwardedForHeader: false },
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "Previse zahteva. Pokusajte ponovo za sat vremena." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

export function xssProtection(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    const skipFields = ['password', 'email', 'images', 'uploadURL'];
    const sanitizedBody: any = {};
    
    for (const key of Object.keys(req.body)) {
      if (skipFields.includes(key)) {
        sanitizedBody[key] = req.body[key];
      } else {
        sanitizedBody[key] = sanitizeObject(req.body[key]);
      }
    }
    
    req.body = sanitizedBody;
  }
  next();
}

export const loginBlockCheck = (req: Request, res: Response, next: NextFunction) => {
  if (isIpBlocked(req)) {
    return res.status(429).json({ 
      error: "Previse neuspesnih pokusaja. Pokusajte ponovo za 15 minuta." 
    });
  }
  next();
};

export function logError(context: string, error: Error | unknown, req?: Request) {
  const timestamp = new Date().toISOString();
  const ip = req ? getClientIp(req) : 'N/A';
  const path = req?.path || 'N/A';
  const method = req?.method || 'N/A';
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`[ERROR] ${timestamp} | ${context}`);
  console.error(`  Method: ${method} | Path: ${path} | IP: ${ip}`);
  console.error(`  Message: ${errorMessage}`);
  if (errorStack) {
    console.error(`  Stack: ${errorStack}`);
  }
}

export function setupSecurity(app: Express) {
  // CORS for cross-origin requests from app.vikendmajstor.rs to api.vikendmajstor.rs
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://app.vikendmajstor.rs',
      'https://vikendmajstor.rs',
      'http://localhost:8081',
      'http://localhost:5000',
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://vikendmajstor.rs", "https://api.vikendmajstor.rs", "https://www.google-analytics.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    xssFilter: true,
  }));
  
  app.use('/api', generalLimiter);
  
  app.use('/api/auth/login', loginBlockCheck, authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/google', authLimiter);
  app.use('/api/auth/apple', authLimiter);
  
  app.use('/api', xssProtection);
  
  console.log('[SECURITY] Security middleware initialized: helmet, rate limiting, XSS protection');
}

export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Unesite ispravan email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Lozinka mora imati najmanje 6 karaktera'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ime mora imati izmedju 2 i 100 karaktera'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Unesite ispravan email'),
  body('password')
    .notEmpty()
    .withMessage('Lozinka je obavezna'),
];

export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: errors.array()[0].msg,
      errors: errors.array() 
    });
  }
  next();
}
