import { sql, relations } from "drizzle-orm";
import { mysqlTable, text, varchar, int, timestamp, decimal, boolean, json, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = mysqlEnum("role", ["owner", "renter"]);
export const bookingStatusEnum = mysqlEnum("status", ["pending", "confirmed", "active", "completed", "cancelled"]);
export const subscriptionTypeEnum = mysqlEnum("subscription_type", ["free", "basic", "premium"]);
export const subscriptionStatusEnum = mysqlEnum("subscription_status", ["active", "expired", "cancelled"]);

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  city: text("city"),
  district: text("district"),
  avatarUrl: text("avatar_url"),
  role: mysqlEnum("role", ["owner", "renter"]).default("renter").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  totalRatings: int("total_ratings").default(0),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  documentVerified: boolean("document_verified").default(false).notNull(),
  documentUrl: text("document_url"),
  subscriptionType: mysqlEnum("subscription_type", ["free", "basic", "premium"]).default("free").notNull(),
  subscriptionStatus: mysqlEnum("subscription_status", ["active", "expired", "cancelled"]).default("active").notNull(),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  isEarlyAdopter: boolean("is_early_adopter").default(false).notNull(),
  isPremiumListing: boolean("is_premium_listing").default(false).notNull(),
  premiumListingEndDate: timestamp("premium_listing_end_date"),
  freeFeatureUsed: boolean("free_feature_used").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  totalAdsCreated: int("total_ads_created").default(0).notNull(),
  pushToken: text("push_token"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationTokens = mysqlTable("verification_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  token: varchar("token", { length: 255 }).notNull().unique(),
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

export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  type: mysqlEnum("type", ["free", "basic", "premium"]).notNull(),
  status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
  priceRsd: int("price_rsd").notNull(),
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

export const items = mysqlTable("items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  ownerId: varchar("owner_id", { length: 36 }).notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  subCategory: text("sub_category"),
  categoryId: varchar("category_id", { length: 36 }),
  subcategoryId: varchar("subcategory_id", { length: 36 }),
  toolType: text("tool_type"),
  toolSubType: text("tool_sub_type"),
  brand: text("brand"),
  powerSource: text("power_source"),
  powerWatts: int("power_watts"),
  pricePerDay: int("price_per_day").notNull(),
  deposit: int("deposit").notNull(),
  city: text("city").notNull(),
  district: text("district"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  images: json("images").$type<string[]>().notNull().default([]),
  adType: text("ad_type").notNull().default("renting"),
  isAvailable: boolean("is_available").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  totalRatings: int("total_ratings").default(0),
  expiresAt: timestamp("expires_at"),
  activityTags: json("activity_tags").$type<string[]>(),
  userType: text("user_type").default("diy"),
  rentalPeriod: text("rental_period").default("dan"),
  hasDeposit: boolean("has_deposit").default(true),
  hasDelivery: boolean("has_delivery").default(false),
  weight: decimal("weight", { precision: 6, scale: 2 }),
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
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  itemId: varchar("item_id", { length: 36 }).notNull().references(() => items.id),
  renterId: varchar("renter_id", { length: 36 }).notNull().references(() => users.id),
  ownerId: varchar("owner_id", { length: 36 }).notNull().references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: int("total_days").notNull(),
  totalPrice: int("total_price").notNull(),
  deposit: int("deposit").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "active", "completed", "cancelled"]).default("pending").notNull(),
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

export const conversations = mysqlTable("conversations", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
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
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
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
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
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

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  icon: text("icon"),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subcategories = mysqlTable("subcategories", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  categoryId: varchar("category_id", { length: 36 }).notNull().references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  items: many(items),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  items: many(items),
}));

export type Category = typeof categories.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;

export const PREDEFINED_CATEGORIES = {
  elektricni: {
    name: "Električni alati",
    slug: "elektricni-alati",
    subcategories: [
      { name: "Bušilice", slug: "busilice" },
      { name: "Brusilice", slug: "brusilice" },
      { name: "Testere", slug: "testere" },
      { name: "Štemari", slug: "stemari" },
      { name: "Rendei", slug: "rendei" },
      { name: "Glodalice", slug: "glodalice" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  akumulatorski: {
    name: "Akumulatorski (aku) alati",
    slug: "akumulatorski-alati",
    subcategories: [
      { name: "Aku bušilice / odvijači", slug: "aku-busilice-odvijaci" },
      { name: "Aku brusilice", slug: "aku-brusilice" },
      { name: "Aku testere", slug: "aku-testere" },
      { name: "Aku višenamjenski", slug: "aku-visenamjenski" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  rucni: {
    name: "Ručni alati",
    slug: "rucni-alati",
    subcategories: [
      { name: "Čekići", slug: "cekici" },
      { name: "Klešta", slug: "klesta" },
      { name: "Odvijači", slug: "odvijaci" },
      { name: "Ključevi", slug: "kljucevi" },
      { name: "Testeri (ručni)", slug: "testeri-rucni" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  bastenski: {
    name: "Baštenski alati i oprema",
    slug: "bastenski-alati",
    subcategories: [
      { name: "Kosilice", slug: "kosilice" },
      { name: "Trimeri", slug: "trimeri" },
      { name: "Lančane testere", slug: "lancane-testere" },
      { name: "Duvači lišća", slug: "duvaci-lisca" },
      { name: "Kultivatori", slug: "kultivatori" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  betonski: {
    name: "Mašine za beton i teške radove",
    slug: "masine-beton-teski-radovi",
    subcategories: [
      { name: "Betonijeri", slug: "betonijeri" },
      { name: "Vibroploče", slug: "vibroploce" },
      { name: "Štemači / čekić bušilice", slug: "stemaci-cekic-busilice" },
      { name: "Mašine za sečenje", slug: "masine-za-secenje" },
      { name: "Agregati", slug: "agregati" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  stolarski: {
    name: "Stolarski i obrada materijala",
    slug: "stolarski-obrada-materijala",
    subcategories: [
      { name: "Stoni rendei", slug: "stoni-rendei" },
      { name: "Stoni brusilice", slug: "stoni-brusilice" },
      { name: "CNC i glodalice", slug: "cnc-glodalice" },
      { name: "Stolarsko lepljenje", slug: "stolarsko-lepljenje" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  auto: {
    name: "Auto i servis",
    slug: "auto-servis",
    subcategories: [
      { name: "Dijagnostika", slug: "dijagnostika" },
      { name: "Hidraulične dizalice", slug: "hidraulicne-dizalice" },
      { name: "Vulkanizerska oprema", slug: "vulkanizerska-oprema" },
      { name: "Lakiranje/poliranje", slug: "lakiranje-poliranje" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  merni: {
    name: "Merni alati i oprema",
    slug: "merni-alati-oprema",
    subcategories: [
      { name: "Laserski niveliri", slug: "laserski-niveliri" },
      { name: "Detektori", slug: "detektori" },
      { name: "Multimetri", slug: "multimetri" },
      { name: "Merni metri", slug: "merni-metri" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  sigurnosna: {
    name: "Sigurnosna i zaštitna oprema",
    slug: "sigurnosna-zastitna-oprema",
    subcategories: [
      { name: "Kacige", slug: "kacige" },
      { name: "Zaštitne naočare", slug: "zastitne-naocare" },
      { name: "Rukavice", slug: "rukavice" },
      { name: "Odelo za rad", slug: "odelo-za-rad" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  ciscenje: {
    name: "Oprema za čišćenje",
    slug: "oprema-za-ciscenje",
    subcategories: [
      { name: "Perači pod pritiskom", slug: "peraci-pod-pritiskom" },
      { name: "Usisivači", slug: "usisivaci" },
      { name: "Parni čistači", slug: "parni-cistaci" },
      { name: "Industrijski usisivači", slug: "industrijski-usisivaci" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  ostalo: {
    name: "Ostalo / Specijalni alati",
    slug: "ostalo-specijalni-alati",
    subcategories: [
      { name: "Specijalni alati", slug: "specijalni-alati" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  vodoinstalaterski: {
    name: "Vodoinstalaterski alati",
    slug: "vodoinstalaterski-alati",
    subcategories: [
      { name: "Ključevi za cevi", slug: "kljucevi-za-cevi" },
      { name: "Oprema za lemljenje cevi", slug: "oprema-za-lemljenje" },
      { name: "Čistači odvoda", slug: "cistaci-odvoda" },
      { name: "Kamere za inspekciju", slug: "kamere-za-inspekciju" },
      { name: "Pres klešta", slug: "pres-klesta" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  elektroinstalaterski: {
    name: "Elektroinstalaterski alati",
    slug: "elektroinstalaterski-alati",
    subcategories: [
      { name: "Klešta za kablove", slug: "klesta-za-kablove" },
      { name: "Detektori kablova", slug: "detektori-kablova" },
      { name: "Oprema za uvlačenje kablova", slug: "oprema-za-uvlacenje" },
      { name: "Ispitivači instalacija", slug: "ispitivaci-instalacija" },
      { name: "Štemalice za zidove", slug: "stemalice-za-zidove" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  farbanje: {
    name: "Alati za farbanje i dekoraciju",
    slug: "alati-farbanje-dekoracija",
    subcategories: [
      { name: "Kompresori za farbanje", slug: "kompresori-za-farbanje" },
      { name: "Airless prskalice", slug: "airless-prskalice" },
      { name: "Brusilice za zidove", slug: "brusilice-za-zidove" },
      { name: "Stepenice i merdevine", slug: "stepenice-merdevine" },
      { name: "Mešalice za boje", slug: "mesalice-za-boje" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  grejanje_klima: {
    name: "Alati za grejanje i klimatizaciju",
    slug: "alati-grejanje-klima",
    subcategories: [
      { name: "Vakuum pumpe", slug: "vakuum-pumpe" },
      { name: "Manometri", slug: "manometri" },
      { name: "Detektori curenja", slug: "detektori-curenja" },
      { name: "Oprema za punjenje", slug: "oprema-za-punjenje" },
      { name: "Lemilice za bakar", slug: "lemilice-za-bakar" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  podovi: {
    name: "Alati za podove",
    slug: "alati-za-podove",
    subcategories: [
      { name: "Brusilice za parket", slug: "brusilice-za-parket" },
      { name: "Mašine za postavljanje", slug: "masine-za-postavljanje" },
      { name: "Rezači pločica", slug: "rezaci-plocica" },
      { name: "Lakirke za podove", slug: "lakirke-za-podove" },
      { name: "Vibro letve", slug: "vibro-letve" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  krov_fasada: {
    name: "Alati za krov i fasadu",
    slug: "alati-krov-fasada",
    subcategories: [
      { name: "Skele", slug: "skele" },
      { name: "Ljestve", slug: "ljestve" },
      { name: "Oprema za krovopokrivače", slug: "oprema-krovopokrivaci" },
      { name: "Fasaderska oprema", slug: "fasaderska-oprema" },
      { name: "Dizalice za materijal", slug: "dizalice-za-materijal" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
  pumpe_voda: {
    name: "Pumpe i oprema za vodu",
    slug: "pumpe-oprema-voda",
    subcategories: [
      { name: "Potapajuće pumpe", slug: "potapajuce-pumpe" },
      { name: "Baštenske pumpe", slug: "bastenske-pumpe" },
      { name: "Pumpe visokog pritiska", slug: "pumpe-visokog-pritiska" },
      { name: "Creva i priključci", slug: "creva-prikljucci" },
      { name: "Cisterne za vodu", slug: "cisterne-za-vodu" },
      { name: "Ostalo", slug: "ostalo" },
    ]
  },
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

export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  priceRsd: int("price_rsd").notNull(),
  durationDays: int("duration_days").notNull().default(30),
  maxAds: int("max_ads"),
  features: json("features").$type<string[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const itemViews = mysqlTable("item_views", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  itemId: varchar("item_id", { length: 36 }).notNull().references(() => items.id),
  viewerId: varchar("viewer_id", { length: 36 }).references(() => users.id),
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

export const reportedUsers = mysqlTable("reported_users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  reporterId: varchar("reporter_id", { length: 36 }).notNull().references(() => users.id),
  reportedUserId: varchar("reported_user_id", { length: 36 }).notNull().references(() => users.id),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  resolvedBy: varchar("resolved_by", { length: 36 }).references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reportedUsersRelations = relations(reportedUsers, ({ one }) => ({
  reporter: one(users, {
    fields: [reportedUsers.reporterId],
    references: [users.id],
    relationName: "reporterUser",
  }),
  reportedUser: one(users, {
    fields: [reportedUsers.reportedUserId],
    references: [users.id],
    relationName: "reportedUser",
  }),
  resolver: one(users, {
    fields: [reportedUsers.resolvedBy],
    references: [users.id],
    relationName: "resolverUser",
  }),
}));

export const serverErrorLogs = mysqlTable("server_error_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  level: text("level").notNull().default("error"),
  message: text("message").notNull(),
  stack: text("stack"),
  endpoint: text("endpoint"),
  method: text("method"),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const admin2fa = mysqlTable("admin_2fa", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  secret: text("secret").notNull(),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  backupCodes: json("backup_codes").$type<string[]>(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appVersions = mysqlTable("app_versions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  platform: text("platform").notNull(),
  version: text("version").notNull(),
  buildNumber: int("build_number"),
  releaseNotes: text("release_notes"),
  isRequired: boolean("is_required").default(false).notNull(),
  downloadUrl: text("download_url"),
  releasedAt: timestamp("released_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ReportedUser = typeof reportedUsers.$inferSelect;
export type ServerErrorLog = typeof serverErrorLogs.$inferSelect;
export type Admin2FA = typeof admin2fa.$inferSelect;
export type AppVersion = typeof appVersions.$inferSelect;

export const emailSubscribers = mysqlTable("email_subscribers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull().unique(),
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

export const adminLogs = mysqlTable("admin_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  adminId: varchar("admin_id", { length: 36 }).notNull().references(() => users.id),
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

export const userActivityLogs = mysqlTable("user_activity_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
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

export const reportedItems = mysqlTable("reported_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  itemId: varchar("item_id", { length: 36 }).notNull().references(() => items.id),
  reporterId: varchar("reporter_id", { length: 36 }).notNull().references(() => users.id),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(),
  resolvedBy: varchar("resolved_by", { length: 36 }).references(() => users.id),
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

export const featureToggles = mysqlTable("feature_toggles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  enabledForPercentage: int("enabled_for_percentage").default(100),
  updatedBy: varchar("updated_by", { length: 36 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const adminNotifications = mysqlTable("admin_notifications", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  adminId: varchar("admin_id", { length: 36 }).notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetType: text("target_type"),
  targetIds: json("target_ids").$type<string[]>(),
  sentCount: int("sent_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sentRemindersLog = mysqlTable("sent_reminders_log", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  bookingId: varchar("booking_id", { length: 36 }).notNull().references(() => bookings.id),
  reminderType: text("reminder_type").notNull(),
  sentDate: text("sent_date").notNull(),
  reminderKey: varchar("reminder_key", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;
export type ReportedItem = typeof reportedItems.$inferSelect;
export type FeatureToggle = typeof featureToggles.$inferSelect;
export type AdminNotification = typeof adminNotifications.$inferSelect;
export type SentReminderLog = typeof sentRemindersLog.$inferSelect;
