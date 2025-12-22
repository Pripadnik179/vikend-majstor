var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  ACTIVITIES: () => ACTIVITIES,
  CATEGORIES: () => CATEGORIES,
  POWER_SOURCES: () => POWER_SOURCES,
  SUBSCRIPTION_PRICES: () => SUBSCRIPTION_PRICES,
  bookingStatusEnum: () => bookingStatusEnum,
  bookings: () => bookings,
  bookingsRelations: () => bookingsRelations,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  insertBookingSchema: () => insertBookingSchema,
  insertItemSchema: () => insertItemSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertUserSchema: () => insertUserSchema,
  items: () => items,
  itemsRelations: () => itemsRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  subscriptionStatusEnum: () => subscriptionStatusEnum,
  subscriptionTypeEnum: () => subscriptionTypeEnum,
  subscriptions: () => subscriptions,
  subscriptionsRelations: () => subscriptionsRelations,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations,
  verificationTokens: () => verificationTokens,
  verificationTokensRelations: () => verificationTokensRelations
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var userRoleEnum, bookingStatusEnum, subscriptionTypeEnum, subscriptionStatusEnum, users, verificationTokens, verificationTokensRelations, usersRelations, subscriptions, subscriptionsRelations, items, itemsRelations, bookings, bookingsRelations, conversations, conversationsRelations, messages, messagesRelations, reviews, reviewsRelations, insertUserSchema, insertItemSchema, insertBookingSchema, insertMessageSchema, insertReviewSchema, insertSubscriptionSchema, CATEGORIES, POWER_SOURCES, ACTIVITIES, SUBSCRIPTION_PRICES;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    userRoleEnum = pgEnum("user_role", ["owner", "renter"]);
    bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "active", "completed", "cancelled"]);
    subscriptionTypeEnum = pgEnum("subscription_type", ["free", "basic", "premium"]);
    subscriptionStatusEnum = pgEnum("subscription_status", ["active", "expired", "cancelled"]);
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      name: text("name").notNull(),
      phone: text("phone"),
      city: text("city"),
      district: text("district"),
      avatarUrl: text("avatar_url"),
      role: userRoleEnum("role").default("renter").notNull(),
      rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
      totalRatings: integer("total_ratings").default(0),
      emailVerified: boolean("email_verified").default(false).notNull(),
      subscriptionType: subscriptionTypeEnum("subscription_type").default("free").notNull(),
      subscriptionStatus: subscriptionStatusEnum("subscription_status").default("active").notNull(),
      subscriptionStartDate: timestamp("subscription_start_date"),
      subscriptionEndDate: timestamp("subscription_end_date"),
      isEarlyAdopter: boolean("is_early_adopter").default(false).notNull(),
      isPremiumListing: boolean("is_premium_listing").default(false).notNull(),
      premiumListingEndDate: timestamp("premium_listing_end_date"),
      freeFeatureUsed: boolean("free_feature_used").default(false).notNull(),
      stripeCustomerId: text("stripe_customer_id"),
      totalAdsCreated: integer("total_ads_created").default(0).notNull(),
      pushToken: text("push_token"),
      isAdmin: boolean("is_admin").default(false).notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    verificationTokens = pgTable("verification_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      token: text("token").notNull().unique(),
      type: text("type").notNull().default("email"),
      expiresAt: timestamp("expires_at").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
      user: one(users, {
        fields: [verificationTokens.userId],
        references: [users.id]
      })
    }));
    usersRelations = relations(users, ({ many }) => ({
      items: many(items),
      bookingsAsRenter: many(bookings, { relationName: "renterBookings" }),
      bookingsAsOwner: many(bookings, { relationName: "ownerBookings" }),
      sentMessages: many(messages, { relationName: "sentMessages" }),
      receivedMessages: many(messages, { relationName: "receivedMessages" }),
      reviews: many(reviews),
      subscriptions: many(subscriptions)
    }));
    subscriptions = pgTable("subscriptions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      type: subscriptionTypeEnum("type").notNull(),
      status: subscriptionStatusEnum("status").default("active").notNull(),
      priceRsd: integer("price_rsd").notNull(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      stripePaymentIntentId: text("stripe_payment_intent_id"),
      stripeSubscriptionId: text("stripe_subscription_id"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    subscriptionsRelations = relations(subscriptions, ({ one }) => ({
      user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id]
      })
    }));
    items = pgTable("items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ownerId: varchar("owner_id").notNull().references(() => users.id),
      title: text("title").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      subCategory: text("sub_category"),
      toolType: text("tool_type"),
      toolSubType: text("tool_sub_type"),
      brand: text("brand"),
      powerSource: text("power_source"),
      powerWatts: integer("power_watts"),
      pricePerDay: integer("price_per_day").notNull(),
      deposit: integer("deposit").notNull(),
      city: text("city").notNull(),
      district: text("district"),
      latitude: decimal("latitude", { precision: 10, scale: 7 }),
      longitude: decimal("longitude", { precision: 10, scale: 7 }),
      images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
      adType: text("ad_type").notNull().default("renting"),
      isAvailable: boolean("is_available").default(true).notNull(),
      isFeatured: boolean("is_featured").default(false).notNull(),
      rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
      totalRatings: integer("total_ratings").default(0),
      expiresAt: timestamp("expires_at"),
      activityTags: text("activity_tags").array(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    itemsRelations = relations(items, ({ one, many }) => ({
      owner: one(users, {
        fields: [items.ownerId],
        references: [users.id]
      }),
      bookings: many(bookings),
      reviews: many(reviews)
    }));
    bookings = pgTable("bookings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      itemId: varchar("item_id").notNull().references(() => items.id),
      renterId: varchar("renter_id").notNull().references(() => users.id),
      ownerId: varchar("owner_id").notNull().references(() => users.id),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      totalDays: integer("total_days").notNull(),
      totalPrice: integer("total_price").notNull(),
      deposit: integer("deposit").notNull(),
      status: bookingStatusEnum("status").default("pending").notNull(),
      paymentMethod: text("payment_method").default("cash"),
      stripePaymentId: text("stripe_payment_id"),
      pickupConfirmed: boolean("pickup_confirmed").default(false),
      returnConfirmed: boolean("return_confirmed").default(false),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    bookingsRelations = relations(bookings, ({ one }) => ({
      item: one(items, {
        fields: [bookings.itemId],
        references: [items.id]
      }),
      renter: one(users, {
        fields: [bookings.renterId],
        references: [users.id],
        relationName: "renterBookings"
      }),
      owner: one(users, {
        fields: [bookings.ownerId],
        references: [users.id],
        relationName: "ownerBookings"
      })
    }));
    conversations = pgTable("conversations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      user1Id: varchar("user1_id").notNull().references(() => users.id),
      user2Id: varchar("user2_id").notNull().references(() => users.id),
      itemId: varchar("item_id").references(() => items.id),
      lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    conversationsRelations = relations(conversations, ({ one, many }) => ({
      user1: one(users, {
        fields: [conversations.user1Id],
        references: [users.id]
      }),
      user2: one(users, {
        fields: [conversations.user2Id],
        references: [users.id]
      }),
      item: one(items, {
        fields: [conversations.itemId],
        references: [items.id]
      }),
      messages: many(messages)
    }));
    messages = pgTable("messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
      senderId: varchar("sender_id").notNull().references(() => users.id),
      receiverId: varchar("receiver_id").notNull().references(() => users.id),
      content: text("content").notNull(),
      isRead: boolean("is_read").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    messagesRelations = relations(messages, ({ one }) => ({
      conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id]
      }),
      sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
        relationName: "sentMessages"
      }),
      receiver: one(users, {
        fields: [messages.receiverId],
        references: [users.id],
        relationName: "receivedMessages"
      })
    }));
    reviews = pgTable("reviews", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      bookingId: varchar("booking_id").notNull().references(() => bookings.id),
      itemId: varchar("item_id").notNull().references(() => items.id),
      reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
      revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
      rating: integer("rating").notNull(),
      comment: text("comment"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    reviewsRelations = relations(reviews, ({ one }) => ({
      booking: one(bookings, {
        fields: [reviews.bookingId],
        references: [bookings.id]
      }),
      item: one(items, {
        fields: [reviews.itemId],
        references: [items.id]
      }),
      reviewer: one(users, {
        fields: [reviews.reviewerId],
        references: [users.id]
      }),
      reviewee: one(users, {
        fields: [reviews.revieweeId],
        references: [users.id]
      })
    }));
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      rating: true,
      totalRatings: true
    });
    insertItemSchema = createInsertSchema(items).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      rating: true,
      totalRatings: true
    });
    insertBookingSchema = createInsertSchema(bookings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      createdAt: true
    });
    insertReviewSchema = createInsertSchema(reviews).omit({
      id: true,
      createdAt: true
    });
    insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
      id: true,
      createdAt: true
    });
    CATEGORIES = {
      byProject: {
        gradjevinarstvo: {
          name: "Gra\u0111evinarstvo",
          subcategories: ["Betoniranje", "Zidanje", "Ru\u0161enje", "Armiranje", "Fasaderski radovi"]
        },
        basta: {
          name: "Ba\u0161ta",
          subcategories: ["Ko\u0161enje", "Orezivanje", "Kopanje", "Navodnjavanje", "\u010Ci\u0161\u0107enje"]
        },
        renoviranje: {
          name: "Renoviranje",
          subcategories: ["Keramika", "Podovi", "Malterisanje", "Gipsarija", "Farbanje"]
        },
        drvoprera\u0111ivanje: {
          name: "Obrada drveta",
          subcategories: ["Tesarenje", "Stolarija", "Rezanje", "Bru\u0161enje", "Glodanje"]
        },
        autoMehanika: {
          name: "Auto-mehanika",
          subcategories: ["Dijagnostika", "Vulkanizerstvo", "Lakiranje", "Poliranje", "Servisiranje"]
        },
        ciscenje: {
          name: "\u010Ci\u0161\u0107enje",
          subcategories: ["Pranje pod pritiskom", "Usisavanje", "Parno \u010Di\u0161\u0107enje", "Industrijska \u010Di\u0161\u0107enja"]
        }
      },
      byToolType: {
        elektricni: {
          name: "Elektri\u010Dni alati",
          subcategories: ["Bu\u0161ilice", "Brusilice", "Testere", "Rendei", "Glodalice"]
        },
        akumulatorski: {
          name: "Akumulatorski alati",
          subcategories: ["Bu\u0161ilice", "Odvija\u010Di", "Brusilice", "Pile", "Vi\u0161enamjenski"]
        },
        rucni: {
          name: "Ru\u010Dni alati",
          subcategories: ["\u010Ceki\u0107i", "Kle\u0161ta", "Odvija\u010Di", "Klju\u010Devi", "Testeri"]
        },
        pneumatski: {
          name: "Pneumatski alati",
          subcategories: ["Pi\u0161tolji", "Bu\u0161ilice", "Brusilice", "Kompresori", "Prskalice"]
        },
        gradevinskemasine: {
          name: "Gra\u0111evinske ma\u0161ine",
          subcategories: ["Mini bageri", "Vibroploci", "Me\u0161alice", "Agregati", "Skele"]
        },
        merniLaserski: {
          name: "Merni/laserski",
          subcategories: ["Laseri", "Niveliri", "Detektori", "Merni metri", "Multimetri"]
        }
      }
    };
    POWER_SOURCES = ["Elektri\u010Dni (struja)", "Akumulator", "Benzinski", "Dizel", "Pneumatski", "Ru\u010Dni"];
    ACTIVITIES = [
      "Renoviranje kupatila",
      "Renoviranje kuhinje",
      "Ba\u0161tenski radovi",
      "Stolarski radovi",
      "Elektri\u010Darski radovi",
      "Vodoinstalaterski radovi",
      "Farbanje i dekoracija",
      "Monta\u017Ea name\u0161taja",
      "Popravke u doma\u0107instvu",
      "Zidarski radovi",
      "Kerami\u010Darski radovi",
      "Podopolaganje"
    ];
    SUBSCRIPTION_PRICES = {
      basic: 500,
      premium: 1e3,
      earlyAdopterFreeDays: 30,
      maxEarlyAdopters: 100
    };
  }
});

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";

// server/auth.ts
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { createRemoteJWKSet, jwtVerify } from "jose";

// server/storage.ts
init_schema();

