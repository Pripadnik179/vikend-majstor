import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["owner", "renter"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "active", "completed", "cancelled"]);
export const subscriptionTypeEnum = pgEnum("subscription_type", ["free", "basic", "premium"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "expired", "cancelled"]);

export const users = pgTable("users", {
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
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  documentVerified: boolean("document_verified").default(false).notNull(),
  documentUrl: text("document_url"),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  type: text("type").notNull().default("email"),
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

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: subscriptionTypeEnum("type").notNull(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  priceRsd: integer("price_rsd").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const items = pgTable("items", {
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

export const bookings = pgTable("bookings", {
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

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  itemId: varchar("item_id").references(() => items.id),
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

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
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

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  itemId: varchar("item_id").notNull().references(() => items.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  revieweeId: varchar("reviewee_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
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

// Subscription plans - admin can manage
export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  priceRsd: integer("price_rsd").notNull(),
  durationDays: integer("duration_days").notNull().default(30),
  maxAds: integer("max_ads"),
  features: text("features").array(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Item views tracking
export const itemViews = pgTable("item_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => items.id, { onDelete: 'cascade' }),
  viewerId: varchar("viewer_id").references(() => users.id),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const itemViewsRelations = relations(itemViews, ({ one }) => ({
  item: one(items, {
    fields: [itemViews.itemId],
    references: [items.id],
  }),
  viewer: one(users, {
    fields: [itemViews.viewerId],
    references: [users.id],
  }),
}));

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type ItemView = typeof itemViews.$inferSelect;

export const emailSubscribers = pgTable("email_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  source: text("source").default("landing_page"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailSubscriberSchema = createInsertSchema(emailSubscribers).omit({
  id: true,
  createdAt: true,
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = z.infer<typeof insertEmailSubscriberSchema>;

// Admin logs - tracking admin actions
export const adminLogs = pgTable("admin_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

// User activity logs
export const userActivityLogs = pgTable("user_activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userActivityLogsRelations = relations(userActivityLogs, ({ one }) => ({
  user: one(users, {
    fields: [userActivityLogs.userId],
    references: [users.id],
  }),
}));

// Reported items
export const reportedItems = pgTable("reported_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => items.id),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reportedItemsRelations = relations(reportedItems, ({ one }) => ({
  item: one(items, {
    fields: [reportedItems.itemId],
    references: [items.id],
  }),
  reporter: one(users, {
    fields: [reportedItems.reporterId],
    references: [users.id],
  }),
}));

// Feature toggles
export const featureToggles = pgTable("feature_toggles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  enabledForPercentage: integer("enabled_for_percentage").default(100),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin notifications sent
export const adminNotifications = pgTable("admin_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetType: text("target_type"),
  targetIds: text("target_ids").array(),
  sentCount: integer("sent_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type ReportedItem = typeof reportedItems.$inferSelect;
export type FeatureToggle = typeof featureToggles.$inferSelect;
export type AdminNotification = typeof adminNotifications.$inferSelect;
