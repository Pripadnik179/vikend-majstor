import { 
  users, items, bookings, conversations, messages, reviews, subscriptions, verificationTokens, emailSubscribers,
  type User, type InsertUser,
  type Item, type InsertItem,
  type Booking, type InsertBooking,
  type Conversation,
  type Message, type InsertMessage,
  type Review, type InsertReview,
  type Subscription, type InsertSubscription,
  type VerificationToken,
  type EmailSubscriber
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql, count, inArray, gt, lt, isNull } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  incrementUserAdsCreated(userId: string): Promise<void>;
  
  getAllUsers(filters?: { search?: string; isActive?: boolean; subscriptionType?: string }): Promise<User[]>;
  updateUserAdmin(id: string, data: { isActive?: boolean; isAdmin?: boolean; subscriptionType?: 'free' | 'basic' | 'premium'; subscriptionDays?: number }): Promise<User | undefined>;
  deleteUserWithData(id: string): Promise<{ deletedItems: number; deletedBookings: number; deletedMessages: number; deletedReviews: number }>;
  
  getItems(filters?: { 
    category?: string; 
    subCategory?: string;
    toolType?: string;
    powerSource?: string;
    city?: string; 
    search?: string;
    adType?: string;
    minPrice?: number;
    maxPrice?: number;
    createdAfter?: Date;
    hasImages?: boolean;
    activityTag?: string;
  }): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  getItemsByOwner(ownerId: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, data: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<void>;
  deleteExpiredItems(): Promise<number>;
  
  getBookings(userId: string, type: 'renter' | 'owner'): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getItemBookings(itemId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, data: Partial<InsertBooking>): Promise<Booking | undefined>;
  
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getOrCreateConversation(user1Id: string, user2Id: string, itemId?: string): Promise<Conversation>;
  
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  
  getReviewsForItem(itemId: string): Promise<Review[]>;
  getReviewsForUser(userId: string): Promise<Review[]>;
  getItemReviews(itemId: string): Promise<(Review & { reviewer: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  createVerificationToken(userId: string, type?: string, customToken?: string, customExpiresAt?: Date): Promise<VerificationToken>;
  getVerificationToken(token: string): Promise<VerificationToken | undefined>;
  deleteVerificationToken(token: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }

  async incrementUserAdsCreated(userId: string): Promise<void> {
    await db.update(users)
      .set({ totalAdsCreated: sql`COALESCE(${users.totalAdsCreated}, 0) + 1` })
      .where(eq(users.id, userId));
  }

  async getItems(filters?: { 
    category?: string; 
    subCategory?: string;
    toolType?: string;
    powerSource?: string;
    city?: string; 
    search?: string;
    adType?: string;
    minPrice?: number;
    maxPrice?: number;
    createdAfter?: Date;
    hasImages?: boolean;
    activityTag?: string;
  }): Promise<Item[]> {
    const now = new Date();
    const conditions = [
      eq(items.isAvailable, true),
      or(isNull(items.expiresAt), gt(items.expiresAt, now))
    ];
    
    if (filters?.category) {
      conditions.push(eq(items.category, filters.category));
    }
    if (filters?.subCategory) {
      conditions.push(eq(items.subCategory, filters.subCategory));
    }
    if (filters?.toolType) {
      conditions.push(eq(items.toolType, filters.toolType));
    }
    if (filters?.powerSource) {
      conditions.push(eq(items.powerSource, filters.powerSource));
    }
    if (filters?.city) {
      conditions.push(eq(items.city, filters.city));
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        sql`(${items.title} ILIKE ${searchTerm} OR ${items.description} ILIKE ${searchTerm})`
      );
    }
    if (filters?.adType && filters.adType !== 'all') {
      conditions.push(eq(items.adType, filters.adType));
    }
    if (filters?.minPrice !== undefined) {
      conditions.push(sql`${items.pricePerDay} >= ${filters.minPrice}`);
    }
    if (filters?.maxPrice !== undefined) {
      conditions.push(sql`${items.pricePerDay} <= ${filters.maxPrice}`);
    }
    if (filters?.createdAfter) {
      conditions.push(gt(items.createdAt, filters.createdAfter));
    }
    if (filters?.hasImages) {
      conditions.push(sql`array_length(${items.images}, 1) > 0`);
    }
    if (filters?.activityTag) {
      conditions.push(sql`${filters.activityTag} = ANY(${items.activityTags})`);
    }
    
    const result = await db.select().from(items).where(and(...conditions)).orderBy(desc(items.isFeatured), desc(items.createdAt));
    return result;
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async getItemsByOwner(ownerId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.ownerId, ownerId)).orderBy(desc(items.createdAt));
  }

  async getPremiumItems(): Promise<Item[]> {
    const now = new Date();
    const premiumUserIds = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.subscriptionType, 'premium'),
          sql`${users.subscriptionEndDate} > ${now}`
        )
      );
    
    if (premiumUserIds.length === 0) {
      return [];
    }

    const premiumOwnerIds = premiumUserIds.map(u => u.id);
    return await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.isAvailable, true),
          inArray(items.ownerId, premiumOwnerIds),
          or(isNull(items.expiresAt), gt(items.expiresAt, now))
        )
      )
      .orderBy(desc(items.createdAt))
      .limit(10);
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const [item] = await db.insert(items).values({ ...insertItem, expiresAt }).returning();
    return item;
  }

  async deleteExpiredItems(): Promise<number> {
    const now = new Date();
    const expiredItems = await db.select({ id: items.id }).from(items).where(
      and(
        sql`${items.expiresAt} IS NOT NULL`,
        lt(items.expiresAt, now)
      )
    );
    
    if (expiredItems.length === 0) return 0;
    
    const expiredIds = expiredItems.map(i => i.id);
    await db.delete(items).where(inArray(items.id, expiredIds));
    return expiredIds.length;
  }

  async updateItem(id: string, data: Partial<InsertItem>): Promise<Item | undefined> {
    const [item] = await db.update(items).set({ ...data, updatedAt: new Date() }).where(eq(items.id, id)).returning();
    return item || undefined;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.itemId, id));
    await db.delete(items).where(eq(items.id, id));
  }

  async getBookings(userId: string, type: 'renter' | 'owner'): Promise<Booking[]> {
    const condition = type === 'renter' ? eq(bookings.renterId, userId) : eq(bookings.ownerId, userId);
    return await db.select().from(bookings).where(condition).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: string, data: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings).set({ ...data, updatedAt: new Date() }).where(eq(bookings.id, id)).returning();
    return booking || undefined;
  }

  async getItemBookings(itemId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(and(
        eq(bookings.itemId, itemId),
        or(
          eq(bookings.status, 'confirmed'),
          eq(bookings.status, 'pending')
        )
      ))
      .orderBy(bookings.startDate);
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return await db.select().from(conversations)
      .where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)))
      .orderBy(desc(conversations.lastMessageAt));
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getOrCreateConversation(user1Id: string, user2Id: string, itemId?: string): Promise<Conversation> {
    const existing = await db.select().from(conversations).where(
      or(
        and(eq(conversations.user1Id, user1Id), eq(conversations.user2Id, user2Id)),
        and(eq(conversations.user1Id, user2Id), eq(conversations.user2Id, user1Id))
      )
    );
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const [conversation] = await db.insert(conversations).values({
      user1Id,
      user2Id,
      itemId,
    }).returning();
    
    return conversation;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, insertMessage.conversationId));
    
    return message;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.conversationId, conversationId),
        eq(messages.receiverId, userId),
        eq(messages.isRead, false)
      ));
  }

  async getReviewsForItem(itemId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.itemId, itemId))
      .orderBy(desc(reviews.createdAt));
  }

  async getReviewsForUser(userId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.revieweeId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async getItemReviews(itemId: string): Promise<(Review & { reviewer: User })[]> {
    const itemReviews = await db.select().from(reviews)
      .where(eq(reviews.itemId, itemId))
      .orderBy(desc(reviews.createdAt));
    
    const reviewsWithReviewers = await Promise.all(
      itemReviews.map(async (review) => {
        const [reviewer] = await db.select().from(users).where(eq(users.id, review.reviewerId));
        return { ...review, reviewer };
      })
    );
    
    return reviewsWithReviewers;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    
    const itemReviews = await this.getReviewsForItem(insertReview.itemId);
    const avgRating = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
    
    await db.update(items)
      .set({ rating: avgRating.toFixed(1), totalRatings: itemReviews.length })
      .where(eq(items.id, insertReview.itemId));
    
    const userReviews = await this.getReviewsForUser(insertReview.revieweeId);
    const userAvgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    
    await db.update(users)
      .set({ rating: userAvgRating.toFixed(1), totalRatings: userReviews.length })
      .where(eq(users.id, insertReview.revieweeId));
    
    return review;
  }

  async getEarlyAdopterCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0]?.count || 0;
  }

  async checkAndUpdateExpiredSubscription(userId: string): Promise<User | null> {
    const user = await this.getUser(userId);
    if (!user) return null;

    const now = new Date();
    
    if (user.subscriptionType !== 'free' && user.subscriptionEndDate && new Date(user.subscriptionEndDate) <= now) {
      const [updatedUser] = await db.update(users)
        .set({
          subscriptionType: 'free',
          subscriptionStatus: 'expired'
        })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    }
    
    return user;
  }

  async getSubscriptionStatus(userId: string): Promise<{
    subscriptionType: string;
    subscriptionStatus: string;
    subscriptionEndDate: Date | null;
    subscriptionStartDate: Date | null;
    isEarlyAdopter: boolean;
    isPremiumListing: boolean;
    premiumListingEndDate: Date | null;
    canPostItems: boolean;
    remainingDays: number | null;
  }> {
    const user = await this.checkAndUpdateExpiredSubscription(userId);
    if (!user) {
      throw new Error("Korisnik nije pronađen");
    }

    const now = new Date();
    let canPostItems = false;
    let remainingDays: number | null = null;

    if (user.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      if (endDate > now) {
        const diffTime = endDate.getTime() - now.getTime();
        remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    if (user.isEarlyAdopter && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now) {
      canPostItems = true;
    } else if (user.subscriptionType !== 'free' && user.subscriptionStatus === 'active' && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now) {
      canPostItems = true;
    }

    return {
      subscriptionType: user.subscriptionType,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
      subscriptionStartDate: user.subscriptionStartDate,
      isEarlyAdopter: user.isEarlyAdopter,
      isPremiumListing: user.isPremiumListing,
      premiumListingEndDate: user.premiumListingEndDate,
      canPostItems,
      remainingDays
    };
  }

  async activateEarlyAdopter(userId: string, endDate: Date): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        isEarlyAdopter: true,
        subscriptionType: 'premium',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: endDate
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateUserSubscription(userId: string, subscriptionType: 'free' | 'basic' | 'premium', endDate: Date): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        subscriptionType,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: endDate
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async activatePremiumListing(userId: string, endDate: Date): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({
        isPremiumListing: true,
        premiumListingEndDate: endDate
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async savePushToken(userId: string, pushToken: string): Promise<void> {
    await db.update(users)
      .set({ pushToken })
      .where(eq(users.id, userId));
  }

  async setFeaturedItem(userId: string, itemId: string | null): Promise<void> {
    await db.update(items)
      .set({ isFeatured: false })
      .where(eq(items.ownerId, userId));
    
    if (itemId) {
      await db.update(items)
        .set({ isFeatured: true })
        .where(and(eq(items.id, itemId), eq(items.ownerId, userId)));
    }
  }

  async featureItem(itemId: string): Promise<void> {
    await db.update(items)
      .set({ isFeatured: true })
      .where(eq(items.id, itemId));
  }

  async unfeatureItem(itemId: string): Promise<void> {
    await db.update(items)
      .set({ isFeatured: false })
      .where(eq(items.id, itemId));
  }

  async markFreeFeatureUsed(userId: string): Promise<void> {
    await db.update(users)
      .set({ freeFeatureUsed: true })
      .where(eq(users.id, userId));
  }

  async createVerificationToken(userId: string, type: string = 'email', customToken?: string, customExpiresAt?: Date): Promise<VerificationToken> {
    const token = customToken || crypto.randomUUID();
    const expiresAt = customExpiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await db.delete(verificationTokens).where(
      and(eq(verificationTokens.userId, userId), eq(verificationTokens.type, type))
    );
    
    const [verificationToken] = await db.insert(verificationTokens).values({
      userId,
      token,
      type,
      expiresAt,
    }).returning();
    
    return verificationToken;
  }

  async getVerificationToken(token: string): Promise<VerificationToken | undefined> {
    const [result] = await db.select().from(verificationTokens).where(eq(verificationTokens.token, token));
    return result || undefined;
  }

  async deleteVerificationToken(token: string): Promise<void> {
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
  }

  async verifyUserEmail(userId: string): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getAllUsers(filters?: { search?: string; isActive?: boolean; subscriptionType?: string }): Promise<User[]> {
    const conditions: any[] = [];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive));
    }
    if (filters?.subscriptionType) {
      conditions.push(eq(users.subscriptionType, filters.subscriptionType as any));
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        sql`(${users.name} ILIKE ${searchTerm} OR ${users.email} ILIKE ${searchTerm})`
      );
    }
    
    if (conditions.length > 0) {
      return await db.select().from(users).where(and(...conditions)).orderBy(desc(users.createdAt));
    }
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserAdmin(id: string, data: { isActive?: boolean; isAdmin?: boolean; subscriptionType?: 'free' | 'basic' | 'premium'; subscriptionDays?: number }): Promise<User | undefined> {
    const updateData: any = {};
    
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.isAdmin !== undefined) {
      updateData.isAdmin = data.isAdmin;
    }
    if (data.subscriptionType !== undefined) {
      updateData.subscriptionType = data.subscriptionType;
      updateData.subscriptionStatus = data.subscriptionType === 'free' ? 'expired' : 'active';
      
      if (data.subscriptionType !== 'free' && data.subscriptionDays) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + data.subscriptionDays);
        updateData.subscriptionStartDate = startDate;
        updateData.subscriptionEndDate = endDate;
      } else if (data.subscriptionType === 'free') {
        updateData.subscriptionStartDate = null;
        updateData.subscriptionEndDate = null;
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return await this.getUser(id);
    }
    
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async deleteUserWithData(id: string): Promise<{ deletedItems: number; deletedBookings: number; deletedMessages: number; deletedReviews: number }> {
    const userItems = await db.select({ id: items.id }).from(items).where(eq(items.ownerId, id));
    const itemIds = userItems.map(i => i.id);
    
    let deletedBookings = 0;
    if (itemIds.length > 0) {
      const bookingResult = await db.delete(bookings).where(
        or(
          eq(bookings.renterId, id),
          inArray(bookings.itemId, itemIds)
        )
      );
      deletedBookings = bookingResult.rowCount || 0;
    } else {
      const bookingResult = await db.delete(bookings).where(eq(bookings.renterId, id));
      deletedBookings = bookingResult.rowCount || 0;
    }
    
    const messageResult = await db.delete(messages).where(eq(messages.senderId, id));
    const deletedMessages = messageResult.rowCount || 0;
    
    await db.delete(conversations).where(
      or(
        eq(conversations.user1Id, id),
        eq(conversations.user2Id, id)
      )
    );
    
    const reviewResult = await db.delete(reviews).where(
      or(
        eq(reviews.reviewerId, id),
        eq(reviews.revieweeId, id)
      )
    );
    const deletedReviews = reviewResult.rowCount || 0;
    
    let deletedItems = 0;
    if (itemIds.length > 0) {
      const itemResult = await db.delete(items).where(eq(items.ownerId, id));
      deletedItems = itemResult.rowCount || 0;
    }
    
    await db.delete(verificationTokens).where(eq(verificationTokens.userId, id));
    
    await db.delete(users).where(eq(users.id, id));
    
    return { deletedItems, deletedBookings, deletedMessages, deletedReviews };
  }

  async getUserStats(): Promise<{ totalUsers: number; activeUsers: number; premiumUsers: number; earlyAdopters: number }> {
    const now = new Date();
    const [total] = await db.select({ count: count() }).from(users);
    const [active] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
    const [premium] = await db.select({ count: count() }).from(users).where(
      and(
        eq(users.subscriptionType, 'premium'),
        gt(users.subscriptionEndDate, now)
      )
    );
    const [earlyAdopters] = await db.select({ count: count() }).from(users).where(eq(users.isEarlyAdopter, true));
    
    return {
      totalUsers: total?.count || 0,
      activeUsers: active?.count || 0,
      premiumUsers: premium?.count || 0,
      earlyAdopters: earlyAdopters?.count || 0
    };
  }

  async subscribeEmail(email: string, source: string = 'landing_page'): Promise<{ subscriber: EmailSubscriber; isNew: boolean }> {
    const existing = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email));
    
    if (existing.length > 0) {
      if (!existing[0].isActive) {
        const [updated] = await db.update(emailSubscribers)
          .set({ isActive: true })
          .where(eq(emailSubscribers.email, email))
          .returning();
        return { subscriber: updated, isNew: false };
      }
      return { subscriber: existing[0], isNew: false };
    }
    
    const [subscriber] = await db.insert(emailSubscribers)
      .values({ email, source })
      .returning();
    
    return { subscriber, isNew: true };
  }

  async getEmailSubscribers(): Promise<EmailSubscriber[]> {
    return db.select().from(emailSubscribers).where(eq(emailSubscribers.isActive, true)).orderBy(desc(emailSubscribers.createdAt));
  }
}

export const storage = new DatabaseStorage();