// server/db.ts
init_schema();
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, or, desc, sql as sql2, count, inArray, gt, lt, isNull } from "drizzle-orm";
import crypto from "crypto";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, data) {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async updateUserPassword(userId, hashedPassword) {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  }
  async incrementUserAdsCreated(userId) {
    await db.update(users).set({ totalAdsCreated: sql2`COALESCE(${users.totalAdsCreated}, 0) + 1` }).where(eq(users.id, userId));
  }
  async getItems(filters) {
    const now = /* @__PURE__ */ new Date();
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
        sql2`(${items.title} ILIKE ${searchTerm} OR ${items.description} ILIKE ${searchTerm})`
      );
    }
    if (filters?.adType && filters.adType !== "all") {
      conditions.push(eq(items.adType, filters.adType));
    }
    if (filters?.minPrice !== void 0) {
      conditions.push(sql2`${items.pricePerDay} >= ${filters.minPrice}`);
    }
    if (filters?.maxPrice !== void 0) {
      conditions.push(sql2`${items.pricePerDay} <= ${filters.maxPrice}`);
    }
    if (filters?.createdAfter) {
      conditions.push(gt(items.createdAt, filters.createdAfter));
    }
    if (filters?.hasImages) {
      conditions.push(sql2`array_length(${items.images}, 1) > 0`);
    }
    if (filters?.activityTag) {
      conditions.push(sql2`${filters.activityTag} = ANY(${items.activityTags})`);
    }
    const result = await db.select().from(items).where(and(...conditions)).orderBy(desc(items.isFeatured), desc(items.createdAt));
    return result;
  }
  async getItem(id) {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || void 0;
  }
  async getItemsByOwner(ownerId) {
    return await db.select().from(items).where(eq(items.ownerId, ownerId)).orderBy(desc(items.createdAt));
  }
  async getPremiumItems() {
    const now = /* @__PURE__ */ new Date();
    const premiumUserIds = await db.select({ id: users.id }).from(users).where(
      and(
        eq(users.subscriptionType, "premium"),
        sql2`${users.subscriptionEndDate} > ${now}`
      )
    );
    if (premiumUserIds.length === 0) {
      return [];
    }
    const premiumOwnerIds = premiumUserIds.map((u) => u.id);
    return await db.select().from(items).where(
      and(
        eq(items.isAvailable, true),
        inArray(items.ownerId, premiumOwnerIds),
        or(isNull(items.expiresAt), gt(items.expiresAt, now))
      )
    ).orderBy(desc(items.createdAt)).limit(10);
  }
  async createItem(insertItem) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
    const [item] = await db.insert(items).values({ ...insertItem, expiresAt }).returning();
    return item;
  }
  async deleteExpiredItems() {
    const now = /* @__PURE__ */ new Date();
    const expiredItems = await db.select({ id: items.id }).from(items).where(
      and(
        sql2`${items.expiresAt} IS NOT NULL`,
        lt(items.expiresAt, now)
      )
    );
    if (expiredItems.length === 0) return 0;
    const expiredIds = expiredItems.map((i) => i.id);
    await db.delete(items).where(inArray(items.id, expiredIds));
    return expiredIds.length;
  }
  async updateItem(id, data) {
    const [item] = await db.update(items).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(items.id, id)).returning();
    return item || void 0;
  }
  async deleteItem(id) {
    await db.delete(bookings).where(eq(bookings.itemId, id));
    await db.delete(items).where(eq(items.id, id));
  }
  async getBookings(userId, type) {
    const condition = type === "renter" ? eq(bookings.renterId, userId) : eq(bookings.ownerId, userId);
    return await db.select().from(bookings).where(condition).orderBy(desc(bookings.createdAt));
  }
  async getBooking(id) {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || void 0;
  }
  async createBooking(insertBooking) {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }
  async updateBooking(id, data) {
    const [booking] = await db.update(bookings).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bookings.id, id)).returning();
    return booking || void 0;
  }
  async getItemBookings(itemId) {
    return await db.select().from(bookings).where(and(
      eq(bookings.itemId, itemId),
      or(
        eq(bookings.status, "confirmed"),
        eq(bookings.status, "pending")
      )
    )).orderBy(bookings.startDate);
  }
  async getConversations(userId) {
    return await db.select().from(conversations).where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId))).orderBy(desc(conversations.lastMessageAt));
  }
  async getConversation(id) {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || void 0;
  }
  async getOrCreateConversation(user1Id, user2Id, itemId) {
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
      itemId
    }).returning();
    return conversation;
  }
  async getMessages(conversationId) {
    return await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }
  async createMessage(insertMessage) {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    await db.update(conversations).set({ lastMessageAt: /* @__PURE__ */ new Date() }).where(eq(conversations.id, insertMessage.conversationId));
    return message;
  }
  async markMessagesAsRead(conversationId, userId) {
    await db.update(messages).set({ isRead: true }).where(and(
      eq(messages.conversationId, conversationId),
      eq(messages.receiverId, userId),
      eq(messages.isRead, false)
    ));
  }
  async getReviewsForItem(itemId) {
    return await db.select().from(reviews).where(eq(reviews.itemId, itemId)).orderBy(desc(reviews.createdAt));
  }
  async getReviewsForUser(userId) {
    return await db.select().from(reviews).where(eq(reviews.revieweeId, userId)).orderBy(desc(reviews.createdAt));
  }
  async getItemReviews(itemId) {
    const itemReviews = await db.select().from(reviews).where(eq(reviews.itemId, itemId)).orderBy(desc(reviews.createdAt));
    const reviewsWithReviewers = await Promise.all(
      itemReviews.map(async (review) => {
        const [reviewer] = await db.select().from(users).where(eq(users.id, review.reviewerId));
        return { ...review, reviewer };
      })
    );
    return reviewsWithReviewers;
  }
  async createReview(insertReview) {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    const itemReviews = await this.getReviewsForItem(insertReview.itemId);
    const avgRating = itemReviews.reduce((sum, r) => sum + r.rating, 0) / itemReviews.length;
    await db.update(items).set({ rating: avgRating.toFixed(1), totalRatings: itemReviews.length }).where(eq(items.id, insertReview.itemId));
    const userReviews = await this.getReviewsForUser(insertReview.revieweeId);
    const userAvgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    await db.update(users).set({ rating: userAvgRating.toFixed(1), totalRatings: userReviews.length }).where(eq(users.id, insertReview.revieweeId));
    return review;
  }
  async getEarlyAdopterCount() {
    const result = await db.select({ count: count() }).from(users);
    return result[0]?.count || 0;
  }
  async checkAndUpdateExpiredSubscription(userId) {
    const user = await this.getUser(userId);
    if (!user) return null;
    const now = /* @__PURE__ */ new Date();
    if (user.subscriptionType !== "free" && user.subscriptionEndDate && new Date(user.subscriptionEndDate) <= now) {
      const [updatedUser] = await db.update(users).set({
        subscriptionType: "free",
        subscriptionStatus: "expired"
      }).where(eq(users.id, userId)).returning();
      return updatedUser;
    }
    return user;
  }
  async getSubscriptionStatus(userId) {
    const user = await this.checkAndUpdateExpiredSubscription(userId);
    if (!user) {
      throw new Error("Korisnik nije prona\u0111en");
    }
    const now = /* @__PURE__ */ new Date();
    let canPostItems = false;
    let remainingDays = null;
    if (user.subscriptionEndDate) {
      const endDate = new Date(user.subscriptionEndDate);
      if (endDate > now) {
        const diffTime = endDate.getTime() - now.getTime();
        remainingDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
      }
    }
    if (user.isEarlyAdopter && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now) {
      canPostItems = true;
    } else if (user.subscriptionType !== "free" && user.subscriptionStatus === "active" && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now) {
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
  async activateEarlyAdopter(userId, endDate) {
    const [updatedUser] = await db.update(users).set({
      isEarlyAdopter: true,
      subscriptionType: "premium",
      subscriptionStatus: "active",
      subscriptionStartDate: /* @__PURE__ */ new Date(),
      subscriptionEndDate: endDate
    }).where(eq(users.id, userId)).returning();
    return updatedUser;
  }
  async createSubscription(subscription) {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }
  async updateUserSubscription(userId, subscriptionType, endDate) {
    const [updatedUser] = await db.update(users).set({
      subscriptionType,
      subscriptionStatus: "active",
      subscriptionStartDate: /* @__PURE__ */ new Date(),
      subscriptionEndDate: endDate
    }).where(eq(users.id, userId)).returning();
    return updatedUser;
  }
  async activatePremiumListing(userId, endDate) {
    const [updatedUser] = await db.update(users).set({
      isPremiumListing: true,
      premiumListingEndDate: endDate
    }).where(eq(users.id, userId)).returning();
    return updatedUser;
  }
  async savePushToken(userId, pushToken) {
    await db.update(users).set({ pushToken }).where(eq(users.id, userId));
  }
  async setFeaturedItem(userId, itemId) {
    await db.update(items).set({ isFeatured: false }).where(eq(items.ownerId, userId));
    if (itemId) {
      await db.update(items).set({ isFeatured: true }).where(and(eq(items.id, itemId), eq(items.ownerId, userId)));
    }
  }
  async featureItem(itemId) {
    await db.update(items).set({ isFeatured: true }).where(eq(items.id, itemId));
  }
  async unfeatureItem(itemId) {
    await db.update(items).set({ isFeatured: false }).where(eq(items.id, itemId));
  }
  async markFreeFeatureUsed(userId) {
    await db.update(users).set({ freeFeatureUsed: true }).where(eq(users.id, userId));
  }
  async createVerificationToken(userId, type = "email") {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
    await db.delete(verificationTokens).where(
      and(eq(verificationTokens.userId, userId), eq(verificationTokens.type, type))
    );
    const [verificationToken] = await db.insert(verificationTokens).values({
      userId,
      token,
      type,
      expiresAt
    }).returning();
    return verificationToken;
  }
  async getVerificationToken(token) {
    const [result] = await db.select().from(verificationTokens).where(eq(verificationTokens.token, token));
    return result || void 0;
  }
  async deleteVerificationToken(token) {
    await db.delete(verificationTokens).where(eq(verificationTokens.token, token));
  }
  async verifyUserEmail(userId) {
    const [user] = await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId)).returning();
    return user || void 0;
  }
  async getAllUsers(filters) {
    const conditions = [];
    if (filters?.isActive !== void 0) {
      conditions.push(eq(users.isActive, filters.isActive));
    }
    if (filters?.subscriptionType) {
      conditions.push(eq(users.subscriptionType, filters.subscriptionType));
    }
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        sql2`(${users.name} ILIKE ${searchTerm} OR ${users.email} ILIKE ${searchTerm})`
      );
    }
    if (conditions.length > 0) {
      return await db.select().from(users).where(and(...conditions)).orderBy(desc(users.createdAt));
    }
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async updateUserAdmin(id, data) {
    const updateData = {};
    if (data.isActive !== void 0) {
      updateData.isActive = data.isActive;
    }
    if (data.isAdmin !== void 0) {
      updateData.isAdmin = data.isAdmin;
    }
    if (data.subscriptionType !== void 0) {
      updateData.subscriptionType = data.subscriptionType;
      updateData.subscriptionStatus = data.subscriptionType === "free" ? "expired" : "active";
      if (data.subscriptionType !== "free" && data.subscriptionDays) {
        const startDate = /* @__PURE__ */ new Date();
        const endDate = /* @__PURE__ */ new Date();
        endDate.setDate(endDate.getDate() + data.subscriptionDays);
        updateData.subscriptionStartDate = startDate;
        updateData.subscriptionEndDate = endDate;
      } else if (data.subscriptionType === "free") {
        updateData.subscriptionStartDate = null;
        updateData.subscriptionEndDate = null;
      }
    }
    if (Object.keys(updateData).length === 0) {
      return await this.getUser(id);
    }
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async getUserStats() {
    const now = /* @__PURE__ */ new Date();
    const [total] = await db.select({ count: count() }).from(users);
    const [active] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
    const [premium] = await db.select({ count: count() }).from(users).where(
      and(
        eq(users.subscriptionType, "premium"),
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
};
var storage = new DatabaseStorage();

// server/email.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: parseInt(process.env.SMTP_PORT || "465") === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
var getBaseUrl = () => {
  if (process.env.VERIFICATION_BASE_URL) {
    return process.env.VERIFICATION_BASE_URL;
  }
  if (process.env.NODE_ENV === "development" && process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}:5000`;
  }
  return "https://vikendmajstor.rs";
};
async function sendVerificationEmail(to, verificationToken, userName) {
  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/verify?token=${verificationToken}`;
  const mailOptions = {
    from: `"VikendMajstor" <${process.env.SMTP_USER}>`,
    to,
    subject: "Potvrdite svoju email adresu - VikendMajstor",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifikacija email adrese</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                    <h1 style="color: #FFCC00; margin: 0; font-size: 28px; font-weight: bold;">VikendMajstor</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1A1A1A; margin: 0 0 20px; font-size: 24px;">Dobrodo\u0161li, ${userName}!</h2>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Hvala vam \u0161to ste se registrovali na VikendMajstor platformi. Da biste aktivirali svoj nalog i po\u010Deli da koristite sve funkcije, potrebno je da potvrdite svoju email adresu.
                    </p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                      Kliknite na dugme ispod da potvrdite va\u0161u email adresu:
                    </p>
                    
                    <!-- Button -->
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 8px; background-color: #FFCC00;">
                          <a href="${verificationUrl}" style="display: inline-block; padding: 16px 40px; color: #1A1A1A; text-decoration: none; font-size: 18px; font-weight: bold;">
                            Potvrdi email adresu
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                      Ako dugme ne radi, kopirajte i nalepite slede\u0107i link u va\u0161 pretra\u017Eiva\u010D:
                    </p>
                    <p style="color: #FFCC00; font-size: 14px; word-break: break-all; margin: 10px 0 0;">
                      <a href="${verificationUrl}" style="color: #FFCC00;">${verificationUrl}</a>
                    </p>
                    
                    <p style="color: #999999; font-size: 12px; margin: 30px 0 0;">
                      Ovaj link isti\u010De za 24 sata. Ako niste vi kreirali nalog na VikendMajstor, mo\u017Eete ignorisati ovaj email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f5f5f5; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} VikendMajstor. Sva prava zadr\u017Eana.
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 5px 0 0;">
                      Ovo je automatska poruka. Molimo vas da ne odgovarate na ovaj email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Dobrodo\u0161li na VikendMajstor, ${userName}!

Hvala vam \u0161to ste se registrovali. Da biste aktivirali svoj nalog, potvrdite svoju email adresu klikom na slede\u0107i link:

${verificationUrl}

Ovaj link isti\u010De za 24 sata.

Ako niste vi kreirali nalog, mo\u017Eete ignorisati ovaj email.

Srda\u010Dan pozdrav,
VikendMajstor tim`
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Verification email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send verification email to ${to}:`, error);
    return false;
  }
}
async function sendPasswordResetEmail(to, resetToken, userName) {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: `"VikendMajstor" <${process.env.SMTP_USER}>`,
    to,
    subject: "Resetovanje lozinke - VikendMajstor",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resetovanje lozinke</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                    <h1 style="color: #FFCC00; margin: 0; font-size: 28px; font-weight: bold;">VikendMajstor</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1A1A1A; margin: 0 0 20px; font-size: 24px;">Zdravo, ${userName}!</h2>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Primili smo zahtev za resetovanje lozinke va\u0161eg VikendMajstor naloga.
                    </p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                      Kliknite na dugme ispod da kreirate novu lozinku:
                    </p>
                    
                    <!-- Button -->
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 8px; background-color: #FFCC00;">
                          <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; color: #1A1A1A; text-decoration: none; font-size: 18px; font-weight: bold;">
                            Resetuj lozinku
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                      Ako dugme ne radi, kopirajte i nalepite slede\u0107i link u va\u0161 pretra\u017Eiva\u010D:
                    </p>
                    <p style="color: #FFCC00; font-size: 14px; word-break: break-all; margin: 10px 0 0;">
                      <a href="${resetUrl}" style="color: #FFCC00;">${resetUrl}</a>
                    </p>
                    
                    <p style="color: #999999; font-size: 12px; margin: 30px 0 0;">
                      Ovaj link isti\u010De za 1 sat. Ako niste vi zatra\u017Eili resetovanje lozinke, mo\u017Eete ignorisati ovaj email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f5f5f5; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} VikendMajstor. Sva prava zadr\u017Eana.
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 5px 0 0;">
                      Ovo je automatska poruka. Molimo vas da ne odgovarate na ovaj email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Zdravo ${userName}!

Primili smo zahtev za resetovanje lozinke va\u0161eg VikendMajstor naloga.

Kliknite na slede\u0107i link da kreirate novu lozinku:

${resetUrl}

Ovaj link isti\u010De za 1 sat.

Ako niste vi zatra\u017Eili resetovanje lozinke, mo\u017Eete ignorisati ovaj email.

Srda\u010Dan pozdrav,
VikendMajstor tim`
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Password reset email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send password reset email to ${to}:`, error);
    return false;
  }
}
async function sendBookingRequestEmail(ownerEmail, ownerName, renterName, itemTitle, startDate, endDate, totalPrice) {
  const baseUrl = getBaseUrl();
  const bookingsUrl = `${baseUrl}`;
  const mailOptions = {
    from: `"VikendMajstor" <${process.env.SMTP_USER}>`,
    to: ownerEmail,
    subject: `Nova rezervacija za "${itemTitle}" - VikendMajstor`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova rezervacija</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                    <h1 style="color: #FFCC00; margin: 0; font-size: 28px; font-weight: bold;">VikendMajstor</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1A1A1A; margin: 0 0 20px; font-size: 24px;">Zdravo, ${ownerName}!</h2>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Imate novu rezervaciju za va\u0161 predmet <strong>"${itemTitle}"</strong>.
                    </p>
                    
                    <table style="width: 100%; background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #666;">Korisnik:</strong>
                          <span style="color: #1A1A1A; float: right;">${renterName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #eee;">
                          <strong style="color: #666;">Period:</strong>
                          <span style="color: #1A1A1A; float: right;">${startDate} - ${endDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #eee;">
                          <strong style="color: #666;">Ukupna cena:</strong>
                          <span style="color: #FFCC00; font-weight: bold; float: right;">${totalPrice} RSD</span>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                      Molimo vas da potvrdite ili odbijete ovu rezervaciju u aplikaciji.
                    </p>
                    
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 8px; background-color: #FFCC00;">
                          <a href="${bookingsUrl}" style="display: inline-block; padding: 16px 40px; color: #1A1A1A; text-decoration: none; font-size: 18px; font-weight: bold;">
                            Pogledaj rezervaciju
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f5f5f5; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} VikendMajstor. Sva prava zadr\u017Eana.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Zdravo ${ownerName}!

Imate novu rezervaciju za "${itemTitle}".

Korisnik: ${renterName}
Period: ${startDate} - ${endDate}
Ukupna cena: ${totalPrice} RSD

Molimo potvrdite ili odbijete rezervaciju u aplikaciji.

Srda\u010Dan pozdrav,
VikendMajstor tim`
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Booking request email sent to ${ownerEmail}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send booking request email to ${ownerEmail}:`, error);
    return false;
  }
}
async function sendBookingConfirmedEmail(renterEmail, renterName, ownerName, itemTitle, startDate, endDate, totalPrice, ownerPhone) {
  const baseUrl = getBaseUrl();
  const mailOptions = {
    from: `"VikendMajstor" <${process.env.SMTP_USER}>`,
    to: renterEmail,
    subject: `Rezervacija potvr\u0111ena: "${itemTitle}" - VikendMajstor`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rezervacija potvr\u0111ena</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background-color: #1A1A1A; padding: 30px; text-align: center;">
                    <h1 style="color: #FFCC00; margin: 0; font-size: 28px; font-weight: bold;">VikendMajstor</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="display: inline-block; width: 60px; height: 60px; background-color: #22C55E; border-radius: 50%; line-height: 60px;">
                        <span style="color: white; font-size: 30px;">&#10003;</span>
                      </div>
                    </div>
                    
                    <h2 style="color: #22C55E; margin: 0 0 20px; font-size: 24px; text-align: center;">Rezervacija potvr\u0111ena!</h2>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Zdravo ${renterName}! Va\u0161a rezervacija za <strong>"${itemTitle}"</strong> je potvr\u0111ena.
                    </p>
                    
                    <table style="width: 100%; background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #22C55E;">
                      <tr>
                        <td style="padding: 10px 0;">
                          <strong style="color: #666;">Vlasnik:</strong>
                          <span style="color: #1A1A1A; float: right;">${ownerName}</span>
                        </td>
                      </tr>
                      ${ownerPhone ? `
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #bbf7d0;">
                          <strong style="color: #666;">Telefon:</strong>
                          <span style="color: #1A1A1A; float: right;">${ownerPhone}</span>
                        </td>
                      </tr>
                      ` : ""}
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #bbf7d0;">
                          <strong style="color: #666;">Period:</strong>
                          <span style="color: #1A1A1A; float: right;">${startDate} - ${endDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 1px solid #bbf7d0;">
                          <strong style="color: #666;">Ukupna cena:</strong>
                          <span style="color: #22C55E; font-weight: bold; float: right;">${totalPrice} RSD</span>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                      Kontaktirajte vlasnika putem poruka u aplikaciji da dogovorite preuzimanje.
                    </p>
                    
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 8px; background-color: #FFCC00;">
                          <a href="${baseUrl}" style="display: inline-block; padding: 16px 40px; color: #1A1A1A; text-decoration: none; font-size: 18px; font-weight: bold;">
                            Otvori aplikaciju
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f5f5f5; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} VikendMajstor. Sva prava zadr\u017Eana.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Zdravo ${renterName}!

Va\u0161a rezervacija za "${itemTitle}" je potvr\u0111ena!

Vlasnik: ${ownerName}
${ownerPhone ? `Telefon: ${ownerPhone}
` : ""}Period: ${startDate} - ${endDate}
Ukupna cena: ${totalPrice} RSD

Kontaktirajte vlasnika putem poruka u aplikaciji da dogovorite preuzimanje.

Srda\u010Dan pozdrav,
VikendMajstor tim`
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Booking confirmed email sent to ${renterEmail}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] Failed to send booking confirmed email to ${renterEmail}:`, error);
    return false;
  }
}

