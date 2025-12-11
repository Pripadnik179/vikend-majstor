import { 
  users, items, bookings, conversations, messages, reviews,
  type User, type InsertUser,
  type Item, type InsertItem,
  type Booking, type InsertBooking,
  type Conversation,
  type Message, type InsertMessage,
  type Review, type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  getItems(filters?: { category?: string; city?: string; search?: string }): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  getItemsByOwner(ownerId: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, data: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<void>;
  
  getBookings(userId: string, type: 'renter' | 'owner'): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
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
  createReview(review: InsertReview): Promise<Review>;
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

  async getItems(filters?: { category?: string; city?: string; search?: string }): Promise<Item[]> {
    let query = db.select().from(items).where(eq(items.isAvailable, true));
    
    const conditions = [eq(items.isAvailable, true)];
    
    if (filters?.category) {
      conditions.push(eq(items.category, filters.category));
    }
    if (filters?.city) {
      conditions.push(eq(items.city, filters.city));
    }
    
    const result = await db.select().from(items).where(and(...conditions)).orderBy(desc(items.createdAt));
    return result;
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async getItemsByOwner(ownerId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.ownerId, ownerId)).orderBy(desc(items.createdAt));
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const [item] = await db.insert(items).values(insertItem).returning();
    return item;
  }

  async updateItem(id: string, data: Partial<InsertItem>): Promise<Item | undefined> {
    const [item] = await db.update(items).set({ ...data, updatedAt: new Date() }).where(eq(items.id, id)).returning();
    return item || undefined;
  }

  async deleteItem(id: string): Promise<void> {
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
}

export const storage = new DatabaseStorage();
