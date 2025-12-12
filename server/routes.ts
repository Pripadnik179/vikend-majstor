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

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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
      const featuredItem = userItems.find(item => item.isFeatured);
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
        featuredItemId: featuredItem?.id || null,
        isPremium: freshUser.subscriptionType === 'premium' && subscriptionActive,
      });
    } catch (error) {
      console.error("Error fetching ad stats:", error);
      res.status(500).json({ error: "Greška pri učitavanju statistike" });
    }
  });

  app.get("/api/items", async (req, res) => {
    try {
      const { category, subCategory, toolType, powerSource, city, search } = req.query;
      const items = await storage.getItems({
        category: category as string | undefined,
        subCategory: subCategory as string | undefined,
        toolType: toolType as string | undefined,
        powerSource: powerSource as string | undefined,
        city: city as string | undefined,
        search: search as string | undefined,
      });
      
      const now = new Date();
      const itemsWithPremium = await Promise.all(
        items.map(async (item) => {
          const owner = await storage.getUser(item.ownerId);
          const isPremium = owner?.subscriptionType === 'premium' && 
            owner?.subscriptionEndDate && 
            new Date(owner.subscriptionEndDate) > now;
          return { ...item, isPremium: !!isPremium };
        })
      );
      
      res.json(itemsWithPremium);
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
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije pronađena" });
      }
      if (item.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      await storage.deleteItem(req.params.id);
      res.json({ success: true, message: "Oglas je uspešno obrisan" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Greška pri brisanju oglasa" });
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

  app.delete("/api/items/:id", isAuthenticated, async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije pronađena" });
      }
      if (item.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      
      await storage.deleteItem(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Greška pri brisanju stvari" });
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

  const httpServer = createServer(app);

  return httpServer;
}