// server/security.ts
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, validationResult } from "express-validator";
var loginAttempts = /* @__PURE__ */ new Map();
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  let ip = req.ip || req.socket.remoteAddress || "unknown";
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  return ip;
}
function logLoginAttempt(req, success, email) {
  const ip = getClientIp(req);
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  const status = success ? "SUCCESS" : "FAILED";
  console.log(`[AUTH] ${timestamp2} | ${status} | IP: ${ip} | Email: ${email}`);
  if (!success) {
    const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: /* @__PURE__ */ new Date(), blocked: false };
    attempts.count++;
    attempts.lastAttempt = /* @__PURE__ */ new Date();
    if (attempts.count >= 5) {
      attempts.blocked = true;
      console.log(`[SECURITY] IP ${ip} blocked after ${attempts.count} failed login attempts`);
    }
    loginAttempts.set(ip, attempts);
  } else {
    loginAttempts.delete(ip);
  }
}
function isIpBlocked(req) {
  const ip = getClientIp(req);
  const attempts = loginAttempts.get(ip);
  if (attempts?.blocked) {
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
    const blockDuration = 15 * 60 * 1e3;
    if (timeSinceLastAttempt > blockDuration) {
      loginAttempts.delete(ip);
      return false;
    }
    return true;
  }
  return false;
}
var generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 100,
  message: { error: "Previse zahteva. Pokusajte ponovo za 15 minuta." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  message: { error: "Previse pokusaja prijave. Pokusajte ponovo za 15 minuta." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  validate: { xForwardedForHeader: false }
});
var strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  max: 5,
  message: { error: "Previse zahteva. Pokusajte ponovo za sat vremena." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
});
function sanitizeInput(input) {
  if (typeof input !== "string") return input;
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}
function sanitizeObject(obj) {
  if (typeof obj === "string") {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === "object") {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}
function xssProtection(req, res, next) {
  if (req.body && typeof req.body === "object") {
    const skipFields = ["password", "email"];
    const sanitizedBody = {};
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
var loginBlockCheck = (req, res, next) => {
  if (isIpBlocked(req)) {
    return res.status(429).json({
      error: "Previse neuspesnih pokusaja. Pokusajte ponovo za 15 minuta."
    });
  }
  next();
};
function setupSecurity(app2) {
  app2.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  }));
  app2.use("/api", generalLimiter);
  app2.use("/api/auth/login", loginBlockCheck, authLimiter);
  app2.use("/api/auth/register", authLimiter);
  app2.use("/api/auth/google", authLimiter);
  app2.use("/api/auth/apple", authLimiter);
  app2.use("/api", xssProtection);
  console.log("[SECURITY] Security middleware initialized: helmet, rate limiting, XSS protection");
}
var validateRegistration = [
  body("email").isEmail().normalizeEmail().withMessage("Unesite ispravan email"),
  body("password").isLength({ min: 6 }).withMessage("Lozinka mora imati najmanje 6 karaktera"),
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Ime mora imati izmedju 2 i 100 karaktera")
];
var validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Unesite ispravan email"),
  body("password").notEmpty().withMessage("Lozinka je obavezna")
];
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
}

// server/auth.ts
var APPLE_JWKS_URL = new URL("https://appleid.apple.com/auth/keys");
var appleJWKS = createRemoteJWKSet(APPLE_JWKS_URL);
function getVerificationPage(success, message) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verifikacija - VikendMajstor</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1A1A1A 0%, #333 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 40px;
        }
        .icon.success { background: #FFCC00; }
        .icon.error { background: #ff4444; }
        h1 { color: #1A1A1A; margin-bottom: 16px; font-size: 24px; }
        p { color: #666; font-size: 16px; line-height: 1.5; }
        .logo { font-size: 28px; font-weight: 700; color: #FFCC00; margin-bottom: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">VikendMajstor</div>
        <div class="icon ${success ? "success" : "error"}">
          ${success ? "\u2713" : "\u2715"}
        </div>
        <h1>${success ? "Uspe\u0161no!" : "Gre\u0161ka"}</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedPasswordBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}
function generateAuthToken(userId, secret) {
  return Buffer.from(`${userId}:${secret}`).toString("base64");
}
function setupAuth(app2) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
  }
  app2.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        sameSite: "lax"
      }
    })
  );
  app2.use(async (req, res, next) => {
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        req.user = user;
      }
    }
    if (!req.user) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
          const decoded = Buffer.from(token, "base64").toString("utf-8");
          const [userId, secret] = decoded.split(":");
          if (secret === sessionSecret && userId) {
            const user = await storage.getUser(userId);
            if (user) {
              req.user = user;
              req.session.userId = userId;
            }
          }
        } catch (e) {
        }
      }
    }
    next();
  });
  app2.post("/api/auth/register", validateRegistration, handleValidationErrors, async (req, res) => {
    try {
      const { email, password, name, role } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Korisnik sa ovim emailom ve\u0107 postoji" });
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
        subscriptionStatus: isEarlyAdopter ? "active" : void 0,
        subscriptionEndDate: isEarlyAdopter ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3) : null
      });
      req.session.userId = user.id;
      const verificationToken = await storage.createVerificationToken(user.id, "email");
      sendVerificationEmail(user.email, verificationToken.token, user.name).catch((err) => {
        console.error("Failed to send verification email:", err);
      });
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.status(201).json({ ...userWithoutPassword, authToken });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Gre\u0161ka pri registraciji" });
    }
  });
  app2.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).send(getVerificationPage(false, "Neva\u017Ee\u0107i link za verifikaciju"));
      }
      const verificationToken = await storage.getVerificationToken(token);
      if (!verificationToken) {
        return res.status(400).send(getVerificationPage(false, "Link za verifikaciju je istekao ili je ve\u0107 iskori\u0161\u0107en"));
      }
      if (/* @__PURE__ */ new Date() > verificationToken.expiresAt) {
        await storage.deleteVerificationToken(token);
        return res.status(400).send(getVerificationPage(false, "Link za verifikaciju je istekao"));
      }
      await storage.verifyUserEmail(verificationToken.userId);
      await storage.deleteVerificationToken(token);
      res.send(getVerificationPage(true, "Va\u0161 email je uspe\u0161no verifikovan! Mo\u017Eete zatvoriti ovu stranicu."));
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).send(getVerificationPage(false, "Do\u0161lo je do gre\u0161ke. Poku\u0161ajte ponovo."));
    }
  });
  app2.post("/api/auth/resend-verification", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Morate biti prijavljeni" });
      }
      if (req.user.emailVerified) {
        return res.status(400).json({ error: "Email je ve\u0107 verifikovan" });
      }
      const verificationToken = await storage.createVerificationToken(req.user.id, "email");
      const sent = await sendVerificationEmail(req.user.email, verificationToken.token, req.user.name);
      if (sent) {
        res.json({ success: true, message: "Verifikacioni email je poslat" });
      } else {
        res.status(500).json({ error: "Gre\u0161ka pri slanju emaila" });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ error: "Gre\u0161ka pri slanju emaila" });
    }
  });
  app2.post("/api/auth/login", validateLogin, handleValidationErrors, async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        logLoginAttempt(req, false, email);
        return res.status(401).json({ error: "Pogre\u0161an email ili lozinka" });
      }
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        logLoginAttempt(req, false, email);
        return res.status(401).json({ error: "Pogre\u0161an email ili lozinka" });
      }
      if (!user.emailVerified) {
        return res.status(403).json({
          error: "Morate potvrditi email adresu pre prijave",
          code: "EMAIL_NOT_VERIFIED",
          email: user.email
        });
      }
      if (!user.isActive) {
        return res.status(403).json({ error: "Va\u0161 nalog je deaktiviran" });
      }
      logLoginAttempt(req, true, email);
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.json({ ...userWithoutPassword, authToken });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Gre\u0161ka pri prijavi" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Gre\u0161ka pri odjavi" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email je obavezan" });
      }
      const user = await storage.getUserByEmail(email);
      if (user) {
        const resetToken = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
        await storage.createVerificationToken(user.id, resetToken, "password_reset", expiresAt);
        await sendPasswordResetEmail(email, resetToken, user.name);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.json({ success: true });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: "Token i nova lozinka su obavezni" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Lozinka mora imati najmanje 6 karaktera" });
      }
      const tokenRecord = await storage.getVerificationToken(token);
      if (!tokenRecord || tokenRecord.type !== "password_reset") {
        return res.status(400).json({ error: "Nevazeci ili istekli link za resetovanje" });
      }
      if (/* @__PURE__ */ new Date() > tokenRecord.expiresAt) {
        await storage.deleteVerificationToken(token);
        return res.status(400).json({ error: "Link za resetovanje je istekao" });
      }
      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(tokenRecord.userId, hashedPassword);
      await storage.deleteVerificationToken(token);
      res.json({ success: true });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Greska pri resetovanju lozinke" });
    }
  });
  app2.get("/reset-password", async (req, res) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.send(getVerificationPage(false, "Nevazeci link za resetovanje lozinke."));
    }
    const tokenRecord = await storage.getVerificationToken(token);
    if (!tokenRecord || tokenRecord.type !== "password_reset") {
      return res.send(getVerificationPage(false, "Nevazeci link za resetovanje lozinke."));
    }
    if (/* @__PURE__ */ new Date() > tokenRecord.expiresAt) {
      await storage.deleteVerificationToken(token);
      return res.send(getVerificationPage(false, "Link za resetovanje je istekao. Zatrazite novi link."));
    }
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resetovanje lozinke - VikendMajstor</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1A1A1A 0%, #333 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          }
          .logo { font-size: 28px; font-weight: 700; color: #FFCC00; margin-bottom: 24px; text-align: center; }
          h1 { color: #1A1A1A; margin-bottom: 16px; font-size: 24px; text-align: center; }
          p { color: #666; font-size: 14px; margin-bottom: 24px; text-align: center; }
          .form-group { margin-bottom: 16px; position: relative; }
          label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; }
          input[type="password"], input[type="text"] {
            width: 100%;
            padding: 12px 40px 12px 16px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
          }
          .toggle-password {
            position: absolute;
            right: 12px;
            top: 38px;
            background: none;
            border: none;
            cursor: pointer;
            color: #666;
            font-size: 18px;
          }
          button[type="submit"] {
            width: 100%;
            padding: 14px;
            background: #FFCC00;
            color: #1A1A1A;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          }
          button[type="submit"]:hover { background: #E6B800; }
          button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }
          .error { color: #ff4444; font-size: 14px; margin-top: 8px; display: none; }
          .success { color: #22C55E; font-size: 14px; margin-top: 8px; display: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">VikendMajstor</div>
          <h1>Nova lozinka</h1>
          <p>Unesite novu lozinku za vas nalog</p>
          <form id="resetForm">
            <div class="form-group">
              <label for="password">Nova lozinka</label>
              <input type="password" id="password" name="password" required minlength="6" placeholder="Najmanje 6 karaktera">
              <button type="button" class="toggle-password" onclick="togglePassword('password', this)">\u{1F441}</button>
            </div>
            <div class="form-group">
              <label for="confirmPassword">Potvrdite lozinku</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Ponovite lozinku">
              <button type="button" class="toggle-password" onclick="togglePassword('confirmPassword', this)">\u{1F441}</button>
            </div>
            <div class="error" id="error"></div>
            <div class="success" id="success"></div>
            <button type="submit" id="submitBtn">Resetuj lozinku</button>
          </form>
        </div>
        <script>
          function togglePassword(fieldId, btn) {
            const field = document.getElementById(fieldId);
            if (field.type === 'password') {
              field.type = 'text';
              btn.textContent = '\u{1F648}';
            } else {
              field.type = 'password';
              btn.textContent = '\u{1F441}';
            }
          }
          
          document.getElementById('resetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const errorEl = document.getElementById('error');
            const successEl = document.getElementById('success');
            const submitBtn = document.getElementById('submitBtn');
            
            errorEl.style.display = 'none';
            successEl.style.display = 'none';
            
            if (password !== confirmPassword) {
              errorEl.textContent = 'Lozinke se ne podudaraju';
              errorEl.style.display = 'block';
              return;
            }
            
            if (password.length < 6) {
              errorEl.textContent = 'Lozinka mora imati najmanje 6 karaktera';
              errorEl.style.display = 'block';
              return;
            }
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Resetovanje...';
            
            try {
              const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '${token}', password })
              });
              
              const data = await res.json();
              
              if (res.ok) {
                successEl.textContent = 'Lozinka je uspesno resetovana! Mozete se prijaviti sa novom lozinkom.';
                successEl.style.display = 'block';
                document.getElementById('resetForm').style.display = 'none';
              } else {
                errorEl.textContent = data.error || 'Greska pri resetovanju lozinke';
                errorEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Resetuj lozinku';
              }
            } catch (err) {
              errorEl.textContent = 'Greska pri povezivanju sa serverom';
              errorEl.style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Resetuj lozinku';
            }
          });
        </script>
      </body>
      </html>
    `);
  });
  app2.get("/api/auth/me", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Niste prijavljeni" });
    }
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  app2.post("/api/auth/google", async (req, res) => {
    try {
      const { accessToken } = req.body;
      if (!accessToken) {
        return res.status(400).json({ error: "Access token je obavezan" });
      }
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        return res.status(401).json({ error: "Neispravan Google token" });
      }
      const googleUser = await response.json();
      const { email, name, picture } = googleUser;
      if (!email) {
        return res.status(400).json({ error: "Nije mogu\u0107e dobiti email sa Google naloga" });
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
          name: name || email.split("@")[0],
          role: "renter",
          avatarUrl: picture || void 0,
          isEarlyAdopter,
          subscriptionType: isEarlyAdopter ? "premium" : "free",
          subscriptionStatus: isEarlyAdopter ? "active" : void 0,
          subscriptionEndDate: isEarlyAdopter ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3) : null
        });
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.json({ ...userWithoutPassword, authToken });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ error: "Gre\u0161ka pri Google prijavi" });
    }
  });
  app2.post("/api/auth/apple", async (req, res) => {
    try {
      const { identityToken, fullName } = req.body;
      if (!identityToken) {
        return res.status(400).json({ error: "Identity token je obavezan" });
      }
      let payload;
      try {
        const { payload: verifiedPayload } = await jwtVerify(identityToken, appleJWKS, {
          issuer: "https://appleid.apple.com"
        });
        payload = verifiedPayload;
      } catch (jwtError) {
        console.error("Apple JWT verification failed:", jwtError);
        return res.status(401).json({ error: "Neispravan ili istekao Apple token" });
      }
      const appleUserId = payload.sub;
      const email = payload.email;
      if (!appleUserId) {
        return res.status(400).json({ error: "Nije mogu\u0107e dobiti Apple korisni\u010Dki ID" });
      }
      const userEmail = email || `apple_${appleUserId}@privaterelay.appleid.com`;
      let user = await storage.getUserByEmail(userEmail);
      if (!user) {
        const earlyAdopterCount = await storage.getEarlyAdopterCount();
        const isEarlyAdopter = earlyAdopterCount < 100;
        const randomPassword = randomBytes(32).toString("hex");
        const hashedPassword = await hashPassword(randomPassword);
        const userName = fullName && fullName.trim() ? fullName.trim() : "Apple User";
        user = await storage.createUser({
          email: userEmail,
          password: hashedPassword,
          name: userName,
          role: "renter",
          isEarlyAdopter,
          subscriptionType: isEarlyAdopter ? "premium" : "free",
          subscriptionStatus: isEarlyAdopter ? "active" : void 0,
          subscriptionEndDate: isEarlyAdopter ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3) : null
        });
      } else if (fullName && fullName.trim() && user.name === "Apple User") {
        await storage.updateUser(user.id, { name: fullName.trim() });
        user = { ...user, name: fullName.trim() };
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.json({ ...userWithoutPassword, authToken });
    } catch (error) {
      console.error("Apple auth error:", error);
      res.status(500).json({ error: "Gre\u0161ka pri Apple prijavi" });
    }
  });
}
function isAuthenticated(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Morate biti prijavljeni" });
  }
  next();
}
function isVerifiedUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Morate biti prijavljeni" });
  }
  if (!req.user.emailVerified) {
    return res.status(403).json({
      error: "Molimo vas da prvo potvrdite svoju email adresu kako biste nastavili.",
      code: "EMAIL_NOT_VERIFIED"
    });
  }
  next();
}

// server/objectStorage.ts
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

// server/objectAcl.ts
var ACL_POLICY_METADATA_KEY = "custom:aclPolicy";
function isPermissionAllowed(requested, granted) {
  if (requested === "read" /* READ */) {
    return ["read" /* READ */, "write" /* WRITE */].includes(granted);
  }
  return granted === "write" /* WRITE */;
}
function createObjectAccessGroup(group) {
  switch (group.type) {
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}
async function setObjectAclPolicy(objectFile, aclPolicy) {
  const [exists] = await objectFile.exists();
  if (!exists) {
    throw new Error(`Object not found: ${objectFile.name}`);
  }
  await objectFile.setMetadata({
    metadata: {
      [ACL_POLICY_METADATA_KEY]: JSON.stringify(aclPolicy)
    }
  });
}
async function getObjectAclPolicy(objectFile) {
  const [metadata] = await objectFile.getMetadata();
  const aclPolicy = metadata?.metadata?.[ACL_POLICY_METADATA_KEY];
  if (!aclPolicy) {
    return null;
  }
  return JSON.parse(aclPolicy);
}
async function canAccessObject({
  userId,
  objectFile,
  requestedPermission
}) {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) {
    return false;
  }
  if (aclPolicy.visibility === "public" && requestedPermission === "read" /* READ */) {
    return true;
  }
  if (!userId) {
    return false;
  }
  if (aclPolicy.owner === userId) {
    return true;
  }
  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (await accessGroup.hasMember(userId) && isPermissionAllowed(requestedPermission, rule.permission)) {
      return true;
    }
  }
  return false;
}

// server/objectStorage.ts
var REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
var objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token"
      }
    },
    universe_domain: "googleapis.com"
  },
  projectId: ""
});
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectStorageService = class {
  constructor() {
  }
  getPublicObjectSearchPaths() {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr.split(",").map((path3) => path3.trim()).filter((path3) => path3.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths)."
      );
    }
    return paths;
  }
  getPrivateObjectDir() {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }
  async searchPublicObject(filePath) {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }
  async downloadObject(file, res, cacheTtlSec = 3600) {
    try {
      const [metadata] = await file.getMetadata();
      const aclPolicy = await getObjectAclPolicy(file);
      const isPublic = aclPolicy?.visibility === "public";
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": metadata.size,
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`
      });
      const stream = file.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }
  async getObjectEntityUploadURL() {
    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    return signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900
    });
  }
  async getObjectEntityFile(objectPath) {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }
    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }
  normalizeObjectEntityPath(rawPath) {
    if (!rawPath.startsWith("https://storage.googleapis.com/")) {
      return rawPath;
    }
    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;
    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) {
      objectEntityDir = `${objectEntityDir}/`;
    }
    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }
    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }
  async trySetObjectEntityAclPolicy(rawPath, aclPolicy) {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }
    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }
  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission
  }) {
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? "read" /* READ */
    });
  }
};
function parseObjectPath(path3) {
  if (!path3.startsWith("/")) {
    path3 = `/${path3}`;
  }
  const pathParts = path3.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");
  return {
    bucketName,
    objectName
  };
}
async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec
}) {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1e3).toISOString()
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request)
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, make sure you're running on Replit`
    );
  }
  const { signed_url: signedURL } = await response.json();
  return signedURL;
}

