import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { setupAuth, isAuthenticated } from "./auth";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { 
  sendBookingRequestNotification, 
  sendBookingRequestConfirmationToRenter,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification
} from "./notifications";
import * as path from "path";
import * as fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/", (req, res) => {
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
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
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

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.uploadURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error finalizing upload:", error);
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
      const { category, subCategory, toolType, powerSource, city, search, adType, minPrice, maxPrice, period, hasImages, activityTag, lat, lng, maxDistance } = req.query;
      
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
      });
      
      const now = new Date();
      const userLat = lat ? parseFloat(lat as string) : null;
      const userLng = lng ? parseFloat(lng as string) : null;
      const maxDist = maxDistance ? parseFloat(maxDistance as string) : null;
      
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
          
          return { ...item, isPremium: !!isPremium, distance };
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

  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije pronađena" });
      }
      
      const owner = await storage.getUser(item.ownerId);
      res.json({ ...item, owner });
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

  app.post("/api/items", isAuthenticated, async (req, res) => {
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
      
      const item = await storage.createItem({
        ...req.body,
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

  app.delete("/api/items/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/items/:id/feature", isAuthenticated, async (req, res) => {
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

  app.put("/api/items/:id", isAuthenticated, async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije pronađena" });
      }
      if (item.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      const updatedItem = await storage.updateItem(req.params.id, req.body);
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

  app.post("/api/bookings", isAuthenticated, async (req, res) => {
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
      
      sendBookingRequestConfirmationToRenter(req.user!.id, item.title, booking.id);
      sendBookingRequestNotification(item.ownerId, renter?.name || 'Korisnik', item.title, booking.id);
      
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
        
        if (req.body.status === 'confirmed' && item && owner) {
          sendBookingConfirmedNotification(booking.renterId, item.title, owner.name, booking.id);
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

  app.post("/api/conversations", isAuthenticated, async (req, res) => {
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

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
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

  app.post("/api/reviews", isAuthenticated, async (req, res) => {
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

  app.get("/api/categories", async (_req, res) => {
    try {
      const { CATEGORIES, POWER_SOURCES } = await import("../shared/schema");
      res.json({ categories: CATEGORIES, powerSources: POWER_SOURCES });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Greška pri učitavanju kategorija" });
    }
  });

  // Admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "Niste prijavljeni" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
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
      
      console.log(`[ADMIN] User ${req.user.email} updated user ${updatedUser.email}: isActive=${isActive}, subscriptionType=${subscriptionType}, days=${subscriptionDays}`);
      
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

  const httpServer = createServer(app);

  return httpServer;
}
