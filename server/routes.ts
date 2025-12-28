import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { setupAuth, isAuthenticated, isVerifiedUser } from "./auth";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { 
  sendBookingRequestNotification, 
  sendBookingRequestConfirmationToRenter,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification,
  sendNewMessageNotification,
  sendBookingReminderNotification,
  sendScheduledReminders
} from "./notifications";
import { sendBookingRequestEmail, sendBookingConfirmedEmail } from "./email";
import { seedDemoData, deleteDemoData, getDemoDataStats } from "./seed-demo";
import { addProductionSubscriber, isProductionAvailable } from "./mysql-db";
import { db } from "./db";
import { categories, subcategories } from "../shared/schema";
import { eq, asc } from "drizzle-orm";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ES module polyfill for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// XSS Sanitization - removes HTML tags and dangerous content
function sanitizeString(input: string | undefined | null): string | undefined | null {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (typeof input !== 'string') return input;
  if (input.trim() === '') return input; // Preserve empty strings for validation layer
  
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>') // Decode HTML entities then strip
    .replace(/<[^>]*>/g, '') // Remove any remaining tags
    .trim();
}

function sanitizeItemData(data: any): any {
  const sanitized = { ...data };
  if (sanitized.title !== undefined) sanitized.title = sanitizeString(sanitized.title);
  if (sanitized.description !== undefined) sanitized.description = sanitizeString(sanitized.description);
  if (sanitized.location !== undefined) sanitized.location = sanitizeString(sanitized.location);
  if (sanitized.category !== undefined) sanitized.category = sanitizeString(sanitized.category);
  if (sanitized.subCategory !== undefined) sanitized.subCategory = sanitizeString(sanitized.subCategory);
  return sanitized;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/", (req, res, next) => {
    const hostname = req.hostname || req.headers.host?.split(':')[0] || '';
    const isAppSubdomain = hostname === 'app.vikendmajstor.rs' || hostname.includes('app.');
    
    // For app.vikendmajstor.rs, let static files (Expo web app) handle it
    if (isAppSubdomain) {
      return next();
    }
    
    const userAgent = req.headers['user-agent'] || '';
    const isExpoRequest = userAgent.includes('Expo') || req.headers['expo-platform'];
    
    if (isExpoRequest) {
      return res.json({ status: 'ok', type: 'api' });
    }
    
    const landingPath = path.join(__dirname, 'landing', 'index.html');
    if (fs.existsSync(landingPath)) {
      return res.sendFile(landingPath);
    }
    
    res.json({ status: 'ok', message: 'VikendMajstor API' });
  });

  // SEO Landing Pages
  const seoPages = [
    'iznajmljivanje-alata-nis',
    'busilica-nis',
    'kosilica-beograd',
    'brusilica-novi-sad',
    'testerica-nis',
    'blog-top-5-alata-nis'
  ];
  
  seoPages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
      const pagePath = path.join(__dirname, 'landing', 'seo', `${page}.html`);
      if (fs.existsSync(pagePath)) {
        return res.sendFile(pagePath);
      }
      res.redirect('/');
    });
  });

  // Sitemap and Robots.txt
  app.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path.join(__dirname, 'landing', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      res.setHeader('Content-Type', 'application/xml');
      return res.sendFile(sitemapPath);
    }
    res.status(404).send('Sitemap not found');
  });

  app.get("/robots.txt", (req, res) => {
    const robotsPath = path.join(__dirname, 'landing', 'robots.txt');
    if (fs.existsSync(robotsPath)) {
      res.setHeader('Content-Type', 'text/plain');
      return res.sendFile(robotsPath);
    }
    res.status(404).send('Robots.txt not found');
  });

  // Newsletter subscription endpoint
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email, source } = req.body;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ success: false, message: "Email adresa je obavezna" });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Unesite validnu email adresu" });
      }
      
      const cleanEmail = email.toLowerCase().trim();
      const emailSource = source || 'landing_page';
      let isNew = true;
      
      if (isProductionAvailable()) {
        try {
          isNew = await addProductionSubscriber(cleanEmail, emailSource);
        } catch (prodError: any) {
          console.error("Production subscription error:", prodError);
        }
      }
      
      try {
        const subscriber = await storage.subscribeEmail(cleanEmail, emailSource);
        isNew = subscriber.isNew;
      } catch (devError: any) {
        if (devError.message !== 'EMAIL_EXISTS') {
          console.error("Dev subscription error:", devError);
        }
      }
      
      res.json({ 
        success: true, 
        message: "Uspešno ste se prijavili na novosti!",
        isNew
      });
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      
      if (error.message === 'EMAIL_EXISTS') {
        return res.json({ 
          success: true, 
          message: "Već ste prijavljeni na novosti!",
          isNew: false
        });
      }
      
      res.status(500).json({ success: false, message: "Došlo je do greške. Pokušajte ponovo." });
    }
  });

  app.get("/app", (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    
    if (isAndroid || isIOS) {
      return res.redirect('exp://');
    }
    
    const webAppPath = path.join(process.cwd(), 'static-build', 'web', 'index.html');
    if (fs.existsSync(webAppPath)) {
      return res.sendFile(webAppPath);
    }
    
    res.redirect('/');
  });

  // ============================================
  // CATEGORIES API ENDPOINTS
  // ============================================
  
  app.get("/api/categories", async (req, res) => {
    try {
      const allCategories = await db.select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(asc(categories.sortOrder));
      
      const categoriesWithSubs = await Promise.all(
        allCategories.map(async (cat) => {
          const subs = await db.select()
            .from(subcategories)
            .where(eq(subcategories.categoryId, cat.id))
            .orderBy(asc(subcategories.sortOrder));
          return { ...cat, subcategories: subs };
        })
      );
      
      res.json(categoriesWithSubs);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Greška pri učitavanju kategorija" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const [category] = await db.select()
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);
      
      if (!category) {
        return res.status(404).json({ error: "Kategorija nije pronađena" });
      }
      
      const subs = await db.select()
        .from(subcategories)
        .where(eq(subcategories.categoryId, category.id))
        .orderBy(asc(subcategories.sortOrder));
      
      res.json({ ...category, subcategories: subs });
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Greška pri učitavanju kategorije" });
    }
  });

  app.get("/api/subcategories/:categoryId", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const subs = await db.select()
        .from(subcategories)
        .where(eq(subcategories.categoryId, categoryId))
        .orderBy(asc(subcategories.sortOrder));
      res.json(subs);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ error: "Greška pri učitavanju podkategorija" });
    }
  });

  app.get("/oauth/google/callback", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VikendMajstor - Prijava</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a1a; color: white; }
    .container { text-align: center; padding: 20px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #333; border-top-color: #FFCC00; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Prijava u toku...</p>
  </div>
  <script>
    (function() {
      var hash = window.location.hash.substring(1);
      var params = new URLSearchParams(hash);
      var accessToken = params.get('access_token');
      
      if (accessToken) {
        window.location.href = 'vikendmajstor://oauth?access_token=' + encodeURIComponent(accessToken);
        setTimeout(function() {
          document.querySelector('.container').innerHTML = '<p>Ako se aplikacija nije otvorila, <a href="vikendmajstor://oauth?access_token=' + encodeURIComponent(accessToken) + '" style="color: #FFCC00;">kliknite ovde</a></p>';
        }, 2000);
      } else {
        document.querySelector('.container').innerHTML = '<p style="color: #ff4444;">Greska pri prijavi. Pokusajte ponovo.</p>';
      }
    })();
  </script>
</body>
</html>
    `);
  });

  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    console.log(`[OBJECTS] Requesting object: ${req.path}`);
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      console.log(`[OBJECTS] Found object: ${req.path}`);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error(`[OBJECTS] Error for ${req.path}:`, error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.get("/api/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const objectPath = `/objects/${req.params.objectPath}`;
    console.log(`[API-OBJECTS] Requesting object: ${objectPath}`);
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      console.log(`[API-OBJECTS] Found object: ${objectPath}`);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error(`[API-OBJECTS] Error for ${objectPath}:`, error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/objects/finalize", isAuthenticated, async (req, res) => {
    if (!req.body.uploadURL) {
      return res.status(400).json({ error: "uploadURL is required" });
    }

    const userId = req.user!.id;
    console.log(`[UPLOAD] Finalizing upload for user ${userId}, URL: ${req.body.uploadURL.substring(0, 100)}...`);

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.uploadURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      console.log(`[UPLOAD] Finalized successfully, objectPath: ${objectPath}`);
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("[UPLOAD] Error finalizing upload:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/push-token", isAuthenticated, async (req, res) => {
    try {
      const { pushToken } = req.body;
      if (!pushToken) {
        return res.status(400).json({ error: "Push token je obavezan" });
      }
      
      await storage.savePushToken(req.user!.id, pushToken);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving push token:", error);
      res.status(500).json({ error: "Greška pri čuvanju push tokena" });
    }
  });

  app.get("/api/home", async (req, res) => {
    try {
      const premiumItems = await storage.getPremiumItems();
      const earlyAdopterCount = await storage.getEarlyAdopterCount();
      const remainingSlots = Math.max(0, 100 - earlyAdopterCount);
      res.json({
        premiumItems,
        remainingEarlyAdopterSlots: remainingSlots,
      });
    } catch (error) {
      console.error("Error fetching home data:", error);
      res.status(500).json({ error: "Greška pri učitavanju podataka" });
    }
  });

  app.get("/api/user/ad-stats", isAuthenticated, async (req, res) => {
    try {
      const freshUser = await storage.getUser(req.user!.id);
      if (!freshUser) {
        return res.status(401).json({ error: "Korisnik nije pronađen" });
      }
      
      const userItems = await storage.getItemsByOwner(freshUser.id);
      const itemCount = userItems.length;
      const featuredItems = userItems.filter(item => item.isFeatured);
      const totalAdsCreated = freshUser.totalAdsCreated || 0;
      
      const FREE_AD_LIMIT = 5;
      const hasSubscription = freshUser.subscriptionType === 'basic' || freshUser.subscriptionType === 'premium';
      const subscriptionActive = hasSubscription && freshUser.subscriptionEndDate && new Date(freshUser.subscriptionEndDate) > new Date();
      
      res.json({
        totalAds: itemCount,
        totalAdsCreated,
        freeAdsUsed: Math.min(totalAdsCreated, FREE_AD_LIMIT),
        freeAdsLimit: FREE_AD_LIMIT,
        canCreateAd: subscriptionActive || totalAdsCreated < FREE_AD_LIMIT,
        subscriptionType: freshUser.subscriptionType,
        subscriptionStatus: subscriptionActive ? 'active' : 'inactive',
        subscriptionEndDate: freshUser.subscriptionEndDate,
        featuredItemId: featuredItems[0]?.id || null,
        isPremium: freshUser.subscriptionType === 'premium' && subscriptionActive,
        freeFeatureUsed: freshUser.freeFeatureUsed,
        featuredCount: featuredItems.length,
      });
    } catch (error) {
      console.error("Error fetching ad stats:", error);
      res.status(500).json({ error: "Greška pri učitavanju statistike" });
    }
  });

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  app.get("/api/items", async (req, res) => {
    try {
      const { category, subCategory, toolType, powerSource, city, search, adType, minPrice, maxPrice, period, hasImages, activityTag, lat, lng, maxDistance, hasDeposit, hasDelivery, userType } = req.query;
      
      let createdAfter: Date | undefined;
      if (period === 'today') {
        createdAfter = new Date();
        createdAfter.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        createdAfter = new Date();
        createdAfter.setDate(createdAfter.getDate() - 7);
      } else if (period === 'month') {
        createdAfter = new Date();
        createdAfter.setMonth(createdAfter.getMonth() - 1);
      }
      
      const items = await storage.getItems({
        category: category as string | undefined,
        subCategory: subCategory as string | undefined,
        toolType: toolType as string | undefined,
        powerSource: powerSource as string | undefined,
        city: city as string | undefined,
        search: search as string | undefined,
        adType: adType as string | undefined,
        minPrice: minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
        createdAfter,
        hasImages: hasImages === 'true',
        activityTag: activityTag as string | undefined,
        hasDeposit: hasDeposit === 'true' ? true : hasDeposit === 'false' ? false : undefined,
        hasDelivery: hasDelivery === 'true' ? true : hasDelivery === 'false' ? false : undefined,
        userType: userType as string | undefined,
      });
      
      const now = new Date();
      const userLat = lat ? parseFloat(lat as string) : null;
      const userLng = lng ? parseFloat(lng as string) : null;
      const maxDist = maxDistance ? parseFloat(maxDistance as string) : null;
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      let itemsWithDistance = await Promise.all(
        items.map(async (item) => {
          const owner = await storage.getUser(item.ownerId);
          const isPremium = owner?.subscriptionType === 'premium' && 
            owner?.subscriptionEndDate && 
            new Date(owner.subscriptionEndDate) > now;
          
          let distance: number | null = null;
          if (userLat !== null && userLng !== null && item.latitude && item.longitude) {
            distance = haversineDistance(
              userLat, 
              userLng, 
              parseFloat(item.latitude), 
              parseFloat(item.longitude)
            );
          }
          
          const itemBookings = await storage.getItemBookings(item.id);
          const hasBookingToday = itemBookings.some(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            return bookingStart <= todayEnd && bookingEnd >= todayStart;
          });
          const availableToday = item.isAvailable && !hasBookingToday;
          
          return { ...item, isPremium: !!isPremium, distance, availableToday };
        })
      );
      
      if (maxDist !== null && userLat !== null && userLng !== null) {
        itemsWithDistance = itemsWithDistance.filter(item => 
          item.distance !== null && item.distance <= maxDist
        );
        // Sort by: 1) Featured items first, 2) Premium users' items, 3) Distance
        itemsWithDistance.sort((a, b) => {
          // Featured items come first
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          // Then premium users' items
          if (a.isPremium && !b.isPremium) return -1;
          if (!a.isPremium && b.isPremium) return 1;
          // Then sort by distance
          return (a.distance || 999999) - (b.distance || 999999);
        });
      } else {
        // Sort by: 1) Featured items first, 2) Premium users' items, 3) createdAt
        itemsWithDistance.sort((a, b) => {
          // Featured items come first
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          // Then premium users' items
          if (a.isPremium && !b.isPremium) return -1;
          if (!a.isPremium && b.isPremium) return 1;
          // Then sort by createdAt descending
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      
      res.json(itemsWithDistance);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: "Greška pri učitavanju stvari" });
    }
  });

  app.get("/api/items/category-counts", async (req, res) => {
    try {
      const allItems = await storage.getItems();
      const activeItems = allItems.filter(item => item.isAvailable);
      
      const counts: Record<string, number> = {};
      
      activeItems.forEach(item => {
        if (item.category) {
          counts[item.category] = (counts[item.category] || 0) + 1;
        }
      });
      
      res.json(counts);
    } catch (error) {
      console.error("Error fetching category counts:", error);
      res.status(500).json({ error: "Greška pri učitavanju broja alata po kategorijama" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije pronađena" });
      }
      
      const owner = await storage.getUser(item.ownerId);
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      
      const itemBookings = await storage.getItemBookings(item.id);
      const hasBookingToday = itemBookings.some(booking => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        return bookingStart <= todayEnd && bookingEnd >= todayStart;
      });
      const availableToday = item.isAvailable && !hasBookingToday;
      
      res.json({ ...item, owner, availableToday });
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ error: "Greška pri učitavanju stvari" });
    }
  });

  app.get("/api/items/:id/bookings", async (req, res) => {
    try {
      const bookings = await storage.getItemBookings(req.params.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching item bookings:", error);
      res.status(500).json({ error: "Greška pri učitavanju rezervacija" });
    }
  });

  app.get("/api/my-items", isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getItemsByOwner(req.user!.id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching user items:", error);
      res.status(500).json({ error: "Greška pri učitavanju stvari" });
    }
  });

  app.post("/api/items", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const freshUser = await storage.getUser(req.user!.id);
      if (!freshUser) {
        return res.status(401).json({ error: "Korisnik nije pronađen" });
      }
      
      const FREE_AD_LIMIT = 5;
      const hasSubscription = freshUser.subscriptionType === 'basic' || freshUser.subscriptionType === 'premium';
      const subscriptionActive = hasSubscription && freshUser.subscriptionEndDate && new Date(freshUser.subscriptionEndDate) > new Date();
      
      const totalAdsCreated = freshUser.totalAdsCreated || 0;
      
      if (totalAdsCreated >= FREE_AD_LIMIT && !subscriptionActive) {
        return res.status(403).json({ 
          error: "Iskoristili ste svih 5 besplatnih oglasa. Za nove oglase potrebna vam je pretplata.",
          code: "FREE_LIMIT_REACHED",
          totalAdsCreated,
          freeLimit: FREE_AD_LIMIT
        });
      }
      
      const sanitizedData = sanitizeItemData(req.body);
      const item = await storage.createItem({
        ...sanitizedData,
        ownerId: freshUser.id,
      });
      
      if (!subscriptionActive) {
        await storage.incrementUserAdsCreated(freshUser.id);
      }
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Greška pri kreiranju stvari" });
    }
  });

  app.delete("/api/items/:id", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const forceDelete = req.query.force === 'true';
      
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije pronađena" });
      }
      if (item.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      const activeBookings = await storage.getItemBookings(req.params.id);
      const now = new Date();
      const currentlyRented = activeBookings.filter(b => 
        (b.status === 'confirmed' || b.status === 'pending') && 
        new Date(b.endDate) >= now
      );
      
      if (currentlyRented.length > 0 && !forceDelete) {
        return res.status(409).json({ 
          error: "Ovaj oglas ima aktivne rezervacije",
          code: "HAS_ACTIVE_BOOKINGS",
          activeBookingsCount: currentlyRented.length,
          message: `Ovaj oglas je trenutno izdat ili ima ${currentlyRented.length} aktivnih rezervacija. Brisanjem se otkazuju sve povezane rezervacije.`
        });
      }
      
      await storage.deleteItem(req.params.id);
      res.json({ success: true, message: "Oglas je uspešno obrisan" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Greška pri brisanju oglasa" });
    }
  });

  app.post("/api/items/:id/feature", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const { action, paid } = req.body;
      
      if (!action || !['feature', 'unfeature'].includes(action)) {
        return res.status(400).json({ error: "Nevažeća akcija" });
      }
      
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije pronađena" });
      }
      
      if (item.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije pronađen" });
      }
      
      const now = new Date();
      const isPremium = user.subscriptionType === 'premium' && 
        user.subscriptionEndDate && 
        new Date(user.subscriptionEndDate) > now;
      
      if (!isPremium) {
        return res.status(403).json({ 
          error: "Samo premium korisnici mogu istaknuti oglase",
          code: "PREMIUM_REQUIRED"
        });
      }
      
      if (action === 'feature') {
        if (item.isFeatured) {
          return res.json({ success: true, message: "Ovaj oglas je već istaknut" });
        }
        
        const userItems = await storage.getItemsByOwner(user.id);
        const currentFeaturedCount = userItems.filter(i => i.isFeatured).length;
        
        if (currentFeaturedCount >= 1 && !paid) {
          return res.status(402).json({ 
            error: "Možete imati samo 1 istaknuti oglas. Dodatno isticanje košta 99 RSD.",
            code: "PAYMENT_REQUIRED",
            price: 99
          });
        }
        
        if (!user.freeFeatureUsed) {
          await storage.featureItem(req.params.id);
          await storage.markFreeFeatureUsed(user.id);
          res.json({ success: true, message: "Oglas je uspešno istaknut (besplatno u okviru Premium pretplate)" });
        } else if (!paid) {
          return res.status(402).json({ 
            error: "Već ste iskoristili besplatno isticanje. Dodatno isticanje košta 99 RSD.",
            code: "PAYMENT_REQUIRED",
            price: 99
          });
        } else {
          await storage.featureItem(req.params.id);
          res.json({ success: true, message: "Oglas je uspešno istaknut" });
        }
      } else {
        const userItems = await storage.getItemsByOwner(user.id);
        const featuredItems = userItems.filter(i => i.isFeatured);
        
        if (featuredItems.length <= 1 && user.freeFeatureUsed) {
          return res.status(403).json({ 
            error: "Ne možete ukloniti besplatni istaknuti oglas. Možete samo zameniti plaćenim isticanjem.",
            code: "CANNOT_REMOVE_FREE"
          });
        }
        
        await storage.unfeatureItem(req.params.id);
        res.json({ success: true, message: "Oglas je uklonjen sa vrha" });
      }
    } catch (error) {
      console.error("Error featuring item:", error);
      res.status(500).json({ error: "Greška pri isticanju oglasa" });
    }
  });

  app.put("/api/items/:id", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije pronađena" });
      }
      if (item.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      const sanitizedData = sanitizeItemData(req.body);
      const updatedItem = await storage.updateItem(req.params.id, sanitizedData);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Greška pri ažuriranju stvari" });
    }
  });

  app.get("/api/items/:id/bookings", async (req, res) => {
    try {
      const bookings = await storage.getItemBookings(req.params.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching item bookings:", error);
      res.status(500).json({ error: "Greška pri učitavanju rezervacija" });
    }
  });

  app.get("/api/items/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getItemReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching item reviews:", error);
      res.status(500).json({ error: "Greška pri učitavanju recenzija" });
    }
  });

  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const { type = "renter" } = req.query;
      const bookings = await storage.getBookings(
        req.user!.id,
        type as "renter" | "owner"
      );
      
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          const item = await storage.getItem(booking.itemId);
          const renter = await storage.getUser(booking.renterId);
          const owner = await storage.getUser(booking.ownerId);
          return { ...booking, item, renter, owner };
        })
      );
      
      res.json(bookingsWithDetails);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Greška pri učitavanju rezervacija" });
    }
  });

  app.get("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Rezervacija nije pronađena" });
      }
      
      if (booking.renterId !== req.user!.id && booking.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      const item = await storage.getItem(booking.itemId);
      const renter = await storage.getUser(booking.renterId);
      const owner = await storage.getUser(booking.ownerId);
      
      res.json({ ...booking, item, renter, owner });
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Greška pri učitavanju rezervacije" });
    }
  });

  app.post("/api/bookings", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const item = await storage.getItem(req.body.itemId);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije pronađena" });
      }
      
      if (item.ownerId === req.user!.id) {
        return res.status(400).json({ error: "Ne možete rezervisati sopstvenu stvar" });
      }
      
      const requestedStart = new Date(req.body.startDate);
      const requestedEnd = new Date(req.body.endDate);
      
      const existingBookings = await storage.getItemBookings(req.body.itemId);
      const conflictingBooking = existingBookings.find(b => {
        if (b.status !== 'confirmed' && b.status !== 'pending') return false;
        
        const bookingStart = new Date(b.startDate);
        const bookingEnd = new Date(b.endDate);
        
        return (requestedStart <= bookingEnd && requestedEnd >= bookingStart);
      });
      
      if (conflictingBooking) {
        return res.status(409).json({ 
          error: "Izabrani datumi su već rezervisani. Molimo izaberite druge datume." 
        });
      }
      
      const booking = await storage.createBooking({
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        renterId: req.user!.id,
        ownerId: item.ownerId,
      });
      
      const renter = await storage.getUser(req.user!.id);
      const owner = await storage.getUser(item.ownerId);
      
      sendBookingRequestConfirmationToRenter(req.user!.id, item.title, booking.id);
      sendBookingRequestNotification(item.ownerId, renter?.name || 'Korisnik', item.title, booking.id);
      
      if (owner?.email) {
        const startDateStr = new Date(req.body.startDate).toLocaleDateString('sr-RS');
        const endDateStr = new Date(req.body.endDate).toLocaleDateString('sr-RS');
        sendBookingRequestEmail(
          owner.email,
          owner.name,
          renter?.name || 'Korisnik',
          item.title,
          startDateStr,
          endDateStr,
          req.body.totalPrice || 0
        );
      }
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Greška pri kreiranju rezervacije" });
    }
  });

  app.put("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Rezervacija nije pronađena" });
      }
      
      if (booking.renterId !== req.user!.id && booking.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      const previousStatus = booking.status;
      const updatedBooking = await storage.updateBooking(req.params.id, req.body);
      
      if (req.body.status && req.body.status !== previousStatus) {
        const item = await storage.getItem(booking.itemId);
        const owner = await storage.getUser(booking.ownerId);
        const renter = await storage.getUser(booking.renterId);
        
        if (req.body.status === 'confirmed' && item && owner) {
          sendBookingConfirmedNotification(booking.renterId, item.title, owner.name, booking.id);
          
          if (renter?.email) {
            const startDateStr = new Date(booking.startDate).toLocaleDateString('sr-RS');
            const endDateStr = new Date(booking.endDate).toLocaleDateString('sr-RS');
            sendBookingConfirmedEmail(
              renter.email,
              renter.name,
              owner.name,
              item.title,
              startDateStr,
              endDateStr,
              booking.totalPrice || 0,
              owner.phone || undefined
            );
          }
        } else if (req.body.status === 'cancelled' && item) {
          const notifyUserId = req.user!.id === booking.ownerId ? booking.renterId : booking.ownerId;
          sendBookingCancelledNotification(notifyUserId, item.title, booking.id);
        }
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Greška pri ažuriranju rezervacije" });
    }
  });

  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.user!.id);
      
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.user1Id === req.user!.id ? conv.user2Id : conv.user1Id;
          const otherUser = await storage.getUser(otherUserId);
          const messages = await storage.getMessages(conv.id);
          const lastMessage = messages[messages.length - 1];
          const unreadCount = messages.filter(
            m => m.receiverId === req.user!.id && !m.isRead
          ).length;
          
          return {
            ...conv,
            otherUser,
            lastMessage,
            unreadCount,
          };
        })
      );
      
      res.json(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Greška pri učitavanju razgovora" });
    }
  });

  app.post("/api/conversations", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const { userId, itemId } = req.body;
      
      if (userId === req.user!.id) {
        return res.status(400).json({ error: "Ne možete započeti razgovor sa sobom" });
      }
      
      const conversation = await storage.getOrCreateConversation(
        req.user!.id,
        userId,
        itemId
      );
      
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Greška pri kreiranju razgovora" });
    }
  });

  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Razgovor nije pronađen" });
      }
      
      if (conversation.user1Id !== req.user!.id && conversation.user2Id !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      await storage.markMessagesAsRead(req.params.id, req.user!.id);
      const messages = await storage.getMessages(req.params.id);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Greška pri učitavanju poruka" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Razgovor nije pronađen" });
      }
      
      if (conversation.user1Id !== req.user!.id && conversation.user2Id !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      const receiverId = conversation.user1Id === req.user!.id 
        ? conversation.user2Id 
        : conversation.user1Id;
      
      const message = await storage.createMessage({
        conversationId: req.params.id,
        senderId: req.user!.id,
        receiverId,
        content: req.body.content,
        isRead: false,
      });
      
      const sender = await storage.getUser(req.user!.id);
      sendNewMessageNotification(receiverId, sender?.name || 'Korisnik', req.body.content, req.params.id)
        .catch(err => console.error('[NOTIFICATION] Failed to send message notification:', err));
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Greška pri slanju poruke" });
    }
  });

  app.get("/api/items/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsForItem(req.params.id);
      
      const reviewsWithReviewers = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          return { ...review, reviewer };
        })
      );
      
      res.json(reviewsWithReviewers);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Greška pri učitavanju recenzija" });
    }
  });

  app.post("/api/reviews", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.body.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Rezervacija nije pronađena" });
      }
      
      if (booking.status !== "completed") {
        return res.status(400).json({ error: "Možete oceniti samo završene rezervacije" });
      }
      
      if (booking.renterId !== req.user!.id && booking.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      const revieweeId = booking.renterId === req.user!.id 
        ? booking.ownerId 
        : booking.renterId;
      
      const review = await storage.createReview({
        bookingId: booking.id,
        itemId: booking.itemId,
        reviewerId: req.user!.id,
        revieweeId,
        rating: req.body.rating,
        comment: req.body.comment,
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Greška pri kreiranju recenzije" });
    }
  });

  app.put("/api/users/me", isAuthenticated, async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user!.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: "Korisnik nije pronađen" });
      }
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Greška pri ažuriranju profila" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije pronađen" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Greška pri učitavanju korisnika" });
    }
  });

  app.get("/api/subscription/status", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije pronađen" });
      }
      
      const subscriptionInfo = await storage.getSubscriptionStatus(user.id);
      const earlyAdopterCount = await storage.getEarlyAdopterCount();
      const remainingEarlyAdopterSlots = Math.max(0, 100 - earlyAdopterCount);
      
      res.json({
        ...subscriptionInfo,
        earlyAdopterCount,
        remainingEarlyAdopterSlots,
        canBecomeEarlyAdopter: remainingEarlyAdopterSlots > 0 && !user.isEarlyAdopter,
        prices: {
          basic: 500,
          premium: 1000
        }
      });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ error: "Greška pri učitavanju pretplate" });
    }
  });

  app.post("/api/subscription/activate-early-adopter", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije pronađen" });
      }
      
      if (user.isEarlyAdopter) {
        return res.status(400).json({ error: "Već ste early adopter korisnik" });
      }
      
      const earlyAdopterCount = await storage.getEarlyAdopterCount();
      if (earlyAdopterCount >= 100) {
        return res.status(400).json({ error: "Nema više dostupnih mesta za early adopter program" });
      }
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const updatedUser = await storage.activateEarlyAdopter(user.id, endDate);
      
      res.json({
        message: "Uspešno ste postali early adopter! Imate besplatno korišćenje 30 dana.",
        subscriptionEndDate: endDate,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error activating early adopter:", error);
      res.status(500).json({ error: "Greška pri aktivaciji early adopter programa" });
    }
  });

  app.post("/api/subscription/create-checkout", isAuthenticated, async (req, res) => {
    try {
      const { planType } = req.body;
      
      if (!planType || !['basic', 'premium'].includes(planType)) {
        return res.status(400).json({ error: "Nevažeći tip pretplate" });
      }
      
      const priceRsd = planType === 'basic' ? 500 : 1000;
      
      res.json({
        message: "Stripe integracija će uskoro biti dostupna",
        planType,
        priceRsd,
        stripeConfigured: false,
        placeholder: true
      });
    } catch (error) {
      console.error("Error creating checkout:", error);
      res.status(500).json({ error: "Greška pri kreiranju naplate" });
    }
  });

  app.post("/api/subscription/buy-feature", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije pronađen" });
      }
      
      const isPremium = user.subscriptionType === 'premium' && 
        user.subscriptionEndDate && 
        new Date(user.subscriptionEndDate) > new Date();
      
      if (!isPremium) {
        return res.status(403).json({ error: "Potrebna je Premium pretplata" });
      }
      
      res.json({
        message: "Stripe integracija će uskoro biti dostupna",
        priceRsd: 99,
        stripeConfigured: false,
        placeholder: true
      });
    } catch (error) {
      console.error("Error buying feature:", error);
      res.status(500).json({ error: "Greška pri kupovini istaknutog oglasa" });
    }
  });

  app.post("/api/stripe/webhook", async (req, res) => {
    res.json({ received: true, message: "Stripe webhook placeholder - konfigurišite Stripe ključeve" });
  });

  // Admin middleware - supports both session and token authentication
  const isAdmin = async (req: any, res: any, next: any) => {
    let user = null;
    
    // Check token auth first (mobile app)
    if (req.user) {
      user = req.user;
    } 
    // Fall back to session auth (web)
    else if (req.session?.userId) {
      user = await storage.getUser(req.session.userId);
    }
    
    if (!user) {
      return res.status(401).json({ error: "Niste prijavljeni" });
    }
    
    if (!user.isAdmin) {
      return res.status(403).json({ error: "Nemate administratorska prava" });
    }
    
    req.user = user;
    next();
  };

  // Admin Routes
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Greška pri učitavanju statistike" });
    }
  });

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const { search, isActive, subscriptionType } = req.query;
      const filters: any = {};
      
      if (search) filters.search = search as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (subscriptionType) filters.subscriptionType = subscriptionType as string;
      
      const users = await storage.getAllUsers(filters);
      
      const safeUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        city: user.city,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
        subscriptionType: user.subscriptionType,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        isEarlyAdopter: user.isEarlyAdopter,
        totalAdsCreated: user.totalAdsCreated,
        createdAt: user.createdAt
      }));
      
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Greška pri učitavanju korisnika" });
    }
  });

  app.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije pronađen" });
      }
      
      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        city: user.city,
        district: user.district,
        avatarUrl: user.avatarUrl,
        role: user.role,
        rating: user.rating,
        totalRatings: user.totalRatings,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        emailVerified: user.emailVerified,
        subscriptionType: user.subscriptionType,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        isEarlyAdopter: user.isEarlyAdopter,
        isPremiumListing: user.isPremiumListing,
        premiumListingEndDate: user.premiumListingEndDate,
        totalAdsCreated: user.totalAdsCreated,
        createdAt: user.createdAt
      };
      
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Greška pri učitavanju korisnika" });
    }
  });

  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const { isActive, isAdmin: makeAdmin, subscriptionType, subscriptionDays } = req.body;
      
      const updatedUser = await storage.updateUserAdmin(req.params.id, {
        isActive,
        isAdmin: makeAdmin,
        subscriptionType,
        subscriptionDays: subscriptionDays ? parseInt(subscriptionDays) : undefined
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: "Korisnik nije pronađen" });
      }
      
      console.log(`[ADMIN] User ${req.user?.email} updated user ${updatedUser.email}: isActive=${isActive}, subscriptionType=${subscriptionType}, days=${subscriptionDays}`);
      
      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          isActive: updatedUser.isActive,
          isAdmin: updatedUser.isAdmin,
          subscriptionType: updatedUser.subscriptionType,
          subscriptionStatus: updatedUser.subscriptionStatus,
          subscriptionStartDate: updatedUser.subscriptionStartDate,
          subscriptionEndDate: updatedUser.subscriptionEndDate
        }
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Greška pri ažuriranju korisnika" });
    }
  });

  app.get("/api/admin/check", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      res.json({ isAdmin: user?.isAdmin || false });
    } catch (error) {
      res.status(500).json({ error: "Greška pri proveri admin statusa" });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije pronađen" });
      }
      
      if (user.isAdmin) {
        return res.status(403).json({ error: "Ne možete obrisati admin korisnika" });
      }
      
      console.log(`[ADMIN] User ${req.user?.email} deleting user ${user.email}`);
      
      const result = await storage.deleteUserWithData(userId);
      
      res.json({
        success: true,
        message: `Korisnik ${user.email} je obrisan`,
        deleted: result
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Greška pri brisanju korisnika" });
    }
  });

  app.get("/api/admin/demo-data", isAdmin, async (req, res) => {
    try {
      const stats = await getDemoDataStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting demo data stats:", error);
      res.status(500).json({ error: "Greška pri dobijanju demo podataka" });
    }
  });

  app.post("/api/admin/demo-data/seed", isAdmin, async (req, res) => {
    try {
      console.log(`[ADMIN] User ${req.user?.email} initiated demo data seeding`);
      const result = await seedDemoData();
      res.json({ 
        success: true, 
        message: `Kreirano ${result.users} korisnika i ${result.items} oglasa`,
        ...result 
      });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ error: "Greška pri kreiranju demo podataka" });
    }
  });

  app.delete("/api/admin/demo-data", isAdmin, async (req, res) => {
    try {
      console.log(`[ADMIN] User ${req.user?.email} initiated demo data deletion`);
      const result = await deleteDemoData();
      res.json({ 
        success: true, 
        message: `Obrisano ${result.users} korisnika i ${result.items} oglasa`,
        ...result 
      });
    } catch (error) {
      console.error("Error deleting demo data:", error);
      res.status(500).json({ error: "Greška pri brisanju demo podataka" });
    }
  });

  app.post("/api/admin/send-reminders", isAdmin, async (req, res) => {
    try {
      console.log(`[ADMIN] User ${req.user?.email} triggered manual reminder sending`);
      const result = await sendScheduledReminders();
      res.json({ 
        success: result.success, 
        message: `Poslato ${result.remindersCount || 0} podsetnika`,
        remindersCount: result.remindersCount
      });
    } catch (error) {
      console.error("Error sending reminders:", error);
      res.status(500).json({ error: "Greška pri slanju podsetnika" });
    }
  });

  const REMINDER_INTERVAL = 6 * 60 * 60 * 1000;
  setInterval(async () => {
    console.log('[SCHEDULER] Running scheduled reminder check...');
    await sendScheduledReminders();
  }, REMINDER_INTERVAL);
  
  setTimeout(async () => {
    console.log('[SCHEDULER] Initial reminder check on server start...');
    await sendScheduledReminders();
  }, 10000);

  const httpServer = createServer(app);

  return httpServer;
}
