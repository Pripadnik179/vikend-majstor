import type { Express, Request, Response, NextFunction } from "express";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { db } from "./db";
import * as jose from "jose";
import { 
  getProductionSubscribers, 
  deleteProductionSubscriber, 
  getProductionSubscriptions,
  updateProductionSubscription,
  isProductionAvailable 
} from "./mysql-db";
import { eq, desc, and, inArray, asc, sql } from "drizzle-orm";
import { 
  adminLogs, 
  userActivityLogs, 
  reportedItems, 
  featureToggles, 
  adminNotifications,
  messages,
  conversations,
  users,
  items,
  subscriptionPlans,
  itemViews,
  bookings,
  subscriptions,
  reportedUsers,
  serverErrorLogs,
  admin2fa,
  appVersions,
  reviews,
  emailSubscribers,
  categories,
  subcategories
} from "@shared/schema";
import { randomBytes, createHmac } from "crypto";
import * as crypto from "crypto";

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

async function logAdminAction(
  adminId: string, 
  action: string, 
  targetType?: string, 
  targetId?: string, 
  details?: string,
  ipAddress?: string
) {
  try {
    await db.insert(adminLogs).values({
      adminId,
      action,
      targetType,
      targetId,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

export function registerAdminRoutes(app: Express) {
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password, twoFactorCode } = req.body;
      
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

      // Check if 2FA is enabled for this user
      const [twoFa] = await db.select().from(admin2fa).where(eq(admin2fa.userId, user.id));
      
      if (twoFa?.isEnabled) {
        // 2FA is enabled - require code
        if (!twoFactorCode) {
          return res.json({
            requires2FA: true,
            message: 'Unesite kod iz autentifikator aplikacije'
          });
        }
        
        // Verify the 2FA code
        const isCodeValid = verifyTOTP(twoFa.secret, twoFactorCode);
        if (!isCodeValid) {
          // Check backup codes
          const backupIndex = twoFa.backupCodes?.indexOf(twoFactorCode.toUpperCase());
          if (backupIndex === undefined || backupIndex === -1) {
            return res.status(401).json({ message: 'Neispravan 2FA kod' });
          }
          // Remove used backup code
          const newBackupCodes = [...(twoFa.backupCodes || [])];
          newBackupCodes.splice(backupIndex, 1);
          await db.update(admin2fa)
            .set({ backupCodes: newBackupCodes, lastUsedAt: new Date() })
            .where(eq(admin2fa.userId, user.id));
        } else {
          // Update last used
          await db.update(admin2fa)
            .set({ lastUsedAt: new Date() })
            .where(eq(admin2fa.userId, user.id));
        }
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
      const admin = (req as any).admin;
      await storage.updateUser(userId, { isActive: false });
      await logAdminAction(admin.id, 'suspend_user', 'user', userId, 'User suspended', req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error('Admin suspend error:', error);
      res.status(500).json({ message: 'Greska pri suspendovanju' });
    }
  });

  app.post("/api/admin/users/:id/activate", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      const admin = (req as any).admin;
      await storage.updateUser(userId, { isActive: true });
      await logAdminAction(admin.id, 'activate_user', 'user', userId, 'User activated', req.ip);
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
      const admin = (req as any).admin;
      await storage.updateItem(itemId, { isAvailable: true });
      await logAdminAction(admin.id, 'approve_item', 'item', itemId, 'Item approved', req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error('Admin approve error:', error);
      res.status(500).json({ message: 'Greska pri odobravanju' });
    }
  });

  app.post("/api/admin/items/:id/reject", isAdminAuth, async (req, res) => {
    try {
      const itemId = req.params.id;
      const admin = (req as any).admin;
      await storage.updateItem(itemId, { isAvailable: false });
      await logAdminAction(admin.id, 'reject_item', 'item', itemId, 'Item rejected', req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error('Admin reject error:', error);
      res.status(500).json({ message: 'Greska pri odbijanju' });
    }
  });

  app.delete("/api/admin/items/:id", isAdminAuth, async (req, res) => {
    try {
      const itemId = req.params.id;
      const admin = (req as any).admin;
      await storage.deleteItem(itemId);
      await logAdminAction(admin.id, 'delete_item', 'item', itemId, 'Item deleted', req.ip);
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

  app.put("/api/admin/subscriptions/:userId", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { userId } = req.params;
      const { tier, status, endDate } = req.body;

      const updateData: any = {};
      if (tier) updateData.subscriptionType = tier;
      if (status) updateData.subscriptionStatus = status;
      if (endDate) updateData.subscriptionEndDate = new Date(endDate);

      await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId));

      if (isProductionAvailable()) {
        try {
          await updateProductionSubscription(parseInt(userId), { tier, status, expiresAt: endDate ? new Date(endDate) : undefined });
        } catch (prodErr) {
          console.error('Production subscription update error:', prodErr);
        }
      }

      await logAdminAction(admin.id, 'update_subscription', 'subscription', userId, `Updated subscription: ${JSON.stringify({ tier, status, endDate })}`, req.ip);

      res.json({ success: true, message: 'Pretplata uspesno azurirana' });
    } catch (error) {
      console.error('Admin update subscription error:', error);
      res.status(500).json({ message: 'Greska pri azuriranju pretplate' });
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

  // ============================================
  // Admin Logs - Track admin actions
  // ============================================
  app.get("/api/admin/admin-logs", isAdminAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const logs = await db.select({
        id: adminLogs.id,
        adminId: adminLogs.adminId,
        action: adminLogs.action,
        targetType: adminLogs.targetType,
        targetId: adminLogs.targetId,
        details: adminLogs.details,
        ipAddress: adminLogs.ipAddress,
        createdAt: adminLogs.createdAt
      })
        .from(adminLogs)
        .orderBy(desc(adminLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const allUsers = await storage.getAllUsers();
      const logsWithAdmin = logs.map(log => {
        const admin = allUsers.find(u => u.id === log.adminId);
        return {
          ...log,
          adminName: admin?.name || admin?.email || 'Unknown',
          adminEmail: admin?.email || ''
        };
      });

      res.json({ logs: logsWithAdmin, page, limit });
    } catch (error) {
      console.error('Get admin logs error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju admin logova' });
    }
  });

  app.post("/api/admin/log-action", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { action, targetType, targetId, details } = req.body;

      if (!action) {
        return res.status(400).json({ message: 'Action is required' });
      }

      const ipAddress = req.ip || req.socket.remoteAddress;
      await logAdminAction(admin.id, action, targetType, targetId, details, ipAddress);

      res.json({ success: true });
    } catch (error) {
      console.error('Log action error:', error);
      res.status(500).json({ message: 'Greska pri logovanju akcije' });
    }
  });

  // ============================================
  // User Activity - Track user activities
  // ============================================
  app.get("/api/admin/users/:id/activity", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      const limit = parseInt(req.query.limit as string) || 50;

      const activities = await db.select()
        .from(userActivityLogs)
        .where(eq(userActivityLogs.userId, userId))
        .orderBy(desc(userActivityLogs.createdAt))
        .limit(limit);

      res.json({ activities });
    } catch (error) {
      console.error('Get user activity error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju aktivnosti korisnika' });
    }
  });

  // ============================================
  // Reported Items - Handle reported ads
  // ============================================
  app.get("/api/admin/reported-items", isAdminAuth, async (req, res) => {
    try {
      const status = req.query.status as string || 'all';

      let reports;
      if (status === 'all') {
        reports = await db.select()
          .from(reportedItems)
          .orderBy(desc(reportedItems.createdAt));
      } else {
        reports = await db.select()
          .from(reportedItems)
          .where(eq(reportedItems.status, status))
          .orderBy(desc(reportedItems.createdAt));
      }

      const allUsers = await storage.getAllUsers();
      const allItems = await storage.getItems();

      const reportsWithDetails = reports.map(report => {
        const item = allItems.find((i: any) => i.id === report.itemId);
        const reporter = allUsers.find(u => u.id === report.reporterId);
        const resolver = report.resolvedBy ? allUsers.find(u => u.id === report.resolvedBy) : null;
        
        return {
          ...report,
          itemTitle: item?.title || 'Deleted Item',
          itemOwnerName: item ? allUsers.find(u => u.id === item.ownerId)?.name || 'Unknown' : 'Unknown',
          reporterName: reporter?.name || reporter?.email || 'Unknown',
          resolverName: resolver?.name || resolver?.email || null
        };
      });

      res.json({ reports: reportsWithDetails });
    } catch (error) {
      console.error('Get reported items error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju prijavljenih oglasa' });
    }
  });

  app.post("/api/admin/reported-items/:id/resolve", isAdminAuth, async (req, res) => {
    try {
      const reportId = req.params.id;
      const admin = (req as any).admin;
      const { resolution, action } = req.body;

      await db.update(reportedItems)
        .set({
          status: 'resolved',
          resolvedBy: admin.id,
          resolvedAt: new Date()
        })
        .where(eq(reportedItems.id, reportId));

      if (action === 'remove_item') {
        const report = await db.select().from(reportedItems).where(eq(reportedItems.id, reportId));
        if (report.length > 0 && report[0].itemId) {
          await storage.deleteItem(report[0].itemId);
          await logAdminAction(admin.id, 'remove_reported_item', 'item', report[0].itemId, `Report resolved with item removal: ${resolution}`, req.ip);
        }
      } else {
        await logAdminAction(admin.id, 'resolve_report', 'report', reportId, resolution, req.ip);
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Resolve report error:', error);
      res.status(500).json({ message: 'Greska pri resavanju prijave' });
    }
  });

  // ============================================
  // Feature Toggles
  // ============================================
  app.get("/api/admin/feature-toggles", isAdminAuth, async (req, res) => {
    try {
      const toggles = await db.select()
        .from(featureToggles)
        .orderBy(featureToggles.name);

      res.json({ toggles });
    } catch (error) {
      console.error('Get feature toggles error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju feature toggle-a' });
    }
  });

  app.post("/api/admin/feature-toggles", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { name, description, isEnabled, enabledForPercentage } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const existing = await db.select().from(featureToggles).where(eq(featureToggles.name, name));
      
      if (existing.length > 0) {
        await db.update(featureToggles)
          .set({
            description,
            isEnabled: isEnabled !== undefined ? isEnabled : true,
            enabledForPercentage: enabledForPercentage || 100,
            updatedBy: admin.id,
            updatedAt: new Date()
          })
          .where(eq(featureToggles.name, name));
      } else {
        await db.insert(featureToggles).values({
          name,
          description,
          isEnabled: isEnabled !== undefined ? isEnabled : true,
          enabledForPercentage: enabledForPercentage || 100,
          updatedBy: admin.id
        });
      }

      await logAdminAction(admin.id, 'update_feature_toggle', 'feature_toggle', name, `Enabled: ${isEnabled}`, req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error('Create/update feature toggle error:', error);
      res.status(500).json({ message: 'Greska pri kreiranju/azuriranju feature toggle-a' });
    }
  });

  app.put("/api/admin/feature-toggles/:id", isAdminAuth, async (req, res) => {
    try {
      const toggleId = req.params.id;
      const admin = (req as any).admin;
      const { isEnabled, description, enabledForPercentage } = req.body;

      await db.update(featureToggles)
        .set({
          isEnabled: isEnabled !== undefined ? isEnabled : true,
          description,
          enabledForPercentage: enabledForPercentage || 100,
          updatedBy: admin.id,
          updatedAt: new Date()
        })
        .where(eq(featureToggles.id, toggleId));

      await logAdminAction(admin.id, 'update_feature_toggle', 'feature_toggle', toggleId, `Enabled: ${isEnabled}`, req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error('Update feature toggle error:', error);
      res.status(500).json({ message: 'Greska pri azuriranju feature toggle-a' });
    }
  });

  // ============================================
  // Messages - View user conversations
  // ============================================
  app.get("/api/admin/messages", isAdminAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;

      const recentMessages = await db.select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt
      })
        .from(messages)
        .orderBy(desc(messages.createdAt))
        .limit(limit);

      const allUsers = await storage.getAllUsers();

      const messagesWithUsers = recentMessages.map(msg => {
        const sender = allUsers.find(u => u.id === msg.senderId);
        const receiver = allUsers.find(u => u.id === msg.receiverId);
        return {
          ...msg,
          senderName: sender?.name || sender?.email || 'Unknown',
          senderEmail: sender?.email || '',
          receiverName: receiver?.name || receiver?.email || 'Unknown',
          receiverEmail: receiver?.email || ''
        };
      });

      res.json({ messages: messagesWithUsers });
    } catch (error) {
      console.error('Get admin messages error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju poruka' });
    }
  });

  // ============================================
  // Notifications - Send notifications
  // ============================================
  app.post("/api/admin/notifications/send", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { type, title, message, targetType, targetIds } = req.body;

      if (!type || !title || !message) {
        return res.status(400).json({ message: 'Type, title and message are required' });
      }

      let sentCount = 0;
      const allUsers = await storage.getAllUsers();

      if (targetType === 'all') {
        sentCount = allUsers.length;
      } else if (targetType === 'specific' && Array.isArray(targetIds)) {
        sentCount = targetIds.length;
      } else if (targetType === 'premium') {
        sentCount = allUsers.filter(u => u.subscriptionType === 'premium').length;
      }

      await db.insert(adminNotifications).values({
        adminId: admin.id,
        type,
        title,
        message,
        targetType,
        targetIds: Array.isArray(targetIds) ? targetIds : null,
        sentCount
      });

      await logAdminAction(admin.id, 'send_notification', 'notification', undefined, `Type: ${type}, Title: ${title}, Sent to: ${sentCount} users`, req.ip);

      res.json({ success: true, sentCount });
    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({ message: 'Greska pri slanju notifikacija' });
    }
  });

  app.get("/api/admin/notifications", isAdminAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      const notifications = await db.select()
        .from(adminNotifications)
        .orderBy(desc(adminNotifications.createdAt))
        .limit(limit);

      const allUsers = await storage.getAllUsers();

      const notificationsWithAdmin = notifications.map(notif => {
        const admin = allUsers.find(u => u.id === notif.adminId);
        return {
          ...notif,
          adminName: admin?.name || admin?.email || 'Unknown'
        };
      });

      res.json({ notifications: notificationsWithAdmin });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju notifikacija' });
    }
  });

  // ============================================
  // CSV Export
  // ============================================
  app.get("/api/admin/export/users", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const allUsers = await storage.getAllUsers();

      const csvHeader = 'ID,Email,Name,Phone,City,Role,Subscription,Active,Verified,Created At\n';
      const csvRows = allUsers.map(u => 
        `"${u.id}","${u.email}","${u.name || ''}","${u.phone || ''}","${u.city || ''}","${u.role}","${u.subscriptionType}","${u.isActive}","${u.emailVerified}","${u.createdAt}"`
      ).join('\n');

      const csv = csvHeader + csvRows;

      await logAdminAction(admin.id, 'export_users', 'users', undefined, `Exported ${allUsers.length} users`, req.ip);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
      res.send(csv);
    } catch (error) {
      console.error('Export users error:', error);
      res.status(500).json({ message: 'Greska pri eksportovanju korisnika' });
    }
  });

  app.get("/api/admin/export/items", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const allItems = await storage.getItems();
      const allUsers = await storage.getAllUsers();

      const csvHeader = 'ID,Title,Category,Price Per Day,Deposit,City,Owner Email,Available,Featured,Created At\n';
      const csvRows = allItems.map((item: any) => {
        const owner = allUsers.find(u => u.id === item.ownerId);
        return `"${item.id}","${item.title}","${item.category}","${item.pricePerDay}","${item.deposit}","${item.city}","${owner?.email || ''}","${item.isAvailable}","${item.isFeatured}","${item.createdAt}"`;
      }).join('\n');

      const csv = csvHeader + csvRows;

      await logAdminAction(admin.id, 'export_items', 'items', undefined, `Exported ${allItems.length} items`, req.ip);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=items_export.csv');
      res.send(csv);
    } catch (error) {
      console.error('Export items error:', error);
      res.status(500).json({ message: 'Greska pri eksportovanju oglasa' });
    }
  });

  // ============================================
  // Email Subscribers
  // ============================================
  
  app.get("/api/admin/subscribers", isAdminAuth, async (req, res) => {
    try {
      if (isProductionAvailable()) {
        const productionSubscribers = await getProductionSubscribers();
        const subscribers = productionSubscribers.map(s => ({
          id: s.id.toString(),
          email: s.email,
          source: s.source,
          isActive: s.is_active,
          createdAt: s.created_at
        }));
        res.json({ subscribers, source: 'production' });
      } else {
        const subscribers = await db.select()
          .from(emailSubscribers)
          .orderBy(desc(emailSubscribers.createdAt));
        res.json({ subscribers, source: 'development' });
      }
    } catch (error) {
      console.error('Get subscribers error:', error);
      res.status(500).json({ message: 'Greska pri dobijanju pretplatnika' });
    }
  });

  app.get("/api/admin/export/subscribers", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      let subscribers: any[] = [];
      
      if (isProductionAvailable()) {
        const prodSubscribers = await getProductionSubscribers();
        subscribers = prodSubscribers.map(s => ({
          email: s.email,
          source: s.source,
          isActive: s.is_active,
          createdAt: s.created_at
        }));
      } else {
        subscribers = await db.select()
          .from(emailSubscribers)
          .orderBy(desc(emailSubscribers.createdAt));
      }

      const csvHeader = 'Email,Izvor,Aktivan,Datum pretplate\n';
      const csvRows = subscribers.map(s => 
        `"${s.email}","${s.source || 'unknown'}","${s.isActive ? 'Da' : 'Ne'}","${s.createdAt}"`
      ).join('\n');

      const csv = csvHeader + csvRows;

      await logAdminAction(admin.id, 'export_subscribers', 'subscribers', undefined, `Exported ${subscribers.length} subscribers`, req.ip);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=email_subscribers.csv');
      res.send(csv);
    } catch (error) {
      console.error('Export subscribers error:', error);
      res.status(500).json({ message: 'Greska pri eksportovanju pretplatnika' });
    }
  });

  app.delete("/api/admin/subscribers/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const subscriberId = req.params.id;

      if (isProductionAvailable()) {
        await deleteProductionSubscriber(parseInt(subscriberId));
      } else {
        await db.delete(emailSubscribers).where(eq(emailSubscribers.id, subscriberId));
      }
      
      await logAdminAction(admin.id, 'delete_subscriber', 'subscribers', subscriberId, 'Deleted subscriber', req.ip);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete subscriber error:', error);
      res.status(500).json({ message: 'Greska pri brisanju pretplatnika' });
    }
  });

  // ============================================
  // User Management - Extended
  // ============================================
  
  // Change user subscription
  app.post("/api/admin/users/:id/subscription", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const userId = req.params.id;
      const { subscriptionType, durationDays } = req.body;

      if (!subscriptionType || !['free', 'basic', 'premium'].includes(subscriptionType)) {
        return res.status(400).json({ message: 'Invalid subscription type' });
      }

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + (durationDays || 30));

      await db.update(users)
        .set({ 
          subscriptionType,
          subscriptionStatus: 'active',
          subscriptionStartDate: now,
          subscriptionEndDate: endDate
        })
        .where(eq(users.id, userId));

      // Also create a subscription record
      await db.insert(subscriptions).values({
        userId,
        type: subscriptionType,
        status: 'active',
        priceRsd: subscriptionType === 'premium' ? 1000 : subscriptionType === 'basic' ? 500 : 0,
        startDate: now,
        endDate: endDate
      });

      await logAdminAction(admin.id, 'change_subscription', 'user', userId, `Changed to ${subscriptionType} for ${durationDays || 30} days`, req.ip);

      res.json({ success: true });
    } catch (error) {
      console.error('Change subscription error:', error);
      res.status(500).json({ message: 'Greska pri promeni pretplate' });
    }
  });

  // Reset user password
  app.post("/api/admin/users/:id/reset-password", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const userId = req.params.id;
      
      // Generate a temporary password
      const tempPassword = randomBytes(8).toString('hex');
      const salt = randomBytes(16).toString("hex");
      const hashedBuffer = (await scryptAsync(tempPassword, salt, 64)) as Buffer;
      const hashedPassword = `${hashedBuffer.toString("hex")}.${salt}`;

      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId));

      await logAdminAction(admin.id, 'reset_password', 'user', userId, 'Password was reset', req.ip);

      res.json({ success: true, tempPassword });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Greska pri resetovanju lozinke' });
    }
  });

  // Verify user (email, phone, document)
  app.post("/api/admin/users/:id/verify", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const userId = req.params.id;
      const { verificationType, verified } = req.body;

      if (!['email', 'phone', 'document'].includes(verificationType)) {
        return res.status(400).json({ message: 'Invalid verification type' });
      }

      const updateData: any = {};
      if (verificationType === 'email') updateData.emailVerified = verified;
      if (verificationType === 'phone') updateData.phoneVerified = verified;
      if (verificationType === 'document') updateData.documentVerified = verified;

      await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId));

      await logAdminAction(admin.id, `verify_${verificationType}`, 'user', userId, `Set ${verificationType} verified to ${verified}`, req.ip);

      res.json({ success: true });
    } catch (error) {
      console.error('Verify user error:', error);
      res.status(500).json({ message: 'Greska pri verifikaciji korisnika' });
    }
  });

  // Get user details for editing
  app.get("/api/admin/users/:id/details", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Korisnik nije pronadjen' });
      }

      // Get user's items count
      const userItems = await db.select().from(items).where(eq(items.ownerId, userId));
      
      // Get user's bookings
      const userBookings = await db.select().from(bookings).where(eq(bookings.renterId, userId));

      res.json({
        user: {
          ...user,
          password: undefined,
          itemsCount: userItems.length,
          bookingsCount: userBookings.length
        }
      });
    } catch (error) {
      console.error('Get user details error:', error);
      res.status(500).json({ message: 'Greska pri ucitavanju korisnika' });
    }
  });

  // ============================================
  // Subscription Plans Management
  // ============================================
  
  app.get("/api/admin/subscription-plans", isAdminAuth, async (req, res) => {
    try {
      const plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
      res.json({ plans });
    } catch (error) {
      console.error('Get subscription plans error:', error);
      res.status(500).json({ message: 'Greska pri ucitavanju planova' });
    }
  });

  app.post("/api/admin/subscription-plans", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { name, displayName, description, priceRsd, durationDays, maxAds, features } = req.body;

      if (!name || !displayName || priceRsd === undefined) {
        return res.status(400).json({ message: 'Name, displayName and priceRsd are required' });
      }

      const [plan] = await db.insert(subscriptionPlans).values({
        name,
        displayName,
        description,
        priceRsd,
        durationDays: durationDays || 30,
        maxAds,
        features
      }).returning();

      await logAdminAction(admin.id, 'create_plan', 'subscription_plan', plan.id, `Created plan ${name}`, req.ip);

      res.json({ success: true, plan });
    } catch (error) {
      console.error('Create subscription plan error:', error);
      res.status(500).json({ message: 'Greska pri kreiranju plana' });
    }
  });

  app.put("/api/admin/subscription-plans/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const planId = req.params.id;
      const { displayName, description, priceRsd, durationDays, maxAds, features, isActive } = req.body;

      await db.update(subscriptionPlans)
        .set({ 
          displayName, 
          description, 
          priceRsd, 
          durationDays, 
          maxAds, 
          features, 
          isActive,
          updatedAt: new Date()
        })
        .where(eq(subscriptionPlans.id, planId));

      await logAdminAction(admin.id, 'update_plan', 'subscription_plan', planId, 'Updated plan', req.ip);

      res.json({ success: true });
    } catch (error) {
      console.error('Update subscription plan error:', error);
      res.status(500).json({ message: 'Greska pri azuriranju plana' });
    }
  });

  app.delete("/api/admin/subscription-plans/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const planId = req.params.id;

      await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, planId));

      await logAdminAction(admin.id, 'delete_plan', 'subscription_plan', planId, 'Deleted plan', req.ip);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete subscription plan error:', error);
      res.status(500).json({ message: 'Greska pri brisanju plana' });
    }
  });

  // ============================================
  // Item Statistics
  // ============================================
  
  app.get("/api/admin/items/:id/stats", isAdminAuth, async (req, res) => {
    try {
      const itemId = req.params.id;
      
      // Get views count
      const views = await db.select().from(itemViews).where(eq(itemViews.itemId, itemId));
      
      // Get bookings for this item
      const itemBookings = await db.select().from(bookings).where(eq(bookings.itemId, itemId));
      
      // Calculate stats
      const totalViews = views.length;
      const totalBookings = itemBookings.length;
      const completedBookings = itemBookings.filter(b => b.status === 'completed').length;
      const totalRevenue = itemBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.totalPrice, 0);
      
      res.json({
        stats: {
          totalViews,
          totalBookings,
          completedBookings,
          conversionRate: totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(1) : 0,
          totalRevenue
        }
      });
    } catch (error) {
      console.error('Get item stats error:', error);
      res.status(500).json({ message: 'Greska pri ucitavanju statistike' });
    }
  });

  app.get("/api/admin/items-stats", isAdminAuth, async (req, res) => {
    try {
      const allItems = await storage.getItems();
      const allBookings = await db.select().from(bookings);
      const allViews = await db.select().from(itemViews);

      // Calculate stats per item
      const itemStats = allItems.map((item: any) => {
        const itemBookings = allBookings.filter(b => b.itemId === item.id);
        const views = allViews.filter(v => v.itemId === item.id);
        const completedBookings = itemBookings.filter(b => b.status === 'completed');
        
        return {
          id: item.id,
          title: item.title,
          views: views.length,
          bookings: itemBookings.length,
          completedBookings: completedBookings.length,
          avgPrice: item.pricePerDay,
          revenue: completedBookings.reduce((sum, b) => sum + b.totalPrice, 0)
        };
      });

      // Sort by bookings desc
      itemStats.sort((a, b) => b.bookings - a.bookings);

      // Overall stats
      const totalViews = allViews.length;
      const totalBookings = allBookings.length;
      const completedBookings = allBookings.filter(b => b.status === 'completed').length;
      const avgPricePerDay = allItems.length > 0 
        ? Math.round(allItems.reduce((sum: number, i: any) => sum + i.pricePerDay, 0) / allItems.length)
        : 0;

      res.json({
        overview: {
          totalViews,
          totalBookings,
          completedBookings,
          avgPricePerDay
        },
        items: itemStats.slice(0, 20) // Top 20
      });
    } catch (error) {
      console.error('Get items stats error:', error);
      res.status(500).json({ message: 'Greska pri ucitavanju statistike' });
    }
  });

  // ============================================
  // Bulk Actions
  // ============================================
  app.post("/api/admin/bulk/suspend-users", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { userIds } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'userIds array is required' });
      }

      await db.update(users)
        .set({ isActive: false })
        .where(inArray(users.id, userIds));

      await logAdminAction(admin.id, 'bulk_suspend_users', 'users', undefined, `Suspended ${userIds.length} users: ${userIds.join(', ')}`, req.ip);

      res.json({ success: true, count: userIds.length });
    } catch (error) {
      console.error('Bulk suspend users error:', error);
      res.status(500).json({ message: 'Greska pri suspendovanju korisnika' });
    }
  });

  app.post("/api/admin/bulk/delete-items", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { itemIds } = req.body;

      if (!Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(400).json({ message: 'itemIds array is required' });
      }

      let deletedCount = 0;
      for (const itemId of itemIds) {
        try {
          await storage.deleteItem(itemId);
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete item ${itemId}:`, err);
        }
      }

      await logAdminAction(admin.id, 'bulk_delete_items', 'items', undefined, `Deleted ${deletedCount} items: ${itemIds.join(', ')}`, req.ip);

      res.json({ success: true, count: deletedCount });
    } catch (error) {
      console.error('Bulk delete items error:', error);
      res.status(500).json({ message: 'Greska pri brisanju oglasa' });
    }
  });

  // ============================================
  // Reported Users
  // ============================================
  app.get("/api/admin/reported-users", isAdminAuth, async (req, res) => {
    try {
      const reports = await db.select().from(reportedUsers).orderBy(desc(reportedUsers.createdAt));
      const allUsers = await storage.getAllUsers();
      
      const reportsWithDetails = reports.map(r => ({
        ...r,
        reporter: allUsers.find(u => u.id === r.reporterId),
        reportedUser: allUsers.find(u => u.id === r.reportedUserId)
      }));
      
      res.json({ reports: reportsWithDetails });
    } catch (error) {
      console.error('Get reported users error:', error);
      res.status(500).json({ message: 'Greska pri ucitavanju prijava' });
    }
  });

  app.post("/api/admin/reported-users/:id/resolve", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const reportId = req.params.id;
      const { status, adminNotes } = req.body;

      await db.update(reportedUsers)
        .set({ 
          status, 
          adminNotes, 
          resolvedBy: admin.id, 
          resolvedAt: new Date() 
        })
        .where(eq(reportedUsers.id, reportId));

      await logAdminAction(admin.id, 'resolve_user_report', 'reported_user', reportId, `Status: ${status}`, req.ip);

      res.json({ success: true });
    } catch (error) {
      console.error('Resolve reported user error:', error);
      res.status(500).json({ message: 'Greska pri resavanju prijave' });
    }
  });

  // ============================================
  // User Reputation
  // ============================================
  app.get("/api/admin/users/:id/reputation", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Korisnik nije pronadjen' });
      }

      // Get reviews for this user
      const userReviews = await db.select().from(reviews).where(eq(reviews.revieweeId, userId));
      
      // Get bookings as owner
      const ownerBookings = await db.select().from(bookings).where(eq(bookings.ownerId, userId));
      const completedAsOwner = ownerBookings.filter(b => b.status === 'completed').length;
      
      // Get bookings as renter
      const renterBookings = await db.select().from(bookings).where(eq(bookings.renterId, userId));
      const completedAsRenter = renterBookings.filter(b => b.status === 'completed').length;
      
      // Get items count
      const userItems = await db.select().from(items).where(eq(items.ownerId, userId));
      
      // Calculate reputation score
      const avgRating = userReviews.length > 0 
        ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length 
        : 0;
      
      const totalTransactions = completedAsOwner + completedAsRenter;
      const reputationScore = Math.min(100, Math.round(
        (avgRating * 10) + 
        (totalTransactions * 2) + 
        (user.emailVerified ? 10 : 0) + 
        (user.phoneVerified ? 10 : 0) + 
        (user.documentVerified ? 20 : 0)
      ));

      res.json({
        reputation: {
          score: reputationScore,
          avgRating: avgRating.toFixed(1),
          totalReviews: userReviews.length,
          completedAsOwner,
          completedAsRenter,
          totalTransactions,
          itemsCount: userItems.length,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          documentVerified: user.documentVerified,
          memberSince: user.createdAt
        },
        recentReviews: userReviews.slice(0, 5)
      });
    } catch (error) {
      console.error('Get user reputation error:', error);
      res.status(500).json({ message: 'Greska pri ucitavanju reputacije' });
    }
  });

  // ============================================
  // Server Error Logs
  // ============================================
  app.get("/api/admin/error-logs", isAdminAuth, async (req, res) => {
    try {
      const logs = await db.select().from(serverErrorLogs).orderBy(desc(serverErrorLogs.createdAt)).limit(100);
      res.json({ logs });
    } catch (error) {
      console.error('Get error logs error:', error);
      res.status(500).json({ message: 'Greska pri ucitavanju logova' });
    }
  });

  app.delete("/api/admin/error-logs/clear", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      await db.delete(serverErrorLogs);
      await logAdminAction(admin.id, 'clear_error_logs', 'system', undefined, 'Cleared all error logs', req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error('Clear error logs error:', error);
      res.status(500).json({ message: 'Greska pri brisanju logova' });
    }
  });

  // ============================================
  // Admin 2FA
  // ============================================
  app.get("/api/admin/2fa/status", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const [twoFa] = await db.select().from(admin2fa).where(eq(admin2fa.userId, admin.id));
      res.json({ 
        enabled: twoFa?.isEnabled || false,
        hasSetup: !!twoFa
      });
    } catch (error) {
      console.error('Get 2FA status error:', error);
      res.status(500).json({ message: 'Greska pri ucitavanju 2FA statusa' });
    }
  });

  app.post("/api/admin/2fa/setup", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      
      // Generate a secret (base32 encoded for TOTP apps)
      const secret = crypto.randomBytes(20).toString('hex');
      const base32Secret = Buffer.from(secret, 'hex').toString('base64').replace(/=/g, '').slice(0, 16).toUpperCase();
      
      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () => 
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      // Check if already exists
      const [existing] = await db.select().from(admin2fa).where(eq(admin2fa.userId, admin.id));
      
      if (existing) {
        await db.update(admin2fa)
          .set({ secret: base32Secret, backupCodes, isEnabled: false })
          .where(eq(admin2fa.userId, admin.id));
      } else {
        await db.insert(admin2fa).values({
          userId: admin.id,
          secret: base32Secret,
          backupCodes,
          isEnabled: false
        });
      }

      res.json({ 
        success: true, 
        secret: base32Secret,
        backupCodes,
        qrCodeUrl: `otpauth://totp/VikendMajstor:${admin.email}?secret=${base32Secret}&issuer=VikendMajstor`
      });
    } catch (error) {
      console.error('Setup 2FA error:', error);
      res.status(500).json({ message: 'Greska pri podesavanju 2FA' });
    }
  });

  app.post("/api/admin/2fa/enable", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { code } = req.body;

      if (!code || code.length !== 6) {
        return res.status(400).json({ message: 'Unesite 6-cifreni kod iz aplikacije' });
      }

      // Get the secret
      const [twoFa] = await db.select().from(admin2fa).where(eq(admin2fa.userId, admin.id));
      if (!twoFa) {
        return res.status(400).json({ message: 'Prvo pokrenite podesavanje 2FA' });
      }

      // Verify TOTP code
      const isValid = verifyTOTP(twoFa.secret, code);
      if (!isValid) {
        return res.status(400).json({ message: 'Neispravan kod. Proverite da li je vreme na uredjaju tacno.' });
      }

      await db.update(admin2fa)
        .set({ isEnabled: true, lastUsedAt: new Date() })
        .where(eq(admin2fa.userId, admin.id));

      await logAdminAction(admin.id, 'enable_2fa', 'admin', admin.id, 'Enabled 2FA', req.ip);

      res.json({ success: true });
    } catch (error) {
      console.error('Enable 2FA error:', error);
      res.status(500).json({ message: 'Greska pri aktivaciji 2FA' });
    }
  });

  // TOTP verification helper function
  function verifyTOTP(secret: string, code: string): boolean {
    const timeStep = 30;
    const now = Math.floor(Date.now() / 1000);
    
    // Check current time window and one before/after for clock drift
    for (let i = -1; i <= 1; i++) {
      const time = Math.floor((now + i * timeStep) / timeStep);
      const generatedCode = generateTOTP(secret, time);
      if (generatedCode === code) {
        return true;
      }
    }
    return false;
  }

  function generateTOTP(secret: string, time: number): string {
    // Convert base32 secret to bytes
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (const char of secret.toUpperCase()) {
      const val = base32chars.indexOf(char);
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, '0');
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    
    // Create time buffer (8 bytes, big-endian)
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigUInt64BE(BigInt(time));
    
    // HMAC-SHA1
    const hmac = crypto.createHmac('sha1', Buffer.from(bytes));
    hmac.update(timeBuffer);
    const hash = hmac.digest();
    
    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0xf;
    const binary = ((hash[offset] & 0x7f) << 24) |
                   ((hash[offset + 1] & 0xff) << 16) |
                   ((hash[offset + 2] & 0xff) << 8) |
                   (hash[offset + 3] & 0xff);
    
    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  app.post("/api/admin/2fa/disable", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      
      await db.update(admin2fa)
        .set({ isEnabled: false })
        .where(eq(admin2fa.userId, admin.id));

      await logAdminAction(admin.id, 'disable_2fa', 'admin', admin.id, 'Disabled 2FA', req.ip);

      res.json({ success: true });
    } catch (error) {
      console.error('Disable 2FA error:', error);
      res.status(500).json({ message: 'Greska pri deaktivaciji 2FA' });
    }
  });

  // ============================================
  // App Versions
  // ============================================
  app.get("/api/admin/app-versions", isAdminAuth, async (req, res) => {
    try {
      const versions = await db.select().from(appVersions).orderBy(desc(appVersions.releasedAt));
      res.json({ versions });
    } catch (error) {
      console.error('Get app versions error:', error);
      res.status(500).json({ message: 'Greska pri ucitavanju verzija' });
    }
  });

  app.post("/api/admin/app-versions", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { platform, version, buildNumber, releaseNotes, isRequired, downloadUrl } = req.body;

      const [newVersion] = await db.insert(appVersions).values({
        platform,
        version,
        buildNumber,
        releaseNotes,
        isRequired,
        downloadUrl
      }).returning();

      await logAdminAction(admin.id, 'add_app_version', 'app_version', newVersion.id, `${platform} v${version}`, req.ip);

      res.json({ success: true, version: newVersion });
    } catch (error) {
      console.error('Add app version error:', error);
      res.status(500).json({ message: 'Greska pri dodavanju verzije' });
    }
  });

  app.delete("/api/admin/app-versions/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const versionId = req.params.id;

      await db.delete(appVersions).where(eq(appVersions.id, versionId));
      await logAdminAction(admin.id, 'delete_app_version', 'app_version', versionId, 'Deleted version', req.ip);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete app version error:', error);
      res.status(500).json({ message: 'Greska pri brisanju verzije' });
    }
  });

  // ============================================
  // Transactions Export
  // ============================================
  app.get("/api/admin/export/transactions", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const allBookings = await db.select().from(bookings);
      const allUsers = await storage.getAllUsers();
      const allItems = await storage.getItems();

      const csvHeader = 'ID,Item,Owner,Renter,Start Date,End Date,Days,Price Per Day,Total Price,Status,Created At\n';
      const csvRows = allBookings.map((b: any) => {
        const item = allItems.find((i: any) => i.id === b.itemId);
        const owner = allUsers.find(u => u.id === b.ownerId);
        const renter = allUsers.find(u => u.id === b.renterId);
        return `"${b.id}","${item?.title || ''}","${owner?.email || ''}","${renter?.email || ''}","${b.startDate}","${b.endDate}","${b.totalDays}","${b.pricePerDay}","${b.totalPrice}","${b.status}","${b.createdAt}"`;
      }).join('\n');

      const csv = csvHeader + csvRows;

      await logAdminAction(admin.id, 'export_transactions', 'bookings', undefined, `Exported ${allBookings.length} transactions`, req.ip);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions_export.csv');
      res.send(csv);
    } catch (error) {
      console.error('Export transactions error:', error);
      res.status(500).json({ message: 'Greska pri eksportovanju transakcija' });
    }
  });

  // ============================================
  // Deployment Status
  // ============================================
  app.get("/api/admin/deployment-status", isAdminAuth, async (req, res) => {
    try {
      // Get latest versions for each platform
      const versions = await db.select().from(appVersions).orderBy(desc(appVersions.releasedAt));
      
      const webVersion = versions.find(v => v.platform === 'web');
      const androidVersion = versions.find(v => v.platform === 'android');
      const iosVersion = versions.find(v => v.platform === 'ios');

      res.json({
        status: {
          server: 'running',
          database: 'connected',
          uptime: process.uptime(),
          nodeVersion: process.version,
          memoryUsage: process.memoryUsage()
        },
        versions: {
          web: webVersion?.version || 'N/A',
          android: androidVersion?.version || 'N/A',
          ios: iosVersion?.version || 'N/A'
        },
        lastDeployment: versions[0]?.releasedAt || null
      });
    } catch (error) {
      console.error('Get deployment status error:', error);
      res.status(500).json({ message: 'Greska pri ucitavanju statusa' });
    }
  });

  // ============================================
  // Categories Management (Admin CRUD)
  // ============================================
  
  app.get("/api/admin/categories", isAdminAuth, async (req, res) => {
    try {
      const allCategories = await db.select()
        .from(categories)
        .orderBy(asc(categories.sortOrder));
      
      const categoriesWithSubs = await Promise.all(
        allCategories.map(async (cat) => {
          const subs = await db.select()
            .from(subcategories)
            .where(eq(subcategories.categoryId, cat.id))
            .orderBy(asc(subcategories.sortOrder));
          
          const itemCount = await db.select({ count: sql<number>`count(*)` })
            .from(items)
            .where(eq(items.categoryId, cat.id));
          
          return { 
            ...cat, 
            subcategories: subs,
            itemCount: Number(itemCount[0]?.count || 0)
          };
        })
      );
      
      res.json(categoriesWithSubs);
    } catch (error) {
      console.error("Error fetching admin categories:", error);
      res.status(500).json({ message: "Greška pri učitavanju kategorija" });
    }
  });

  app.post("/api/admin/categories", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { name, slug, icon, sortOrder } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ message: "Naziv i slug su obavezni" });
      }
      
      const [newCategory] = await db.insert(categories).values({
        name,
        slug,
        icon,
        sortOrder: sortOrder || 0,
        isActive: true,
      }).returning();
      
      await logAdminAction(admin.id, 'create_category', 'category', newCategory.id, `Created category: ${name}`, req.ip);
      
      res.json(newCategory);
    } catch (error: any) {
      console.error("Error creating category:", error);
      if (error.code === '23505') {
        return res.status(400).json({ message: "Kategorija sa ovim nazivom ili slugom već postoji" });
      }
      res.status(500).json({ message: "Greška pri kreiranju kategorije" });
    }
  });

  app.put("/api/admin/categories/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { id } = req.params;
      const { name, slug, icon, sortOrder, isActive } = req.body;
      
      const [updated] = await db.update(categories)
        .set({ name, slug, icon, sortOrder, isActive })
        .where(eq(categories.id, id))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ message: "Kategorija nije pronađena" });
      }
      
      await logAdminAction(admin.id, 'update_category', 'category', id, `Updated category: ${name}`, req.ip);
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Greška pri ažuriranju kategorije" });
    }
  });

  app.delete("/api/admin/categories/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { id } = req.params;
      
      const itemCount = await db.select({ count: sql<number>`count(*)` })
        .from(items)
        .where(eq(items.categoryId, id));
      
      if (Number(itemCount[0]?.count || 0) > 0) {
        return res.status(400).json({ 
          message: "Ne možete obrisati kategoriju koja ima oglase. Prvo premestite oglase u drugu kategoriju." 
        });
      }
      
      const [deleted] = await db.delete(categories)
        .where(eq(categories.id, id))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ message: "Kategorija nije pronađena" });
      }
      
      await logAdminAction(admin.id, 'delete_category', 'category', id, `Deleted category: ${deleted.name}`, req.ip);
      
      res.json({ message: "Kategorija uspešno obrisana" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Greška pri brisanju kategorije" });
    }
  });

  // Subcategories CRUD
  app.post("/api/admin/subcategories", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { categoryId, name, slug, icon, sortOrder } = req.body;
      
      if (!categoryId || !name || !slug) {
        return res.status(400).json({ message: "Kategorija, naziv i slug su obavezni" });
      }
      
      const [newSubcategory] = await db.insert(subcategories).values({
        categoryId,
        name,
        slug,
        icon,
        sortOrder: sortOrder || 0,
        isActive: true,
      }).returning();
      
      await logAdminAction(admin.id, 'create_subcategory', 'subcategory', newSubcategory.id, `Created subcategory: ${name}`, req.ip);
      
      res.json(newSubcategory);
    } catch (error) {
      console.error("Error creating subcategory:", error);
      res.status(500).json({ message: "Greška pri kreiranju podkategorije" });
    }
  });

  app.put("/api/admin/subcategories/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { id } = req.params;
      const { name, slug, icon, sortOrder, isActive } = req.body;
      
      const [updated] = await db.update(subcategories)
        .set({ name, slug, icon, sortOrder, isActive })
        .where(eq(subcategories.id, id))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ message: "Podkategorija nije pronađena" });
      }
      
      await logAdminAction(admin.id, 'update_subcategory', 'subcategory', id, `Updated subcategory: ${name}`, req.ip);
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating subcategory:", error);
      res.status(500).json({ message: "Greška pri ažuriranju podkategorije" });
    }
  });

  app.delete("/api/admin/subcategories/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = (req as any).admin;
      const { id } = req.params;
      
      const itemCount = await db.select({ count: sql<number>`count(*)` })
        .from(items)
        .where(eq(items.subcategoryId, id));
      
      if (Number(itemCount[0]?.count || 0) > 0) {
        return res.status(400).json({ 
          message: "Ne možete obrisati podkategoriju koja ima oglase." 
        });
      }
      
      const [deleted] = await db.delete(subcategories)
        .where(eq(subcategories.id, id))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ message: "Podkategorija nije pronađena" });
      }
      
      await logAdminAction(admin.id, 'delete_subcategory', 'subcategory', id, `Deleted subcategory: ${deleted.name}`, req.ip);
      
      res.json({ message: "Podkategorija uspešno obrisana" });
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      res.status(500).json({ message: "Greška pri brisanju podkategorije" });
    }
  });

  console.log('[ADMIN] Admin panel API routes registered');
}