// server/notifications.ts
async function sendPushNotification(userId, title, body2, data) {
  try {
    const user = await storage.getUser(userId);
    if (!user?.pushToken) {
      console.log(`No push token for user ${userId}, skipping notification`);
      return { success: false, reason: "no_push_token" };
    }
    const message = {
      to: user.pushToken,
      sound: "default",
      title,
      body: body2,
      data
    };
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });
    const result = await response.json();
    console.log(`Push notification sent to user ${userId}:`, result);
    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send push notification to user ${userId}:`, error);
    return { success: false, error };
  }
}
async function sendBookingRequestNotification(ownerId, renterName, itemTitle, bookingId) {
  return sendPushNotification(
    ownerId,
    "Nova rezervacija!",
    `${renterName} \u017Eeli da rezervi\u0161e "${itemTitle}"`,
    { type: "booking_request", bookingId }
  );
}
async function sendBookingRequestConfirmationToRenter(renterId, itemTitle, bookingId) {
  return sendPushNotification(
    renterId,
    "Zahtev poslat",
    `Va\u0161 zahtev za "${itemTitle}" je uspe\u0161no poslat vlasniku`,
    { type: "booking_request_sent", bookingId }
  );
}
async function sendBookingConfirmedNotification(renterId, itemTitle, ownerName, bookingId) {
  return sendPushNotification(
    renterId,
    "Rezervacija potvr\u0111ena!",
    `${ownerName} je potvrdio va\u0161u rezervaciju za "${itemTitle}"`,
    { type: "booking_confirmed", bookingId }
  );
}
async function sendBookingCancelledNotification(userId, itemTitle, bookingId) {
  return sendPushNotification(
    userId,
    "Rezervacija otkazana",
    `Rezervacija za "${itemTitle}" je otkazana`,
    { type: "booking_cancelled", bookingId }
  );
}

// server/seed-demo.ts
init_schema();
import { eq as eq2, like } from "drizzle-orm";
import { scrypt as scrypt2, randomBytes as randomBytes2 } from "crypto";
import { promisify as promisify2 } from "util";
import * as fs from "fs";

// shared/cityCoordinates.ts
var CITY_COORDINATES = {
  // Major cities
  "Beograd": { latitude: 44.8176, longitude: 20.4633 },
  "Novi Sad": { latitude: 45.2671, longitude: 19.8335 },
  "Ni\u0161": { latitude: 43.3209, longitude: 21.8958 },
  "Kragujevac": { latitude: 44.0128, longitude: 20.9114 },
  "Subotica": { latitude: 46.1003, longitude: 19.6658 },
  // Other major cities
  "Zrenjanin": { latitude: 45.3816, longitude: 20.3862 },
  "Pan\u010Devo": { latitude: 44.8708, longitude: 20.6403 },
  "\u010Ca\u010Dak": { latitude: 43.8914, longitude: 20.3497 },
  "Kraljevo": { latitude: 43.7257, longitude: 20.6895 },
  "Novi Pazar": { latitude: 43.1367, longitude: 20.5122 },
  "Leskovac": { latitude: 42.9981, longitude: 21.9461 },
  "\u0160abac": { latitude: 44.7536, longitude: 19.6906 },
  "U\u017Eice": { latitude: 43.8589, longitude: 19.8425 },
  "Smederevo": { latitude: 44.6633, longitude: 20.9272 },
  "Sombor": { latitude: 45.7742, longitude: 19.1122 },
  "Valjevo": { latitude: 44.2706, longitude: 19.8914 },
  "Vranje": { latitude: 42.5514, longitude: 21.9 },
  "Kru\u0161evac": { latitude: 43.5803, longitude: 21.3269 },
  "Po\u017Earevac": { latitude: 44.6214, longitude: 21.1894 },
  "Pirot": { latitude: 43.1531, longitude: 22.5856 },
  "Bor": { latitude: 44.0739, longitude: 22.0956 },
  "Zaje\u010Dar": { latitude: 43.9042, longitude: 22.285 },
  "Kikinda": { latitude: 45.8289, longitude: 20.4656 },
  "Vr\u0161ac": { latitude: 45.1167, longitude: 21.3 },
  "Sremska Mitrovica": { latitude: 44.9764, longitude: 19.6125 },
  "Jagodina": { latitude: 43.9775, longitude: 21.2611 },
  "Loznica": { latitude: 44.5333, longitude: 19.2258 },
  "Prokuplje": { latitude: 43.2339, longitude: 21.5875 },
  "Para\u0107in": { latitude: 43.86, longitude: 21.4078 },
  "In\u0111ija": { latitude: 45.0481, longitude: 20.08 },
  "Stara Pazova": { latitude: 44.9853, longitude: 20.1639 },
  "Ruma": { latitude: 45.0081, longitude: 19.8225 },
  "Aran\u0111elovac": { latitude: 44.3072, longitude: 20.56 },
  "\u0106uprija": { latitude: 43.9275, longitude: 21.3742 }
};
function getCityCoordinates(cityName) {
  if (CITY_COORDINATES[cityName]) {
    return CITY_COORDINATES[cityName];
  }
  const normalizedCity = cityName.trim();
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (city.toLowerCase() === normalizedCity.toLowerCase()) {
      return coords;
    }
  }
  return null;
}

// server/seed-demo.ts
var scryptAsync2 = promisify2(scrypt2);
async function hashPassword2(password) {
  const salt = randomBytes2(16).toString("hex");
  const derivedKey = await scryptAsync2(password, salt, 64);
  return `${derivedKey.toString("hex")}.${salt}`;
}
var bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
async function uploadImage(localPath, remoteName) {
  if (!bucketId) {
    console.log("No bucket ID, using placeholder URL");
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(remoteName)}`;
  }
  const destination = `public/items/${remoteName}`;
  try {
    if (!fs.existsSync(localPath)) {
      console.log(`File not found: ${localPath}, using placeholder`);
      return `https://via.placeholder.com/400x300?text=${encodeURIComponent(remoteName)}`;
    }
    const bucket = objectStorageClient.bucket(bucketId);
    const file = bucket.file(destination);
    const fileBuffer = fs.readFileSync(localPath);
    const contentType = remoteName.endsWith(".png") ? "image/png" : "image/jpeg";
    await file.save(fileBuffer, {
      contentType,
      resumable: false
    });
    await setObjectAclPolicy(file, {
      owner: "system",
      visibility: "public"
    });
    return `/public-objects/items/${remoteName}`;
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error);
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(remoteName)}`;
  }
}
var DEMO_EMAIL_SUFFIX = "@demo.vikendmajstor.rs";
async function seedDemoData() {
  console.log("[SEED] Starting demo data seed...");
  const imageFiles = [
    { local: "attached_assets/stock_images/power_drill_construc_aab87253.jpg", remote: "demo-drill-1.jpg" },
    { local: "attached_assets/stock_images/power_drill_construc_88d24ac2.jpg", remote: "demo-drill-2.jpg" },
    { local: "attached_assets/stock_images/angle_grinder_power__67fea1d6.jpg", remote: "demo-grinder-1.jpg" },
    { local: "attached_assets/stock_images/angle_grinder_power__fa5044c9.jpg", remote: "demo-grinder-2.jpg" },
    { local: "attached_assets/stock_images/circular_saw_wood_cu_782311cf.jpg", remote: "demo-saw-1.jpg" },
    { local: "attached_assets/stock_images/circular_saw_wood_cu_f8a54218.jpg", remote: "demo-saw-2.jpg" },
    { local: "attached_assets/stock_images/concrete_mixer_const_eb48124d.jpg", remote: "demo-mixer-1.jpg" },
    { local: "attached_assets/stock_images/concrete_mixer_const_70c4cfbb.jpg", remote: "demo-mixer-2.jpg" },
    { local: "attached_assets/stock_images/pressure_washer_clea_e6a0f759.jpg", remote: "demo-washer-1.jpg" },
    { local: "attached_assets/stock_images/pressure_washer_clea_acfb4285.jpg", remote: "demo-washer-2.jpg" },
    { local: "attached_assets/stock_images/lawn_mower_garden_fb0c4911.jpg", remote: "demo-mower-1.jpg" },
    { local: "attached_assets/stock_images/lawn_mower_garden_483255de.jpg", remote: "demo-mower-2.jpg" },
    { local: "attached_assets/stock_images/electric_sander_wood_5ea4579b.jpg", remote: "demo-sander-1.jpg" },
    { local: "attached_assets/stock_images/electric_sander_wood_20677c0e.jpg", remote: "demo-sander-2.jpg" },
    { local: "attached_assets/stock_images/hammer_drill_profess_982f972f.jpg", remote: "demo-hammer-1.jpg" },
    { local: "attached_assets/stock_images/hammer_drill_profess_5caf5550.jpg", remote: "demo-hammer-2.jpg" },
    { local: "attached_assets/stock_images/chainsaw_cutting_woo_69813d2f.jpg", remote: "demo-chainsaw-1.jpg" },
    { local: "attached_assets/stock_images/chainsaw_cutting_woo_2663231f.jpg", remote: "demo-chainsaw-2.jpg" },
    { local: "attached_assets/stock_images/scaffolding_construc_b8f2d01c.jpg", remote: "demo-scaffold-1.jpg" },
    { local: "attached_assets/stock_images/scaffolding_construc_b7700a42.jpg", remote: "demo-scaffold-2.jpg" }
  ];
  console.log("[SEED] Uploading images...");
  const imageUrls = [];
  for (const img of imageFiles) {
    const url = await uploadImage(img.local, img.remote);
    imageUrls.push(url);
  }
  console.log(`[SEED] Uploaded ${imageUrls.length} images`);
  console.log("[SEED] Creating demo users...");
  const hashedPassword = await hashPassword2("demo123");
  const demoUsers = [
    {
      email: `marko${DEMO_EMAIL_SUFFIX}`,
      name: "Marko Petrovi\u0107",
      phone: "+381641234567",
      city: "Beograd",
      district: "Novi Beograd",
      subscriptionType: "premium"
    },
    {
      email: `jelena${DEMO_EMAIL_SUFFIX}`,
      name: "Jelena Nikoli\u0107",
      phone: "+381642345678",
      city: "Novi Sad",
      district: "Liman",
      subscriptionType: "basic"
    },
    {
      email: `stefan${DEMO_EMAIL_SUFFIX}`,
      name: "Stefan Jovanovi\u0107",
      phone: "+381643456789",
      city: "Ni\u0161",
      district: "Centar",
      subscriptionType: "premium"
    },
    {
      email: `ana${DEMO_EMAIL_SUFFIX}`,
      name: "Ana \u0110or\u0111evi\u0107",
      phone: "+381644567890",
      city: "Kragujevac",
      district: "Aerodrom",
      subscriptionType: "free"
    },
    {
      email: `nikola${DEMO_EMAIL_SUFFIX}`,
      name: "Nikola Stojanovi\u0107",
      phone: "+381645678901",
      city: "Subotica",
      district: "Centar",
      subscriptionType: "basic"
    },
    {
      email: `milica${DEMO_EMAIL_SUFFIX}`,
      name: "Milica Markovi\u0107",
      phone: "+381646789012",
      city: "Zrenjanin",
      district: "Centar",
      subscriptionType: "premium"
    },
    {
      email: `dragan${DEMO_EMAIL_SUFFIX}`,
      name: "Dragan Ili\u0107",
      phone: "+381647890123",
      city: "\u010Ca\u010Dak",
      district: "Centar",
      subscriptionType: "basic"
    },
    {
      email: `jovana${DEMO_EMAIL_SUFFIX}`,
      name: "Jovana Pavlovi\u0107",
      phone: "+381648901234",
      city: "Leskovac",
      district: "Centar",
      subscriptionType: "free"
    },
    {
      email: `milan${DEMO_EMAIL_SUFFIX}`,
      name: "Milan Todorovi\u0107",
      phone: "+381649012345",
      city: "Valjevo",
      district: "Centar",
      subscriptionType: "premium"
    },
    {
      email: `tamara${DEMO_EMAIL_SUFFIX}`,
      name: "Tamara Kosti\u0107",
      phone: "+381640123456",
      city: "\u0160abac",
      district: "Centar",
      subscriptionType: "basic"
    }
  ];
  const createdUsers = [];
  let usersCreated = 0;
  for (const userData of demoUsers) {
    const existingUser = await db.select().from(users).where(eq2(users.email, userData.email)).limit(1);
    if (existingUser.length > 0) {
      const user = existingUser[0];
      createdUsers.push({ id: user.id, city: userData.city, district: userData.district || "" });
      console.log(`[SEED] Demo user already exists: ${userData.name}`);
    } else {
      const subscriptionEndDate = userData.subscriptionType !== "free" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3) : null;
      const [user] = await db.insert(users).values({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone,
        city: userData.city,
        district: userData.district,
        role: "owner",
        rating: (4 + Math.random()).toFixed(1),
        totalRatings: Math.floor(Math.random() * 15) + 1,
        subscriptionType: userData.subscriptionType,
        subscriptionEndDate,
        emailVerified: true,
        isActive: true
      }).returning();
      createdUsers.push({ id: user.id, city: userData.city, district: userData.district || "" });
      usersCreated++;
      console.log(`[SEED] Created demo user: ${userData.name}`);
    }
  }
  console.log("[SEED] Creating demo items...");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
  const demoItems = [
    {
      ownerIndex: 0,
      title: "Bosch profesionalna bu\u0161ilica GSB 18V",
      description: "Profesionalna akumulatorska bu\u0161ilica Bosch sa dva akumulatora. Idealna za bu\u0161enje u betonu, drvu i metalu. Uklju\u010Dena torba za no\u0161enje i set burgija.",
      category: "Elektri\u010Dni alati",
      subCategory: "Bu\u0161ilice",
      brand: "Bosch",
      powerSource: "Akumulator",
      powerWatts: 650,
      pricePerDay: 800,
      deposit: 5e3,
      images: [imageUrls[0], imageUrls[1]],
      isFeatured: true
    },
    {
      ownerIndex: 0,
      title: "DeWalt ugaona brusilica 230mm",
      description: "Profesionalna ugaona brusilica za se\u010Denje i bru\u0161enje metala i kamena. Snaga 2200W. Uklju\u010Deni za\u0161titni poklopac i ru\u010Dka.",
      category: "Elektri\u010Dni alati",
      subCategory: "Brusilice",
      brand: "DeWalt",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 2200,
      pricePerDay: 900,
      deposit: 6e3,
      images: [imageUrls[2], imageUrls[3]],
      isFeatured: false
    },
    {
      ownerIndex: 1,
      title: "Makita kru\u017Ena testera 190mm",
      description: "Sna\u017Ena elektri\u010Dna kru\u017Ena testera za precizno se\u010Denje drva. Dubina reza do 66mm. Laser za precizno vo\u0111enje.",
      category: "Elektri\u010Dni alati",
      subCategory: "Testere",
      brand: "Makita",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 1800,
      pricePerDay: 1200,
      deposit: 8e3,
      images: [imageUrls[4], imageUrls[5]],
      isFeatured: true
    },
    {
      ownerIndex: 1,
      title: "Betonijer me\u0161alica 160L",
      description: "Elektri\u010Dna me\u0161alica za beton kapaciteta 160 litara. Idealna za manje gra\u0111evinske radove. To\u010Dkovi za lako preme\u0161tanje.",
      category: "Gra\u0111evinske ma\u0161ine",
      subCategory: "Me\u0161alice",
      brand: "Lescha",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 650,
      pricePerDay: 1500,
      deposit: 1e4,
      images: [imageUrls[6], imageUrls[7]],
      isFeatured: false
    },
    {
      ownerIndex: 2,
      title: "K\xE4rcher pera\u010D pod pritiskom K5",
      description: "Profesionalni pera\u010D pod pritiskom za \u010Di\u0161\u0107enje dvori\u0161ta, automobila, fasada. Pritisak do 145 bara. Uklju\u010Deno crevo od 8m.",
      category: "Oprema za \u010Di\u0161\u0107enje",
      subCategory: "Pera\u010Di pod pritiskom",
      brand: "K\xE4rcher",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 2100,
      pricePerDay: 1500,
      deposit: 1e4,
      images: [imageUrls[8], imageUrls[9]],
      isFeatured: true
    },
    {
      ownerIndex: 2,
      title: "Husqvarna motorna kosilica",
      description: "Profesionalna benzinska kosilica za travu. \u0160irina ko\u0161enja 53cm. Kanta za sakupljanje trave 70L.",
      category: "Ba\u0161ta",
      subCategory: "Ko\u0161enje",
      brand: "Husqvarna",
      powerSource: "Benzinski",
      pricePerDay: 1200,
      deposit: 8e3,
      images: [imageUrls[10], imageUrls[11]],
      isFeatured: false
    },
    {
      ownerIndex: 3,
      title: "Bosch orbitalna brusilica GEX 125",
      description: "Profesionalna orbitalna brusilica za finu obradu drveta. Pre\u010Dnik plo\u010De 125mm. Priklju\u010Dak za usisavanje pra\u0161ine.",
      category: "Elektri\u010Dni alati",
      subCategory: "Brusilice",
      brand: "Bosch",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 350,
      pricePerDay: 600,
      deposit: 4e3,
      images: [imageUrls[12], imageUrls[13]],
      isFeatured: false
    },
    {
      ownerIndex: 3,
      title: "Hilti TE 7-C SDS-Plus \u010Deki\u0107 bu\u0161ilica",
      description: "Profesionalni \u010Deki\u0107 za bu\u0161enje u betonu i zidariji. Energija udara 2.6J. Uklju\u010Den kofer sa setom burgija.",
      category: "Elektri\u010Dni alati",
      subCategory: "Bu\u0161ilice",
      brand: "Hilti",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 800,
      pricePerDay: 1100,
      deposit: 8e3,
      images: [imageUrls[14], imageUrls[15]],
      isFeatured: true
    },
    {
      ownerIndex: 4,
      title: "Stihl benzinska lan\u010Dana testera MS 250",
      description: "Profesionalna benzinska lan\u010Dana testera za se\u010Denje drve\u0107a i ogreva. Du\u017Eina ma\u010Da 40cm. Automatsko podmazivanje lanca.",
      category: "Ba\u0161ta",
      subCategory: "Orezivanje",
      brand: "Stihl",
      powerSource: "Benzinski",
      pricePerDay: 1800,
      deposit: 12e3,
      images: [imageUrls[16], imageUrls[17]],
      isFeatured: false
    },
    {
      ownerIndex: 5,
      title: "Gra\u0111evinska skela set 8m",
      description: "Komplet gra\u0111evinske skele visine do 8 metara. Aluminijumska konstrukcija, lagana za monta\u017Eu. Uklju\u010Dene sigurnosne ograde.",
      category: "Gra\u0111evinske ma\u0161ine",
      subCategory: "Skele",
      brand: "Generic",
      powerSource: "Ru\u010Dni",
      pricePerDay: 2e3,
      deposit: 15e3,
      images: [imageUrls[18], imageUrls[19]],
      isFeatured: true
    },
    {
      ownerIndex: 5,
      title: "Milwaukee akumulatorska bu\u0161ilica M18",
      description: "Sna\u017Ena akumulatorska udarna bu\u0161ilica Milwaukee. Dva akumulatora od 5Ah, punja\u010D i kofer u kompletu.",
      category: "Akumulatorski alati",
      subCategory: "Bu\u0161ilice",
      brand: "Milwaukee",
      powerSource: "Akumulator",
      powerWatts: 700,
      pricePerDay: 1e3,
      deposit: 7e3,
      images: [imageUrls[0], imageUrls[1]],
      isFeatured: false
    },
    {
      ownerIndex: 6,
      title: "Festool tra\u010Dna brusilica BS 75",
      description: "Profesionalna tra\u010Dna brusilica za bru\u0161enje velikih povr\u0161ina. \u0160irina trake 75mm. Uklju\u010Den set brusnih traka.",
      category: "Elektri\u010Dni alati",
      subCategory: "Brusilice",
      brand: "Festool",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 1010,
      pricePerDay: 800,
      deposit: 5e3,
      images: [imageUrls[12], imageUrls[13]],
      isFeatured: false
    },
    {
      ownerIndex: 6,
      title: "Metabo potapaju\u0107a pumpa za prljavu vodu",
      description: "Sna\u017Ena potapaju\u0107a pumpa kapaciteta 18000L/h. Idealna za ispumpavanje podruma, bazena. Mo\u017Ee da pre\u010Disti \u010Destice do 30mm.",
      category: "Gra\u0111evinske ma\u0161ine",
      subCategory: "Pumpe",
      brand: "Metabo",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 1100,
      pricePerDay: 700,
      deposit: 4e3,
      images: [imageUrls[8], imageUrls[9]],
      isFeatured: false
    },
    {
      ownerIndex: 7,
      title: "Vibroploca za sabijanje zemlje 90kg",
      description: "Profesionalna vibroploca za sabijanje tla i peska. Te\u017Eina 90kg, benzinski motor. Idealna za pripremu terena.",
      category: "Gra\u0111evinske ma\u0161ine",
      subCategory: "Vibroploci",
      brand: "Wacker Neuson",
      powerSource: "Benzinski",
      pricePerDay: 2500,
      deposit: 2e4,
      images: [imageUrls[6], imageUrls[7]],
      isFeatured: true
    },
    {
      ownerIndex: 7,
      title: "Bosch laser nivelir GLL 3-80",
      description: "Profesionalni linijski laser sa 3 linije od 360 stepeni. Domet do 30m. Stativ i torbica u kompletu.",
      category: "Merni/laserski",
      subCategory: "Laseri",
      brand: "Bosch",
      powerSource: "Akumulator",
      pricePerDay: 900,
      deposit: 6e3,
      images: [imageUrls[14], imageUrls[15]],
      isFeatured: false
    },
    {
      ownerIndex: 8,
      title: "Einhell elektri\u010Dna \u0161rafciger glodalica",
      description: "Vi\u0161enamenska elektri\u010Dna alatka za glodanje drva. Uklju\u010Den set glodala razli\u010Ditih oblika.",
      category: "Elektri\u010Dni alati",
      subCategory: "Glodalice",
      brand: "Einhell",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 1200,
      pricePerDay: 700,
      deposit: 4500,
      images: [imageUrls[4], imageUrls[5]],
      isFeatured: false
    },
    {
      ownerIndex: 8,
      title: "Honda agregat EU 22i",
      description: "Tihi inverterski agregat snage 2.2kW. Idealan za kampovanje, gradili\u0161te ili rezervno napajanje.",
      category: "Gra\u0111evinske ma\u0161ine",
      subCategory: "Agregati",
      brand: "Honda",
      powerSource: "Benzinski",
      pricePerDay: 2500,
      deposit: 2e4,
      images: [imageUrls[18], imageUrls[19]],
      isFeatured: true
    },
    {
      ownerIndex: 9,
      title: "Rubi ma\u0161ina za se\u010Denje plo\u010Dica TX-900",
      description: "Profesionalna ma\u0161ina za se\u010Denje kerami\u010Dkih plo\u010Dica do 90cm. Dijamantski disk i sistem vodenog hla\u0111enja.",
      category: "Gra\u0111evinske ma\u0161ine",
      subCategory: "Ma\u0161ine za se\u010Denje",
      brand: "Rubi",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 800,
      pricePerDay: 1200,
      deposit: 8e3,
      images: [imageUrls[2], imageUrls[3]],
      isFeatured: false
    },
    {
      ownerIndex: 9,
      title: "Black+Decker elektri\u010Dna kosa\u010Dica",
      description: "Elektri\u010Dna kosa\u010Dica za travnjake do 400m2. \u0160irina ko\u0161enja 38cm, kanta 45L.",
      category: "Ba\u0161ta",
      subCategory: "Ko\u0161enje",
      brand: "Black+Decker",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 1400,
      pricePerDay: 600,
      deposit: 4e3,
      images: [imageUrls[10], imageUrls[11]],
      isFeatured: false
    }
  ];
  let itemsCreated = 0;
  for (const itemData of demoItems) {
    const owner = createdUsers[itemData.ownerIndex];
    if (!owner) continue;
    const cityCoords = getCityCoordinates(owner.city);
    await db.insert(items).values({
      ownerId: owner.id,
      title: itemData.title,
      description: itemData.description,
      category: itemData.category,
      subCategory: itemData.subCategory || null,
      brand: itemData.brand || null,
      powerSource: itemData.powerSource || null,
      powerWatts: itemData.powerWatts || null,
      pricePerDay: itemData.pricePerDay,
      deposit: itemData.deposit,
      city: owner.city,
      district: owner.district,
      latitude: cityCoords?.latitude.toString() || null,
      longitude: cityCoords?.longitude.toString() || null,
      images: itemData.images,
      rating: (4 + Math.random()).toFixed(1),
      totalRatings: Math.floor(Math.random() * 10) + 1,
      isFeatured: itemData.isFeatured,
      isAvailable: true,
      expiresAt
    });
    itemsCreated++;
  }
  console.log(`[SEED] Demo data seeding complete: ${usersCreated} users, ${itemsCreated} items`);
  return { users: usersCreated, items: itemsCreated };
}
async function deleteDemoData() {
  console.log("[SEED] Deleting demo data...");
  const demoUsersList = await db.select().from(users).where(like(users.email, `%${DEMO_EMAIL_SUFFIX}`));
  let itemsDeleted = 0;
  let usersDeleted = 0;
  for (const user of demoUsersList) {
    const deletedItems = await db.delete(items).where(eq2(items.ownerId, user.id)).returning();
    itemsDeleted += deletedItems.length;
    await db.delete(users).where(eq2(users.id, user.id));
    usersDeleted++;
    console.log(`[SEED] Deleted demo user: ${user.name} and ${deletedItems.length} items`);
  }
  console.log(`[SEED] Demo data deletion complete: ${usersDeleted} users, ${itemsDeleted} items`);
  return { users: usersDeleted, items: itemsDeleted };
}
async function getDemoDataStats() {
  const demoUsersList = await db.select().from(users).where(like(users.email, `%${DEMO_EMAIL_SUFFIX}`));
  let totalItems = 0;
  for (const user of demoUsersList) {
    const userItems = await db.select().from(items).where(eq2(items.ownerId, user.id));
    totalItems += userItems.length;
  }
  return { users: demoUsersList.length, items: totalItems };
}

// server/routes.ts
import * as path from "path";
import * as fs2 from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/", (req, res, next) => {
    const hostname = req.hostname || req.headers.host?.split(":")[0] || "";
    const isAppSubdomain = hostname === "app.vikendmajstor.rs" || hostname.includes("app.");
    if (isAppSubdomain) {
      return next();
    }
    const userAgent = req.headers["user-agent"] || "";
    const isExpoRequest = userAgent.includes("Expo") || req.headers["expo-platform"];
    if (isExpoRequest) {
      return res.json({ status: "ok", type: "api" });
    }
    const landingPath = path.join(__dirname, "landing", "index.html");
    if (fs2.existsSync(landingPath)) {
      return res.sendFile(landingPath);
    }
    res.json({ status: "ok", message: "VikendMajstor API" });
  });
  app2.get("/app", (req, res) => {
    const userAgent = req.headers["user-agent"] || "";
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    if (isAndroid || isIOS) {
      return res.redirect("exp://");
    }
    const webAppPath = path.join(process.cwd(), "static-build", "web", "index.html");
    if (fs2.existsSync(webAppPath)) {
      return res.sendFile(webAppPath);
    }
    res.redirect("/");
  });
  app2.get("/public-objects/:filePath(*)", async (req, res) => {
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
  app2.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path
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
  app2.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });
  app2.put("/api/objects/finalize", isAuthenticated, async (req, res) => {
    if (!req.body.uploadURL) {
      return res.status(400).json({ error: "uploadURL is required" });
    }
    const userId = req.user.id;
    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.uploadURL,
        {
          owner: userId,
          visibility: "public"
        }
      );
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error finalizing upload:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/push-token", isAuthenticated, async (req, res) => {
    try {
      const { pushToken } = req.body;
      if (!pushToken) {
        return res.status(400).json({ error: "Push token je obavezan" });
      }
      await storage.savePushToken(req.user.id, pushToken);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving push token:", error);
      res.status(500).json({ error: "Gre\u0161ka pri \u010Duvanju push tokena" });
    }
  });
  app2.get("/api/home", async (req, res) => {
    try {
      const premiumItems = await storage.getPremiumItems();
      const earlyAdopterCount = await storage.getEarlyAdopterCount();
      const remainingSlots = Math.max(0, 100 - earlyAdopterCount);
      res.json({
        premiumItems,
        remainingEarlyAdopterSlots: remainingSlots
      });
    } catch (error) {
      console.error("Error fetching home data:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju podataka" });
    }
  });
  app2.get("/api/user/ad-stats", isAuthenticated, async (req, res) => {
    try {
      const freshUser = await storage.getUser(req.user.id);
      if (!freshUser) {
        return res.status(401).json({ error: "Korisnik nije prona\u0111en" });
      }
      const userItems = await storage.getItemsByOwner(freshUser.id);
      const itemCount = userItems.length;
      const featuredItems = userItems.filter((item) => item.isFeatured);
      const totalAdsCreated = freshUser.totalAdsCreated || 0;
      const FREE_AD_LIMIT = 5;
      const hasSubscription = freshUser.subscriptionType === "basic" || freshUser.subscriptionType === "premium";
      const subscriptionActive = hasSubscription && freshUser.subscriptionEndDate && new Date(freshUser.subscriptionEndDate) > /* @__PURE__ */ new Date();
      res.json({
        totalAds: itemCount,
        totalAdsCreated,
        freeAdsUsed: Math.min(totalAdsCreated, FREE_AD_LIMIT),
        freeAdsLimit: FREE_AD_LIMIT,
        canCreateAd: subscriptionActive || totalAdsCreated < FREE_AD_LIMIT,
        subscriptionType: freshUser.subscriptionType,
        subscriptionStatus: subscriptionActive ? "active" : "inactive",
        subscriptionEndDate: freshUser.subscriptionEndDate,
        featuredItemId: featuredItems[0]?.id || null,
        isPremium: freshUser.subscriptionType === "premium" && subscriptionActive,
        freeFeatureUsed: freshUser.freeFeatureUsed,
        featuredCount: featuredItems.length
      });
    } catch (error) {
      console.error("Error fetching ad stats:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju statistike" });
    }
  });
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  app2.get("/api/items", async (req, res) => {
    try {
      const { category, subCategory, toolType, powerSource, city, search, adType, minPrice, maxPrice, period, hasImages, activityTag, lat, lng, maxDistance } = req.query;
      let createdAfter;
      if (period === "today") {
        createdAfter = /* @__PURE__ */ new Date();
        createdAfter.setHours(0, 0, 0, 0);
      } else if (period === "week") {
        createdAfter = /* @__PURE__ */ new Date();
        createdAfter.setDate(createdAfter.getDate() - 7);
      } else if (period === "month") {
        createdAfter = /* @__PURE__ */ new Date();
        createdAfter.setMonth(createdAfter.getMonth() - 1);
      }
      const items2 = await storage.getItems({
        category,
        subCategory,
        toolType,
        powerSource,
        city,
        search,
        adType,
        minPrice: minPrice ? parseInt(minPrice) : void 0,
        maxPrice: maxPrice ? parseInt(maxPrice) : void 0,
        createdAfter,
        hasImages: hasImages === "true",
        activityTag
      });
      const now = /* @__PURE__ */ new Date();
      const userLat = lat ? parseFloat(lat) : null;
      const userLng = lng ? parseFloat(lng) : null;
      const maxDist = maxDistance ? parseFloat(maxDistance) : null;
      let itemsWithDistance = await Promise.all(
        items2.map(async (item) => {
          const owner = await storage.getUser(item.ownerId);
          const isPremium = owner?.subscriptionType === "premium" && owner?.subscriptionEndDate && new Date(owner.subscriptionEndDate) > now;
          let distance = null;
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
        itemsWithDistance = itemsWithDistance.filter(
          (item) => item.distance !== null && item.distance <= maxDist
        );
        itemsWithDistance.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isPremium && !b.isPremium) return -1;
          if (!a.isPremium && b.isPremium) return 1;
          return (a.distance || 999999) - (b.distance || 999999);
        });
      } else {
        itemsWithDistance.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          if (a.isPremium && !b.isPremium) return -1;
          if (!a.isPremium && b.isPremium) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      res.json(itemsWithDistance);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju stvari" });
    }
  });
  app2.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije prona\u0111ena" });
      }
      const owner = await storage.getUser(item.ownerId);
      res.json({ ...item, owner });
    } catch (error) {
      console.error("Error fetching item:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju stvari" });
    }
  });
  app2.get("/api/items/:id/bookings", async (req, res) => {
    try {
      const bookings2 = await storage.getItemBookings(req.params.id);
      res.json(bookings2);
    } catch (error) {
      console.error("Error fetching item bookings:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju rezervacija" });
    }
  });
  app2.get("/api/my-items", isAuthenticated, async (req, res) => {
    try {
      const items2 = await storage.getItemsByOwner(req.user.id);
      res.json(items2);
    } catch (error) {
      console.error("Error fetching user items:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju stvari" });
    }
  });
  app2.post("/api/items", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const freshUser = await storage.getUser(req.user.id);
      if (!freshUser) {
        return res.status(401).json({ error: "Korisnik nije prona\u0111en" });
      }
      const FREE_AD_LIMIT = 5;
      const hasSubscription = freshUser.subscriptionType === "basic" || freshUser.subscriptionType === "premium";
      const subscriptionActive = hasSubscription && freshUser.subscriptionEndDate && new Date(freshUser.subscriptionEndDate) > /* @__PURE__ */ new Date();
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
        ownerId: freshUser.id
      });
      if (!subscriptionActive) {
        await storage.incrementUserAdsCreated(freshUser.id);
      }
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ error: "Gre\u0161ka pri kreiranju stvari" });
    }
  });
  app2.delete("/api/items/:id", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const forceDelete = req.query.force === "true";
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije prona\u0111ena" });
      }
      if (item.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      const activeBookings = await storage.getItemBookings(req.params.id);
      const now = /* @__PURE__ */ new Date();
      const currentlyRented = activeBookings.filter(
        (b) => (b.status === "confirmed" || b.status === "pending") && new Date(b.endDate) >= now
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
      res.json({ success: true, message: "Oglas je uspe\u0161no obrisan" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Gre\u0161ka pri brisanju oglasa" });
    }
  });
  app2.post("/api/items/:id/feature", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const { action, paid } = req.body;
      if (!action || !["feature", "unfeature"].includes(action)) {
        return res.status(400).json({ error: "Neva\u017Ee\u0107a akcija" });
      }
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije prona\u0111ena" });
      }
      if (item.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije prona\u0111en" });
      }
      const now = /* @__PURE__ */ new Date();
      const isPremium = user.subscriptionType === "premium" && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now;
      if (!isPremium) {
        return res.status(403).json({
          error: "Samo premium korisnici mogu istaknuti oglase",
          code: "PREMIUM_REQUIRED"
        });
      }
      if (action === "feature") {
        if (item.isFeatured) {
          return res.json({ success: true, message: "Ovaj oglas je ve\u0107 istaknut" });
        }
        const userItems = await storage.getItemsByOwner(user.id);
        const currentFeaturedCount = userItems.filter((i) => i.isFeatured).length;
        if (currentFeaturedCount >= 1 && !paid) {
          return res.status(402).json({
            error: "Mo\u017Eete imati samo 1 istaknuti oglas. Dodatno isticanje ko\u0161ta 99 RSD.",
            code: "PAYMENT_REQUIRED",
            price: 99
          });
        }
        if (!user.freeFeatureUsed) {
          await storage.featureItem(req.params.id);
          await storage.markFreeFeatureUsed(user.id);
          res.json({ success: true, message: "Oglas je uspe\u0161no istaknut (besplatno u okviru Premium pretplate)" });
        } else if (!paid) {
          return res.status(402).json({
            error: "Ve\u0107 ste iskoristili besplatno isticanje. Dodatno isticanje ko\u0161ta 99 RSD.",
            code: "PAYMENT_REQUIRED",
            price: 99
          });
        } else {
          await storage.featureItem(req.params.id);
          res.json({ success: true, message: "Oglas je uspe\u0161no istaknut" });
        }
      } else {
        const userItems = await storage.getItemsByOwner(user.id);
        const featuredItems = userItems.filter((i) => i.isFeatured);
        if (featuredItems.length <= 1 && user.freeFeatureUsed) {
          return res.status(403).json({
            error: "Ne mo\u017Eete ukloniti besplatni istaknuti oglas. Mo\u017Eete samo zameniti pla\u0107enim isticanjem.",
            code: "CANNOT_REMOVE_FREE"
          });
        }
        await storage.unfeatureItem(req.params.id);
        res.json({ success: true, message: "Oglas je uklonjen sa vrha" });
      }
    } catch (error) {
      console.error("Error featuring item:", error);
      res.status(500).json({ error: "Gre\u0161ka pri isticanju oglasa" });
    }
  });
  app2.put("/api/items/:id", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije prona\u0111ena" });
      }
      if (item.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      const updatedItem = await storage.updateItem(req.params.id, req.body);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: "Gre\u0161ka pri a\u017Euriranju stvari" });
    }
  });
  app2.get("/api/items/:id/bookings", async (req, res) => {
    try {
      const bookings2 = await storage.getItemBookings(req.params.id);
      res.json(bookings2);
    } catch (error) {
      console.error("Error fetching item bookings:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju rezervacija" });
    }
  });
  app2.get("/api/items/:id/reviews", async (req, res) => {
    try {
      const reviews2 = await storage.getItemReviews(req.params.id);
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching item reviews:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju recenzija" });
    }
  });
  app2.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const { type = "renter" } = req.query;
      const bookings2 = await storage.getBookings(
        req.user.id,
        type
      );
      const bookingsWithDetails = await Promise.all(
        bookings2.map(async (booking) => {
          const item = await storage.getItem(booking.itemId);
          const renter = await storage.getUser(booking.renterId);
          const owner = await storage.getUser(booking.ownerId);
          return { ...booking, item, renter, owner };
        })
      );
      res.json(bookingsWithDetails);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju rezervacija" });
    }
  });
  app2.get("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Rezervacija nije prona\u0111ena" });
      }
      if (booking.renterId !== req.user.id && booking.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      const item = await storage.getItem(booking.itemId);
      const renter = await storage.getUser(booking.renterId);
      const owner = await storage.getUser(booking.ownerId);
      res.json({ ...booking, item, renter, owner });
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju rezervacije" });
    }
  });
  app2.post("/api/bookings", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const item = await storage.getItem(req.body.itemId);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije prona\u0111ena" });
      }
      if (item.ownerId === req.user.id) {
        return res.status(400).json({ error: "Ne mo\u017Eete rezervisati sopstvenu stvar" });
      }
      const requestedStart = new Date(req.body.startDate);
      const requestedEnd = new Date(req.body.endDate);
      const existingBookings = await storage.getItemBookings(req.body.itemId);
      const conflictingBooking = existingBookings.find((b) => {
        if (b.status !== "confirmed" && b.status !== "pending") return false;
        const bookingStart = new Date(b.startDate);
        const bookingEnd = new Date(b.endDate);
        return requestedStart <= bookingEnd && requestedEnd >= bookingStart;
      });
      if (conflictingBooking) {
        return res.status(409).json({
          error: "Izabrani datumi su ve\u0107 rezervisani. Molimo izaberite druge datume."
        });
      }
      const booking = await storage.createBooking({
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        renterId: req.user.id,
        ownerId: item.ownerId
      });
      const renter = await storage.getUser(req.user.id);
      const owner = await storage.getUser(item.ownerId);
      sendBookingRequestConfirmationToRenter(req.user.id, item.title, booking.id);
      sendBookingRequestNotification(item.ownerId, renter?.name || "Korisnik", item.title, booking.id);
      if (owner?.email) {
        const startDateStr = new Date(req.body.startDate).toLocaleDateString("sr-RS");
        const endDateStr = new Date(req.body.endDate).toLocaleDateString("sr-RS");
        sendBookingRequestEmail(
          owner.email,
          owner.name,
          renter?.name || "Korisnik",
          item.title,
          startDateStr,
          endDateStr,
          req.body.totalPrice || 0
        );
      }
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Gre\u0161ka pri kreiranju rezervacije" });
    }
  });
  app2.put("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Rezervacija nije prona\u0111ena" });
      }
      if (booking.renterId !== req.user.id && booking.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      const previousStatus = booking.status;
      const updatedBooking = await storage.updateBooking(req.params.id, req.body);
      if (req.body.status && req.body.status !== previousStatus) {
        const item = await storage.getItem(booking.itemId);
        const owner = await storage.getUser(booking.ownerId);
        const renter = await storage.getUser(booking.renterId);
        if (req.body.status === "confirmed" && item && owner) {
          sendBookingConfirmedNotification(booking.renterId, item.title, owner.name, booking.id);
          if (renter?.email) {
            const startDateStr = new Date(booking.startDate).toLocaleDateString("sr-RS");
            const endDateStr = new Date(booking.endDate).toLocaleDateString("sr-RS");
            sendBookingConfirmedEmail(
              renter.email,
              renter.name,
              owner.name,
              item.title,
              startDateStr,
              endDateStr,
              booking.totalPrice || 0,
              owner.phone || void 0
            );
          }
        } else if (req.body.status === "cancelled" && item) {
          const notifyUserId = req.user.id === booking.ownerId ? booking.renterId : booking.ownerId;
          sendBookingCancelledNotification(notifyUserId, item.title, booking.id);
        }
      }
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Gre\u0161ka pri a\u017Euriranju rezervacije" });
    }
  });
  app2.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const conversations2 = await storage.getConversations(req.user.id);
      const conversationsWithDetails = await Promise.all(
        conversations2.map(async (conv) => {
          const otherUserId = conv.user1Id === req.user.id ? conv.user2Id : conv.user1Id;
          const otherUser = await storage.getUser(otherUserId);
          const messages2 = await storage.getMessages(conv.id);
          const lastMessage = messages2[messages2.length - 1];
          const unreadCount = messages2.filter(
            (m) => m.receiverId === req.user.id && !m.isRead
          ).length;
          return {
            ...conv,
            otherUser,
            lastMessage,
            unreadCount
          };
        })
      );
      res.json(conversationsWithDetails);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju razgovora" });
    }
  });
  app2.post("/api/conversations", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const { userId, itemId } = req.body;
      if (userId === req.user.id) {
        return res.status(400).json({ error: "Ne mo\u017Eete zapo\u010Deti razgovor sa sobom" });
      }
      const conversation = await storage.getOrCreateConversation(
        req.user.id,
        userId,
        itemId
      );
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Gre\u0161ka pri kreiranju razgovora" });
    }
  });
  app2.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Razgovor nije prona\u0111en" });
      }
      if (conversation.user1Id !== req.user.id && conversation.user2Id !== req.user.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      await storage.markMessagesAsRead(req.params.id, req.user.id);
      const messages2 = await storage.getMessages(req.params.id);
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju poruka" });
    }
  });
  app2.post("/api/conversations/:id/messages", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Razgovor nije prona\u0111en" });
      }
      if (conversation.user1Id !== req.user.id && conversation.user2Id !== req.user.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      const receiverId = conversation.user1Id === req.user.id ? conversation.user2Id : conversation.user1Id;
      const message = await storage.createMessage({
        conversationId: req.params.id,
        senderId: req.user.id,
        receiverId,
        content: req.body.content,
        isRead: false
      });
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Gre\u0161ka pri slanju poruke" });
    }
  });
  app2.get("/api/items/:id/reviews", async (req, res) => {
    try {
      const reviews2 = await storage.getReviewsForItem(req.params.id);
      const reviewsWithReviewers = await Promise.all(
        reviews2.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          return { ...review, reviewer };
        })
      );
      res.json(reviewsWithReviewers);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju recenzija" });
    }
  });
  app2.post("/api/reviews", isAuthenticated, isVerifiedUser, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.body.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Rezervacija nije prona\u0111ena" });
      }
      if (booking.status !== "completed") {
        return res.status(400).json({ error: "Mo\u017Eete oceniti samo zavr\u0161ene rezervacije" });
      }
      if (booking.renterId !== req.user.id && booking.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Nemate dozvolu za ovu akciju" });
      }
      const revieweeId = booking.renterId === req.user.id ? booking.ownerId : booking.renterId;
      const review = await storage.createReview({
        bookingId: booking.id,
        itemId: booking.itemId,
        reviewerId: req.user.id,
        revieweeId,
        rating: req.body.rating,
        comment: req.body.comment
      });
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Gre\u0161ka pri kreiranju recenzije" });
    }
  });
  app2.put("/api/users/me", isAuthenticated, async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: "Korisnik nije prona\u0111en" });
      }
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Gre\u0161ka pri a\u017Euriranju profila" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije prona\u0111en" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju korisnika" });
    }
  });
  app2.get("/api/subscription/status", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije prona\u0111en" });
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
          premium: 1e3
        }
      });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju pretplate" });
    }
  });
  app2.post("/api/subscription/activate-early-adopter", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije prona\u0111en" });
      }
      if (user.isEarlyAdopter) {
        return res.status(400).json({ error: "Ve\u0107 ste early adopter korisnik" });
      }
      const earlyAdopterCount = await storage.getEarlyAdopterCount();
      if (earlyAdopterCount >= 100) {
        return res.status(400).json({ error: "Nema vi\u0161e dostupnih mesta za early adopter program" });
      }
      const endDate = /* @__PURE__ */ new Date();
      endDate.setDate(endDate.getDate() + 30);
      const updatedUser = await storage.activateEarlyAdopter(user.id, endDate);
      res.json({
        message: "Uspe\u0161no ste postali early adopter! Imate besplatno kori\u0161\u0107enje 30 dana.",
        subscriptionEndDate: endDate,
        user: updatedUser
      });
    } catch (error) {
      console.error("Error activating early adopter:", error);
      res.status(500).json({ error: "Gre\u0161ka pri aktivaciji early adopter programa" });
    }
  });
  app2.post("/api/subscription/create-checkout", isAuthenticated, async (req, res) => {
    try {
      const { planType } = req.body;
      if (!planType || !["basic", "premium"].includes(planType)) {
        return res.status(400).json({ error: "Neva\u017Ee\u0107i tip pretplate" });
      }
      const priceRsd = planType === "basic" ? 500 : 1e3;
      res.json({
        message: "Stripe integracija \u0107e uskoro biti dostupna",
        planType,
        priceRsd,
        stripeConfigured: false,
        placeholder: true
      });
    } catch (error) {
      console.error("Error creating checkout:", error);
      res.status(500).json({ error: "Gre\u0161ka pri kreiranju naplate" });
    }
  });
  app2.post("/api/subscription/buy-feature", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije prona\u0111en" });
      }
      const isPremium = user.subscriptionType === "premium" && user.subscriptionEndDate && new Date(user.subscriptionEndDate) > /* @__PURE__ */ new Date();
      if (!isPremium) {
        return res.status(403).json({ error: "Potrebna je Premium pretplata" });
      }
      res.json({
        message: "Stripe integracija \u0107e uskoro biti dostupna",
        priceRsd: 99,
        stripeConfigured: false,
        placeholder: true
      });
    } catch (error) {
      console.error("Error buying feature:", error);
      res.status(500).json({ error: "Gre\u0161ka pri kupovini istaknutog oglasa" });
    }
  });
  app2.post("/api/stripe/webhook", async (req, res) => {
    res.json({ received: true, message: "Stripe webhook placeholder - konfiguri\u0161ite Stripe klju\u010Deve" });
  });
  app2.get("/api/categories", async (_req, res) => {
    try {
      const { CATEGORIES: CATEGORIES2, POWER_SOURCES: POWER_SOURCES2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      res.json({ categories: CATEGORIES2, powerSources: POWER_SOURCES2 });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju kategorija" });
    }
  });
  const isAdmin = async (req, res, next) => {
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
  app2.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju statistike" });
    }
  });
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const { search, isActive, subscriptionType } = req.query;
      const filters = {};
      if (search) filters.search = search;
      if (isActive !== void 0) filters.isActive = isActive === "true";
      if (subscriptionType) filters.subscriptionType = subscriptionType;
      const users2 = await storage.getAllUsers(filters);
      const safeUsers = users2.map((user) => ({
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
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju korisnika" });
    }
  });
  app2.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije prona\u0111en" });
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
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju korisnika" });
    }
  });
  app2.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const { isActive, isAdmin: makeAdmin, subscriptionType, subscriptionDays } = req.body;
      const updatedUser = await storage.updateUserAdmin(req.params.id, {
        isActive,
        isAdmin: makeAdmin,
        subscriptionType,
        subscriptionDays: subscriptionDays ? parseInt(subscriptionDays) : void 0
      });
      if (!updatedUser) {
        return res.status(404).json({ error: "Korisnik nije prona\u0111en" });
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
      res.status(500).json({ error: "Gre\u0161ka pri a\u017Euriranju korisnika" });
    }
  });
  app2.get("/api/admin/check", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      res.json({ isAdmin: user?.isAdmin || false });
    } catch (error) {
      res.status(500).json({ error: "Gre\u0161ka pri proveri admin statusa" });
    }
  });
  app2.get("/api/admin/demo-data", isAdmin, async (req, res) => {
    try {
      const stats = await getDemoDataStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting demo data stats:", error);
      res.status(500).json({ error: "Gre\u0161ka pri dobijanju demo podataka" });
    }
  });
  app2.post("/api/admin/demo-data/seed", isAdmin, async (req, res) => {
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
      res.status(500).json({ error: "Gre\u0161ka pri kreiranju demo podataka" });
    }
  });
  app2.delete("/api/admin/demo-data", isAdmin, async (req, res) => {
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
      res.status(500).json({ error: "Gre\u0161ka pri brisanju demo podataka" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/landing-page-template.ts
var LANDING_PAGE_TEMPLATE = `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VikendMajstor - Platforma za iznajmljivanje alata</title>
  <meta name="description" content="VikendMajstor je platforma za iznajmljivanje alata. Prona\u0111ite alat koji vam treba ili zaradite iznajmljivanjem svog alata.">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/favicon.png">
  <meta property="og:title" content="VikendMajstor - Platforma za iznajmljivanje alata">
  <meta property="og:description" content="Prona\u0111ite alat koji vam treba ili zaradite iznajmljivanjem svog alata.">
  <meta property="og:image" content="/favicon.png">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --primary: #FFCC00;
      --primary-dark: #E6B800;
      --dark: #1A1A1A;
      --dark-secondary: #2A2A2A;
      --text: #333333;
      --text-secondary: #666666;
      --text-light: #999999;
      --background: #FFFFFF;
      --background-secondary: #F5F5F5;
      --success: #22C55E;
      --border: #E5E5E5;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--text);
      background: var(--background);
    }
    
    a {
      text-decoration: none;
      color: inherit;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    /* Navigation */
    .nav {
      background: var(--dark);
      padding: 16px 0;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    
    .nav-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .nav-logo img {
      width: 40px;
      height: 40px;
      border-radius: 8px;
    }
    
    .nav-logo-text {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
    }
    
    .nav-links {
      display: flex;
      gap: 32px;
      list-style: none;
    }
    
    .nav-links a {
      color: #FFFFFF;
      font-weight: 500;
      transition: color 0.2s;
    }
    
    .nav-links a:hover {
      color: var(--primary);
    }
    
    .nav-cta {
      background: var(--primary);
      color: var(--dark);
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      transition: background 0.2s;
    }
    
    .nav-cta:hover {
      background: var(--primary-dark);
    }
    
    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      color: #FFFFFF;
      font-size: 24px;
      cursor: pointer;
    }
    
    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, var(--dark) 0%, var(--dark-secondary) 100%);
      padding: 140px 0 80px;
      text-align: center;
    }
    
    .hero h1 {
      font-size: 48px;
      font-weight: 800;
      color: #FFFFFF;
      margin-bottom: 20px;
    }
    
    .hero h1 span {
      color: var(--primary);
    }
    
    .hero p {
      font-size: 20px;
      color: #CCCCCC;
      max-width: 600px;
      margin: 0 auto 40px;
    }
    
    .hero-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn-primary {
      background: var(--primary);
      color: var(--dark);
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
    }
    
    .btn-secondary {
      background: transparent;
      color: #FFFFFF;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      border: 2px solid #FFFFFF;
      transition: all 0.2s;
    }
    
    .btn-secondary:hover {
      background: rgba(255,255,255,0.1);
    }
    
    /* App Download Section */
    .qr-section {
      padding: 60px 0;
      background: var(--background-secondary);
      text-align: center;
    }
    
    .qr-section h2 {
      font-size: 28px;
      margin-bottom: 20px;
    }
    
    .store-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    
    .store-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--dark);
      color: #FFFFFF;
      border-radius: 8px;
      font-weight: 500;
      transition: opacity 0.2s;
    }
    
    .store-btn:hover {
      opacity: 0.9;
    }
    
    .store-btn img {
      width: 20px;
      height: 20px;
    }
    
    .store-btn-disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .store-btn-disabled:hover {
      opacity: 0.6;
    }
    
    /* About Section */
    .about {
      padding: 80px 0;
    }
    
    .section-title {
      text-align: center;
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    
    .section-subtitle {
      text-align: center;
      font-size: 18px;
      color: var(--text-secondary);
      max-width: 600px;
      margin: 0 auto 48px;
    }
    
    .about-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
    }
    
    .about-text p {
      font-size: 18px;
      color: var(--text-secondary);
      margin-bottom: 24px;
      line-height: 1.8;
    }
    
    .eco-card {
      background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
      border-radius: 16px;
      padding: 32px;
      border-left: 4px solid var(--success);
    }
    
    .eco-card h3 {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      color: var(--success);
      margin-bottom: 16px;
    }
    
    .eco-card ul {
      list-style: none;
    }
    
    .eco-card li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
      color: var(--text);
    }
    
    .eco-card li::before {
      content: "\u2713";
      color: var(--success);
      font-weight: bold;
    }
    
    /* How it Works */
    .how-it-works {
      padding: 80px 0;
      background: var(--background-secondary);
    }
    
    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
    }
    
    .step {
      text-align: center;
      padding: 32px;
      background: #FFFFFF;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    
    .step-number {
      width: 60px;
      height: 60px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      color: var(--dark);
      margin: 0 auto 20px;
    }
    
    .step h3 {
      font-size: 20px;
      margin-bottom: 12px;
    }
    
    .step p {
      color: var(--text-secondary);
    }
    
    /* FAQ Section */
    .faq {
      padding: 80px 0;
    }
    
    .faq-grid {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .faq-item {
      border: 1px solid var(--border);
      border-radius: 12px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    
    .faq-question {
      padding: 20px 24px;
      background: #FFFFFF;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      transition: background 0.2s;
    }
    
    .faq-question:hover {
      background: var(--background-secondary);
    }
    
    .faq-arrow {
      transition: transform 0.3s;
    }
    
    .faq-item.active .faq-arrow {
      transform: rotate(180deg);
    }
    
    .faq-answer {
      padding: 0 24px;
      max-height: 0;
      overflow: hidden;
      transition: all 0.3s;
      background: var(--background-secondary);
    }
    
    .faq-item.active .faq-answer {
      padding: 20px 24px;
      max-height: 200px;
    }
    
    .faq-answer p {
      color: var(--text-secondary);
      line-height: 1.7;
    }
    
    /* Contact Section */
    .contact {
      padding: 80px 0;
      background: var(--dark);
      color: #FFFFFF;
    }
    
    .contact .section-title {
      color: #FFFFFF;
    }
    
    .contact .section-subtitle {
      color: #CCCCCC;
    }
    
    .contact-info {
      display: flex;
      justify-content: center;
      gap: 48px;
      flex-wrap: wrap;
    }
    
    .contact-item {
      text-align: center;
      padding: 32px;
      background: var(--dark-secondary);
      border-radius: 16px;
      min-width: 280px;
    }
    
    .contact-icon {
      width: 60px;
      height: 60px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 24px;
    }
    
    .contact-item h3 {
      font-size: 18px;
      margin-bottom: 8px;
    }
    
    .contact-item a {
      color: var(--primary);
      font-size: 18px;
      font-weight: 600;
    }
    
    .contact-item a:hover {
      text-decoration: underline;
    }
    
    /* Footer */
    .footer {
      background: var(--dark);
      padding: 48px 0 24px;
      border-top: 1px solid #333;
    }
    
    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 48px;
      margin-bottom: 48px;
    }
    
    .footer-brand h3 {
      color: var(--primary);
      font-size: 24px;
      margin-bottom: 16px;
    }
    
    .footer-brand p {
      color: #999;
      line-height: 1.7;
    }
    
    .footer-links h4 {
      color: #FFFFFF;
      font-size: 16px;
      margin-bottom: 16px;
    }
    
    .footer-links ul {
      list-style: none;
    }
    
    .footer-links li {
      margin-bottom: 12px;
    }
    
    .footer-links a {
      color: #999;
      transition: color 0.2s;
    }
    
    .footer-links a:hover {
      color: var(--primary);
    }
    
    .footer-bottom {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #333;
      color: #666;
    }
    
    /* Mobile Styles */
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      .mobile-menu-btn {
        display: block;
      }
      
      .hero h1 {
        font-size: 32px;
      }
      
      .hero p {
        font-size: 16px;
      }
      
      .about-content {
        grid-template-columns: 1fr;
      }
      
      .steps {
        grid-template-columns: 1fr;
      }
      
      .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
      }
      
      .contact-info {
        flex-direction: column;
        align-items: center;
      }
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav class="nav">
    <div class="container nav-container">
      <a href="#" class="nav-logo">
        <img src="/favicon.png" alt="VikendMajstor">
        <span class="nav-logo-text">VikendMajstor</span>
      </a>
      <ul class="nav-links">
        <li><a href="#app">Alati</a></li>
        <li><a href="#o-nama">O nama</a></li>
        <li><a href="#kako-radi">Kako radi</a></li>
        <li><a href="#faq">FAQ</a></li>
        <li><a href="#kontakt">Kontakt</a></li>
      </ul>
      <a href="https://app.vikendmajstor.rs" class="nav-cta">Otvori aplikaciju</a>
      <button class="mobile-menu-btn">&#9776;</button>
    </div>
  </nav>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <h1>Iznajmi alat od <span>komsije</span></h1>
      <p>VikendMajstor je platforma za iznajmljivanje alata. Pronadji alat koji ti treba ili zaradi iznajmljivanjem svog alata.</p>
      <div class="hero-buttons">
        <a href="#app" class="btn-primary">Pregledaj alate</a>
        <a href="#kako-radi" class="btn-secondary">Kako funkcionise</a>
      </div>
    </div>
  </section>

  <!-- App Download Section -->
  <section class="qr-section" id="app">
    <div class="container">
      <h2>Preuzmi aplikaciju</h2>
      <p style="color: var(--text-secondary); margin-bottom: 30px;">Dostupno uskoro na svim platformama</p>
      <div class="store-buttons">
        <a href="#" class="store-btn store-btn-disabled" onclick="event.preventDefault(); alert('App Store verzija ce uskoro biti dostupna!');">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          App Store (uskoro)
        </a>
        <a href="#" class="store-btn store-btn-disabled" onclick="event.preventDefault(); alert('Google Play verzija ce uskoro biti dostupna!');">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
          Google Play (uskoro)
        </a>
      </div>
      
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid var(--border);">
        <h3 style="font-size: 20px; margin-bottom: 16px;">Android korisnici</h3>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">Preuzmi APK fajl direktno i instaliraj na svoj Android telefon</p>
        <a href="/download/vikendmajstor.apk" class="btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/></svg>
          Preuzmi APK
        </a>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section class="about" id="o-nama">
    <div class="container">
      <h2 class="section-title">O nama</h2>
      <p class="section-subtitle">Povezujemo ljude koji imaju alate sa onima kojima su potrebni</p>
      
      <div class="about-content">
        <div class="about-text">
          <p>
            VikendMajstor je platforma za iznajmljivanje alata. Nas cilj je da korisnicima omogucimo lak pristup potrebnim alatima bez kupovine, da podstaknemo deljenje resursa i doprinesemo zastiti zivotne sredine kroz odgovorno koriscenje i ponovnu upotrebu.
          </p>
          <p>
            Umesto da kupujete alat koji cete koristiti jednom ili dvaput godisnje, iznajmite ga od komsije po povoljnoj ceni. Tako stedite novac, prostor u garazi, a i poma\u017Eete planeti.
          </p>
        </div>
        
        <div class="eco-card">
          <h3>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
            Ekoloska poruka
          </h3>
          <ul>
            <li>Manje kupovine = manje proizvodnje = manje otpada</li>
            <li>Deljenje resursa = racionalno koriscenje energije i materijala</li>
            <li>Zajednica koja razmenjuje = zajednica koja stedi i cuva planetu</li>
            <li>Produzavamo zivotni vek alata kroz zajednicko koriscenje</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- How it Works -->
  <section class="how-it-works" id="kako-radi">
    <div class="container">
      <h2 class="section-title">Kako funkcionise</h2>
      <p class="section-subtitle">Tri jednostavna koraka do alata koji vam treba</p>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <h3>Pronadji alat</h3>
          <p>Pretrazite oglase u vasoj okolini i pronadjite alat koji vam treba po povoljnoj ceni.</p>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <h3>Rezervisi</h3>
          <p>Posaljite zahtev za rezervaciju, izaberite datume i sacekajte potvrdu od vlasnika.</p>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <h3>Preuzmi i koristi</h3>
          <p>Dogovorite se o preuzimanju, koristite alat i vratite ga u dogovorenom roku.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="faq" id="faq">
    <div class="container">
      <h2 class="section-title">Cesta pitanja</h2>
      <p class="section-subtitle">Odgovori na najcesde postavljana pitanja</p>
      
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-question">
            Kako da dodam oglas?
            <span class="faq-arrow">&#9660;</span>
          </div>
          <div class="faq-answer">
            <p>Kliknite na "+" dugme u donjem meniju da biste dodali novi oglas. Popunite naslov, opis, kategoriju, cenu po danu i dodajte fotografije. Besplatni korisnici mogu dodati do 5 oglasa.</p>
          </div>
        </div>
        
        <div class="faq-item">
          <div class="faq-question">
            Kako funkcionise rezervacija?
            <span class="faq-arrow">&#9660;</span>
          </div>
          <div class="faq-answer">
            <p>Pronadjite stvar koju zelite da iznajmite, izaberite datume i posaljite zahtev za rezervaciju. Vlasnik ce primiti obavestenje i moze da prihvati ili odbije zahtev. Nakon potvrde, dogovorite se o preuzimanju.</p>
          </div>
        </div>
        
        <div class="faq-item">
          <div class="faq-question">
            Kako se vrsi placanje?
            <span class="faq-arrow">&#9660;</span>
          </div>
          <div class="faq-answer">
            <p>Placanje se vrsi direktno izmedju korisnika prilikom preuzimanja stvari. VikendMajstor trenutno ne procesira placanja kroz aplikaciju. Depozit se vraca nakon vracanja stvari u dobrom stanju.</p>
          </div>
        </div>
        
        <div class="faq-item">
          <div class="faq-question">
            Da li je moj novac siguran?
            <span class="faq-arrow">&#9660;</span>
          </div>
          <div class="faq-answer">
            <p>Preporucujemo da uvek trazite depozit kao garanciju. Fotografisite stvar pre i posle iznajmljivanja. U slucaju problema, kontaktirajte nasu podrsku.</p>
          </div>
        </div>
        
        <div class="faq-item">
          <div class="faq-question">
            Kako da postanem Premium korisnik?
            <span class="faq-arrow">&#9660;</span>
          </div>
          <div class="faq-answer">
            <p>Idjite na Profil > Pretplata i izaberite Premium plan. Premium korisnici imaju neogranicen broj oglasa, istaknute oglase na vrhu pretrage i premium znacku.</p>
          </div>
        </div>
        
        <div class="faq-item">
          <div class="faq-question">
            Sta ako imam problem sa rezervacijom?
            <span class="faq-arrow">&#9660;</span>
          </div>
          <div class="faq-answer">
            <p>Koristite chat funkciju da komunicirate direktno sa drugom stranom. Ako ne mozete da resite problem, kontaktirajte nasu podrsku na podrska@vikendmajstor.rs</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section class="contact" id="kontakt">
    <div class="container">
      <h2 class="section-title">Kontaktirajte nas</h2>
      <p class="section-subtitle">Imate pitanja? Rado cemo vam pomoci.</p>
      
      <div class="contact-info">
        <div class="contact-item">
          <div class="contact-icon">&#9993;</div>
          <h3>Email podrska</h3>
          <p style="color: #999; margin-bottom: 8px;">Odgovaramo u roku od 24 sata</p>
          <a href="mailto:podrska@vikendmajstor.rs">podrska@vikendmajstor.rs</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>VikendMajstor</h3>
          <p>Platforma za iznajmljivanje alata i opreme. Povezujemo komsije i stedimo planetu kroz deljenje resursa.</p>
        </div>
        
        <div class="footer-links">
          <h4>Navigacija</h4>
          <ul>
            <li><a href="#app">Alati</a></li>
            <li><a href="#o-nama">O nama</a></li>
            <li><a href="#kako-radi">Kako radi</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
        
        <div class="footer-links">
          <h4>Pravne informacije</h4>
          <ul>
            <li><a href="/uslovi-koriscenja">Uslovi koriscenja</a></li>
            <li><a href="/politika-privatnosti">Politika privatnosti</a></li>
          </ul>
        </div>
        
        <div class="footer-links">
          <h4>Kontakt</h4>
          <ul>
            <li><a href="mailto:podrska@vikendmajstor.rs">podrska@vikendmajstor.rs</a></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 VikendMajstor. Sva prava zadrzana.</p>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script>
    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const item = question.parentElement;
        item.classList.toggle('active');
      });
    });
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  </script>
</body>
</html>`;

// server/index.ts
import * as fs3 from "fs";
import * as path2 from "path";
import { scrypt as scrypt3, randomBytes as randomBytes3 } from "crypto";
import { promisify as promisify3 } from "util";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2 } from "path";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var scryptAsync3 = promisify3(scrypt3);
async function hashPasswordForAdmin(password) {
  const salt = randomBytes3(16).toString("hex");
  const buf = await scryptAsync3(password, salt, 64);
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
        isActive: true
      });
      console.log(`[ADMIN] Created admin account: ${adminEmail}`);
    } else if (!existingAdmin.isAdmin) {
      await storage.updateUserAdmin(existingAdmin.id, { isAdmin: true, isActive: true });
      console.log(`[ADMIN] Updated existing user to admin: ${adminEmail}`);
    }
  } catch (error) {
    console.error("[ADMIN] Error initializing admin account:", error);
  }
}
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    origins.add("https://vikendmajstor.rs");
    origins.add("https://www.vikendmajstor.rs");
    origins.add("https://app.vikendmajstor.rs");
    origins.add("https://api.vikendmajstor.rs");
    if (process.env.REPLIT_DEV_DOMAIN) {
      const baseDomain = process.env.REPLIT_DEV_DOMAIN;
      origins.add(`https://${baseDomain}`);
      const parts = baseDomain.split(".");
      if (parts.length >= 3) {
        for (const port of ["8081", "8082", "3000", "5173"]) {
          const portDomain = `${parts[0]}--${port}.${parts.slice(1).join(".")}`;
          origins.add(`https://${portDomain}`);
        }
      }
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    let isAllowed = origin && origins.has(origin);
    if (!isAllowed && origin && (origin.includes(".replit.dev") || origin.includes(".repl.co") || origin.includes("vikendmajstor.rs"))) {
      isAllowed = true;
    }
    if (isAllowed && origin) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
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
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path3.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path2.resolve(process.cwd(), "app.json");
    const appJsonContent = fs3.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path2.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs3.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs3.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const customLandingPath = path2.resolve(
    process.cwd(),
    "server",
    "landing",
    "index.html"
  );
  const adminPanelPath = path2.resolve(
    process.cwd(),
    "server",
    "admin",
    "index.html"
  );
  const landingPageTemplate = LANDING_PAGE_TEMPLATE;
  const appName = getAppName();
  const hasCustomLanding = fs3.existsSync(customLandingPath);
  const hasAdminPanel = fs3.existsSync(adminPanelPath);
  log("Serving static Expo files with dynamic manifest routing");
  if (hasAdminPanel) {
    app2.get("/admin", (_req, res) => {
      res.sendFile(adminPanelPath);
    });
    app2.get("/admin/*", (_req, res) => {
      res.sendFile(adminPanelPath);
    });
    log("Admin panel available at /admin");
  }
  app2.get("/favicon.png", (_req, res) => {
    const faviconPath = path2.resolve(process.cwd(), "server", "templates", "favicon.png");
    if (fs3.existsSync(faviconPath)) {
      res.sendFile(faviconPath);
    } else {
      res.status(404).send("Favicon not found");
    }
  });
  app2.get("/verify", (req, res) => {
    const token = req.query.token;
    if (token) {
      return res.redirect(`/api/auth/verify-email?token=${token}`);
    }
    res.redirect("/");
  });
  app2.get("/uslovi-koriscenja", (_req, res) => {
    const termsPath = path2.resolve(process.cwd(), "server", "templates", "terms.html");
    if (fs3.existsSync(termsPath)) {
      res.sendFile(termsPath);
    } else {
      res.status(404).send("Page not found");
    }
  });
  app2.get("/politika-privatnosti", (_req, res) => {
    const privacyPath = path2.resolve(process.cwd(), "server", "templates", "privacy.html");
    if (fs3.existsSync(privacyPath)) {
      res.sendFile(privacyPath);
    } else {
      res.status(404).send("Page not found");
    }
  });
  app2.use((req, res, next) => {
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
    const hostname = req.hostname || req.headers.host?.split(":")[0] || "";
    const isMainLandingDomain = hostname === "vikendmajstor.rs" || hostname === "www.vikendmajstor.rs";
    if (req.path === "/") {
      if (isMainLandingDomain) {
        if (hasCustomLanding) {
          return res.sendFile(customLandingPath);
        }
        return serveLandingPage({
          req,
          res,
          landingPageTemplate,
          appName
        });
      }
      return next();
    }
    next();
  });
  app2.use("/assets", express.static(path2.resolve(process.cwd(), "assets")));
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    const hostname = req.hostname || req.headers.host?.split(":")[0] || "";
    const isAppSubdomain = hostname === "app.vikendmajstor.rs" || hostname.includes("app.");
    if (isAppSubdomain) {
      const webBuildPath = path2.resolve(process.cwd(), "static-build", "web");
      return express.static(webBuildPath)(req, res, () => {
        const indexPath = path2.join(webBuildPath, "index.html");
        if (fs3.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
        next();
      });
    }
    next();
  });
  app2.use(express.static(path2.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, _next) => {
    const error = err;
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
  await initializeAdminAccount();
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
