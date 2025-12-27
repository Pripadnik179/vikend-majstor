import type { Express, Request, Response, NextFunction } from "express";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import * as jose from "jose";

const scryptAsync = promisify(scrypt);

const JWT_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'admin-secret-key');
const JWT_ALGORITHM = 'HS256';

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [hashed, salt] = hashedPassword.split(".");
  const hashedBuffer = Buffer.from(hashed, "hex");
  const suppliedBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuffer, suppliedBuffer);
}

async function createToken(admin: { id: string; email: string; name: string; role: string }) {
  const jwt = await new jose.SignJWT({ 
    adminId: admin.id, 
    email: admin.email,
    name: admin.name,
    role: admin.role 
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
  return jwt;
}

async function verifyToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

async function isAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Neautorizovan pristup' });
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);
  
  if (!payload || typeof payload.adminId !== 'string') {
    return res.status(401).json({ message: 'Nevazeci token' });
  }

  const user = await storage.getUser(payload.adminId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: 'Pristup odbijen' });
  }

  (req as any).admin = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.isAdmin ? 'superadmin' : 'admin'
  };
  
  next();
}

export function registerAdminRoutes(app: Express) {
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email i lozinka su obavezni' });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.isAdmin) {
        return res.status(401).json({ message: 'Pogresni kredencijali ili nemate admin pristup' });
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Pogresni kredencijali' });
      }

      const token = await createToken({
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: 'superadmin'
      });

      res.json({
        token,
        admin: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: 'superadmin'
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Greska pri prijavi' });
    }
  });

  app.get("/api/admin/me", isAdminAuth, async (req, res) => {
    const admin = (req as any).admin;
    res.json({ admin });
  });

  app.get("/api/admin/stats", isAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allItems = await storage.getItems();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const newUsersToday = allUsers.filter(u => 
        u.createdAt && new Date(u.createdAt) >= today
      ).length;
      
      const newItemsToday = allItems.filter((i: any) => 
        i.createdAt && new Date(i.createdAt) >= today
      ).length;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeUsers = allUsers.filter(u => 
        u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo
      ).length;

      res.json({
        totalUsers: allUsers.length,
        activeUsers: activeUsers || allUsers.length,
        totalItems: allItems.length,
        activeItems: allItems.filter((i: any) => i.status === 'active').length,
        totalBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        newUsersToday,
        newItemsToday
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju statistike' });
    }
  });

  app.get("/api/admin/activity", isAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const recentUsers = allUsers
        .filter(u => u.createdAt)
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
        .slice(0, 5);

      const activities = recentUsers.map(u => ({
        icon: '👤',
        description: `Novi korisnik: ${u.name || u.email}`,
        time: new Date(u.createdAt!).toLocaleString('sr-RS')
      }));

      res.json({ activities });
    } catch (error) {
      console.error('Admin activity error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju aktivnosti' });
    }
  });

  app.get("/api/admin/users", isAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allItems = await storage.getItems();
      
      const users = await Promise.all(allUsers.map(async (u) => {
        const userItems = allItems.filter((i: any) => i.ownerId === u.id);
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role || 'renter',
          subscriptionTier: u.subscriptionType || 'free',
          isActive: u.isActive !== false,
          isVerified: u.emailVerified || false,
          createdAt: u.createdAt,
          itemCount: userItems.length,
          bookingCount: 0
        };
      }));

      res.json({ users });
    } catch (error) {
      console.error('Admin users error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju korisnika' });
    }
  });

  app.post("/api/admin/users/:id/suspend", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.updateUser(userId, { isActive: false });
      res.json({ success: true });
    } catch (error) {
      console.error('Admin suspend error:', error);
      res.status(500).json({ message: 'Greska pri suspendovanju' });
    }
  });

  app.post("/api/admin/users/:id/activate", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.updateUser(userId, { isActive: true });
      res.json({ success: true });
    } catch (error) {
      console.error('Admin activate error:', error);
      res.status(500).json({ message: 'Greska pri aktivaciji' });
    }
  });

  app.get("/api/admin/items", isAdminAuth, async (req, res) => {
    try {
      const allItems = await storage.getItems();
      const allUsers = await storage.getAllUsers();
      
      const items = allItems.map((item: any) => {
        const owner = allUsers.find(u => u.id === item.ownerId);
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          pricePerDay: item.pricePerDay,
          category: item.category,
          status: item.isAvailable ? 'active' : 'pending',
          ownerName: owner?.name || 'Nepoznato',
          ownerEmail: owner?.email || '',
          views: 0,
          bookings: 0,
          createdAt: item.createdAt,
          images: item.images || []
        };
      });

      res.json({ items });
    } catch (error) {
      console.error('Admin items error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju oglasa' });
    }
  });

  app.post("/api/admin/items/:id/approve", isAdminAuth, async (req, res) => {
    try {
      const itemId = req.params.id;
      await storage.updateItem(itemId, { isAvailable: true });
      res.json({ success: true });
    } catch (error) {
      console.error('Admin approve error:', error);
      res.status(500).json({ message: 'Greska pri odobravanju' });
    }
  });

  app.post("/api/admin/items/:id/reject", isAdminAuth, async (req, res) => {
    try {
      const itemId = req.params.id;
      await storage.updateItem(itemId, { isAvailable: false });
      res.json({ success: true });
    } catch (error) {
      console.error('Admin reject error:', error);
      res.status(500).json({ message: 'Greska pri odbijanju' });
    }
  });

  app.delete("/api/admin/items/:id", isAdminAuth, async (req, res) => {
    try {
      const itemId = req.params.id;
      await storage.deleteItem(itemId);
      res.json({ success: true });
    } catch (error) {
      console.error('Admin delete item error:', error);
      res.status(500).json({ message: 'Greska pri brisanju' });
    }
  });

  app.get("/api/admin/subscriptions", isAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const subscriptions = allUsers
        .filter(u => u.subscriptionType && u.subscriptionType !== 'free')
        .map(u => ({
          id: u.id,
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          tier: u.subscriptionType || 'standard',
          status: u.subscriptionStatus || 'active',
          startDate: u.subscriptionStartDate || u.createdAt,
          endDate: u.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: u.subscriptionType === 'premium' ? 999 : 499
        }));

      res.json({ subscriptions });
    } catch (error) {
      console.error('Admin subscriptions error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju pretplata' });
    }
  });

  app.get("/api/admin/analytics", isAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allItems = await storage.getItems();
      
      const categoryCount: Record<string, number> = {};
      allItems.forEach((item: any) => {
        const cat = item.category || 'other';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      const popularCategories = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const cityCount: Record<string, number> = {};
      allUsers.forEach(user => {
        const city = user.city || 'Beograd';
        cityCount[city] = (cityCount[city] || 0) + 1;
      });

      const topCities = Object.entries(cityCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      res.json({
        monthlyActiveUsers: allUsers.length,
        registrations: allUsers.length,
        conversions: {
          registered: allUsers.length,
          addedItem: allItems.length > 0 ? Math.floor(allUsers.length * 0.4) : 0,
          madeBooking: Math.floor(allUsers.length * 0.25),
          completed: Math.floor(allUsers.length * 0.2)
        },
        popularCategories,
        topCities
      });
    } catch (error) {
      console.error('Admin analytics error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju analitike' });
    }
  });

  app.get("/api/admin/reports", isAdminAuth, async (req, res) => {
    res.json({ reports: [] });
  });

  app.get("/api/admin/logs", isAdminAuth, async (req, res) => {
    res.json({ logs: [] });
  });

  console.log('[ADMIN] Admin panel API routes registered');
}
