import { sql, relations } from "drizzle-orm";
import { mysqlTable, text, varchar, int, timestamp, decimal, boolean, mysqlEnum, json } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  avatarUrl: text("avatar_url"),
  role: mysqlEnum("role", ["owner", "renter"]).default("renter").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  totalRatings: int("total_ratings").default(0),
  emailVerified: boolean("email_verified").default(false).notNull(),
  subscriptionType: mysqlEnum("subscription_type", ["free", "basic", "premium"]).default("free").notNull(),
  subscriptionStatus: mysqlEnum("subscription_status", ["active", "expired", "cancelled"]).default("active").notNull(),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  isEarlyAdopter: boolean("is_early_adopter").default(false).notNull(),
  isPremiumListing: boolean("is_premium_listing").default(false).notNull(),
  premiumListingEndDate: timestamp("premium_listing_end_date"),
  freeFeatureUsed: boolean("free_feature_used").default(false).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  totalAdsCreated: int("total_ads_created").default(0).notNull(),
  pushToken: text("push_token"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationTokens = mysqlTable("verification_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  token: varchar("token", { length: 255 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull().default("email"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  items: many(items),
  bookingsAsRenter: many(bookings, { relationName: "renterBookings" }),
  bookingsAsOwner: many(bookings, { relationName: "ownerBookings" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  reviews: many(reviews),
  subscriptions: many(subscriptions),
}));

export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  type: mysqlEnum("type", ["free", "basic", "premium"]).notNull(),
  status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
  priceRsd: int("price_rsd").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const items = mysqlTable("items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 36 }).notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  subCategory: varchar("sub_category", { length: 100 }),
  toolType: varchar("tool_type", { length: 100 }),
  toolSubType: varchar("tool_sub_type", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  powerSource: varchar("power_source", { length: 100 }),
  powerWatts: int("power_watts"),
  pricePerDay: int("price_per_day").notNull(),
  deposit: int("deposit").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  district: varchar("district", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  images: json("images").$type<string[]>().default([]),
  adType: varchar("ad_type", { length: 50 }).notNull().default("renting"),
  isAvailable: boolean("is_available").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  totalRatings: int("total_ratings").default(0),
  expiresAt: timestamp("expires_at"),
  activityTags: json("activity_tags").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const itemsRelations = relations(items, ({ one, many }) => ({
  owner: one(users, {
    fields: [items.ownerId],
    references: [users.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookings = mysqlTable("bookings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  itemId: varchar("item_id", { length: 36 }).notNull().references(() => items.id),
  renterId: varchar("renter_id", { length: 36 }).notNull().references(() => users.id),
  ownerId: varchar("owner_id", { length: 36 }).notNull().references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: int("total_days").notNull(),
  totalPrice: int("total_price").notNull(),
  deposit: int("deposit").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "active", "completed", "cancelled"]).default("pending").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default("cash"),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  pickupConfirmed: boolean("pickup_confirmed").default(false),
  returnConfirmed: boolean("return_confirmed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  item: one(items, {
    fields: [bookings.itemId],
    references: [items.id],
  }),
  renter: one(users, {
    fields: [bookings.renterId],
    references: [users.id],
    relationName: "renterBookings",
  }),
  owner: one(users, {
    fields: [bookings.ownerId],
    references: [users.id],
    relationName: "ownerBookings",
  }),
}));

export const conversations = mysqlTable("conversations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  user1Id: varchar("user1_id", { length: 36 }).notNull().references(() => users.id),
  user2Id: varchar("user2_id", { length: 36 }).notNull().references(() => users.id),
  itemId: varchar("item_id", { length: 36 }).references(() => items.id),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user1: one(users, {
    fields: [conversations.user1Id],
    references: [users.id],
  }),
  user2: one(users, {
    fields: [conversations.user2Id],
    references: [users.id],
  }),
  item: one(items, {
    fields: [conversations.itemId],
    references: [items.id],
  }),
  messages: many(messages),
}));

export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 36 }).notNull().references(() => conversations.id),
  senderId: varchar("sender_id", { length: 36 }).notNull().references(() => users.id),
  receiverId: varchar("receiver_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey(),
  bookingId: varchar("booking_id", { length: 36 }).notNull().references(() => bookings.id),
  itemId: varchar("item_id", { length: 36 }).notNull().references(() => items.id),
  reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id", { length: 36 }).notNull().references(() => users.id),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  item: one(items, {
    fields: [reviews.itemId],
    references: [items.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  rating: true,
  totalRatings: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  totalRatings: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type VerificationToken = typeof verificationTokens.$inferSelect;

export const CATEGORIES = {
  byProject: {
    gradjevinarstvo: {
      name: "Građevinarstvo",
      subcategories: ["Betoniranje", "Zidanje", "Rušenje", "Armiranje", "Fasaderski radovi"]
    },
    basta: {
      name: "Bašta",
      subcategories: ["Košenje", "Orezivanje", "Kopanje", "Navodnjavanje", "Čišćenje"]
    },
    renoviranje: {
      name: "Renoviranje",
      subcategories: ["Keramika", "Podovi", "Malterisanje", "Gipsarija", "Farbanje"]
    },
    drvoprerađivanje: {
      name: "Obrada drveta",
      subcategories: ["Tesarenje", "Stolarija", "Rezanje", "Brušenje", "Glodanje"]
    },
    autoMehanika: {
      name: "Auto-mehanika",
      subcategories: ["Dijagnostika", "Vulkanizerstvo", "Lakiranje", "Poliranje", "Servisiranje"]
    },
    ciscenje: {
      name: "Čišćenje",
      subcategories: ["Pranje pod pritiskom", "Usisavanje", "Parno čišćenje", "Industrijska čišćenja"]
    }
  },
  byToolType: {
    elektricni: {
      name: "Električni alati",
      subcategories: ["Bušilice", "Brusilice", "Testere", "Rendei", "Glodalice"]
    },
    akumulatorski: {
      name: "Akumulatorski alati",
      subcategories: ["Bušilice", "Odvijači", "Brusilice", "Pile", "Višenamjenski"]
    },
    rucni: {
      name: "Ručni alati",
      subcategories: ["Čekići", "Klešta", "Odvijači", "Ključevi", "Testeri"]
    },
    pneumatski: {
      name: "Pneumatski alati",
      subcategories: ["Pištolji", "Bušilice", "Brusilice", "Kompresori", "Prskalice"]
    },
    gradevinskemasine: {
      name: "Građevinske mašine",
      subcategories: ["Mini bageri", "Vibroploci", "Mešalice", "Agregati", "Skele"]
    },
    merniLaserski: {
      name: "Merni/laserski",
      subcategories: ["Laseri", "Niveliri", "Detektori", "Merni metri", "Multimetri"]
    }
  }
};

export const POWER_SOURCES = ["Električni (struja)", "Akumulator", "Benzinski", "Dizel", "Pneumatski", "Ručni"];

export const ACTIVITIES = [
  "Renoviranje kupatila",
  "Renoviranje kuhinje",
  "Baštenski radovi",
  "Stolarski radovi",
  "Električarski radovi",
  "Vodoinstalaterski radovi",
  "Farbanje i dekoracija",
  "Montaža nameštaja",
  "Popravke u domaćinstvu",
  "Zidarski radovi",
  "Keramičarski radovi",
  "Podopolaganje",
];

export const SUBSCRIPTION_PRICES = {
  basic: 500,
  premium: 1000,
  earlyAdopterFreeDays: 30,
  maxEarlyAdopters: 100
};
