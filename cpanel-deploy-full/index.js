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
  POWER_SOURCES: () => POWER_SOURCES,
  PREDEFINED_CATEGORIES: () => PREDEFINED_CATEGORIES,
  SUBSCRIPTION_PRICES: () => SUBSCRIPTION_PRICES,
  admin2fa: () => admin2fa,
  adminLogs: () => adminLogs,
  adminLogsRelations: () => adminLogsRelations,
  adminNotifications: () => adminNotifications,
  appVersions: () => appVersions,
  bookingStatusEnum: () => bookingStatusEnum,
  bookings: () => bookings,
  bookingsRelations: () => bookingsRelations,
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  emailSubscribers: () => emailSubscribers,
  featureToggles: () => featureToggles,
  insertBookingSchema: () => insertBookingSchema,
  insertEmailSubscriberSchema: () => insertEmailSubscriberSchema,
  insertItemSchema: () => insertItemSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertSubscriptionSchema: () => insertSubscriptionSchema,
  insertUserSchema: () => insertUserSchema,
  itemViews: () => itemViews,
  itemViewsRelations: () => itemViewsRelations,
  items: () => items,
  itemsRelations: () => itemsRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  reportedItems: () => reportedItems,
  reportedItemsRelations: () => reportedItemsRelations,
  reportedUsers: () => reportedUsers,
  reportedUsersRelations: () => reportedUsersRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  sentRemindersLog: () => sentRemindersLog,
  serverErrorLogs: () => serverErrorLogs,
  subcategories: () => subcategories,
  subcategoriesRelations: () => subcategoriesRelations,
  subscriptionPlans: () => subscriptionPlans,
  subscriptionStatusEnum: () => subscriptionStatusEnum,
  subscriptionTypeEnum: () => subscriptionTypeEnum,
  subscriptions: () => subscriptions,
  subscriptionsRelations: () => subscriptionsRelations,
  userActivityLogs: () => userActivityLogs,
  userActivityLogsRelations: () => userActivityLogsRelations,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations,
  verificationTokens: () => verificationTokens,
  verificationTokensRelations: () => verificationTokensRelations
});
import { sql, relations } from "drizzle-orm";
import { mysqlTable, text, varchar, int, timestamp, decimal, boolean, json, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
var userRoleEnum, bookingStatusEnum, subscriptionTypeEnum, subscriptionStatusEnum, users, verificationTokens, verificationTokensRelations, usersRelations, subscriptions, subscriptionsRelations, items, itemsRelations, bookings, bookingsRelations, conversations, conversationsRelations, messages, messagesRelations, reviews, reviewsRelations, insertUserSchema, insertItemSchema, insertBookingSchema, insertMessageSchema, insertReviewSchema, insertSubscriptionSchema, categories, subcategories, categoriesRelations, subcategoriesRelations, PREDEFINED_CATEGORIES, POWER_SOURCES, ACTIVITIES, SUBSCRIPTION_PRICES, subscriptionPlans, itemViews, itemViewsRelations, reportedUsers, reportedUsersRelations, serverErrorLogs, admin2fa, appVersions, emailSubscribers, insertEmailSubscriberSchema, adminLogs, adminLogsRelations, userActivityLogs, userActivityLogsRelations, reportedItems, reportedItemsRelations, featureToggles, adminNotifications, sentRemindersLog;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    userRoleEnum = mysqlEnum("role", ["owner", "renter"]);
    bookingStatusEnum = mysqlEnum("status", ["pending", "confirmed", "active", "completed", "cancelled"]);
    subscriptionTypeEnum = mysqlEnum("subscription_type", ["free", "basic", "premium"]);
    subscriptionStatusEnum = mysqlEnum("subscription_status", ["active", "expired", "cancelled"]);
    users = mysqlTable("users", {
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
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    verificationTokens = mysqlTable("verification_tokens", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
      token: varchar("token", { length: 255 }).notNull().unique(),
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
    subscriptions = mysqlTable("subscriptions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
      type: mysqlEnum("type", ["free", "basic", "premium"]).notNull(),
      status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
      priceRsd: int("price_rsd").notNull(),
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
    items = mysqlTable("items", {
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
      images: json("images").$type().notNull().default([]),
      adType: text("ad_type").notNull().default("renting"),
      isAvailable: boolean("is_available").default(true).notNull(),
      isFeatured: boolean("is_featured").default(false).notNull(),
      rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
      totalRatings: int("total_ratings").default(0),
      expiresAt: timestamp("expires_at"),
      activityTags: json("activity_tags").$type(),
      userType: text("user_type").default("diy"),
      rentalPeriod: text("rental_period").default("dan"),
      hasDeposit: boolean("has_deposit").default(true),
      hasDelivery: boolean("has_delivery").default(false),
      weight: decimal("weight", { precision: 6, scale: 2 }),
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
    bookings = mysqlTable("bookings", {
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
    conversations = mysqlTable("conversations", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      user1Id: varchar("user1_id", { length: 36 }).notNull().references(() => users.id),
      user2Id: varchar("user2_id", { length: 36 }).notNull().references(() => users.id),
      itemId: varchar("item_id", { length: 36 }).references(() => items.id),
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
    messages = mysqlTable("messages", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      conversationId: varchar("conversation_id", { length: 36 }).notNull().references(() => conversations.id),
      senderId: varchar("sender_id", { length: 36 }).notNull().references(() => users.id),
      receiverId: varchar("receiver_id", { length: 36 }).notNull().references(() => users.id),
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
    reviews = mysqlTable("reviews", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      bookingId: varchar("booking_id", { length: 36 }).notNull().references(() => bookings.id),
      itemId: varchar("item_id", { length: 36 }).notNull().references(() => items.id),
      reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
      revieweeId: varchar("reviewee_id", { length: 36 }).notNull().references(() => users.id),
      rating: int("rating").notNull(),
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
    categories = mysqlTable("categories", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      name: varchar("name", { length: 255 }).notNull().unique(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      icon: text("icon"),
      sortOrder: int("sort_order").default(0),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    subcategories = mysqlTable("subcategories", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      categoryId: varchar("category_id", { length: 36 }).notNull().references(() => categories.id),
      name: text("name").notNull(),
      slug: text("slug").notNull(),
      icon: text("icon"),
      sortOrder: int("sort_order").default(0),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    categoriesRelations = relations(categories, ({ many }) => ({
      subcategories: many(subcategories),
      items: many(items)
    }));
    subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
      category: one(categories, {
        fields: [subcategories.categoryId],
        references: [categories.id]
      }),
      items: many(items)
    }));
    PREDEFINED_CATEGORIES = {
      elektricni: {
        name: "Elektri\u010Dni alati",
        slug: "elektricni-alati",
        subcategories: [
          { name: "Bu\u0161ilice", slug: "busilice" },
          { name: "Brusilice", slug: "brusilice" },
          { name: "Testere", slug: "testere" },
          { name: "\u0160temari", slug: "stemari" },
          { name: "Rendei", slug: "rendei" },
          { name: "Glodalice", slug: "glodalice" },
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      akumulatorski: {
        name: "Akumulatorski (aku) alati",
        slug: "akumulatorski-alati",
        subcategories: [
          { name: "Aku bu\u0161ilice / odvija\u010Di", slug: "aku-busilice-odvijaci" },
          { name: "Aku brusilice", slug: "aku-brusilice" },
          { name: "Aku testere", slug: "aku-testere" },
          { name: "Aku vi\u0161enamjenski", slug: "aku-visenamjenski" },
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      rucni: {
        name: "Ru\u010Dni alati",
        slug: "rucni-alati",
        subcategories: [
          { name: "\u010Ceki\u0107i", slug: "cekici" },
          { name: "Kle\u0161ta", slug: "klesta" },
          { name: "Odvija\u010Di", slug: "odvijaci" },
          { name: "Klju\u010Devi", slug: "kljucevi" },
          { name: "Testeri (ru\u010Dni)", slug: "testeri-rucni" },
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      bastenski: {
        name: "Ba\u0161tenski alati i oprema",
        slug: "bastenski-alati",
        subcategories: [
          { name: "Kosilice", slug: "kosilice" },
          { name: "Trimeri", slug: "trimeri" },
          { name: "Lan\u010Dane testere", slug: "lancane-testere" },
          { name: "Duva\u010Di li\u0161\u0107a", slug: "duvaci-lisca" },
          { name: "Kultivatori", slug: "kultivatori" },
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      betonski: {
        name: "Ma\u0161ine za beton i te\u0161ke radove",
        slug: "masine-beton-teski-radovi",
        subcategories: [
          { name: "Betonijeri", slug: "betonijeri" },
          { name: "Vibroplo\u010De", slug: "vibroploce" },
          { name: "\u0160tema\u010Di / \u010Deki\u0107 bu\u0161ilice", slug: "stemaci-cekic-busilice" },
          { name: "Ma\u0161ine za se\u010Denje", slug: "masine-za-secenje" },
          { name: "Agregati", slug: "agregati" },
          { name: "Ostalo", slug: "ostalo" }
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
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      auto: {
        name: "Auto i servis",
        slug: "auto-servis",
        subcategories: [
          { name: "Dijagnostika", slug: "dijagnostika" },
          { name: "Hidrauli\u010Dne dizalice", slug: "hidraulicne-dizalice" },
          { name: "Vulkanizerska oprema", slug: "vulkanizerska-oprema" },
          { name: "Lakiranje/poliranje", slug: "lakiranje-poliranje" },
          { name: "Ostalo", slug: "ostalo" }
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
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      sigurnosna: {
        name: "Sigurnosna i za\u0161titna oprema",
        slug: "sigurnosna-zastitna-oprema",
        subcategories: [
          { name: "Kacige", slug: "kacige" },
          { name: "Za\u0161titne nao\u010Dare", slug: "zastitne-naocare" },
          { name: "Rukavice", slug: "rukavice" },
          { name: "Odelo za rad", slug: "odelo-za-rad" },
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      ciscenje: {
        name: "Oprema za \u010Di\u0161\u0107enje",
        slug: "oprema-za-ciscenje",
        subcategories: [
          { name: "Pera\u010Di pod pritiskom", slug: "peraci-pod-pritiskom" },
          { name: "Usisiva\u010Di", slug: "usisivaci" },
          { name: "Parni \u010Dista\u010Di", slug: "parni-cistaci" },
          { name: "Industrijski usisiva\u010Di", slug: "industrijski-usisivaci" },
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      ostalo: {
        name: "Ostalo / Specijalni alati",
        slug: "ostalo-specijalni-alati",
        subcategories: [
          { name: "Specijalni alati", slug: "specijalni-alati" },
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      vodoinstalaterski: {
        name: "Vodoinstalaterski alati",
        slug: "vodoinstalaterski-alati",
        subcategories: [
          { name: "Klju\u010Devi za cevi", slug: "kljucevi-za-cevi" },
          { name: "Oprema za lemljenje cevi", slug: "oprema-za-lemljenje" },
          { name: "\u010Cista\u010Di odvoda", slug: "cistaci-odvoda" },
          { name: "Kamere za inspekciju", slug: "kamere-za-inspekciju" },
          { name: "Pres kle\u0161ta", slug: "pres-klesta" },
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      elektroinstalaterski: {
        name: "Elektroinstalaterski alati",
        slug: "elektroinstalaterski-alati",
        subcategories: [
          { name: "Kle\u0161ta za kablove", slug: "klesta-za-kablove" },
          { name: "Detektori kablova", slug: "detektori-kablova" },
          { name: "Oprema za uvla\u010Denje kablova", slug: "oprema-za-uvlacenje" },
          { name: "Ispitiva\u010Di instalacija", slug: "ispitivaci-instalacija" },
          { name: "\u0160temalice za zidove", slug: "stemalice-za-zidove" },
          { name: "Ostalo", slug: "ostalo" }
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
          { name: "Me\u0161alice za boje", slug: "mesalice-za-boje" },
          { name: "Ostalo", slug: "ostalo" }
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
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      podovi: {
        name: "Alati za podove",
        slug: "alati-za-podove",
        subcategories: [
          { name: "Brusilice za parket", slug: "brusilice-za-parket" },
          { name: "Ma\u0161ine za postavljanje", slug: "masine-za-postavljanje" },
          { name: "Reza\u010Di plo\u010Dica", slug: "rezaci-plocica" },
          { name: "Lakirke za podove", slug: "lakirke-za-podove" },
          { name: "Vibro letve", slug: "vibro-letve" },
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      krov_fasada: {
        name: "Alati za krov i fasadu",
        slug: "alati-krov-fasada",
        subcategories: [
          { name: "Skele", slug: "skele" },
          { name: "Ljestve", slug: "ljestve" },
          { name: "Oprema za krovopokriva\u010De", slug: "oprema-krovopokrivaci" },
          { name: "Fasaderska oprema", slug: "fasaderska-oprema" },
          { name: "Dizalice za materijal", slug: "dizalice-za-materijal" },
          { name: "Ostalo", slug: "ostalo" }
        ]
      },
      pumpe_voda: {
        name: "Pumpe i oprema za vodu",
        slug: "pumpe-oprema-voda",
        subcategories: [
          { name: "Potapaju\u0107e pumpe", slug: "potapajuce-pumpe" },
          { name: "Ba\u0161tenske pumpe", slug: "bastenske-pumpe" },
          { name: "Pumpe visokog pritiska", slug: "pumpe-visokog-pritiska" },
          { name: "Creva i priklju\u010Dci", slug: "creva-prikljucci" },
          { name: "Cisterne za vodu", slug: "cisterne-za-vodu" },
          { name: "Ostalo", slug: "ostalo" }
        ]
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
    subscriptionPlans = mysqlTable("subscription_plans", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      name: varchar("name", { length: 255 }).notNull().unique(),
      displayName: text("display_name").notNull(),
      description: text("description"),
      priceRsd: int("price_rsd").notNull(),
      durationDays: int("duration_days").notNull().default(30),
      maxAds: int("max_ads"),
      features: json("features").$type(),
      isActive: boolean("is_active").default(true).notNull(),
      sortOrder: int("sort_order").default(0),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    itemViews = mysqlTable("item_views", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      itemId: varchar("item_id", { length: 36 }).notNull().references(() => items.id),
      viewerId: varchar("viewer_id", { length: 36 }).references(() => users.id),
      ipAddress: text("ip_address"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    itemViewsRelations = relations(itemViews, ({ one }) => ({
      item: one(items, {
        fields: [itemViews.itemId],
        references: [items.id]
      }),
      viewer: one(users, {
        fields: [itemViews.viewerId],
        references: [users.id]
      })
    }));
    reportedUsers = mysqlTable("reported_users", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      reporterId: varchar("reporter_id", { length: 36 }).notNull().references(() => users.id),
      reportedUserId: varchar("reported_user_id", { length: 36 }).notNull().references(() => users.id),
      reason: text("reason").notNull(),
      description: text("description"),
      status: text("status").default("pending").notNull(),
      adminNotes: text("admin_notes"),
      resolvedBy: varchar("resolved_by", { length: 36 }).references(() => users.id),
      resolvedAt: timestamp("resolved_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    reportedUsersRelations = relations(reportedUsers, ({ one }) => ({
      reporter: one(users, {
        fields: [reportedUsers.reporterId],
        references: [users.id],
        relationName: "reporterUser"
      }),
      reportedUser: one(users, {
        fields: [reportedUsers.reportedUserId],
        references: [users.id],
        relationName: "reportedUser"
      }),
      resolver: one(users, {
        fields: [reportedUsers.resolvedBy],
        references: [users.id],
        relationName: "resolverUser"
      })
    }));
    serverErrorLogs = mysqlTable("server_error_logs", {
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
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    admin2fa = mysqlTable("admin_2fa", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
      secret: text("secret").notNull(),
      isEnabled: boolean("is_enabled").default(false).notNull(),
      backupCodes: json("backup_codes").$type(),
      lastUsedAt: timestamp("last_used_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    appVersions = mysqlTable("app_versions", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      platform: text("platform").notNull(),
      version: text("version").notNull(),
      buildNumber: int("build_number"),
      releaseNotes: text("release_notes"),
      isRequired: boolean("is_required").default(false).notNull(),
      downloadUrl: text("download_url"),
      releasedAt: timestamp("released_at").defaultNow().notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    emailSubscribers = mysqlTable("email_subscribers", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      email: varchar("email", { length: 255 }).notNull().unique(),
      source: text("source").default("landing_page"),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    insertEmailSubscriberSchema = createInsertSchema(emailSubscribers).omit({
      id: true,
      createdAt: true
    });
    adminLogs = mysqlTable("admin_logs", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      adminId: varchar("admin_id", { length: 36 }).notNull().references(() => users.id),
      action: text("action").notNull(),
      targetType: text("target_type"),
      targetId: text("target_id"),
      details: text("details"),
      ipAddress: text("ip_address"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    adminLogsRelations = relations(adminLogs, ({ one }) => ({
      admin: one(users, {
        fields: [adminLogs.adminId],
        references: [users.id]
      })
    }));
    userActivityLogs = mysqlTable("user_activity_logs", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
      action: text("action").notNull(),
      details: text("details"),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    userActivityLogsRelations = relations(userActivityLogs, ({ one }) => ({
      user: one(users, {
        fields: [userActivityLogs.userId],
        references: [users.id]
      })
    }));
    reportedItems = mysqlTable("reported_items", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      itemId: varchar("item_id", { length: 36 }).notNull().references(() => items.id),
      reporterId: varchar("reporter_id", { length: 36 }).notNull().references(() => users.id),
      reason: text("reason").notNull(),
      description: text("description"),
      status: text("status").default("pending").notNull(),
      resolvedBy: varchar("resolved_by", { length: 36 }).references(() => users.id),
      resolvedAt: timestamp("resolved_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    reportedItemsRelations = relations(reportedItems, ({ one }) => ({
      item: one(items, {
        fields: [reportedItems.itemId],
        references: [items.id]
      }),
      reporter: one(users, {
        fields: [reportedItems.reporterId],
        references: [users.id]
      })
    }));
    featureToggles = mysqlTable("feature_toggles", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      name: varchar("name", { length: 255 }).notNull().unique(),
      description: text("description"),
      isEnabled: boolean("is_enabled").default(true).notNull(),
      enabledForPercentage: int("enabled_for_percentage").default(100),
      updatedBy: varchar("updated_by", { length: 36 }).references(() => users.id),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    adminNotifications = mysqlTable("admin_notifications", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      adminId: varchar("admin_id", { length: 36 }).notNull().references(() => users.id),
      type: text("type").notNull(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      targetType: text("target_type"),
      targetIds: json("target_ids").$type(),
      sentCount: int("sent_count").default(0),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    sentRemindersLog = mysqlTable("sent_reminders_log", {
      id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
      bookingId: varchar("booking_id", { length: 36 }).notNull().references(() => bookings.id),
      reminderType: text("reminder_type").notNull(),
      sentDate: text("sent_date").notNull(),
      reminderKey: varchar("reminder_key", { length: 255 }).notNull().unique(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
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
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
var connectionString = process.env.MYSQL_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "MYSQL_URL or DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = mysql.createPool(connectionString);
var db = drizzle(pool, { schema: schema_exports, mode: "default" });

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
    if (filters?.hasDeposit !== void 0) {
      conditions.push(eq(items.hasDeposit, filters.hasDeposit));
    }
    if (filters?.hasDelivery !== void 0) {
      conditions.push(eq(items.hasDelivery, filters.hasDelivery));
    }
    if (filters?.userType && filters.userType !== "all") {
      conditions.push(eq(items.userType, filters.userType));
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
  async createVerificationToken(userId, type = "email", customToken, customExpiresAt) {
    const token = customToken || crypto.randomUUID();
    const expiresAt = customExpiresAt || new Date(Date.now() + 24 * 60 * 60 * 1e3);
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
  async deleteUserWithData(id) {
    const userItems = await db.select({ id: items.id }).from(items).where(eq(items.ownerId, id));
    const itemIds = userItems.map((i) => i.id);
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
  async subscribeEmail(email, source = "landing_page") {
    const existing = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email));
    if (existing.length > 0) {
      if (!existing[0].isActive) {
        const [updated] = await db.update(emailSubscribers).set({ isActive: true }).where(eq(emailSubscribers.email, email)).returning();
        return { subscriber: updated, isNew: false };
      }
      return { subscriber: existing[0], isNew: false };
    }
    const [subscriber] = await db.insert(emailSubscribers).values({ email, source }).returning();
    return { subscriber, isNew: true };
  }
  async getEmailSubscribers() {
    return db.select().from(emailSubscribers).where(eq(emailSubscribers.isActive, true)).orderBy(desc(emailSubscribers.createdAt));
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
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
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
    const skipFields = ["password", "email", "images", "uploadURL"];
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
  app2.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://app.vikendmajstor.rs",
      "https://vikendmajstor.rs",
      "http://localhost:8081",
      "http://localhost:5000"
    ];
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app2.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://vikendmajstor.rs", "https://api.vikendmajstor.rs", "https://www.google-analytics.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
        frameAncestors: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 31536e3,
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true
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
  const replitDomains = process.env.REPLIT_DOMAINS || "";
  const isProduction = process.env.NODE_ENV === "production" || replitDomains.includes("vikendmajstor.rs") || process.env.REPLIT_DEPLOYMENT === "1";
  console.log(`[AUTH] Session config: isProduction=${isProduction}, NODE_ENV=${process.env.NODE_ENV}`);
  app2.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        sameSite: isProduction ? "none" : "lax",
        domain: isProduction ? ".vikendmajstor.rs" : void 0
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
      res.status(201).json({
        ...userWithoutPassword,
        authToken,
        isNewUser: true,
        emailVerificationSent: true
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Greska pri registraciji: " + (error.message || String(error)) });
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
      let user;
      if (req.body.email) {
        user = await storage.getUserByEmail(req.body.email);
        if (!user) {
          return res.json({ success: true, message: "Ako nalog postoji, verifikacioni email je poslat" });
        }
      } else if (req.user) {
        user = req.user;
      } else {
        return res.status(400).json({ error: "Email adresa je obavezna" });
      }
      if (user.emailVerified) {
        return res.json({ success: true, message: "Ako nalog postoji, verifikacioni email je poslat" });
      }
      const verificationToken = await storage.createVerificationToken(user.id, "email");
      const sent = await sendVerificationEmail(user.email, verificationToken.token, user.name);
      console.log(`[EMAIL] Resend verification to ${user.email}: ${sent ? "SUCCESS" : "FAILED"}`);
      res.json({ success: true, message: "Ako nalog postoji, verifikacioni email je poslat" });
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
      res.status(500).json({ error: "Greska pri prijavi: " + (error.message || String(error)) });
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
        await storage.createVerificationToken(user.id, "password_reset", resetToken, expiresAt);
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
  app2.get("/api/debug/check-user/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ found: false, message: "User not found" });
      }
      const pwd = user.password;
      const pwdType = typeof pwd;
      const pwdLength = pwd ? pwd.length : 0;
      const hasDot = pwd ? pwd.includes(".") : false;
      const parts = pwd ? pwd.split(".") : [];
      res.json({
        found: true,
        email: user.email,
        passwordType: pwdType,
        passwordLength: pwdLength,
        hasDot: hasDot,
        partsCount: parts.length,
        firstPartLength: parts[0] ? parts[0].length : 0,
        secondPartLength: parts[1] ? parts[1].length : 0,
        passwordPreview: pwd ? pwd.substring(0, 20) + "..." : null,
        allUserKeys: Object.keys(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/debug/fix-passwords-now", async (req, res) => {
    try {
      const secretKey = req.query.key;
      if (secretKey !== "vikend2024fix") {
        return res.status(403).json({ error: "Pogresan kljuc. Koristi ?key=vikend2024fix" });
      }
      const adminPassword = "Admin123!";
      const demoPassword = "demo123";
      const hashedAdminPassword = await hashPassword(adminPassword);
      const hashedDemoPassword = await hashPassword(demoPassword);
      const adminResult = await pool.execute(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedAdminPassword, "admin@vikendmajstor.rs"]
      );
      const demoResult = await pool.execute(
        "UPDATE users SET password = ? WHERE email LIKE ?",
        [hashedDemoPassword, "%@demo.com"]
      );
      res.json({
        success: true,
        message: "Lozinke su azurirane!",
        adminCredentials: { email: "admin@vikendmajstor.rs", password: adminPassword },
        demoCredentials: { password: demoPassword, note: "Za sve @demo.com korisnike" },
        adminRowsAffected: adminResult[0].affectedRows,
        demoRowsAffected: demoResult[0].affectedRows,
        warning: "OBRISI OVAJ ENDPOINT NAKON UPOTREBE!"
      });
    } catch (error) {
      res.status(500).json({ error: error.message, stack: error.stack });
    }
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
      let isNewUser = false;
      let emailVerificationSent = false;
      if (!user) {
        isNewUser = true;
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
        const verificationToken = await storage.createVerificationToken(user.id, "email");
        sendVerificationEmail(user.email, verificationToken.token, user.name).then((sent) => {
          emailVerificationSent = sent;
          console.log(`[GOOGLE AUTH] Verification email ${sent ? "sent" : "failed"} to ${user.email}`);
        }).catch((err) => {
          console.error("[GOOGLE AUTH] Failed to send verification email:", err);
        });
        emailVerificationSent = true;
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.json({
        ...userWithoutPassword,
        authToken,
        isNewUser,
        emailVerificationSent: isNewUser ? emailVerificationSent : void 0
      });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ error: "Greska pri Google prijavi: " + (error.message || String(error)) });
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
      let isNewUser = false;
      let emailVerificationSent = false;
      if (!user) {
        isNewUser = true;
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
        if (email && !userEmail.includes("privaterelay.appleid.com")) {
          const verificationToken = await storage.createVerificationToken(user.id, "email");
          sendVerificationEmail(user.email, verificationToken.token, user.name).then((sent) => {
            console.log(`[APPLE AUTH] Verification email ${sent ? "sent" : "failed"} to ${user.email}`);
          }).catch((err) => {
            console.error("[APPLE AUTH] Failed to send verification email:", err);
          });
          emailVerificationSent = true;
        }
      } else if (fullName && fullName.trim() && user.name === "Apple User") {
        await storage.updateUser(user.id, { name: fullName.trim() });
        user = { ...user, name: fullName.trim() };
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      const authToken = generateAuthToken(user.id, sessionSecret);
      res.json({
        ...userWithoutPassword,
        authToken,
        isNewUser,
        emailVerificationSent: isNewUser ? emailVerificationSent : void 0
      });
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

// server/localStorage.ts
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var UPLOADS_DIR = path.join(__dirname, "uploads");
var PUBLIC_DIR = path.join(UPLOADS_DIR, "public");
var TEMP_DIR = path.join(UPLOADS_DIR, "temp");
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var MAX_FILE_SIZE = 10 * 1024 * 1024;
function isValidUUID(id) {
  return UUID_REGEX.test(id);
}
function sanitizePath(inputPath, baseDir) {
  const cleanPath = inputPath.replace(/\.\./g, "").replace(/\/+/g, "/");
  const fullPath = path.join(baseDir, cleanPath);
  const normalizedPath = path.normalize(fullPath);
  if (!normalizedPath.startsWith(baseDir)) {
    return null;
  }
  return normalizedPath;
}
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
ensureDir(PUBLIC_DIR);
ensureDir(TEMP_DIR);
var LocalNotFoundError = class _LocalNotFoundError extends Error {
  constructor() {
    super("File not found");
    this.name = "LocalNotFoundError";
    Object.setPrototypeOf(this, _LocalNotFoundError.prototype);
  }
};
var LocalStorageService = class {
  constructor() {
    ensureDir(PUBLIC_DIR);
    ensureDir(TEMP_DIR);
  }
  async searchPublicObject(filePath) {
    const fullPath = path.join(PUBLIC_DIR, filePath);
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(PUBLIC_DIR)) {
      return null;
    }
    if (fs.existsSync(normalizedPath)) {
      return normalizedPath;
    }
    return null;
  }
  async downloadObject(filePath, res, cacheTtlSec = 3600) {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf"
      };
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.set({
        "Content-Type": contentType,
        "Content-Length": stats.size,
        "Cache-Control": `public, max-age=${cacheTtlSec}`
      });
      const stream = fs.createReadStream(filePath);
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
  generateUploadId() {
    return randomUUID();
  }
  getTempPath(uploadId) {
    return path.join(TEMP_DIR, uploadId);
  }
  getPublicPath(uploadId) {
    return path.join(PUBLIC_DIR, uploadId);
  }
  async saveUploadedFile(uploadId, fileBuffer, contentType, userId) {
    if (!isValidUUID(uploadId)) {
      throw new Error("Invalid upload ID format");
    }
    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error("File too large (max 10MB)");
    }
    const publicPath = sanitizePath(uploadId, PUBLIC_DIR);
    if (!publicPath) {
      throw new Error("Invalid file path");
    }
    fs.writeFileSync(publicPath, fileBuffer);
    const metadata = {
      contentType,
      size: fileBuffer.length,
      owner: userId,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    fs.writeFileSync(`${publicPath}.meta.json`, JSON.stringify(metadata));
    return `/objects/uploads/${uploadId}`;
  }
  async getObjectEntityFile(objectPath) {
    if (!objectPath.startsWith("/objects/")) {
      throw new LocalNotFoundError();
    }
    const relativePath = objectPath.replace("/objects/", "");
    const fullPath = path.join(PUBLIC_DIR, relativePath);
    const normalizedPath = path.normalize(fullPath);
    if (!normalizedPath.startsWith(PUBLIC_DIR)) {
      throw new LocalNotFoundError();
    }
    if (!fs.existsSync(normalizedPath)) {
      throw new LocalNotFoundError();
    }
    return normalizedPath;
  }
  normalizeObjectEntityPath(rawPath) {
    if (rawPath.startsWith("/objects/")) {
      return rawPath;
    }
    if (rawPath.startsWith("uploads/")) {
      return `/objects/${rawPath}`;
    }
    return rawPath;
  }
  async trySetObjectEntityAclPolicy(objectPath, _aclPolicy) {
    return this.normalizeObjectEntityPath(objectPath);
  }
};
var localStorageService = new LocalStorageService();

// server/notifications.ts
init_schema();
import { eq as eq2, and as and2, gte, lte } from "drizzle-orm";
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
async function sendNewMessageNotification(receiverId, senderName, messagePreview, conversationId) {
  const truncatedPreview = messagePreview.length > 50 ? messagePreview.substring(0, 50) + "..." : messagePreview;
  return sendPushNotification(
    receiverId,
    "Nova poruka",
    `${senderName}: ${truncatedPreview}`,
    { type: "new_message", conversationId }
  );
}
async function sendBookingReminderNotification(userId, itemTitle, daysUntil, bookingId, isOwner) {
  const title = isOwner ? "Podsetnik za iznajmljivanje" : "Podsetnik za rezervaciju";
  const body2 = daysUntil === 0 ? `Danas po\u010Dinje ${isOwner ? "iznajmljivanje" : "va\u0161a rezervacija"} za "${itemTitle}"` : `Za ${daysUntil} ${daysUntil === 1 ? "dan" : "dana"} po\u010Dinje ${isOwner ? "iznajmljivanje" : "va\u0161a rezervacija"} za "${itemTitle}"`;
  return sendPushNotification(
    userId,
    title,
    body2,
    { type: "booking_reminder", bookingId }
  );
}
var isReminderRunning = false;
function getReminderKey(bookingId, reminderType, sentDate) {
  return `${bookingId}:${reminderType}:${sentDate}`;
}
async function markReminderSent(bookingId, reminderType, sentDate) {
  const reminderKey = getReminderKey(bookingId, reminderType, sentDate);
  try {
    await db.insert(sentRemindersLog).values({
      bookingId,
      reminderType,
      sentDate,
      reminderKey
    });
    return true;
  } catch (err) {
    if (err?.code === "23505") {
      console.log(`[REMINDERS] Reminder ${reminderKey} already exists (concurrent insert)`);
      return false;
    }
    console.error("[REMINDERS] Failed to mark reminder as sent:", err);
    return false;
  }
}
async function sendScheduledReminders() {
  if (isReminderRunning) {
    console.log("[REMINDERS] Reminder job already running, skipping...");
    return { success: false, reason: "already_running" };
  }
  isReminderRunning = true;
  try {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const todayStr = today.toISOString().split("T")[0];
    const upcomingBookings = await db.select().from(bookings).where(
      and2(
        eq2(bookings.status, "confirmed"),
        gte(bookings.startDate, today),
        lte(bookings.startDate, dayAfterTomorrow)
      )
    );
    console.log(`[REMINDERS] Found ${upcomingBookings.length} upcoming bookings to remind`);
    let sentCount = 0;
    for (const booking of upcomingBookings) {
      const item = await storage.getItem(booking.itemId);
      if (!item) continue;
      const startDate = new Date(booking.startDate);
      startDate.setHours(0, 0, 0, 0);
      let daysUntil = 0;
      if (startDate.getTime() === today.getTime()) {
        daysUntil = 0;
      } else if (startDate.getTime() === tomorrow.getTime()) {
        daysUntil = 1;
      } else {
        continue;
      }
      const reminderType = `day_${daysUntil}`;
      const claimed = await markReminderSent(booking.id, reminderType, todayStr);
      if (!claimed) {
        console.log(`[REMINDERS] Skipping booking ${booking.id} - reminder already claimed by another process`);
        continue;
      }
      try {
        await sendBookingReminderNotification(booking.renterId, item.title, daysUntil, booking.id, false);
        await sendBookingReminderNotification(booking.ownerId, item.title, daysUntil, booking.id, true);
        sentCount++;
        console.log(`[REMINDERS] Sent reminder for booking ${booking.id} (${daysUntil} days until start)`);
      } catch (err) {
        console.error(`[REMINDERS] Failed to send reminder for booking ${booking.id}:`, err);
      }
    }
    isReminderRunning = false;
    return { success: true, remindersCount: sentCount };
  } catch (error) {
    console.error("[REMINDERS] Error sending scheduled reminders:", error);
    isReminderRunning = false;
    return { success: false, error };
  }
}

// server/seed-demo.ts
init_schema();
import { eq as eq3, like, or as or2, inArray as inArray2 } from "drizzle-orm";
import { scrypt as scrypt2, randomBytes as randomBytes2 } from "crypto";
import { promisify as promisify2 } from "util";

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
var DEMO_IMAGES = {
  busilica: ["/demo-images/busilica_makita.png"],
  brusilica: ["/demo-images/brusilica_villager.png"],
  ubodnaTesera: ["/demo-images/ubodna_testera_villager.png"],
  cirkularMetabo: ["/demo-images/cirkular_metabo.png"],
  mesalica: ["/demo-images/mesalica_beton_ingco.png"],
  sekac: ["/demo-images/sekac_husqvarna.png"],
  rende: ["/demo-images/rende_makita.png"],
  vibrator: ["/demo-images/vibrator_beton_raider.png"],
  glodalica: ["/demo-images/glodalica_bosch.png"],
  cirkularBosch: ["/demo-images/cirkular_bosch.png"]
};
var DEMO_EMAIL_SUFFIX = "@demo.vikendmajstor.rs";
async function seedDemoData() {
  console.log("[SEED] Starting demo data seed...");
  console.log("[SEED] Using external Unsplash URLs for demo images");
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
    const existingUser = await db.select().from(users).where(eq3(users.email, userData.email)).limit(1);
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
      title: "Elektri\u010Dna bu\u0161ilica Makita DP4011",
      description: "Profesionalna elektri\u010Dna bu\u0161ilica Makita DP4011. Snaga 720W, podesiva brzina, ergonomska dr\u0161ka. Idealna za bu\u0161enje u drvu i metalu.",
      category: "Elektri\u010Dni alati",
      subCategory: "Bu\u0161ilice",
      brand: "Makita",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 720,
      pricePerDay: 800,
      deposit: 5e3,
      images: DEMO_IMAGES.busilica,
      isFeatured: true
    },
    {
      ownerIndex: 0,
      title: "VLN 433 ugaona brusilica Villager",
      description: "Ugaona brusilica Villager VLN 433. Sna\u017Ena i izdr\u017Eljiva, idealna za se\u010Denje i bru\u0161enje metala. Uklju\u010Deni za\u0161titni poklopac i ru\u010Dka.",
      category: "Elektri\u010Dni alati",
      subCategory: "Brusilice",
      brand: "Villager",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 850,
      pricePerDay: 600,
      deposit: 4e3,
      images: DEMO_IMAGES.brusilica,
      isFeatured: false
    },
    {
      ownerIndex: 1,
      title: "Elektri\u010Dna ubodna testera Villager",
      description: "Elektri\u010Dna ubodna testera Villager za precizno se\u010Denje drva, plastike i tankog metala. Podesiv ugao se\u010Denja, jednostavna zamena lista.",
      category: "Elektri\u010Dni alati",
      subCategory: "Testere",
      brand: "Villager",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 650,
      pricePerDay: 500,
      deposit: 3e3,
      images: DEMO_IMAGES.ubodnaTesera,
      isFeatured: false
    },
    {
      ownerIndex: 1,
      title: "Ru\u010Dni cirkular KS 55 FS Metabo",
      description: "Profesionalni ru\u010Dni cirkular Metabo KS 55 FS. Dubina reza do 55mm, vo\u0111ica za precizno se\u010Denje. Snaga 1200W.",
      category: "Elektri\u010Dni alati",
      subCategory: "Testere",
      brand: "Metabo",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 1200,
      pricePerDay: 900,
      deposit: 6e3,
      images: DEMO_IMAGES.cirkularMetabo,
      isFeatured: true
    },
    {
      ownerIndex: 2,
      title: "Me\u0161alica za beton 200L INGCO",
      description: "Elektri\u010Dna me\u0161alica za beton INGCO kapaciteta 200 litara. Snaga 850W, \u010Deli\u010Dni bubanj, to\u010Dkovi za lako preme\u0161tanje. Idealna za gra\u0111evinske radove.",
      category: "Gra\u0111evinske ma\u0161ine",
      subCategory: "Me\u0161alice",
      brand: "INGCO",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 850,
      pricePerDay: 1500,
      deposit: 1e4,
      images: DEMO_IMAGES.mesalica,
      isFeatured: true
    },
    {
      ownerIndex: 2,
      title: "Husqvarna elektri\u010Dni seka\u010D za beton",
      description: "Profesionalni Husqvarna elektri\u010Dni ru\u010Dni seka\u010D za beton i asfalt. Dijamantski disk, vodeno hla\u0111enje. Idealan za gra\u0111evinske i renovacijske radove.",
      category: "Gra\u0111evinske ma\u0161ine",
      subCategory: "Seka\u010Di",
      brand: "Husqvarna",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 2200,
      pricePerDay: 2e3,
      deposit: 15e3,
      images: DEMO_IMAGES.sekac,
      isFeatured: true
    },
    {
      ownerIndex: 3,
      title: "Elektri\u010Dno ru\u010Dno rende Makita",
      description: "Elektri\u010Dno ru\u010Dno rende za drvo Makita. \u0160irina rendisanja 82mm, podesiva dubina. Idealno za obradu drvenih povr\u0161ina i uklanjanje vi\u0161ka materijala.",
      category: "Elektri\u010Dni alati",
      subCategory: "Rendisalice",
      brand: "Makita",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 620,
      pricePerDay: 700,
      deposit: 5e3,
      images: DEMO_IMAGES.rende,
      isFeatured: false
    },
    {
      ownerIndex: 3,
      title: "Vibrator za beton Raider",
      description: "Vibrator za beton Raider sa fleksibilnom iglom. Idealan za vibriranje betona i uklanjanje mehuri\u0107a vazduha. Snaga 1350W.",
      category: "Gra\u0111evinske ma\u0161ine",
      subCategory: "Vibratori",
      brand: "Raider",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 1350,
      pricePerDay: 1e3,
      deposit: 7e3,
      images: DEMO_IMAGES.vibrator,
      isFeatured: false
    },
    {
      ownerIndex: 4,
      title: "Elektri\u010Dna glodalica Bosch POF 1400 ACE",
      description: "Elektri\u010Dna glodalica za drvo Bosch POF 1400 ACE. Snaga 1400W, elektronska regulacija brzine, sistem za usisavanje pra\u0161ine. Idealna za precizne radove u drvetu.",
      category: "Elektri\u010Dni alati",
      subCategory: "Glodalice",
      brand: "Bosch",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 1400,
      pricePerDay: 1200,
      deposit: 8e3,
      images: DEMO_IMAGES.glodalica,
      isFeatured: true
    },
    {
      ownerIndex: 5,
      title: "Bosch klatna testera GCM 8 SJL",
      description: "Profesionalna klatna testera Bosch za precizno se\u010Denje drva pod uglom. \u0160irina reza do 312mm, laserska vo\u0111ica. Idealna za stolare i podopolaga\u010De.",
      category: "Elektri\u010Dni alati",
      subCategory: "Testere",
      brand: "Bosch",
      powerSource: "Elektri\u010Dni (struja)",
      powerWatts: 1600,
      pricePerDay: 1500,
      deposit: 12e3,
      images: DEMO_IMAGES.cirkularBosch,
      isFeatured: true
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
  const demoUsersList = await db.select().from(users).where(
    or2(
      like(users.email, `%${DEMO_EMAIL_SUFFIX}`),
      like(users.email, `%@demo.com`)
    )
  );
  if (demoUsersList.length === 0) {
    console.log("[SEED] No demo users found to delete");
    return { users: 0, items: 0 };
  }
  const demoUserIds = demoUsersList.map((u) => u.id);
  console.log(`[SEED] Found ${demoUserIds.length} demo users to delete`);
  const demoItems = await db.select().from(items).where(inArray2(items.ownerId, demoUserIds));
  const demoItemIds = demoItems.map((i) => i.id);
  console.log(`[SEED] Found ${demoItemIds.length} demo items to delete`);
  if (demoItemIds.length > 0) {
    const deletedReviews = await db.delete(reviews).where(inArray2(reviews.itemId, demoItemIds)).returning();
    console.log(`[SEED] Deleted ${deletedReviews.length} reviews for demo items`);
  }
  const deletedReviewsByUser = await db.delete(reviews).where(
    or2(
      inArray2(reviews.reviewerId, demoUserIds),
      inArray2(reviews.revieweeId, demoUserIds)
    )
  ).returning();
  console.log(`[SEED] Deleted ${deletedReviewsByUser.length} reviews by/for demo users`);
  if (demoItemIds.length > 0) {
    const deletedBookings = await db.delete(bookings).where(inArray2(bookings.itemId, demoItemIds)).returning();
    console.log(`[SEED] Deleted ${deletedBookings.length} bookings for demo items`);
  }
  const deletedBookingsByUser = await db.delete(bookings).where(
    or2(
      inArray2(bookings.renterId, demoUserIds),
      inArray2(bookings.ownerId, demoUserIds)
    )
  ).returning();
  console.log(`[SEED] Deleted ${deletedBookingsByUser.length} bookings by demo users`);
  const demoConversations = await db.select().from(conversations).where(
    or2(
      inArray2(conversations.user1Id, demoUserIds),
      inArray2(conversations.user2Id, demoUserIds)
    )
  );
  const demoConversationIds = demoConversations.map((c) => c.id);
  if (demoConversationIds.length > 0) {
    const deletedMessages = await db.delete(messages).where(inArray2(messages.conversationId, demoConversationIds)).returning();
    console.log(`[SEED] Deleted ${deletedMessages.length} messages from demo conversations`);
    const deletedConversations = await db.delete(conversations).where(inArray2(conversations.id, demoConversationIds)).returning();
    console.log(`[SEED] Deleted ${deletedConversations.length} conversations involving demo users`);
  }
  let itemsDeleted = 0;
  if (demoItemIds.length > 0) {
    const deletedItems = await db.delete(items).where(inArray2(items.id, demoItemIds)).returning();
    itemsDeleted = deletedItems.length;
    console.log(`[SEED] Deleted ${itemsDeleted} demo items`);
  }
  const deletedUsers = await db.delete(users).where(inArray2(users.id, demoUserIds)).returning();
  const usersDeleted = deletedUsers.length;
  console.log(`[SEED] Deleted ${usersDeleted} demo users`);
  console.log(`[SEED] Demo data deletion complete: ${usersDeleted} users, ${itemsDeleted} items`);
  return { users: usersDeleted, items: itemsDeleted };
}
async function getDemoDataStats() {
  const demoUsersList = await db.select().from(users).where(
    or2(
      like(users.email, `%${DEMO_EMAIL_SUFFIX}`),
      like(users.email, `%@demo.com`)
    )
  );
  let totalItems = 0;
  for (const user of demoUsersList) {
    const userItems = await db.select().from(items).where(eq3(items.ownerId, user.id));
    totalItems += userItems.length;
  }
  return { users: demoUsersList.length, items: totalItems };
}

// server/mysql-db.ts
import mysql2 from "mysql2/promise";
var mysqlPool = null;
function getMySQLPool() {
  if (!process.env.MYSQL_URL) {
    console.log("MYSQL_URL not configured - production database not available");
    return null;
  }
  if (!mysqlPool) {
    mysqlPool = mysql2.createPool(process.env.MYSQL_URL);
    console.log("MySQL production database pool created");
  }
  return mysqlPool;
}
async function queryMySQL(sql4, params = []) {
  const pool2 = getMySQLPool();
  if (!pool2) {
    throw new Error("MySQL connection not available");
  }
  const [rows] = await pool2.execute(sql4, params);
  return rows;
}
async function executeMySQL(sql4, params = []) {
  const pool2 = getMySQLPool();
  if (!pool2) {
    throw new Error("MySQL connection not available");
  }
  const [result] = await pool2.execute(sql4, params);
  return result;
}
async function getProductionSubscribers() {
  try {
    return await queryMySQL(
      "SELECT id, email, source, is_active, created_at FROM email_subscribers ORDER BY created_at DESC"
    );
  } catch (error) {
    console.error("Error fetching production subscribers:", error.message);
    return [];
  }
}
async function addProductionSubscriber(email, source = "landing_page") {
  try {
    const existing = await queryMySQL(
      "SELECT id FROM email_subscribers WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      await executeMySQL(
        "UPDATE email_subscribers SET is_active = 1 WHERE email = ?",
        [email]
      );
      return false;
    }
    await executeMySQL(
      "INSERT INTO email_subscribers (email, source, is_active, created_at) VALUES (?, ?, 1, NOW())",
      [email, source]
    );
    return true;
  } catch (error) {
    console.error("Error adding production subscriber:", error.message);
    throw error;
  }
}
async function deleteProductionSubscriber(id) {
  try {
    const result = await executeMySQL(
      "DELETE FROM email_subscribers WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting production subscriber:", error.message);
    return false;
  }
}
async function updateProductionSubscription(id, updates) {
  try {
    const setClauses = [];
    const params = [];
    if (updates.tier) {
      setClauses.push("tier = ?");
      params.push(updates.tier);
    }
    if (updates.status) {
      setClauses.push("status = ?");
      params.push(updates.status);
    }
    if (updates.expiresAt) {
      setClauses.push("expires_at = ?");
      params.push(updates.expiresAt);
    }
    if (setClauses.length === 0) return false;
    params.push(id);
    const result = await executeMySQL(
      `UPDATE subscriptions SET ${setClauses.join(", ")} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating production subscription:", error.message);
    return false;
  }
}
function isProductionAvailable() {
  return !!process.env.MYSQL_URL;
}

// server/routes.ts
init_schema();
import { eq as eq4, asc } from "drizzle-orm";
import * as path2 from "path";
import * as fs2 from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2 } from "path";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
function sanitizeString(input) {
  if (input === void 0) return void 0;
  if (input === null) return null;
  if (typeof input !== "string") return input;
  if (input.trim() === "") return input;
  return input.replace(/<[^>]*>/g, "").replace(/javascript:/gi, "").replace(/on\w+=/gi, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/<[^>]*>/g, "").trim();
}
function sanitizeItemData(data) {
  const sanitized = { ...data };
  if (sanitized.title !== void 0) sanitized.title = sanitizeString(sanitized.title);
  if (sanitized.description !== void 0) sanitized.description = sanitizeString(sanitized.description);
  if (sanitized.location !== void 0) sanitized.location = sanitizeString(sanitized.location);
  if (sanitized.category !== void 0) sanitized.category = sanitizeString(sanitized.category);
  if (sanitized.subCategory !== void 0) sanitized.subCategory = sanitizeString(sanitized.subCategory);
  return sanitized;
}
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
    const landingPath = path2.join(__dirname2, "landing", "index.html");
    if (fs2.existsSync(landingPath)) {
      return res.sendFile(landingPath);
    }
    res.json({ status: "ok", message: "VikendMajstor API" });
  });
  const seoPages = [
    "iznajmljivanje-alata-nis",
    "busilica-nis",
    "kosilica-beograd",
    "brusilica-novi-sad",
    "testerica-nis",
    "blog-top-5-alata-nis"
  ];
  seoPages.forEach((page) => {
    app2.get(`/${page}`, (req, res) => {
      const pagePath = path2.join(__dirname2, "landing", "seo", `${page}.html`);
      if (fs2.existsSync(pagePath)) {
        return res.sendFile(pagePath);
      }
      res.redirect("/");
    });
  });
  app2.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path2.join(__dirname2, "landing", "sitemap.xml");
    if (fs2.existsSync(sitemapPath)) {
      res.setHeader("Content-Type", "application/xml");
      return res.sendFile(sitemapPath);
    }
    res.status(404).send("Sitemap not found");
  });
  app2.get("/robots.txt", (req, res) => {
    const robotsPath = path2.join(__dirname2, "landing", "robots.txt");
    if (fs2.existsSync(robotsPath)) {
      res.setHeader("Content-Type", "text/plain");
      return res.sendFile(robotsPath);
    }
    res.status(404).send("Robots.txt not found");
  });
  app2.post("/api/subscribe", async (req, res) => {
    try {
      const { email, source } = req.body;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ success: false, message: "Email adresa je obavezna" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Unesite validnu email adresu" });
      }
      const cleanEmail = email.toLowerCase().trim();
      const emailSource = source || "landing_page";
      let isNew = true;
      if (isProductionAvailable()) {
        try {
          isNew = await addProductionSubscriber(cleanEmail, emailSource);
        } catch (prodError) {
          console.error("Production subscription error:", prodError);
        }
      }
      try {
        const subscriber = await storage.subscribeEmail(cleanEmail, emailSource);
        isNew = subscriber.isNew;
      } catch (devError) {
        if (devError.message !== "EMAIL_EXISTS") {
          console.error("Dev subscription error:", devError);
        }
      }
      res.json({
        success: true,
        message: "Uspe\u0161no ste se prijavili na novosti!",
        isNew
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      if (error.message === "EMAIL_EXISTS") {
        return res.json({
          success: true,
          message: "Ve\u0107 ste prijavljeni na novosti!",
          isNew: false
        });
      }
      res.status(500).json({ success: false, message: "Do\u0161lo je do gre\u0161ke. Poku\u0161ajte ponovo." });
    }
  });
  app2.get("/app", (req, res) => {
    const userAgent = req.headers["user-agent"] || "";
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    if (isAndroid || isIOS) {
      return res.redirect("exp://");
    }
    const webAppPath = path2.join(process.cwd(), "static-build", "web", "index.html");
    if (fs2.existsSync(webAppPath)) {
      return res.sendFile(webAppPath);
    }
    res.redirect("/");
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const allCategories = await db.select().from(categories).where(eq4(categories.isActive, true)).orderBy(asc(categories.sortOrder));
      const categoriesWithSubs = await Promise.all(
        allCategories.map(async (cat) => {
          const subs = await db.select().from(subcategories).where(eq4(subcategories.categoryId, cat.id)).orderBy(asc(subcategories.sortOrder));
          return { ...cat, subcategories: subs };
        })
      );
      res.json(categoriesWithSubs);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju kategorija" });
    }
  });
  app2.get("/api/categories/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const [category] = await db.select().from(categories).where(eq4(categories.slug, slug)).limit(1);
      if (!category) {
        return res.status(404).json({ error: "Kategorija nije prona\u0111ena" });
      }
      const subs = await db.select().from(subcategories).where(eq4(subcategories.categoryId, category.id)).orderBy(asc(subcategories.sortOrder));
      res.json({ ...category, subcategories: subs });
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju kategorije" });
    }
  });
  app2.get("/api/subcategories/:categoryId", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const subs = await db.select().from(subcategories).where(eq4(subcategories.categoryId, categoryId)).orderBy(asc(subcategories.sortOrder));
      res.json(subs);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju podkategorija" });
    }
  });
  app2.get("/oauth/google/callback", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VikendMajstor - Prijava</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #1a1a1a; color: white; }
    .container { text-align: center; padding: 20px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #333; border-top-color: #FFCC00; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <p>Prijava u toku...</p>
  </div>
  <script>
    (function() {
      var hash = window.location.hash.substring(1);
      var params = new URLSearchParams(hash);
      var accessToken = params.get('access_token');
      
      if (accessToken) {
        window.location.href = 'vikendmajstor://oauth?access_token=' + encodeURIComponent(accessToken);
        setTimeout(function() {
          document.querySelector('.container').innerHTML = '<p>Ako se aplikacija nije otvorila, <a href="vikendmajstor://oauth?access_token=' + encodeURIComponent(accessToken) + '" style="color: #FFCC00;">kliknite ovde</a></p>';
        }, 2000);
      } else {
        document.querySelector('.container').innerHTML = '<p style="color: #ff4444;">Greska pri prijavi. Pokusajte ponovo.</p>';
      }
    })();
  </script>
</body>
</html>
    `);
  });
  app2.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const localStorageService2 = new LocalStorageService();
    try {
      const file = await localStorageService2.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      localStorageService2.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/objects/:objectPath(*)", async (req, res) => {
    const localStorageService2 = new LocalStorageService();
    console.log(`[OBJECTS] Requesting object: ${req.path}`);
    try {
      const filePath = await localStorageService2.getObjectEntityFile(req.path);
      console.log(`[OBJECTS] Found object: ${req.path}`);
      localStorageService2.downloadObject(filePath, res);
    } catch (error) {
      console.error(`[OBJECTS] Error for ${req.path}:`, error);
      if (error instanceof LocalNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });
  app2.get("/api/objects/:objectPath(*)", async (req, res) => {
    const localStorageService2 = new LocalStorageService();
    const objectPath = `/objects/${req.params.objectPath}`;
    console.log(`[API-OBJECTS] Requesting object: ${objectPath}`);
    try {
      const filePath = await localStorageService2.getObjectEntityFile(objectPath);
      console.log(`[API-OBJECTS] Found object: ${objectPath}`);
      localStorageService2.downloadObject(filePath, res);
    } catch (error) {
      console.error(`[API-OBJECTS] Error for ${objectPath}:`, error);
      if (error instanceof LocalNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });
  app2.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const localStorageService2 = new LocalStorageService();
    try {
      const uploadId = localStorageService2.generateUploadId();
      res.json({ uploadId, uploadURL: `/api/objects/upload/${uploadId}` });
    } catch (error) {
      console.error("Error generating upload ID:", error);
      res.status(500).json({ error: "Failed to generate upload ID" });
    }
  });
  app2.put("/api/objects/upload/:uploadId", isAuthenticated, async (req, res) => {
    const { uploadId } = req.params;
    const userId = req.user.id;
    const localStorageService2 = new LocalStorageService();
    console.log(`[UPLOAD] Receiving file upload for user ${userId}, uploadId: ${uploadId}`);
    try {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", async () => {
        const fileBuffer = Buffer.concat(chunks);
        const contentType = req.headers["content-type"] || "application/octet-stream";
        const objectPath = await localStorageService2.saveUploadedFile(
          uploadId,
          fileBuffer,
          contentType,
          userId
        );
        console.log(`[UPLOAD] Saved successfully, objectPath: ${objectPath}`);
        res.status(200).json({ objectPath });
      });
    } catch (error) {
      console.error("[UPLOAD] Error saving upload:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/objects/finalize", isAuthenticated, async (req, res) => {
    if (!req.body.uploadURL && !req.body.objectPath) {
      return res.status(400).json({ error: "uploadURL or objectPath is required" });
    }
    const userId = req.user.id;
    const rawPath = req.body.uploadURL || req.body.objectPath;
    console.log(`[UPLOAD] Finalizing upload for user ${userId}, path: ${rawPath}`);
    try {
      const localStorageService2 = new LocalStorageService();
      const objectPath = await localStorageService2.trySetObjectEntityAclPolicy(
        rawPath,
        {
          owner: userId,
          visibility: "public"
        }
      );
      console.log(`[UPLOAD] Finalized successfully, objectPath: ${objectPath}`);
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("[UPLOAD] Error finalizing upload:", error);
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
      const { category, subCategory, toolType, powerSource, city, search, adType, minPrice, maxPrice, period, hasImages, activityTag, lat, lng, maxDistance, hasDeposit, hasDelivery, userType } = req.query;
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
      const items3 = await storage.getItems({
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
        activityTag,
        hasDeposit: hasDeposit === "true" ? true : hasDeposit === "false" ? false : void 0,
        hasDelivery: hasDelivery === "true" ? true : hasDelivery === "false" ? false : void 0,
        userType
      });
      const now = /* @__PURE__ */ new Date();
      const userLat = lat ? parseFloat(lat) : null;
      const userLng = lng ? parseFloat(lng) : null;
      const maxDist = maxDistance ? parseFloat(maxDistance) : null;
      const todayStart = /* @__PURE__ */ new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = /* @__PURE__ */ new Date();
      todayEnd.setHours(23, 59, 59, 999);
      let itemsWithDistance = await Promise.all(
        items3.map(async (item) => {
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
          const itemBookings = await storage.getItemBookings(item.id);
          const hasBookingToday = itemBookings.some((booking) => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            return bookingStart <= todayEnd && bookingEnd >= todayStart;
          });
          const availableToday = item.isAvailable && !hasBookingToday;
          return { ...item, isPremium: !!isPremium, distance, availableToday };
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
  app2.get("/api/items/category-counts", async (req, res) => {
    try {
      const allItems = await storage.getItems();
      const activeItems = allItems.filter((item) => item.isAvailable);
      const counts = {};
      activeItems.forEach((item) => {
        if (item.category) {
          counts[item.category] = (counts[item.category] || 0) + 1;
        }
      });
      res.json(counts);
    } catch (error) {
      console.error("Error fetching category counts:", error);
      res.status(500).json({ error: "Gre\u0161ka pri u\u010Ditavanju broja alata po kategorijama" });
    }
  });
  app2.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Stvar nije prona\u0111ena" });
      }
      const owner = await storage.getUser(item.ownerId);
      const todayStart = /* @__PURE__ */ new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = /* @__PURE__ */ new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const itemBookings = await storage.getItemBookings(item.id);
      const hasBookingToday = itemBookings.some((booking) => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        return bookingStart <= todayEnd && bookingEnd >= todayStart;
      });
      const availableToday = item.isAvailable && !hasBookingToday;
      res.json({ ...item, owner, availableToday });
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
      const items3 = await storage.getItemsByOwner(req.user.id);
      res.json(items3);
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
      const sanitizedData = sanitizeItemData(req.body);
      const item = await storage.createItem({
        ...sanitizedData,
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
      const sanitizedData = sanitizeItemData(req.body);
      const updatedItem = await storage.updateItem(req.params.id, sanitizedData);
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
      const conversations3 = await storage.getConversations(req.user.id);
      const conversationsWithDetails = await Promise.all(
        conversations3.map(async (conv) => {
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
      const sender = await storage.getUser(req.user.id);
      sendNewMessageNotification(receiverId, sender?.name || "Korisnik", req.body.content, req.params.id).catch((err) => console.error("[NOTIFICATION] Failed to send message notification:", err));
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
  const isAdmin = async (req, res, next) => {
    let user = null;
    if (req.user) {
      user = req.user;
    } else if (req.session?.userId) {
      user = await storage.getUser(req.session.userId);
    }
    if (!user) {
      return res.status(401).json({ error: "Niste prijavljeni" });
    }
    if (!user.isAdmin) {
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
  app2.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Korisnik nije prona\u0111en" });
      }
      if (user.isAdmin) {
        return res.status(403).json({ error: "Ne mo\u017Eete obrisati admin korisnika" });
      }
      console.log(`[ADMIN] User ${req.user?.email} deleting user ${user.email}`);
      const result = await storage.deleteUserWithData(userId);
      res.json({
        success: true,
        message: `Korisnik ${user.email} je obrisan`,
        deleted: result
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Gre\u0161ka pri brisanju korisnika" });
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
  app2.post("/api/admin/send-reminders", isAdmin, async (req, res) => {
    try {
      console.log(`[ADMIN] User ${req.user?.email} triggered manual reminder sending`);
      const result = await sendScheduledReminders();
      res.json({
        success: result.success,
        message: `Poslato ${result.remindersCount || 0} podsetnika`,
        remindersCount: result.remindersCount
      });
    } catch (error) {
      console.error("Error sending reminders:", error);
      res.status(500).json({ error: "Gre\u0161ka pri slanju podsetnika" });
    }
  });
  const REMINDER_INTERVAL = 6 * 60 * 60 * 1e3;
  setInterval(async () => {
    console.log("[SCHEDULER] Running scheduled reminder check...");
    await sendScheduledReminders();
  }, REMINDER_INTERVAL);
  setTimeout(async () => {
    console.log("[SCHEDULER] Initial reminder check on server start...");
    await sendScheduledReminders();
  }, 1e4);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/admin-routes.ts
import { scrypt as scrypt3, timingSafeEqual as timingSafeEqual2 } from "crypto";
import { promisify as promisify3 } from "util";
import * as jose from "jose";
init_schema();
import { eq as eq5, desc as desc2, inArray as inArray3, asc as asc2, sql as sql3 } from "drizzle-orm";
import { randomBytes as randomBytes3 } from "crypto";
import * as crypto2 from "crypto";
var scryptAsync3 = promisify3(scrypt3);
var JWT_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "admin-secret-key");
var JWT_ALGORITHM = "HS256";
async function verifyPassword(password, hashedPassword) {
  const [hashed, salt] = hashedPassword.split(".");
  const hashedBuffer = Buffer.from(hashed, "hex");
  const suppliedBuffer = await scryptAsync3(password, salt, 64);
  return timingSafeEqual2(hashedBuffer, suppliedBuffer);
}
async function createToken(admin) {
  const jwt = await new jose.SignJWT({
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role
  }).setProtectedHeader({ alg: JWT_ALGORITHM }).setIssuedAt().setExpirationTime("24h").sign(JWT_SECRET);
  return jwt;
}
async function verifyToken(token) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}
async function isAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Neautorizovan pristup" });
  }
  const token = authHeader.substring(7);
  const payload = await verifyToken(token);
  if (!payload || typeof payload.adminId !== "string") {
    return res.status(401).json({ message: "Nevazeci token" });
  }
  const user = await storage.getUser(payload.adminId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Pristup odbijen" });
  }
  req.admin = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.isAdmin ? "superadmin" : "admin"
  };
  next();
}
async function logAdminAction(adminId, action, targetType, targetId, details, ipAddress) {
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
    console.error("Failed to log admin action:", error);
  }
}
function registerAdminRoutes(app2) {
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password, twoFactorCode } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email i lozinka su obavezni" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isAdmin) {
        return res.status(401).json({ message: "Pogresni kredencijali ili nemate admin pristup" });
      }
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Pogresni kredencijali" });
      }
      const [twoFa] = await db.select().from(admin2fa).where(eq5(admin2fa.userId, user.id));
      if (twoFa?.isEnabled) {
        if (!twoFactorCode) {
          return res.json({
            requires2FA: true,
            message: "Unesite kod iz autentifikator aplikacije"
          });
        }
        const isCodeValid = verifyTOTP(twoFa.secret, twoFactorCode);
        if (!isCodeValid) {
          const backupIndex = twoFa.backupCodes?.indexOf(twoFactorCode.toUpperCase());
          if (backupIndex === void 0 || backupIndex === -1) {
            return res.status(401).json({ message: "Neispravan 2FA kod" });
          }
          const newBackupCodes = [...twoFa.backupCodes || []];
          newBackupCodes.splice(backupIndex, 1);
          await db.update(admin2fa).set({ backupCodes: newBackupCodes, lastUsedAt: /* @__PURE__ */ new Date() }).where(eq5(admin2fa.userId, user.id));
        } else {
          await db.update(admin2fa).set({ lastUsedAt: /* @__PURE__ */ new Date() }).where(eq5(admin2fa.userId, user.id));
        }
      }
      const token = await createToken({
        id: user.id,
        email: user.email,
        name: user.name || "",
        role: "superadmin"
      });
      res.json({
        token,
        admin: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: "superadmin"
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Greska pri prijavi" });
    }
  });
  app2.get("/api/admin/me", isAdminAuth, async (req, res) => {
    const admin = req.admin;
    res.json({ admin });
  });
  app2.get("/api/admin/stats", isAdminAuth, async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      const allItems = await db.select().from(items);
      const allBookings = await db.select().from(bookings);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = allUsers.filter(
        (u) => u.createdAt && new Date(u.createdAt) >= today
      ).length;
      const newItemsToday = allItems.filter(
        (i) => i.createdAt && new Date(i.createdAt) >= today
      ).length;
      const thirtyDaysAgo = /* @__PURE__ */ new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = allUsers.filter(
        (u) => u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo
      ).length;
      const pendingBookings = allBookings.filter((b) => b.status === "pending").length;
      const completedBookings = allBookings.filter((b) => b.status === "completed");
      const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      res.json({
        totalUsers: allUsers.length,
        activeUsers: activeUsers || allUsers.length,
        totalItems: allItems.length,
        activeItems: allItems.filter((i) => i.isAvailable).length,
        totalBookings: allBookings.length,
        pendingBookings,
        totalRevenue,
        monthlyRevenue: totalRevenue,
        newUsersToday,
        newItemsToday
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Greska pri dobijanju statistike" });
    }
  });
  app2.get("/api/admin/activity", isAdminAuth, async (req, res) => {
    try {
      const recentUsers = await db.select().from(users).orderBy(desc2(users.createdAt)).limit(5);
      const recentItems = await db.select().from(items).orderBy(desc2(items.createdAt)).limit(5);
      const activities = [];
      recentUsers.forEach((u) => {
        activities.push({
          icon: "user",
          description: `Novi korisnik: ${u.name || u.email}`,
          time: u.createdAt ? new Date(u.createdAt).toLocaleString("sr-RS") : "",
          timestamp: u.createdAt ? new Date(u.createdAt).getTime() : 0
        });
      });
      recentItems.forEach((i) => {
        activities.push({
          icon: "item",
          description: `Novi oglas: ${i.title}`,
          time: i.createdAt ? new Date(i.createdAt).toLocaleString("sr-RS") : "",
          timestamp: i.createdAt ? new Date(i.createdAt).getTime() : 0
        });
      });
      activities.sort((a, b) => b.timestamp - a.timestamp);
      res.json({ activities: activities.slice(0, 10) });
    } catch (error) {
      console.error("Admin activity error:", error);
      res.status(500).json({ message: "Greska pri dobijanju aktivnosti" });
    }
  });
  app2.get("/api/admin/users", isAdminAuth, async (req, res) => {
    try {
      const allUsers = await db.select().from(users).orderBy(desc2(users.createdAt));
      const allItems = await db.select().from(items);
      const allBookings = await db.select().from(bookings);
      const demoEmailPatterns = ["demo@", "test@", "primer@", "example@"];
      const usersList = allUsers.map((u) => {
        const userItems = allItems.filter((i) => i.ownerId === u.id);
        const userBookings = allBookings.filter((b) => b.renterId === u.id || b.ownerId === u.id);
        const isDemo = demoEmailPatterns.some((pattern) => u.email.toLowerCase().includes(pattern));
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role || "renter",
          subscriptionType: u.subscriptionType || "free",
          isActive: u.isActive !== false,
          isVerified: u.emailVerified || false,
          isDemo,
          createdAt: u.createdAt,
          itemCount: userItems.length,
          bookingCount: userBookings.length
        };
      });
      res.json({ users: usersList });
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ message: "Greska pri dobijanju korisnika" });
    }
  });
  app2.post("/api/admin/users/:id/suspend", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      const admin = req.admin;
      await db.update(users).set({ isActive: false }).where(eq5(users.id, userId));
      await logAdminAction(admin.id, "suspend_user", "user", userId, "User suspended", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Admin suspend error:", error);
      res.status(500).json({ message: "Greska pri suspendovanju" });
    }
  });
  app2.post("/api/admin/users/:id/activate", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      const admin = req.admin;
      await db.update(users).set({ isActive: true }).where(eq5(users.id, userId));
      await logAdminAction(admin.id, "activate_user", "user", userId, "User activated", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Admin activate error:", error);
      res.status(500).json({ message: "Greska pri aktivaciji" });
    }
  });
  app2.get("/api/admin/items", isAdminAuth, async (req, res) => {
    try {
      const allItems = await db.select().from(items).orderBy(desc2(items.createdAt));
      const allUsers = await db.select().from(users);
      const allViews = await db.select().from(itemViews);
      const allBookings = await db.select().from(bookings);
      const itemsList = allItems.map((item) => {
        const owner = allUsers.find((u) => u.id === item.ownerId);
        const viewCount = allViews.filter((v) => v.itemId === item.id).length;
        const bookingCount = allBookings.filter((b) => b.itemId === item.id).length;
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          pricePerDay: item.pricePerDay,
          category: item.category,
          status: item.isAvailable ? "active" : "pending",
          ownerName: owner?.name || "Nepoznato",
          ownerEmail: owner?.email || "",
          ownerId: item.ownerId,
          views: viewCount,
          bookings: bookingCount,
          createdAt: item.createdAt,
          images: item.images || []
        };
      });
      res.json({ items: itemsList });
    } catch (error) {
      console.error("Admin items error:", error);
      res.status(500).json({ message: "Greska pri dobijanju oglasa" });
    }
  });
  app2.post("/api/admin/items/:id/approve", isAdminAuth, async (req, res) => {
    try {
      const itemId = req.params.id;
      const admin = req.admin;
      await db.update(items).set({ isAvailable: true }).where(eq5(items.id, itemId));
      await logAdminAction(admin.id, "approve_item", "item", itemId, "Item approved", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Admin approve error:", error);
      res.status(500).json({ message: "Greska pri odobravanju" });
    }
  });
  app2.post("/api/admin/items/:id/reject", isAdminAuth, async (req, res) => {
    try {
      const itemId = req.params.id;
      const admin = req.admin;
      await db.update(items).set({ isAvailable: false }).where(eq5(items.id, itemId));
      await logAdminAction(admin.id, "reject_item", "item", itemId, "Item rejected", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Admin reject error:", error);
      res.status(500).json({ message: "Greska pri odbijanju" });
    }
  });
  app2.delete("/api/admin/items/:id", isAdminAuth, async (req, res) => {
    try {
      const itemId = req.params.id;
      const admin = req.admin;
      await db.delete(itemViews).where(eq5(itemViews.itemId, itemId));
      await db.delete(bookings).where(eq5(bookings.itemId, itemId));
      await db.delete(reportedItems).where(eq5(reportedItems.itemId, itemId));
      await db.delete(items).where(eq5(items.id, itemId));
      await logAdminAction(admin.id, "delete_item", "item", itemId, "Item deleted", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Admin delete item error:", error);
      res.status(500).json({ message: "Greska pri brisanju" });
    }
  });
  app2.get("/api/admin/subscriptions", isAdminAuth, async (req, res) => {
    try {
      const allUsers = await db.select().from(users).orderBy(desc2(users.createdAt));
      const subscriptionsList = allUsers.filter((u) => u.subscriptionType && u.subscriptionType !== "free").map((u) => ({
        id: u.id,
        userId: u.id,
        userName: u.name,
        userEmail: u.email,
        tier: u.subscriptionType || "standard",
        status: u.subscriptionStatus || "active",
        startDate: u.subscriptionStartDate || u.createdAt,
        endDate: u.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
        amount: u.subscriptionType === "premium" ? 1e3 : u.subscriptionType === "basic" ? 500 : 0
      }));
      res.json({ subscriptions: subscriptionsList });
    } catch (error) {
      console.error("Admin subscriptions error:", error);
      res.status(500).json({ message: "Greska pri dobijanju pretplata" });
    }
  });
  app2.put("/api/admin/subscriptions/:userId", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { userId } = req.params;
      const { tier, status, endDate } = req.body;
      const updateData = {};
      if (tier) updateData.subscriptionType = tier;
      if (status) updateData.subscriptionStatus = status;
      if (endDate) updateData.subscriptionEndDate = new Date(endDate);
      await db.update(users).set(updateData).where(eq5(users.id, userId));
      if (isProductionAvailable()) {
        try {
          await updateProductionSubscription(parseInt(userId), { tier, status, expiresAt: endDate ? new Date(endDate) : void 0 });
        } catch (prodErr) {
          console.error("Production subscription update error:", prodErr);
        }
      }
      await logAdminAction(admin.id, "update_subscription", "subscription", userId, `Updated subscription: ${JSON.stringify({ tier, status, endDate })}`, req.ip);
      res.json({ success: true, message: "Pretplata uspesno azurirana" });
    } catch (error) {
      console.error("Admin update subscription error:", error);
      res.status(500).json({ message: "Greska pri azuriranju pretplate" });
    }
  });
  app2.get("/api/admin/analytics", isAdminAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allItems = await storage.getItems();
      const categoryCount = {};
      allItems.forEach((item) => {
        const cat = item.category || "other";
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      const popularCategories = Object.entries(categoryCount).map(([name, count2]) => ({ name, count: count2 })).sort((a, b) => b.count - a.count).slice(0, 5);
      const cityCount = {};
      allUsers.forEach((user) => {
        const city = user.city || "Beograd";
        cityCount[city] = (cityCount[city] || 0) + 1;
      });
      const topCities = Object.entries(cityCount).map(([name, count2]) => ({ name, count: count2 })).sort((a, b) => b.count - a.count).slice(0, 5);
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
      console.error("Admin analytics error:", error);
      res.status(500).json({ message: "Greska pri dobijanju analitike" });
    }
  });
  app2.get("/api/admin/reports", isAdminAuth, async (req, res) => {
    res.json({ reports: [] });
  });
  app2.get("/api/admin/logs", isAdminAuth, async (req, res) => {
    res.json({ logs: [] });
  });
  app2.get("/api/admin/admin-logs", isAdminAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
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
      }).from(adminLogs).orderBy(desc2(adminLogs.createdAt)).limit(limit).offset(offset);
      const allUsers = await storage.getAllUsers();
      const logsWithAdmin = logs.map((log2) => {
        const admin = allUsers.find((u) => u.id === log2.adminId);
        return {
          ...log2,
          adminName: admin?.name || admin?.email || "Unknown",
          adminEmail: admin?.email || ""
        };
      });
      res.json({ logs: logsWithAdmin, page, limit });
    } catch (error) {
      console.error("Get admin logs error:", error);
      res.status(500).json({ message: "Greska pri dobijanju admin logova" });
    }
  });
  app2.post("/api/admin/log-action", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { action, targetType, targetId, details } = req.body;
      if (!action) {
        return res.status(400).json({ message: "Action is required" });
      }
      const ipAddress = req.ip || req.socket.remoteAddress;
      await logAdminAction(admin.id, action, targetType, targetId, details, ipAddress);
      res.json({ success: true });
    } catch (error) {
      console.error("Log action error:", error);
      res.status(500).json({ message: "Greska pri logovanju akcije" });
    }
  });
  app2.get("/api/admin/users/:id/activity", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      const limit = parseInt(req.query.limit) || 50;
      const activities = await db.select().from(userActivityLogs).where(eq5(userActivityLogs.userId, userId)).orderBy(desc2(userActivityLogs.createdAt)).limit(limit);
      res.json({ activities });
    } catch (error) {
      console.error("Get user activity error:", error);
      res.status(500).json({ message: "Greska pri dobijanju aktivnosti korisnika" });
    }
  });
  app2.get("/api/admin/reported-items", isAdminAuth, async (req, res) => {
    try {
      const status = req.query.status || "all";
      let reports;
      if (status === "all") {
        reports = await db.select().from(reportedItems).orderBy(desc2(reportedItems.createdAt));
      } else {
        reports = await db.select().from(reportedItems).where(eq5(reportedItems.status, status)).orderBy(desc2(reportedItems.createdAt));
      }
      const allUsers = await storage.getAllUsers();
      const allItems = await storage.getItems();
      const reportsWithDetails = reports.map((report) => {
        const item = allItems.find((i) => i.id === report.itemId);
        const reporter = allUsers.find((u) => u.id === report.reporterId);
        const resolver = report.resolvedBy ? allUsers.find((u) => u.id === report.resolvedBy) : null;
        return {
          ...report,
          itemTitle: item?.title || "Deleted Item",
          itemOwnerName: item ? allUsers.find((u) => u.id === item.ownerId)?.name || "Unknown" : "Unknown",
          reporterName: reporter?.name || reporter?.email || "Unknown",
          resolverName: resolver?.name || resolver?.email || null
        };
      });
      res.json({ reports: reportsWithDetails });
    } catch (error) {
      console.error("Get reported items error:", error);
      res.status(500).json({ message: "Greska pri dobijanju prijavljenih oglasa" });
    }
  });
  app2.post("/api/admin/reported-items/:id/resolve", isAdminAuth, async (req, res) => {
    try {
      const reportId = req.params.id;
      const admin = req.admin;
      const { resolution, action } = req.body;
      await db.update(reportedItems).set({
        status: "resolved",
        resolvedBy: admin.id,
        resolvedAt: /* @__PURE__ */ new Date()
      }).where(eq5(reportedItems.id, reportId));
      if (action === "remove_item") {
        const report = await db.select().from(reportedItems).where(eq5(reportedItems.id, reportId));
        if (report.length > 0 && report[0].itemId) {
          await storage.deleteItem(report[0].itemId);
          await logAdminAction(admin.id, "remove_reported_item", "item", report[0].itemId, `Report resolved with item removal: ${resolution}`, req.ip);
        }
      } else {
        await logAdminAction(admin.id, "resolve_report", "report", reportId, resolution, req.ip);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Resolve report error:", error);
      res.status(500).json({ message: "Greska pri resavanju prijave" });
    }
  });
  app2.get("/api/admin/feature-toggles", isAdminAuth, async (req, res) => {
    try {
      const toggles = await db.select().from(featureToggles).orderBy(featureToggles.name);
      res.json({ toggles });
    } catch (error) {
      console.error("Get feature toggles error:", error);
      res.status(500).json({ message: "Greska pri dobijanju feature toggle-a" });
    }
  });
  app2.post("/api/admin/feature-toggles", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { name, description, isEnabled, enabledForPercentage } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      const existing = await db.select().from(featureToggles).where(eq5(featureToggles.name, name));
      if (existing.length > 0) {
        await db.update(featureToggles).set({
          description,
          isEnabled: isEnabled !== void 0 ? isEnabled : true,
          enabledForPercentage: enabledForPercentage || 100,
          updatedBy: admin.id,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq5(featureToggles.name, name));
      } else {
        await db.insert(featureToggles).values({
          name,
          description,
          isEnabled: isEnabled !== void 0 ? isEnabled : true,
          enabledForPercentage: enabledForPercentage || 100,
          updatedBy: admin.id
        });
      }
      await logAdminAction(admin.id, "update_feature_toggle", "feature_toggle", name, `Enabled: ${isEnabled}`, req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Create/update feature toggle error:", error);
      res.status(500).json({ message: "Greska pri kreiranju/azuriranju feature toggle-a" });
    }
  });
  app2.put("/api/admin/feature-toggles/:id", isAdminAuth, async (req, res) => {
    try {
      const toggleId = req.params.id;
      const admin = req.admin;
      const { isEnabled, description, enabledForPercentage } = req.body;
      await db.update(featureToggles).set({
        isEnabled: isEnabled !== void 0 ? isEnabled : true,
        description,
        enabledForPercentage: enabledForPercentage || 100,
        updatedBy: admin.id,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq5(featureToggles.id, toggleId));
      await logAdminAction(admin.id, "update_feature_toggle", "feature_toggle", toggleId, `Enabled: ${isEnabled}`, req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Update feature toggle error:", error);
      res.status(500).json({ message: "Greska pri azuriranju feature toggle-a" });
    }
  });
  app2.get("/api/admin/messages", isAdminAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const recentMessages = await db.select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt
      }).from(messages).orderBy(desc2(messages.createdAt)).limit(limit);
      const allUsers = await storage.getAllUsers();
      const messagesWithUsers = recentMessages.map((msg) => {
        const sender = allUsers.find((u) => u.id === msg.senderId);
        const receiver = allUsers.find((u) => u.id === msg.receiverId);
        return {
          ...msg,
          senderName: sender?.name || sender?.email || "Unknown",
          senderEmail: sender?.email || "",
          receiverName: receiver?.name || receiver?.email || "Unknown",
          receiverEmail: receiver?.email || ""
        };
      });
      res.json({ messages: messagesWithUsers });
    } catch (error) {
      console.error("Get admin messages error:", error);
      res.status(500).json({ message: "Greska pri dobijanju poruka" });
    }
  });
  app2.post("/api/admin/notifications/send", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { type, title, message, targetType, targetIds } = req.body;
      if (!type || !title || !message) {
        return res.status(400).json({ message: "Type, title and message are required" });
      }
      let sentCount = 0;
      const allUsers = await storage.getAllUsers();
      if (targetType === "all") {
        sentCount = allUsers.length;
      } else if (targetType === "specific" && Array.isArray(targetIds)) {
        sentCount = targetIds.length;
      } else if (targetType === "premium") {
        sentCount = allUsers.filter((u) => u.subscriptionType === "premium").length;
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
      await logAdminAction(admin.id, "send_notification", "notification", void 0, `Type: ${type}, Title: ${title}, Sent to: ${sentCount} users`, req.ip);
      res.json({ success: true, sentCount });
    } catch (error) {
      console.error("Send notification error:", error);
      res.status(500).json({ message: "Greska pri slanju notifikacija" });
    }
  });
  app2.get("/api/admin/notifications", isAdminAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const notifications = await db.select().from(adminNotifications).orderBy(desc2(adminNotifications.createdAt)).limit(limit);
      const allUsers = await storage.getAllUsers();
      const notificationsWithAdmin = notifications.map((notif) => {
        const admin = allUsers.find((u) => u.id === notif.adminId);
        return {
          ...notif,
          adminName: admin?.name || admin?.email || "Unknown"
        };
      });
      res.json({ notifications: notificationsWithAdmin });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Greska pri dobijanju notifikacija" });
    }
  });
  app2.get("/api/admin/export/users", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const allUsers = await storage.getAllUsers();
      const csvHeader = "ID,Email,Name,Phone,City,Role,Subscription,Active,Verified,Created At\n";
      const csvRows = allUsers.map(
        (u) => `"${u.id}","${u.email}","${u.name || ""}","${u.phone || ""}","${u.city || ""}","${u.role}","${u.subscriptionType}","${u.isActive}","${u.emailVerified}","${u.createdAt}"`
      ).join("\n");
      const csv = csvHeader + csvRows;
      await logAdminAction(admin.id, "export_users", "users", void 0, `Exported ${allUsers.length} users`, req.ip);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users_export.csv");
      res.send(csv);
    } catch (error) {
      console.error("Export users error:", error);
      res.status(500).json({ message: "Greska pri eksportovanju korisnika" });
    }
  });
  app2.get("/api/admin/export/items", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const allItems = await storage.getItems();
      const allUsers = await storage.getAllUsers();
      const csvHeader = "ID,Title,Category,Price Per Day,Deposit,City,Owner Email,Available,Featured,Created At\n";
      const csvRows = allItems.map((item) => {
        const owner = allUsers.find((u) => u.id === item.ownerId);
        return `"${item.id}","${item.title}","${item.category}","${item.pricePerDay}","${item.deposit}","${item.city}","${owner?.email || ""}","${item.isAvailable}","${item.isFeatured}","${item.createdAt}"`;
      }).join("\n");
      const csv = csvHeader + csvRows;
      await logAdminAction(admin.id, "export_items", "items", void 0, `Exported ${allItems.length} items`, req.ip);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=items_export.csv");
      res.send(csv);
    } catch (error) {
      console.error("Export items error:", error);
      res.status(500).json({ message: "Greska pri eksportovanju oglasa" });
    }
  });
  app2.get("/api/admin/subscribers", isAdminAuth, async (req, res) => {
    try {
      let newsletterSubscribers = [];
      let source = "development";
      if (isProductionAvailable()) {
        const productionSubscribers = await getProductionSubscribers();
        newsletterSubscribers = productionSubscribers.map((s) => ({
          id: s.id.toString(),
          email: s.email,
          source: s.source,
          isActive: s.is_active,
          createdAt: s.created_at,
          type: "newsletter"
        }));
        source = "production";
      } else {
        const devSubscribers = await db.select().from(emailSubscribers).orderBy(desc2(emailSubscribers.createdAt));
        newsletterSubscribers = devSubscribers.map((s) => {
          const idValue = typeof s.id === "object" && s.id !== null ? s.id.value || JSON.stringify(s.id) : String(s.id || "");
          return {
            id: idValue,
            email: s.email,
            source: s.source,
            isActive: s.isActive,
            createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt ? String(s.createdAt) : null,
            type: "newsletter"
          };
        });
      }
      const allUsers = await storage.getAllUsers();
      const registeredUsers = allUsers.map((u) => {
        let dateStr = null;
        if (u.createdAt) {
          dateStr = u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt);
        } else if (u.subscriptionStartDate) {
          dateStr = u.subscriptionStartDate instanceof Date ? u.subscriptionStartDate.toISOString() : String(u.subscriptionStartDate);
        }
        return {
          id: `user_${u.id}`,
          email: u.email,
          name: u.name || "",
          source: "registracija",
          isActive: u.isActive !== false,
          createdAt: dateStr,
          type: "registered",
          subscriptionType: u.subscriptionType || "free",
          subscriptionStatus: u.subscriptionStatus || "inactive"
        };
      });
      const allSubscribers = [...newsletterSubscribers, ...registeredUsers];
      allSubscribers.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      });
      res.json({
        subscribers: allSubscribers,
        source,
        stats: {
          newsletter: newsletterSubscribers.length,
          registered: registeredUsers.length,
          total: allSubscribers.length
        }
      });
    } catch (error) {
      console.error("Get subscribers error:", error);
      res.status(500).json({ message: "Greska pri dobijanju pretplatnika" });
    }
  });
  app2.get("/api/admin/export/subscribers", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      let allSubscribers = [];
      if (isProductionAvailable()) {
        const prodSubscribers = await getProductionSubscribers();
        allSubscribers = prodSubscribers.map((s) => ({
          email: s.email,
          name: "",
          source: s.source,
          type: "newsletter",
          isActive: s.is_active,
          createdAt: s.created_at
        }));
      } else {
        const devSubscribers = await db.select().from(emailSubscribers).orderBy(desc2(emailSubscribers.createdAt));
        allSubscribers = devSubscribers.map((s) => ({
          email: s.email,
          name: "",
          source: s.source,
          type: "newsletter",
          isActive: s.isActive,
          createdAt: s.createdAt
        }));
      }
      const allUsers = await storage.getAllUsers();
      const registeredUsers = allUsers.map((u) => ({
        email: u.email,
        name: u.name || "",
        source: "registracija",
        type: "registered",
        isActive: u.isActive !== false,
        createdAt: u.createdAt,
        subscriptionType: u.subscriptionType || "free"
      }));
      allSubscribers = [...allSubscribers, ...registeredUsers];
      allSubscribers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const csvHeader = "Email,Ime,Tip,Izvor,Pretplata,Aktivan,Datum\n";
      const csvRows = allSubscribers.map(
        (s) => `"${s.email}","${s.name || ""}","${s.type === "registered" ? "Registrovan" : "Newsletter"}","${s.source || "unknown"}","${s.subscriptionType || "-"}","${s.isActive ? "Da" : "Ne"}","${s.createdAt}"`
      ).join("\n");
      const csv = csvHeader + csvRows;
      await logAdminAction(admin.id, "export_subscribers", "subscribers", void 0, `Exported ${allSubscribers.length} subscribers`, req.ip);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=email_subscribers.csv");
      res.send(csv);
    } catch (error) {
      console.error("Export subscribers error:", error);
      res.status(500).json({ message: "Greska pri eksportovanju pretplatnika" });
    }
  });
  app2.delete("/api/admin/subscribers/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const subscriberId = req.params.id;
      if (isProductionAvailable()) {
        await deleteProductionSubscriber(parseInt(subscriberId));
      } else {
        await db.delete(emailSubscribers).where(eq5(emailSubscribers.id, subscriberId));
      }
      await logAdminAction(admin.id, "delete_subscriber", "subscribers", subscriberId, "Deleted subscriber", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete subscriber error:", error);
      res.status(500).json({ message: "Greska pri brisanju pretplatnika" });
    }
  });
  app2.post("/api/admin/users/:id/subscription", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const userId = req.params.id;
      const { subscriptionType, durationDays } = req.body;
      if (!subscriptionType || !["free", "basic", "premium"].includes(subscriptionType)) {
        return res.status(400).json({ message: "Invalid subscription type" });
      }
      const now = /* @__PURE__ */ new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + (durationDays || 30));
      await db.update(users).set({
        subscriptionType,
        subscriptionStatus: "active",
        subscriptionStartDate: now,
        subscriptionEndDate: endDate
      }).where(eq5(users.id, userId));
      await db.insert(subscriptions).values({
        userId,
        type: subscriptionType,
        status: "active",
        priceRsd: subscriptionType === "premium" ? 1e3 : subscriptionType === "basic" ? 500 : 0,
        startDate: now,
        endDate
      });
      await logAdminAction(admin.id, "change_subscription", "user", userId, `Changed to ${subscriptionType} for ${durationDays || 30} days`, req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Change subscription error:", error);
      res.status(500).json({ message: "Greska pri promeni pretplate" });
    }
  });
  app2.post("/api/admin/users/:id/reset-password", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const userId = req.params.id;
      const tempPassword = randomBytes3(8).toString("hex");
      const salt = randomBytes3(16).toString("hex");
      const hashedBuffer = await scryptAsync3(tempPassword, salt, 64);
      const hashedPassword = `${hashedBuffer.toString("hex")}.${salt}`;
      await db.update(users).set({ password: hashedPassword }).where(eq5(users.id, userId));
      await logAdminAction(admin.id, "reset_password", "user", userId, "Password was reset", req.ip);
      res.json({ success: true, tempPassword });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Greska pri resetovanju lozinke" });
    }
  });
  app2.post("/api/admin/users/:id/verify", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const userId = req.params.id;
      const { verificationType, verified } = req.body;
      if (!["email", "phone", "document"].includes(verificationType)) {
        return res.status(400).json({ message: "Invalid verification type" });
      }
      const updateData = {};
      if (verificationType === "email") updateData.emailVerified = verified;
      if (verificationType === "phone") updateData.phoneVerified = verified;
      if (verificationType === "document") updateData.documentVerified = verified;
      await db.update(users).set(updateData).where(eq5(users.id, userId));
      await logAdminAction(admin.id, `verify_${verificationType}`, "user", userId, `Set ${verificationType} verified to ${verified}`, req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Verify user error:", error);
      res.status(500).json({ message: "Greska pri verifikaciji korisnika" });
    }
  });
  app2.get("/api/admin/users/:id/details", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Korisnik nije pronadjen" });
      }
      const userItems = await db.select().from(items).where(eq5(items.ownerId, userId));
      const userBookings = await db.select().from(bookings).where(eq5(bookings.renterId, userId));
      res.json({
        user: {
          ...user,
          password: void 0,
          itemsCount: userItems.length,
          bookingsCount: userBookings.length
        }
      });
    } catch (error) {
      console.error("Get user details error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju korisnika" });
    }
  });
  app2.get("/api/admin/subscription-plans", isAdminAuth, async (req, res) => {
    try {
      const plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
      res.json({ plans });
    } catch (error) {
      console.error("Get subscription plans error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju planova" });
    }
  });
  app2.post("/api/admin/subscription-plans", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { name, displayName, description, priceRsd, durationDays, maxAds, features } = req.body;
      if (!name || !displayName || priceRsd === void 0) {
        return res.status(400).json({ message: "Name, displayName and priceRsd are required" });
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
      await logAdminAction(admin.id, "create_plan", "subscription_plan", plan.id, `Created plan ${name}`, req.ip);
      res.json({ success: true, plan });
    } catch (error) {
      console.error("Create subscription plan error:", error);
      res.status(500).json({ message: "Greska pri kreiranju plana" });
    }
  });
  app2.put("/api/admin/subscription-plans/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const planId = req.params.id;
      const { displayName, description, priceRsd, durationDays, maxAds, features, isActive } = req.body;
      await db.update(subscriptionPlans).set({
        displayName,
        description,
        priceRsd,
        durationDays,
        maxAds,
        features,
        isActive,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq5(subscriptionPlans.id, planId));
      await logAdminAction(admin.id, "update_plan", "subscription_plan", planId, "Updated plan", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Update subscription plan error:", error);
      res.status(500).json({ message: "Greska pri azuriranju plana" });
    }
  });
  app2.delete("/api/admin/subscription-plans/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const planId = req.params.id;
      await db.delete(subscriptionPlans).where(eq5(subscriptionPlans.id, planId));
      await logAdminAction(admin.id, "delete_plan", "subscription_plan", planId, "Deleted plan", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete subscription plan error:", error);
      res.status(500).json({ message: "Greska pri brisanju plana" });
    }
  });
  app2.get("/api/admin/items/:id/stats", isAdminAuth, async (req, res) => {
    try {
      const itemId = req.params.id;
      const views = await db.select().from(itemViews).where(eq5(itemViews.itemId, itemId));
      const itemBookings = await db.select().from(bookings).where(eq5(bookings.itemId, itemId));
      const totalViews = views.length;
      const totalBookings = itemBookings.length;
      const completedBookings = itemBookings.filter((b) => b.status === "completed").length;
      const totalRevenue = itemBookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.totalPrice, 0);
      res.json({
        stats: {
          totalViews,
          totalBookings,
          completedBookings,
          conversionRate: totalViews > 0 ? (totalBookings / totalViews * 100).toFixed(1) : 0,
          totalRevenue
        }
      });
    } catch (error) {
      console.error("Get item stats error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju statistike" });
    }
  });
  app2.get("/api/admin/items-stats", isAdminAuth, async (req, res) => {
    try {
      const allItems = await storage.getItems();
      const allBookings = await db.select().from(bookings);
      const allViews = await db.select().from(itemViews);
      const itemStats = allItems.map((item) => {
        const itemBookings = allBookings.filter((b) => b.itemId === item.id);
        const views = allViews.filter((v) => v.itemId === item.id);
        const completedBookings2 = itemBookings.filter((b) => b.status === "completed");
        return {
          id: item.id,
          title: item.title,
          views: views.length,
          bookings: itemBookings.length,
          completedBookings: completedBookings2.length,
          avgPrice: item.pricePerDay,
          revenue: completedBookings2.reduce((sum, b) => sum + b.totalPrice, 0)
        };
      });
      itemStats.sort((a, b) => b.bookings - a.bookings);
      const totalViews = allViews.length;
      const totalBookings = allBookings.length;
      const completedBookings = allBookings.filter((b) => b.status === "completed").length;
      const avgPricePerDay = allItems.length > 0 ? Math.round(allItems.reduce((sum, i) => sum + i.pricePerDay, 0) / allItems.length) : 0;
      res.json({
        overview: {
          totalViews,
          totalBookings,
          completedBookings,
          avgPricePerDay
        },
        items: itemStats.slice(0, 20)
        // Top 20
      });
    } catch (error) {
      console.error("Get items stats error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju statistike" });
    }
  });
  app2.post("/api/admin/bulk/suspend-users", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "userIds array is required" });
      }
      await db.update(users).set({ isActive: false }).where(inArray3(users.id, userIds));
      await logAdminAction(admin.id, "bulk_suspend_users", "users", void 0, `Suspended ${userIds.length} users: ${userIds.join(", ")}`, req.ip);
      res.json({ success: true, count: userIds.length });
    } catch (error) {
      console.error("Bulk suspend users error:", error);
      res.status(500).json({ message: "Greska pri suspendovanju korisnika" });
    }
  });
  app2.post("/api/admin/bulk/delete-items", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { itemIds } = req.body;
      if (!Array.isArray(itemIds) || itemIds.length === 0) {
        return res.status(400).json({ message: "itemIds array is required" });
      }
      let deletedCount = 0;
      for (const itemId of itemIds) {
        try {
          await db.delete(itemViews).where(eq5(itemViews.itemId, itemId));
          await db.delete(bookings).where(eq5(bookings.itemId, itemId));
          await db.delete(reportedItems).where(eq5(reportedItems.itemId, itemId));
          await db.delete(items).where(eq5(items.id, itemId));
          deletedCount++;
        } catch (err) {
          console.error(`Failed to delete item ${itemId}:`, err);
        }
      }
      await logAdminAction(admin.id, "bulk_delete_items", "items", void 0, `Deleted ${deletedCount} items: ${itemIds.join(", ")}`, req.ip);
      res.json({ success: true, count: deletedCount });
    } catch (error) {
      console.error("Bulk delete items error:", error);
      res.status(500).json({ message: "Greska pri brisanju oglasa" });
    }
  });
  app2.get("/api/admin/reported-users", isAdminAuth, async (req, res) => {
    try {
      const reports = await db.select().from(reportedUsers).orderBy(desc2(reportedUsers.createdAt));
      const allUsers = await storage.getAllUsers();
      const reportsWithDetails = reports.map((r) => ({
        ...r,
        reporter: allUsers.find((u) => u.id === r.reporterId),
        reportedUser: allUsers.find((u) => u.id === r.reportedUserId)
      }));
      res.json({ reports: reportsWithDetails });
    } catch (error) {
      console.error("Get reported users error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju prijava" });
    }
  });
  app2.post("/api/admin/reported-users/:id/resolve", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const reportId = req.params.id;
      const { status, adminNotes } = req.body;
      await db.update(reportedUsers).set({
        status,
        adminNotes,
        resolvedBy: admin.id,
        resolvedAt: /* @__PURE__ */ new Date()
      }).where(eq5(reportedUsers.id, reportId));
      await logAdminAction(admin.id, "resolve_user_report", "reported_user", reportId, `Status: ${status}`, req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Resolve reported user error:", error);
      res.status(500).json({ message: "Greska pri resavanju prijave" });
    }
  });
  app2.get("/api/admin/users/:id/reputation", isAdminAuth, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Korisnik nije pronadjen" });
      }
      const userReviews = await db.select().from(reviews).where(eq5(reviews.revieweeId, userId));
      const ownerBookings = await db.select().from(bookings).where(eq5(bookings.ownerId, userId));
      const completedAsOwner = ownerBookings.filter((b) => b.status === "completed").length;
      const renterBookings = await db.select().from(bookings).where(eq5(bookings.renterId, userId));
      const completedAsRenter = renterBookings.filter((b) => b.status === "completed").length;
      const userItems = await db.select().from(items).where(eq5(items.ownerId, userId));
      const avgRating = userReviews.length > 0 ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length : 0;
      const totalTransactions = completedAsOwner + completedAsRenter;
      const reputationScore = Math.min(100, Math.round(
        avgRating * 10 + totalTransactions * 2 + (user.emailVerified ? 10 : 0) + (user.phoneVerified ? 10 : 0) + (user.documentVerified ? 20 : 0)
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
      console.error("Get user reputation error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju reputacije" });
    }
  });
  app2.get("/api/admin/error-logs", isAdminAuth, async (req, res) => {
    try {
      const logs = await db.select().from(serverErrorLogs).orderBy(desc2(serverErrorLogs.createdAt)).limit(100);
      res.json({ logs });
    } catch (error) {
      console.error("Get error logs error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju logova" });
    }
  });
  app2.delete("/api/admin/error-logs/clear", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      await db.delete(serverErrorLogs);
      await logAdminAction(admin.id, "clear_error_logs", "system", void 0, "Cleared all error logs", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Clear error logs error:", error);
      res.status(500).json({ message: "Greska pri brisanju logova" });
    }
  });
  app2.get("/api/admin/2fa/status", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const [twoFa] = await db.select().from(admin2fa).where(eq5(admin2fa.userId, admin.id));
      res.json({
        enabled: twoFa?.isEnabled || false,
        hasSetup: !!twoFa
      });
    } catch (error) {
      console.error("Get 2FA status error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju 2FA statusa" });
    }
  });
  app2.post("/api/admin/2fa/setup", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const secret = crypto2.randomBytes(20).toString("hex");
      const base32Secret = Buffer.from(secret, "hex").toString("base64").replace(/=/g, "").slice(0, 16).toUpperCase();
      const backupCodes = Array.from(
        { length: 8 },
        () => crypto2.randomBytes(4).toString("hex").toUpperCase()
      );
      const [existing] = await db.select().from(admin2fa).where(eq5(admin2fa.userId, admin.id));
      if (existing) {
        await db.update(admin2fa).set({ secret: base32Secret, backupCodes, isEnabled: false }).where(eq5(admin2fa.userId, admin.id));
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
      console.error("Setup 2FA error:", error);
      res.status(500).json({ message: "Greska pri podesavanju 2FA" });
    }
  });
  app2.post("/api/admin/2fa/enable", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { code } = req.body;
      if (!code || code.length !== 6) {
        return res.status(400).json({ message: "Unesite 6-cifreni kod iz aplikacije" });
      }
      const [twoFa] = await db.select().from(admin2fa).where(eq5(admin2fa.userId, admin.id));
      if (!twoFa) {
        return res.status(400).json({ message: "Prvo pokrenite podesavanje 2FA" });
      }
      const isValid = verifyTOTP(twoFa.secret, code);
      if (!isValid) {
        return res.status(400).json({ message: "Neispravan kod. Proverite da li je vreme na uredjaju tacno." });
      }
      await db.update(admin2fa).set({ isEnabled: true, lastUsedAt: /* @__PURE__ */ new Date() }).where(eq5(admin2fa.userId, admin.id));
      await logAdminAction(admin.id, "enable_2fa", "admin", admin.id, "Enabled 2FA", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Enable 2FA error:", error);
      res.status(500).json({ message: "Greska pri aktivaciji 2FA" });
    }
  });
  function verifyTOTP(secret, code) {
    const timeStep = 30;
    const now = Math.floor(Date.now() / 1e3);
    for (let i = -1; i <= 1; i++) {
      const time = Math.floor((now + i * timeStep) / timeStep);
      const generatedCode = generateTOTP(secret, time);
      if (generatedCode === code) {
        return true;
      }
    }
    return false;
  }
  function generateTOTP(secret, time) {
    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    for (const char of secret.toUpperCase()) {
      const val = base32chars.indexOf(char);
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, "0");
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigUInt64BE(BigInt(time));
    const hmac = crypto2.createHmac("sha1", Buffer.from(bytes));
    hmac.update(timeBuffer);
    const hash = hmac.digest();
    const offset = hash[hash.length - 1] & 15;
    const binary = (hash[offset] & 127) << 24 | (hash[offset + 1] & 255) << 16 | (hash[offset + 2] & 255) << 8 | hash[offset + 3] & 255;
    const otp = binary % 1e6;
    return otp.toString().padStart(6, "0");
  }
  app2.post("/api/admin/2fa/disable", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      await db.update(admin2fa).set({ isEnabled: false }).where(eq5(admin2fa.userId, admin.id));
      await logAdminAction(admin.id, "disable_2fa", "admin", admin.id, "Disabled 2FA", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Disable 2FA error:", error);
      res.status(500).json({ message: "Greska pri deaktivaciji 2FA" });
    }
  });
  app2.get("/api/admin/app-versions", isAdminAuth, async (req, res) => {
    try {
      const versions = await db.select().from(appVersions).orderBy(desc2(appVersions.releasedAt));
      res.json({ versions });
    } catch (error) {
      console.error("Get app versions error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju verzija" });
    }
  });
  app2.post("/api/admin/app-versions", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { platform, version, buildNumber, releaseNotes, isRequired, downloadUrl } = req.body;
      const [newVersion] = await db.insert(appVersions).values({
        platform,
        version,
        buildNumber,
        releaseNotes,
        isRequired,
        downloadUrl
      }).returning();
      await logAdminAction(admin.id, "add_app_version", "app_version", newVersion.id, `${platform} v${version}`, req.ip);
      res.json({ success: true, version: newVersion });
    } catch (error) {
      console.error("Add app version error:", error);
      res.status(500).json({ message: "Greska pri dodavanju verzije" });
    }
  });
  app2.delete("/api/admin/app-versions/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const versionId = req.params.id;
      await db.delete(appVersions).where(eq5(appVersions.id, versionId));
      await logAdminAction(admin.id, "delete_app_version", "app_version", versionId, "Deleted version", req.ip);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete app version error:", error);
      res.status(500).json({ message: "Greska pri brisanju verzije" });
    }
  });
  app2.get("/api/admin/export/transactions", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const allBookings = await db.select().from(bookings);
      const allUsers = await storage.getAllUsers();
      const allItems = await storage.getItems();
      const csvHeader = "ID,Item,Owner,Renter,Start Date,End Date,Days,Price Per Day,Total Price,Status,Created At\n";
      const csvRows = allBookings.map((b) => {
        const item = allItems.find((i) => i.id === b.itemId);
        const owner = allUsers.find((u) => u.id === b.ownerId);
        const renter = allUsers.find((u) => u.id === b.renterId);
        return `"${b.id}","${item?.title || ""}","${owner?.email || ""}","${renter?.email || ""}","${b.startDate}","${b.endDate}","${b.totalDays}","${b.pricePerDay}","${b.totalPrice}","${b.status}","${b.createdAt}"`;
      }).join("\n");
      const csv = csvHeader + csvRows;
      await logAdminAction(admin.id, "export_transactions", "bookings", void 0, `Exported ${allBookings.length} transactions`, req.ip);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=transactions_export.csv");
      res.send(csv);
    } catch (error) {
      console.error("Export transactions error:", error);
      res.status(500).json({ message: "Greska pri eksportovanju transakcija" });
    }
  });
  app2.get("/api/admin/deployment-status", isAdminAuth, async (req, res) => {
    try {
      const versions = await db.select().from(appVersions).orderBy(desc2(appVersions.releasedAt));
      const webVersion = versions.find((v) => v.platform === "web");
      const androidVersion = versions.find((v) => v.platform === "android");
      const iosVersion = versions.find((v) => v.platform === "ios");
      res.json({
        status: {
          server: "running",
          database: "connected",
          uptime: process.uptime(),
          nodeVersion: process.version,
          memoryUsage: process.memoryUsage()
        },
        versions: {
          web: webVersion?.version || "N/A",
          android: androidVersion?.version || "N/A",
          ios: iosVersion?.version || "N/A"
        },
        lastDeployment: versions[0]?.releasedAt || null
      });
    } catch (error) {
      console.error("Get deployment status error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju statusa" });
    }
  });
  app2.get("/api/admin/categories", isAdminAuth, async (req, res) => {
    try {
      const allCategories = await db.select().from(categories).orderBy(asc2(categories.sortOrder));
      const categoriesWithSubs = await Promise.all(
        allCategories.map(async (cat) => {
          const subs = await db.select().from(subcategories).where(eq5(subcategories.categoryId, cat.id)).orderBy(asc2(subcategories.sortOrder));
          const itemCount = await db.select({ count: sql3`count(*)` }).from(items).where(eq5(items.categoryId, cat.id));
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
      res.status(500).json({ message: "Gre\u0161ka pri u\u010Ditavanju kategorija" });
    }
  });
  app2.post("/api/admin/categories", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { name, slug, icon, sortOrder } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ message: "Naziv i slug su obavezni" });
      }
      const [newCategory] = await db.insert(categories).values({
        name,
        slug,
        icon,
        sortOrder: sortOrder || 0,
        isActive: true
      }).returning();
      await logAdminAction(admin.id, "create_category", "category", newCategory.id, `Created category: ${name}`, req.ip);
      res.json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error.code === "23505") {
        return res.status(400).json({ message: "Kategorija sa ovim nazivom ili slugom ve\u0107 postoji" });
      }
      res.status(500).json({ message: "Gre\u0161ka pri kreiranju kategorije" });
    }
  });
  app2.put("/api/admin/categories/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { id } = req.params;
      const { name, slug, icon, sortOrder, isActive } = req.body;
      const [updated] = await db.update(categories).set({ name, slug, icon, sortOrder, isActive }).where(eq5(categories.id, id)).returning();
      if (!updated) {
        return res.status(404).json({ message: "Kategorija nije prona\u0111ena" });
      }
      await logAdminAction(admin.id, "update_category", "category", id, `Updated category: ${name}`, req.ip);
      res.json(updated);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Gre\u0161ka pri a\u017Euriranju kategorije" });
    }
  });
  app2.delete("/api/admin/categories/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { id } = req.params;
      const itemCount = await db.select({ count: sql3`count(*)` }).from(items).where(eq5(items.categoryId, id));
      if (Number(itemCount[0]?.count || 0) > 0) {
        return res.status(400).json({
          message: "Ne mo\u017Eete obrisati kategoriju koja ima oglase. Prvo premestite oglase u drugu kategoriju."
        });
      }
      const [deleted] = await db.delete(categories).where(eq5(categories.id, id)).returning();
      if (!deleted) {
        return res.status(404).json({ message: "Kategorija nije prona\u0111ena" });
      }
      await logAdminAction(admin.id, "delete_category", "category", id, `Deleted category: ${deleted.name}`, req.ip);
      res.json({ message: "Kategorija uspe\u0161no obrisana" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Gre\u0161ka pri brisanju kategorije" });
    }
  });
  app2.post("/api/admin/subcategories", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
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
        isActive: true
      }).returning();
      await logAdminAction(admin.id, "create_subcategory", "subcategory", newSubcategory.id, `Created subcategory: ${name}`, req.ip);
      res.json(newSubcategory);
    } catch (error) {
      console.error("Error creating subcategory:", error);
      res.status(500).json({ message: "Gre\u0161ka pri kreiranju podkategorije" });
    }
  });
  app2.put("/api/admin/subcategories/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { id } = req.params;
      const { name, slug, icon, sortOrder, isActive } = req.body;
      const [updated] = await db.update(subcategories).set({ name, slug, icon, sortOrder, isActive }).where(eq5(subcategories.id, id)).returning();
      if (!updated) {
        return res.status(404).json({ message: "Podkategorija nije prona\u0111ena" });
      }
      await logAdminAction(admin.id, "update_subcategory", "subcategory", id, `Updated subcategory: ${name}`, req.ip);
      res.json(updated);
    } catch (error) {
      console.error("Error updating subcategory:", error);
      res.status(500).json({ message: "Gre\u0161ka pri a\u017Euriranju podkategorije" });
    }
  });
  app2.delete("/api/admin/subcategories/:id", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { id } = req.params;
      const itemCount = await db.select({ count: sql3`count(*)` }).from(items).where(eq5(items.subcategoryId, id));
      if (Number(itemCount[0]?.count || 0) > 0) {
        return res.status(400).json({
          message: "Ne mo\u017Eete obrisati podkategoriju koja ima oglase."
        });
      }
      const [deleted] = await db.delete(subcategories).where(eq5(subcategories.id, id)).returning();
      if (!deleted) {
        return res.status(404).json({ message: "Podkategorija nije prona\u0111ena" });
      }
      await logAdminAction(admin.id, "delete_subcategory", "subcategory", id, `Deleted subcategory: ${deleted.name}`, req.ip);
      res.json({ message: "Podkategorija uspe\u0161no obrisana" });
    } catch (error) {
      console.error("Error deleting subcategory:", error);
      res.status(500).json({ message: "Gre\u0161ka pri brisanju podkategorije" });
    }
  });
  app2.get("/api/admin/system-settings", isAdminAuth, async (req, res) => {
    try {
      const earlyAdopterCount = await db.select({ count: sql3`count(*)` }).from(users).where(eq5(users.isEarlyAdopter, true));
      const totalUsersCount = await db.select({ count: sql3`count(*)` }).from(users);
      const premiumPopupToggle = await db.select().from(featureToggles).where(eq5(featureToggles.name, "premium_popup")).limit(1);
      const earlyAdopterToggle = await db.select().from(featureToggles).where(eq5(featureToggles.name, "early_adopter_program")).limit(1);
      res.json({
        earlyAdopterCount: Number(earlyAdopterCount[0]?.count || 0),
        remainingSlots: Math.max(0, 100 - Number(earlyAdopterCount[0]?.count || 0)),
        totalUsers: Number(totalUsersCount[0]?.count || 0),
        premiumPopupEnabled: premiumPopupToggle[0]?.isEnabled ?? true,
        earlyAdopterProgramEnabled: earlyAdopterToggle[0]?.isEnabled ?? true
      });
    } catch (error) {
      console.error("Get system settings error:", error);
      res.status(500).json({ message: "Greska pri ucitavanju podesavanja" });
    }
  });
  app2.post("/api/admin/reset-early-adopter", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const beforeCount = await db.select({ count: sql3`count(*)` }).from(users).where(eq5(users.isEarlyAdopter, true));
      await db.update(users).set({
        isEarlyAdopter: false,
        subscriptionType: sql3`CASE WHEN subscription_type = 'premium' AND subscription_status = 'active' AND subscription_end_date > NOW() THEN 'premium' ELSE 'free' END`
      }).where(eq5(users.isEarlyAdopter, true));
      await logAdminAction(
        admin.id,
        "reset_early_adopter",
        "system",
        void 0,
        `Reset early adopter counter. ${beforeCount[0]?.count || 0} users were reset. Next 100 users will get free premium.`,
        req.ip
      );
      res.json({
        success: true,
        message: `Uspesno resetovano! ${beforeCount[0]?.count || 0} korisnika je resetovano. Sledecih 100 novih korisnika dobice besplatno premium clanstvo.`,
        resetCount: Number(beforeCount[0]?.count || 0)
      });
    } catch (error) {
      console.error("Reset early adopter error:", error);
      res.status(500).json({ message: "Greska pri resetovanju early adopter brojaca" });
    }
  });
  app2.post("/api/admin/toggle-premium-popup", isAdminAuth, async (req, res) => {
    try {
      const admin = req.admin;
      const { enabled } = req.body;
      const existing = await db.select().from(featureToggles).where(eq5(featureToggles.name, "premium_popup")).limit(1);
      if (existing.length === 0) {
        await db.insert(featureToggles).values({
          name: "premium_popup",
          description: "Prikazuje popup za premium pretplatu korisnicima",
          isEnabled: enabled,
          enabledForPercentage: 100
        });
      } else {
        await db.update(featureToggles).set({ isEnabled: enabled }).where(eq5(featureToggles.name, "premium_popup"));
      }
      await logAdminAction(
        admin.id,
        enabled ? "enable_premium_popup" : "disable_premium_popup",
        "feature_toggle",
        "premium_popup",
        `Premium popup ${enabled ? "enabled" : "disabled"}`,
        req.ip
      );
      res.json({
        success: true,
        message: `Premium popup je ${enabled ? "ukljucen" : "iskljucen"}.`
      });
    } catch (error) {
      console.error("Toggle premium popup error:", error);
      res.status(500).json({ message: "Greska pri promeni podesavanja" });
    }
  });
  console.log("[ADMIN] Admin panel API routes registered");
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
        <a href="https://expo.dev/artifacts/eas/kBvrMhL9Lw5pfmLCeD35KB.apk" class="btn-primary" style="display: inline-flex; align-items: center; gap: 8px;" target="_blank" rel="noopener noreferrer">
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

// server/admin-panel-template.ts
var ADMIN_PANEL_TEMPLATE = `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>VikendMajstor Admin Panel</title>
  <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>\u{1F6E0}\uFE0F</text></svg>">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --primary: #FFCC00;
      --primary-dark: #E6B800;
      --secondary: #1A1A1A;
      --background: #0D0D0D;
      --background-card: #1A1A1A;
      --background-hover: #252525;
      --text-primary: #FFFFFF;
      --text-secondary: #A0A0A0;
      --text-tertiary: #666666;
      --border: #333333;
      --success: #10B981;
      --warning: #F59E0B;
      --error: #EF4444;
      --info: #3B82F6;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--background);
      color: var(--text-primary);
      min-height: 100vh;
    }
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      background: var(--background-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 40px;
    }
    .login-header { text-align: center; margin-bottom: 32px; }
    .login-logo { font-size: 48px; margin-bottom: 16px; }
    .login-header h1 { font-size: 24px; font-weight: 700; color: var(--primary); margin-bottom: 4px; }
    .login-header p { color: var(--text-secondary); font-size: 14px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 14px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; }
    .input {
      width: 100%;
      padding: 12px 16px;
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 14px;
    }
    .input:focus { outline: none; border-color: var(--primary); }
    .btn {
      width: 100%;
      padding: 14px;
      background: var(--primary);
      color: var(--secondary);
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn:hover { background: var(--primary-dark); }
    .btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-sm { padding: 8px 16px; font-size: 13px; width: auto; }
    .btn-secondary { background: var(--background-hover); color: var(--text-primary); border: 1px solid var(--border); }
    .btn-secondary:hover { background: var(--border); }
    .btn-success { background: var(--success); color: white; }
    .btn-error { background: var(--error); color: white; }
    .error { background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; padding: 12px; color: var(--error); margin-bottom: 20px; font-size: 14px; }
    .success-msg { background: rgba(16, 185, 129, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 12px; color: var(--success); margin-bottom: 20px; font-size: 14px; }
    .login-footer { margin-top: 24px; text-align: center; }
    .login-footer p { font-size: 12px; color: var(--text-tertiary); }
    
    .layout { display: flex; min-height: 100vh; }
    .sidebar { width: 260px; background: var(--background-card); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; height: 100vh; overflow-y: auto; }
    .sidebar-header { padding: 24px; border-bottom: 1px solid var(--border); }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-icon { font-size: 28px; }
    .logo-text { font-size: 18px; font-weight: 700; color: var(--primary); }
    .logo-subtitle { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; margin-left: 38px; }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-section { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-tertiary); padding: 16px 16px 8px; margin-top: 8px; }
    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px;
      background: transparent; border: none; color: var(--text-secondary); font-size: 14px;
      font-weight: 500; cursor: pointer; text-align: left; width: 100%; transition: all 0.2s;
    }
    .nav-item:hover { background: var(--background-hover); color: var(--text-primary); }
    .nav-item.active { background: var(--primary); color: var(--secondary); }
    .nav-icon { font-size: 18px; width: 24px; text-align: center; }
    .main-content { flex: 1; padding: 32px; margin-left: 260px; min-height: 100vh; }
    .page-header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
    .page-header-left h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .page-header-left p { color: var(--text-secondary); font-size: 14px; }
    .page-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .stat-card { background: var(--background-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; }
    .stat-icon { font-size: 24px; margin-bottom: 12px; }
    .stat-value { font-size: 36px; font-weight: 700; color: var(--text-primary); }
    .stat-label { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
    .stat-change { font-size: 12px; margin-top: 8px; }
    .stat-change.positive { color: var(--success); }
    .stat-change.negative { color: var(--error); }
    .card { background: var(--background-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .card h3 { font-size: 16px; font-weight: 600; }
    .sidebar-footer { padding: 16px; border-top: 1px solid var(--border); }
    .admin-info { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .admin-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: var(--secondary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
    .admin-name { font-weight: 600; font-size: 14px; }
    .admin-role { font-size: 12px; color: var(--text-tertiary); }
    .logout-btn { width: 100%; padding: 10px; background: var(--background-hover); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all 0.2s; }
    .logout-btn:hover { background: var(--error); border-color: var(--error); color: white; }
    
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--border); }
    th { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; background: var(--background); }
    tr:hover td { background: var(--background-hover); }
    .badge { display: inline-flex; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .badge-success { background: rgba(16, 185, 129, 0.15); color: var(--success); }
    .badge-warning { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
    .badge-error { background: rgba(239, 68, 68, 0.15); color: var(--error); }
    .badge-info { background: rgba(59, 130, 246, 0.15); color: var(--info); }
    .hidden { display: none !important; }
    
    .action-btn { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; margin-right: 4px; }
    .action-btn-success { background: rgba(16, 185, 129, 0.15); color: var(--success); }
    .action-btn-success:hover { background: var(--success); color: white; }
    .action-btn-error { background: rgba(239, 68, 68, 0.15); color: var(--error); }
    .action-btn-error:hover { background: var(--error); color: white; }
    .action-btn-info { background: rgba(59, 130, 246, 0.15); color: var(--info); }
    .action-btn-info:hover { background: var(--info); color: white; }
    
    .loading { display: flex; align-items: center; justify-content: center; padding: 40px; color: var(--text-tertiary); }
    .spinner { width: 24px; height: 24px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-right: 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal { background: var(--background-card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; }
    .modal h2 { font-size: 20px; margin-bottom: 8px; }
    .modal p { color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; }
    .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .modal-actions .btn { width: auto; }
    
    .toggle-switch { position: relative; width: 48px; height: 26px; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; cursor: pointer; inset: 0; background: var(--border); border-radius: 26px; transition: 0.3s; }
    .toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
    .toggle-switch input:checked + .toggle-slider { background: var(--success); }
    .toggle-switch input:checked + .toggle-slider:before { transform: translateX(22px); }
    
    .filter-row { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .filter-row select, .filter-row input { padding: 10px 14px; background: var(--background); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px; }
    
    .message-item { padding: 16px; background: var(--background); border-radius: 8px; margin-bottom: 12px; }
    .message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .message-content { color: var(--text-secondary); font-size: 14px; }
    
    .checkbox-row { display: flex; align-items: center; gap: 8px; }
    .checkbox-row input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--primary); }
    
    @media (max-width: 768px) {
      .sidebar { width: 100%; height: auto; position: relative; }
      .main-content { margin-left: 0; padding: 16px; }
      .layout { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div id="root">
    <div id="login-page" class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">\u{1F6E0}\uFE0F</div>
          <h1>VikendMajstor</h1>
          <p>Admin Panel</p>
        </div>
        <div id="login-error" class="error hidden"></div>
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email adresa</label>
            <input type="email" id="email" class="input" placeholder="admin@vikendmajstor.rs" required>
          </div>
          <div class="form-group">
            <label for="password">Lozinka</label>
            <input type="password" id="password" class="input" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required>
          </div>
          <div class="form-group hidden" id="2fa-group">
            <label for="twoFactorCode">2FA kod iz Google Authenticator</label>
            <input type="text" id="twoFactorCode" class="input" placeholder="000000" maxlength="6" 
                   style="text-align:center;font-size:20px;letter-spacing:6px;font-weight:bold;"
                   oninput="this.value = this.value.replace(/[^0-9]/g, '')">
          </div>
          <button type="submit" class="btn" id="login-btn">Prijavi se</button>
        </form>
        <div class="login-footer">
          <p>Pristup je ogranicen samo za administratore.</p>
        </div>
      </div>
    </div>

    <div id="dashboard" class="layout hidden">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">\u{1F6E0}\uFE0F</span>
            <span class="logo-text">VikendMajstor</span>
          </div>
          <div class="logo-subtitle">Admin Panel</div>
        </div>
        <nav class="sidebar-nav">
          <button class="nav-item active" data-page="dashboard"><span class="nav-icon">\u{1F4CA}</span> Dashboard</button>
          <div class="nav-section">Upravljanje</div>
          <button class="nav-item" data-page="users"><span class="nav-icon">\u{1F465}</span> Korisnici</button>
          <button class="nav-item" data-page="items"><span class="nav-icon">\u{1F527}</span> Oglasi</button>
          <button class="nav-item" data-page="subscriptions"><span class="nav-icon">\u{1F4B3}</span> Pretplate</button>
          <button class="nav-item" data-page="plans"><span class="nav-icon">\u{1F4CB}</span> Planovi</button>
          <button class="nav-item" data-page="item-stats"><span class="nav-icon">\u{1F4CA}</span> Statistika oglasa</button>
          <div class="nav-section">Moderacija</div>
          <button class="nav-item" data-page="reports"><span class="nav-icon">\u{1F6A9}</span> Prijave oglasa</button>
          <button class="nav-item" data-page="user-reports"><span class="nav-icon">\u{1F464}</span> Prijave korisnika</button>
          <button class="nav-item" data-page="messages"><span class="nav-icon">\u{1F4AC}</span> Poruke</button>
          <div class="nav-section">Analitika</div>
          <button class="nav-item" data-page="analytics"><span class="nav-icon">\u{1F4C8}</span> Analitika</button>
          <button class="nav-item" data-page="logs"><span class="nav-icon">\u{1F4CB}</span> Admin logovi</button>
          <button class="nav-item" data-page="error-logs"><span class="nav-icon">\u26A0\uFE0F</span> Logovi gresaka</button>
          <div class="nav-section">Sistem</div>
          <button class="nav-item" data-page="settings"><span class="nav-icon">\u2699\uFE0F</span> Podesavanja</button>
          <button class="nav-item" data-page="app-versions"><span class="nav-icon">\u{1F4F1}</span> Verzije aplikacije</button>
          <button class="nav-item" data-page="security"><span class="nav-icon">\u{1F510}</span> Bezbednost</button>
          <button class="nav-item" data-page="notifications"><span class="nav-icon">\u{1F514}</span> Notifikacije</button>
          <button class="nav-item" data-page="subscribers"><span class="nav-icon">\u{1F4E7}</span> Email pretplatnici</button>
        </nav>
        <div class="sidebar-footer">
          <div class="admin-info">
            <div class="admin-avatar" id="admin-avatar">A</div>
            <div>
              <div class="admin-name" id="admin-name">Admin</div>
              <div class="admin-role" id="admin-role">superadmin</div>
            </div>
          </div>
          <button class="logout-btn" id="logout-btn">Odjavi se</button>
        </div>
      </aside>
      
      <main class="main-content">
        <!-- Dashboard Page -->
        <div id="page-dashboard">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Dashboard</h1>
              <p>Pregled stanja platforme VikendMajstor</p>
            </div>
          </div>
          <div class="stats-grid" id="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">\u{1F465}</div>
              <div class="stat-value" id="stat-users">-</div>
              <div class="stat-label">Ukupno korisnika</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">\u2705</div>
              <div class="stat-value" id="stat-active">-</div>
              <div class="stat-label">Aktivni korisnici</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">\u{1F527}</div>
              <div class="stat-value" id="stat-items">-</div>
              <div class="stat-label">Ukupno oglasa</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">\u{1F4E2}</div>
              <div class="stat-value" id="stat-active-items">-</div>
              <div class="stat-label">Aktivni oglasi</div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3>Poslednje aktivnosti</h3>
            </div>
            <div id="activity-list"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></div>
          </div>
        </div>
        
        <!-- Users Page -->
        <div id="page-users" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Korisnici</h1>
              <p>Upravljanje korisnicima platforme</p>
            </div>
            <div class="page-header-actions">
              <button class="btn btn-sm btn-secondary" onclick="exportCSV('users')">\u{1F4E5} Eksportuj CSV</button>
              <button class="btn btn-sm btn-error" onclick="showBulkSuspendModal()">\u26D4 Bulk suspenzija</button>
            </div>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th><input type="checkbox" id="select-all-users" onchange="toggleSelectAll('users')"></th>
                    <th>Korisnik</th>
                    <th>Email</th>
                    <th>Uloga</th>
                    <th>Pretplata</th>
                    <th>Status</th>
                    <th>Oglasi/Rez.</th>
                    <th>Registracija</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody id="users-table">
                  <tr><td colspan="9"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Items Page -->
        <div id="page-items" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Oglasi</h1>
              <p>Moderacija i upravljanje oglasima</p>
            </div>
            <div class="page-header-actions">
              <button class="btn btn-sm btn-secondary" onclick="exportCSV('items')">\u{1F4E5} Eksportuj CSV</button>
              <button class="btn btn-sm btn-error" onclick="showBulkDeleteModal()">\u{1F5D1}\uFE0F Bulk brisanje</button>
            </div>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th><input type="checkbox" id="select-all-items" onchange="toggleSelectAll('items')"></th>
                    <th>Oglas</th>
                    <th>Kategorija</th>
                    <th>Vlasnik</th>
                    <th>Cena/dan</th>
                    <th>Pregledi</th>
                    <th>Status</th>
                    <th>Datum</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody id="items-table">
                  <tr><td colspan="9"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Subscriptions Page -->
        <div id="page-subscriptions" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Pretplate</h1>
              <p>Upravljanje pretplatama i planovima</p>
            </div>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Korisnik</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Pocetak</th>
                    <th>Kraj</th>
                    <th>Iznos</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody id="subscriptions-table">
                  <tr><td colspan="9"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Reports Page -->
        <div id="page-reports" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Prijavljeni oglasi</h1>
              <p>Pregled i obrada prijava oglasa</p>
            </div>
          </div>
          <div class="filter-row">
            <select id="reports-filter" onchange="loadReports()">
              <option value="pending">Na cekanju</option>
              <option value="resolved">Reseni</option>
              <option value="all">Svi</option>
            </select>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Oglas</th>
                    <th>Prijavio</th>
                    <th>Razlog</th>
                    <th>Opis</th>
                    <th>Status</th>
                    <th>Datum</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody id="reports-table">
                  <tr><td colspan="7"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Messages Page -->
        <div id="page-messages" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Poruke korisnika</h1>
              <p>Pregled interne komunikacije</p>
            </div>
          </div>
          <div class="card">
            <div id="messages-list"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></div>
          </div>
        </div>
        
        <!-- Analytics Page -->
        <div id="page-analytics" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Analitika</h1>
              <p>Pregled performansi platforme</p>
            </div>
          </div>
          <div class="stats-grid" id="analytics-stats"></div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div class="card">
              <div class="card-header">
                <h3>Popularne kategorije</h3>
              </div>
              <div id="categories-list"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></div>
            </div>
            <div class="card">
              <div class="card-header">
                <h3>Aktivni gradovi</h3>
              </div>
              <div id="cities-list"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3>Konverzioni levak</h3>
            </div>
            <div id="funnel-chart"></div>
          </div>
        </div>
        
        <!-- Admin Logs Page -->
        <div id="page-logs" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Admin logovi</h1>
              <p>Istorija akcija administratora</p>
            </div>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Akcija</th>
                    <th>Tip</th>
                    <th>Detalji</th>
                    <th>IP Adresa</th>
                    <th>Datum</th>
                  </tr>
                </thead>
                <tbody id="logs-table">
                  <tr><td colspan="6"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Settings Page (Feature Toggles) -->
        <div id="page-settings" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Podesavanja</h1>
              <p>Upravljanje feature flagovima i sistemskim podesavanjima</p>
            </div>
            <div class="page-header-actions">
              <button class="btn btn-sm" onclick="showAddFeatureModal()">+ Dodaj feature</button>
            </div>
          </div>
          
          <!-- System Settings Card -->
          <div class="card" style="margin-bottom: 24px;">
            <div class="card-header">
              <h3>Sistemska podesavanja</h3>
            </div>
            <div id="system-settings-content">
              <div class="loading"><div class="spinner"></div>Ucitavanje...</div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h3>Feature Toggles</h3>
            </div>
            <div id="features-list"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></div>
          </div>
        </div>
        
        <!-- Notifications Page -->
        <div id="page-notifications" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Notifikacije</h1>
              <p>Slanje push i email notifikacija korisnicima</p>
            </div>
            <div class="page-header-actions">
              <button class="btn btn-sm" onclick="showSendNotificationModal()">\u{1F4E4} Posalji notifikaciju</button>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3>Istorija poslatih notifikacija</h3>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Tip</th>
                    <th>Naslov</th>
                    <th>Poruka</th>
                    <th>Ciljna grupa</th>
                    <th>Poslato</th>
                    <th>Datum</th>
                  </tr>
                </thead>
                <tbody id="notifications-table">
                  <tr><td colspan="6"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Subscribers Page -->
        <div id="page-subscribers" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Email pretplatnici</h1>
              <p>Svi korisnici platforme i newsletter pretplatnici</p>
            </div>
            <div class="page-header-actions">
              <button class="btn btn-sm" onclick="exportSubscribers()">\u{1F4E5} Izvezi CSV</button>
            </div>
          </div>
          <div class="stats-grid" style="margin-bottom: 20px;">
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--primary);">\u{1F4E7}</div>
              <div class="stat-info">
                <span class="stat-value" id="stats-newsletter">0</span>
                <span class="stat-label">Newsletter</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--success);">\u{1F464}</div>
              <div class="stat-info">
                <span class="stat-value" id="stats-registered">0</span>
                <span class="stat-label">Registrovani</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: var(--warning);">\u{1F4CA}</div>
              <div class="stat-info">
                <span class="stat-value" id="stats-total">0</span>
                <span class="stat-label">Ukupno</span>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3>Svi pretplatnici (<span id="subscribers-count">0</span>)</h3>
              <div class="filter-group">
                <select id="subscriber-type-filter" onchange="filterSubscribers()" style="padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border);">
                  <option value="all">Svi tipovi</option>
                  <option value="registered">Registrovani korisnici</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Tip</th>
                    <th>Email</th>
                    <th>Ime</th>
                    <th>Izvor</th>
                    <th>Pretplata</th>
                    <th>Status</th>
                    <th>Datum</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody id="subscribers-table">
                  <tr><td colspan="9"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Plans Page -->
        <div id="page-plans" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Planovi pretplata</h1>
              <p>Upravljanje planovima i cenama</p>
            </div>
            <div class="page-header-actions">
              <button class="btn btn-sm" onclick="showAddPlanModal()">+ Dodaj plan</button>
            </div>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Naziv</th>
                    <th>Cena (RSD)</th>
                    <th>Trajanje</th>
                    <th>Max oglasa</th>
                    <th>Status</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody id="plans-table">
                  <tr><td colspan="6"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Item Stats Page -->
        <div id="page-item-stats" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Statistika oglasa</h1>
              <p>Pregled pregleda, rezervacija i prihoda</p>
            </div>
          </div>
          <div class="stats-grid" id="item-stats-overview"></div>
          <div class="card">
            <div class="card-header">
              <h3>Top 20 oglasa</h3>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Oglas</th>
                    <th>Pregledi</th>
                    <th>Rezervacije</th>
                    <th>Zavrsene</th>
                    <th>Cena/dan</th>
                    <th>Prihod</th>
                  </tr>
                </thead>
                <tbody id="item-stats-table">
                  <tr><td colspan="6"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- User Reports Page -->
        <div id="page-user-reports" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Prijave korisnika</h1>
              <p>Pregled prijavljenih korisnika</p>
            </div>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Prijavljeni korisnik</th>
                    <th>Prijavljen od</th>
                    <th>Razlog</th>
                    <th>Status</th>
                    <th>Datum</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody id="user-reports-table">
                  <tr><td colspan="6"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Error Logs Page -->
        <div id="page-error-logs" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Logovi gresaka</h1>
              <p>Pregled serverskih gresaka</p>
            </div>
            <div class="page-header-actions">
              <button class="btn btn-sm btn-danger" onclick="clearErrorLogs()">Obrisi sve</button>
            </div>
          </div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nivo</th>
                    <th>Poruka</th>
                    <th>Endpoint</th>
                    <th>IP</th>
                    <th>Datum</th>
                  </tr>
                </thead>
                <tbody id="error-logs-table">
                  <tr><td colspan="5"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- App Versions Page -->
        <div id="page-app-versions" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Verzije aplikacije</h1>
              <p>Upravljanje verzijama za Web, Android i iOS</p>
            </div>
            <div class="page-header-actions">
              <button class="btn btn-sm" onclick="showAddVersionModal()">+ Dodaj verziju</button>
            </div>
          </div>
          <div class="stats-grid" id="version-stats"></div>
          <div class="card">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Platforma</th>
                    <th>Verzija</th>
                    <th>Build</th>
                    <th>Obavezno</th>
                    <th>Objavljeno</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody id="versions-table">
                  <tr><td colspan="6"><div class="loading"><div class="spinner"></div>Ucitavanje...</div></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <!-- Security Page (2FA) -->
        <div id="page-security" class="hidden">
          <div class="page-header">
            <div class="page-header-left">
              <h1>Bezbednost</h1>
              <p>Dvofaktorska autentifikacija i eksport podataka</p>
            </div>
          </div>
          <div class="card" style="margin-bottom: 20px;">
            <div class="card-header">
              <h3>Dvofaktorska autentifikacija (2FA)</h3>
            </div>
            <div id="2fa-status" style="padding: 20px;">
              <div class="loading"><div class="spinner"></div>Ucitavanje...</div>
            </div>
          </div>
          <div class="card" style="margin-bottom: 20px;">
            <div class="card-header">
              <h3>Status servera</h3>
            </div>
            <div id="server-status" style="padding: 20px;">
              <div class="loading"><div class="spinner"></div>Ucitavanje...</div>
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3>Eksport podataka</h3>
            </div>
            <div style="padding: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
              <button class="btn" onclick="exportCSV('users')">\u{1F4E5} Eksportuj korisnike (CSV)</button>
              <button class="btn" onclick="exportCSV('items')">\u{1F4E5} Eksportuj oglase (CSV)</button>
              <button class="btn" onclick="exportCSV('transactions')">\u{1F4E5} Eksportuj transakcije (CSV)</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- Modals -->
  <div id="modal-overlay" class="modal-overlay hidden"></div>

  <script>
    const API_URL = '';
    let token = localStorage.getItem('admin_token');
    let admin = null;
    let selectedUsers = [];
    let selectedItems = [];

    async function api(endpoint, options = {}) {
      const headers = { 'Content-Type': 'application/json', ...options.headers };
      if (token) headers['Authorization'] = 'Bearer ' + token;
      
      try {
        const res = await fetch(API_URL + endpoint, { ...options, headers, credentials: 'include' });
        
        if (options.responseType === 'blob') {
          if (!res.ok) throw new Error('Eksport nije uspeo');
          return res.blob();
        }
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Zahtev nije uspeo');
        }
        return res.json();
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }

    function showPage(page) {
      document.querySelectorAll('[id^="page-"]').forEach(p => p.classList.add('hidden'));
      document.getElementById('page-' + page).classList.remove('hidden');
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.querySelector('[data-page="' + page + '"]')?.classList.add('active');
      
      const loaders = {
        dashboard: loadDashboard,
        users: loadUsers,
        items: loadItems,
        subscriptions: loadSubscriptions,
        plans: loadPlans,
        'item-stats': loadItemStats,
        'user-reports': loadUserReports,
        'error-logs': loadErrorLogs,
        'app-versions': loadAppVersions,
        security: loadSecurity,
        analytics: loadAnalytics,
        reports: loadReports,
        messages: loadMessages,
        logs: loadLogs,
        settings: loadSettings,
        notifications: loadNotifications,
        subscribers: loadSubscribers
      };
      if (loaders[page]) loaders[page]();
    }

    async function loadDashboard() {
      try {
        const stats = await api('/api/admin/stats');
        document.getElementById('stat-users').textContent = stats.totalUsers || 0;
        document.getElementById('stat-active').textContent = stats.activeUsers || 0;
        document.getElementById('stat-items').textContent = stats.totalItems || 0;
        document.getElementById('stat-active-items').textContent = stats.activeItems || 0;
        
        const activity = await api('/api/admin/activity');
        const list = document.getElementById('activity-list');
        
        if (!activity.activities?.length) {
          list.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 20px;">Nema skorijih aktivnosti</p>';
        } else {
          list.innerHTML = activity.activities.map(a => 
            \`<div style="padding: 14px; background: var(--background); border-radius: 8px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
            <div><span style="margin-right: 12px;">\${a.icon}</span>\${a.description}</div>
            <span style="color: var(--text-tertiary); font-size: 12px;">\${a.time}</span></div>\`
          ).join('');
        }
      } catch (e) {
        document.getElementById('activity-list').innerHTML = '<p style="color: var(--error); text-align: center; padding: 20px;">Greska pri ucitavanju</p>';
      }
    }

    async function loadUsers() {
      try {
        const data = await api('/api/admin/users');
        const tbody = document.getElementById('users-table');
        selectedUsers = [];
        
        if (!data.users?.length) {
          tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-tertiary); padding: 40px;">Nema korisnika</td></tr>';
        } else {
          tbody.innerHTML = data.users.map(u => 
            \`<tr style="\${u.isDemo ? 'opacity: 0.6; background: rgba(255,204,0,0.05);' : ''}">
            <td><input type="checkbox" class="user-checkbox" value="\${u.id}" onchange="updateSelection('users')"></td>
            <td>
              <strong>\${u.name || 'Nepoznato'}</strong>
              \${u.isDemo ? '<br><span class="badge badge-warning" style="font-size:10px;padding:2px 6px;">DEMO</span>' : ''}
            </td>
            <td>\${u.email}</td>
            <td>\${u.role || 'user'}</td>
            <td><span class="badge badge-\${u.subscriptionType === 'premium' ? 'warning' : u.subscriptionType === 'basic' || u.subscriptionType === 'standard' ? 'info' : 'success'}">\${u.subscriptionType || 'free'}</span></td>
            <td><span class="badge \${u.isActive ? 'badge-success' : 'badge-error'}">\${u.isActive ? 'Aktivan' : 'Suspendovan'}</span></td>
            <td>\${u.itemCount || 0} / \${u.bookingCount || 0}</td>
            <td>\${new Date(u.createdAt).toLocaleDateString('sr-RS')}</td>
            <td>
            <button class="action-btn action-btn-info" onclick="showUserDetails('\${u.id}')" title="Detalji">Detalji</button>
            \${u.isActive 
              ? \`<button class="action-btn action-btn-error" onclick="suspendUser('\${u.id}')">Suspenduj</button>\`
              : \`<button class="action-btn action-btn-success" onclick="activateUser('\${u.id}')">Aktiviraj</button>\`}
            </td></tr>\`
          ).join('');
        }
      } catch (e) {
        document.getElementById('users-table').innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--error); padding: 40px;">Greska pri ucitavanju</td></tr>';
      }
    }

    async function viewUserActivity(userId) {
      try {
        const data = await api(\`/api/admin/users/\${userId}/activity\`);
        const activities = data.activities || [];
        
        const html = activities.length ? 
          activities.map(a => \`<div style="padding: 12px; background: var(--background); border-radius: 8px; margin-bottom: 8px;">
            <div style="font-weight: 500;">\${a.action}</div>
            <div style="color: var(--text-tertiary); font-size: 12px; margin-top: 4px;">\${new Date(a.createdAt).toLocaleString('sr-RS')}</div>
            \${a.details ? \`<div style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">\${a.details}</div>\` : ''}
          </div>\`).join('') :
          '<p style="color: var(--text-tertiary); text-align: center; padding: 20px;">Nema aktivnosti za ovog korisnika</p>';
        
        showModal('Istorija aktivnosti', '', html);
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function suspendUser(userId) {
      if (!confirm('Da li ste sigurni da zelite da suspendujete ovog korisnika?')) return;
      try {
        await api('/api/admin/users/' + userId + '/suspend', { method: 'POST' });
        loadUsers();
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function activateUser(userId) {
      try {
        await api('/api/admin/users/' + userId + '/activate', { method: 'POST' });
        loadUsers();
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function loadItems() {
      try {
        const data = await api('/api/admin/items');
        const tbody = document.getElementById('items-table');
        selectedItems = [];
        
        if (!data.items?.length) {
          tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--text-tertiary); padding: 40px;">Nema oglasa</td></tr>';
        } else {
          tbody.innerHTML = data.items.map(i => 
            \`<tr>
            <td><input type="checkbox" class="item-checkbox" value="\${i.id}" onchange="updateSelection('items')"></td>
            <td><strong>\${i.title}</strong></td>
            <td>\${i.category || '-'}</td>
            <td>\${i.ownerName || 'Nepoznato'}</td>
            <td>\${i.pricePerDay} RSD</td>
            <td style="text-align:center;">\${i.views || 0}</td>
            <td><span class="badge \${i.status === 'active' ? 'badge-success' : 'badge-warning'}">\${i.status === 'active' ? 'Aktivan' : 'Na cekanju'}</span></td>
            <td>\${new Date(i.createdAt).toLocaleDateString('sr-RS')}</td>
            <td>
            \${i.status !== 'active' ? \`<button class="action-btn action-btn-success" onclick="approveItem('\${i.id}')">Odobri</button>\` : ''}
            <button class="action-btn action-btn-error" onclick="deleteItem('\${i.id}')">Obrisi</button>
            </td></tr>\`
          ).join('');
        }
      } catch (e) {
        document.getElementById('items-table').innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--error); padding: 40px;">Greska pri ucitavanju</td></tr>';
      }
    }

    async function approveItem(itemId) {
      try {
        await api('/api/admin/items/' + itemId + '/approve', { method: 'POST' });
        loadItems();
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function deleteItem(itemId) {
      if (!confirm('Da li ste sigurni da zelite da obrisete ovaj oglas?')) return;
      try {
        await api('/api/admin/items/' + itemId, { method: 'DELETE' });
        loadItems();
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function loadSubscriptions() {
      try {
        const data = await api('/api/admin/subscriptions');
        const tbody = document.getElementById('subscriptions-table');
        
        if (!data.subscriptions?.length) {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-tertiary); padding: 40px;">Nema aktivnih pretplata</td></tr>';
        } else {
          tbody.innerHTML = data.subscriptions.map(s => 
            \`<tr>
            <td><strong>\${s.userName || 'Nepoznato'}</strong></td>
            <td>\${s.userEmail || '-'}</td>
            <td><span class="badge badge-warning">\${s.tier}</span></td>
            <td><span class="badge badge-success">\${s.status}</span></td>
            <td>\${new Date(s.startDate).toLocaleDateString('sr-RS')}</td>
            <td>\${new Date(s.endDate).toLocaleDateString('sr-RS')}</td>
            <td>\${s.amount} RSD</td>
            <td>
              <button class="action-btn action-btn-info" onclick="showEditSubscriptionModal('\${s.userId}', '\${s.tier}', '\${s.status}', '\${s.endDate}')" title="Izmeni">\u270F\uFE0F</button>
            </td></tr>\`
          ).join('');
        }
      } catch (e) {
        document.getElementById('subscriptions-table').innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--error); padding: 40px;">Greska pri ucitavanju</td></tr>';
      }
    }

    function showEditSubscriptionModal(userId, tier, status, endDate) {
      const endDateFormatted = new Date(endDate).toISOString().split('T')[0];
      showModal('Izmeni Pretplatu', 'Izmenite parametre pretplate za ovog korisnika', \`
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; margin-bottom: 6px; color: var(--text-secondary);">Tip pretplate</label>
            <select id="edit-sub-tier" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--background); color: var(--text-primary); border: 1px solid var(--border);">
              <option value="free" \${tier === 'free' ? 'selected' : ''}>Besplatno</option>
              <option value="standard" \${tier === 'standard' ? 'selected' : ''}>Standard</option>
              <option value="premium" \${tier === 'premium' ? 'selected' : ''}>Premium</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 6px; color: var(--text-secondary);">Status</label>
            <select id="edit-sub-status" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--background); color: var(--text-primary); border: 1px solid var(--border);">
              <option value="active" \${status === 'active' ? 'selected' : ''}>Aktivan</option>
              <option value="inactive" \${status === 'inactive' ? 'selected' : ''}>Neaktivan</option>
              <option value="cancelled" \${status === 'cancelled' ? 'selected' : ''}>Otkazan</option>
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 6px; color: var(--text-secondary);">Datum isteka</label>
            <input type="date" id="edit-sub-enddate" value="\${endDateFormatted}" style="width: 100%; padding: 10px; border-radius: 8px; background: var(--background); color: var(--text-primary); border: 1px solid var(--border);">
          </div>
        </div>
      \`, \`
        <button class="btn btn-secondary" onclick="closeModal()">Otkazi</button>
        <button class="btn btn-primary" onclick="saveSubscription('\${userId}')">Sacuvaj</button>
      \`);
    }

    async function saveSubscription(userId) {
      const tier = document.getElementById('edit-sub-tier').value;
      const status = document.getElementById('edit-sub-status').value;
      const endDate = document.getElementById('edit-sub-enddate').value;
      
      try {
        await api('/api/admin/subscriptions/' + userId, {
          method: 'PUT',
          body: JSON.stringify({ tier, status, endDate })
        });
        closeModal();
        loadSubscriptions();
        alert('Pretplata uspesno azurirana!');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function loadReports() {
      try {
        const status = document.getElementById('reports-filter').value;
        const data = await api('/api/admin/reported-items?status=' + status);
        const tbody = document.getElementById('reports-table');
        
        if (!data.reports?.length) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-tertiary); padding: 40px;">Nema prijava</td></tr>';
        } else {
          tbody.innerHTML = data.reports.map(r => 
            \`<tr>
            <td><strong>\${r.itemTitle || 'Nepoznat oglas'}</strong></td>
            <td>\${r.reporterName || 'Nepoznato'}</td>
            <td>\${r.reason}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${r.description || '-'}</td>
            <td><span class="badge \${r.status === 'pending' ? 'badge-warning' : 'badge-success'}">\${r.status === 'pending' ? 'Na cekanju' : 'Resen'}</span></td>
            <td>\${new Date(r.createdAt).toLocaleDateString('sr-RS')}</td>
            <td>
            \${r.status === 'pending' ? \`
              <button class="action-btn action-btn-success" onclick="resolveReport('\${r.id}', false)">Resi</button>
              <button class="action-btn action-btn-error" onclick="resolveReport('\${r.id}', true)">Resi + Obrisi</button>
            \` : '-'}
            </td></tr>\`
          ).join('');
        }
      } catch (e) {
        document.getElementById('reports-table').innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--error); padding: 40px;">Greska pri ucitavanju</td></tr>';
      }
    }

    async function resolveReport(reportId, removeItem) {
      if (!confirm(removeItem ? 'Da li zelite da resite prijavu i obrisete oglas?' : 'Da li zelite da resite ovu prijavu?')) return;
      try {
        await api('/api/admin/reported-items/' + reportId + '/resolve', { 
          method: 'POST',
          body: JSON.stringify({ removeItem })
        });
        loadReports();
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function loadMessages() {
      try {
        const data = await api('/api/admin/messages');
        const list = document.getElementById('messages-list');
        
        if (!data.messages?.length) {
          list.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: 20px;">Nema poruka</p>';
        } else {
          list.innerHTML = data.messages.map(m => 
            \`<div class="message-item">
              <div class="message-header">
                <div><strong>\${m.senderName}</strong> \u2192 <strong>\${m.receiverName}</strong></div>
                <span style="color: var(--text-tertiary); font-size: 12px;">\${new Date(m.createdAt).toLocaleString('sr-RS')}</span>
              </div>
              <div class="message-content">\${m.content}</div>
            </div>\`
          ).join('');
        }
      } catch (e) {
        document.getElementById('messages-list').innerHTML = '<p style="color: var(--error); text-align: center; padding: 20px;">Greska pri ucitavanju</p>';
      }
    }

    async function loadAnalytics() {
      try {
        const data = await api('/api/admin/analytics');
        
        document.getElementById('analytics-stats').innerHTML = 
          \`<div class="stat-card"><div class="stat-icon">\u{1F4C5}</div><div class="stat-value">\${data.monthlyActiveUsers || 0}</div><div class="stat-label">Mesecno aktivni korisnici</div></div>
          <div class="stat-card"><div class="stat-icon">\u{1F4DD}</div><div class="stat-value">\${data.registrations || 0}</div><div class="stat-label">Ukupne registracije</div></div>
          <div class="stat-card"><div class="stat-icon">\u2705</div><div class="stat-value">\${data.conversions?.completed || 0}</div><div class="stat-label">Zavrsene transakcije</div></div>
          <div class="stat-card"><div class="stat-icon">\u{1F527}</div><div class="stat-value">\${data.conversions?.addedItem || 0}</div><div class="stat-label">Objavljeni oglasi</div></div>\`;
        
        const categories = data.popularCategories || [];
        document.getElementById('categories-list').innerHTML = categories.length ? 
          categories.map((c, i) => 
            \`<div style="display: flex; align-items: center; gap: 16px; padding: 14px; background: var(--background); border-radius: 8px; margin-bottom: 8px;">
            <span style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary); color: var(--secondary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">\${i + 1}</span>
            <span style="flex: 1; font-weight: 500;">\${c.name}</span>
            <span style="color: var(--text-tertiary);">\${c.count} oglasa</span></div>\`
          ).join('') :
          '<p style="color: var(--text-tertiary); text-align: center; padding: 20px;">Nema podataka</p>';
        
        const cities = data.topCities || [];
        document.getElementById('cities-list').innerHTML = cities.length ?
          cities.map((c, i) => 
            \`<div style="display: flex; align-items: center; gap: 16px; padding: 14px; background: var(--background); border-radius: 8px; margin-bottom: 8px;">
            <span style="width: 32px; height: 32px; border-radius: 50%; background: var(--info); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">\${i + 1}</span>
            <span style="flex: 1; font-weight: 500;">\${c.name}</span>
            <span style="color: var(--text-tertiary);">\${c.count} korisnika</span></div>\`
          ).join('') :
          '<p style="color: var(--text-tertiary); text-align: center; padding: 20px;">Nema podataka</p>';
        
        const conversions = data.conversions || {};
        const maxVal = Math.max(conversions.registered || 1, 1);
        document.getElementById('funnel-chart').innerHTML = 
          \`<div style="padding: 20px;">
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>Registrovani</span><span>\${conversions.registered || 0}</span>
              </div>
              <div style="height: 24px; background: var(--border); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: 100%; background: var(--success);"></div>
              </div>
            </div>
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>Objavili oglas</span><span>\${conversions.addedItem || 0}</span>
              </div>
              <div style="height: 24px; background: var(--border); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: \${((conversions.addedItem || 0) / maxVal * 100)}%; background: var(--info);"></div>
              </div>
            </div>
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>Napravili rezervaciju</span><span>\${conversions.madeBooking || 0}</span>
              </div>
              <div style="height: 24px; background: var(--border); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: \${((conversions.madeBooking || 0) / maxVal * 100)}%; background: var(--warning);"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>Zavrsili transakciju</span><span>\${conversions.completed || 0}</span>
              </div>
              <div style="height: 24px; background: var(--border); border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: \${((conversions.completed || 0) / maxVal * 100)}%; background: var(--primary);"></div>
              </div>
            </div>
          </div>\`;
      } catch (e) {
        document.getElementById('analytics-stats').innerHTML = '<div class="stat-card"><p style="color: var(--error);">Greska pri ucitavanju</p></div>';
      }
    }

    async function loadLogs() {
      try {
        const data = await api('/api/admin/admin-logs');
        const tbody = document.getElementById('logs-table');
        
        if (!data.logs?.length) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary); padding: 40px;">Nema logova</td></tr>';
        } else {
          tbody.innerHTML = data.logs.map(l => 
            \`<tr>
            <td>\${l.adminName || 'Nepoznato'}</td>
            <td><strong>\${l.action}</strong></td>
            <td>\${l.targetType || '-'}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${l.details || '-'}</td>
            <td>\${l.ipAddress || '-'}</td>
            <td>\${new Date(l.createdAt).toLocaleString('sr-RS')}</td></tr>\`
          ).join('');
        }
      } catch (e) {
        document.getElementById('logs-table').innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--error); padding: 40px;">Greska pri ucitavanju</td></tr>';
      }
    }

    async function loadSettings() {
      try {
        // Load system settings
        loadSystemSettings();
        
        // Load feature toggles
        const data = await api('/api/admin/feature-toggles');
        const list = document.getElementById('features-list');
        const toggles = data.toggles || [];
        
        if (!toggles.length) {
          list.innerHTML = \`<p style="color: var(--text-tertiary); text-align: center; padding: 20px;">Nema feature togglea. <button class="btn btn-sm" onclick="showAddFeatureModal()">Dodaj prvi</button></p>\`;
        } else {
          list.innerHTML = toggles.map(f => 
            \`<div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--background); border-radius: 8px; margin-bottom: 12px;">
              <div>
                <div style="font-weight: 600;">\${f.name}</div>
                <div style="color: var(--text-secondary); font-size: 13px; margin-top: 4px;">\${f.description || 'Bez opisa'}</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" \${f.isEnabled ? 'checked' : ''} onchange="toggleFeature('\${f.id}', this.checked)">
                <span class="toggle-slider"></span>
              </label>
            </div>\`
          ).join('');
        }
      } catch (e) {
        document.getElementById('features-list').innerHTML = '<p style="color: var(--error); text-align: center; padding: 20px;">Greska pri ucitavanju</p>';
      }
    }

    async function loadSystemSettings() {
      try {
        const data = await api('/api/admin/system-settings');
        const container = document.getElementById('system-settings-content');
        
        container.innerHTML = \`
          <div style="display: grid; gap: 20px;">
            <!-- Early Adopter Section -->
            <div style="padding: 20px; background: var(--background); border-radius: 12px; border: 1px solid var(--border);">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <span style="font-size: 28px;">\u{1F389}</span>
                <div>
                  <div style="font-weight: 600; font-size: 16px;">Early Adopter Program</div>
                  <div style="color: var(--text-secondary); font-size: 13px;">Prvih 100 korisnika dobija besplatno premium 30 dana</div>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 16px; background: var(--background-card); border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: 700; color: var(--primary);">\${data.earlyAdopterCount}</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">Iskorisceno</div>
                </div>
                <div style="text-align: center; padding: 16px; background: var(--background-card); border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: 700; color: var(--success);">\${data.remainingSlots}</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">Preostalo</div>
                </div>
                <div style="text-align: center; padding: 16px; background: var(--background-card); border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: 700;">\${data.totalUsers}</div>
                  <div style="font-size: 12px; color: var(--text-secondary);">Ukupno korisnika</div>
                </div>
              </div>
              <div style="display: flex; gap: 12px; align-items: center;">
                <button class="btn btn-error btn-sm" onclick="confirmResetEarlyAdopter()" id="reset-ea-btn">
                  Resetuj brojac (sledecih 100 korisnika dobija premium)
                </button>
                <span style="color: var(--text-tertiary); font-size: 12px;">
                  Ova akcija ce resetovati early adopter status i sledecih 100 NOVIH korisnika dobice besplatno premium.
                </span>
              </div>
            </div>
            
            <!-- Premium Popup Section -->
            <div style="padding: 20px; background: var(--background); border-radius: 12px; border: 1px solid var(--border);">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 28px;">\u{1F48E}</span>
                  <div>
                    <div style="font-weight: 600; font-size: 16px;">Premium Popup</div>
                    <div style="color: var(--text-secondary); font-size: 13px;">Prikazuje popup korisnicima za kupovinu premium clanstva</div>
                  </div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="premium-popup-toggle" \${data.premiumPopupEnabled ? 'checked' : ''} onchange="togglePremiumPopup(this.checked)">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        \`;
      } catch (e) {
        document.getElementById('system-settings-content').innerHTML = '<p style="color: var(--error); text-align: center; padding: 20px;">Greska pri ucitavanju sistemskih podesavanja</p>';
      }
    }

    async function confirmResetEarlyAdopter() {
      if (!confirm('Da li ste sigurni da zelite da resetujete early adopter brojac?\\n\\nOva akcija ce:\\n- Ukloniti early adopter status sa svih korisnika\\n- Omoguciti sledecih 100 NOVIH korisnika da dobiju besplatno premium\\n\\nPostojeci korisnici ce zadrzati premium ako im nije istekao.')) {
        return;
      }
      
      const btn = document.getElementById('reset-ea-btn');
      btn.disabled = true;
      btn.textContent = 'Resetovanje...';
      
      try {
        const result = await api('/api/admin/reset-early-adopter', { method: 'POST' });
        alert(result.message || 'Uspesno resetovano!');
        loadSystemSettings();
      } catch (e) {
        alert('Greska: ' + e.message);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Resetuj brojac (sledecih 100 korisnika dobija premium)';
      }
    }

    async function togglePremiumPopup(enabled) {
      try {
        await api('/api/admin/toggle-premium-popup', { 
          method: 'POST',
          body: JSON.stringify({ enabled })
        });
      } catch (e) {
        alert('Greska: ' + e.message);
        loadSystemSettings();
      }
    }

    async function toggleFeature(featureId, enabled) {
      try {
        await api('/api/admin/feature-toggles/' + featureId, { 
          method: 'PUT',
          body: JSON.stringify({ isEnabled: enabled })
        });
      } catch (e) {
        alert('Greska: ' + e.message);
        loadSettings();
      }
    }

    async function loadNotifications() {
      try {
        const data = await api('/api/admin/notifications');
        const tbody = document.getElementById('notifications-table');
        
        if (!data.notifications?.length) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary); padding: 40px;">Nema poslatih notifikacija</td></tr>';
        } else {
          tbody.innerHTML = data.notifications.map(n => 
            \`<tr>
            <td><span class="badge badge-\${n.type === 'push' ? 'info' : 'warning'}">\${n.type}</span></td>
            <td><strong>\${n.title}</strong></td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${n.message}</td>
            <td>\${n.targetType || 'all'}</td>
            <td>\${n.sentCount || 0}</td>
            <td>\${new Date(n.createdAt).toLocaleString('sr-RS')}</td></tr>\`
          ).join('');
        }
      } catch (e) {
        document.getElementById('notifications-table').innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--error); padding: 40px;">Greska pri ucitavanju</td></tr>';
      }
    }

    let allSubscribersData = [];
    
    async function loadSubscribers() {
      try {
        const data = await api('/api/admin/subscribers');
        allSubscribersData = data.subscribers || [];
        
        if (data.stats) {
          document.getElementById('stats-newsletter').textContent = data.stats.newsletter || 0;
          document.getElementById('stats-registered').textContent = data.stats.registered || 0;
          document.getElementById('stats-total').textContent = data.stats.total || 0;
        }
        
        renderSubscribers(allSubscribersData);
      } catch (e) {
        document.getElementById('subscribers-table').innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--error); padding: 40px;">Greska pri ucitavanju</td></tr>';
      }
    }
    
    function filterSubscribers() {
      const filter = document.getElementById('subscriber-type-filter').value;
      let filtered = allSubscribersData;
      if (filter !== 'all') {
        filtered = allSubscribersData.filter(s => s.type === filter);
      }
      renderSubscribers(filtered);
    }
    
    function renderSubscribers(subscribers) {
      const tbody = document.getElementById('subscribers-table');
      document.getElementById('subscribers-count').textContent = subscribers.length;
      
      if (!subscribers.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-tertiary); padding: 40px;">Nema pretplatnika</td></tr>';
      } else {
        tbody.innerHTML = subscribers.map(s => {
          const typeLabel = s.type === 'registered' ? 'Registrovan' : 'Newsletter';
          const typeBadge = s.type === 'registered' ? 'badge-success' : 'badge-info';
          const subscriptionLabel = s.subscriptionType === 'premium' ? 'Premium' : 
                                    s.subscriptionType === 'basic' ? 'Standard' : 
                                    s.type === 'registered' ? 'Besplatno' : '-';
          const subscriptionBadge = s.subscriptionType === 'premium' ? 'badge-warning' :
                                    s.subscriptionType === 'basic' ? 'badge-info' : 'badge-secondary';
          const canDelete = s.type !== 'registered';
          
          const isRegistered = s.type === 'registered';
          const realUserId = isRegistered ? s.id.replace('user_', '') : s.id;
          
          const actionButtons = isRegistered ? \`
            <button class="action-btn" onclick="showSubscriptionModal('\${realUserId}', '\${s.email}', '\${s.subscriptionType || 'free'}')" title="Promeni pretplatu" style="background: var(--warning); color: white;">\u2699\uFE0F</button>
          \` : (canDelete ? \`<button class="action-btn action-btn-error" onclick="deleteSubscriber('\${s.id}')" title="Obrisi">\u{1F5D1}\uFE0F</button>\` : '<span style="color: var(--text-tertiary);">-</span>');
          
          return \`<tr>
            <td><span class="badge \${typeBadge}">\${typeLabel}</span></td>
            <td><strong>\${s.email}</strong></td>
            <td>\${s.name || '-'}</td>
            <td>\${s.source || 'nepoznato'}</td>
            <td><span class="badge \${subscriptionBadge}">\${subscriptionLabel}</span></td>
            <td><span class="badge \${s.isActive ? 'badge-success' : 'badge-error'}">\${s.isActive ? 'Aktivan' : 'Neaktivan'}</span></td>
            <td>\${s.createdAt && !isNaN(new Date(s.createdAt).getTime()) ? new Date(s.createdAt).toLocaleString('sr-RS') : '-'}</td>
            <td>\${actionButtons}</td></tr>\`;
        }).join('');
      }
    }

    async function exportSubscribers() {
      try {
        const blob = await api('/api/admin/export/subscribers', { responseType: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`email-subscribers-\${new Date().toISOString().split('T')[0]}.csv\`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert('Greska pri eksportu: ' + e.message);
      }
    }

    async function deleteSubscriber(id) {
      if (!confirm('Da li ste sigurni da zelite da obrisete ovog pretplatnika?')) return;
      try {
        await api('/api/admin/subscribers/' + id, { method: 'DELETE' });
        loadSubscribers();
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }
    
    function showSubscriptionModal(userId, email, currentType) {
      const content = \`
        <div style="margin: 20px 0;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500;">Korisnik: \${email}</label>
          <label style="display: block; margin-bottom: 8px;">Izaberite novu pretplatu:</label>
          <select id="modal-subscription-type" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary); margin-bottom: 16px;">
            <option value="free" \${currentType === 'free' ? 'selected' : ''}>Besplatno (0 RSD)</option>
            <option value="basic" \${currentType === 'basic' ? 'selected' : ''}>Standard (500 RSD/mesec)</option>
            <option value="premium" \${currentType === 'premium' ? 'selected' : ''}>Premium (1000 RSD/mesec)</option>
          </select>
          <label style="display: block; margin-bottom: 8px;">Trajanje (dana):</label>
          <input type="number" id="modal-subscription-days" value="30" min="1" max="365" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg-secondary); color: var(--text-primary);">
        </div>
      \`;
      const actions = \`
        <button class="btn btn-secondary" onclick="closeModal()">Otkazi</button>
        <button class="btn btn-primary" onclick="applySubscriptionChange('\${userId}')">Primeni</button>
      \`;
      showModal('Promeni pretplatu', 'Izaberite tip pretplate i trajanje', content, actions);
    }
    
    async function applySubscriptionChange(userId) {
      const subscriptionType = document.getElementById('modal-subscription-type').value;
      const durationDays = parseInt(document.getElementById('modal-subscription-days').value) || 30;
      
      try {
        await api('/api/admin/users/' + userId + '/subscription', {
          method: 'POST',
          body: JSON.stringify({ subscriptionType, durationDays })
        });
        closeModal();
        loadSubscribers();
        alert('Pretplata uspesno promenjena!');
      } catch (e) {
        alert('Greska pri promeni pretplate: ' + e.message);
      }
    }

    function updateSelection(type) {
      if (type === 'users') {
        selectedUsers = Array.from(document.querySelectorAll('.user-checkbox:checked')).map(c => c.value);
      } else {
        selectedItems = Array.from(document.querySelectorAll('.item-checkbox:checked')).map(c => c.value);
      }
    }

    function toggleSelectAll(type) {
      const checkboxes = document.querySelectorAll(\`.\${type.slice(0, -1)}-checkbox\`);
      const selectAll = document.getElementById(\`select-all-\${type}\`);
      checkboxes.forEach(c => c.checked = selectAll.checked);
      updateSelection(type);
    }

    async function exportCSV(type) {
      try {
        const blob = await api(\`/api/admin/export/\${type}\`, { responseType: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`\${type}-export-\${new Date().toISOString().split('T')[0]}.csv\`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert('Greska pri eksportu: ' + e.message);
      }
    }

    function showModal(title, description, content, actions = '') {
      const overlay = document.getElementById('modal-overlay');
      overlay.innerHTML = \`<div class="modal">
        <h2>\${title}</h2>
        <p>\${description}</p>
        <div>\${content}</div>
        <div class="modal-actions">\${actions || \`<button class="btn btn-secondary" onclick="closeModal()">Zatvori</button>\`}</div>
      </div>\`;
      overlay.classList.remove('hidden');
      overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
    }

    function closeModal() {
      document.getElementById('modal-overlay').classList.add('hidden');
    }

    function showBulkSuspendModal() {
      if (!selectedUsers.length) {
        alert('Izaberite korisnike za suspenziju');
        return;
      }
      showModal('Bulk suspenzija', \`Da li zelite da suspendujete \${selectedUsers.length} korisnika?\`, '',
        \`<button class="btn btn-secondary" onclick="closeModal()">Odustani</button>
        <button class="btn btn-error" onclick="bulkSuspendUsers()">Suspenduj</button>\`);
    }

    async function bulkSuspendUsers() {
      try {
        await api('/api/admin/bulk/suspend-users', { 
          method: 'POST',
          body: JSON.stringify({ userIds: selectedUsers })
        });
        closeModal();
        loadUsers();
        alert('Korisnici su uspesno suspendovani');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    function showBulkDeleteModal() {
      if (!selectedItems.length) {
        alert('Izaberite oglase za brisanje');
        return;
      }
      showModal('Bulk brisanje', \`Da li zelite da obrisete \${selectedItems.length} oglasa?\`, '',
        \`<button class="btn btn-secondary" onclick="closeModal()">Odustani</button>
        <button class="btn btn-error" onclick="bulkDeleteItems()">Obrisi</button>\`);
    }

    async function bulkDeleteItems() {
      try {
        await api('/api/admin/bulk/delete-items', { 
          method: 'POST',
          body: JSON.stringify({ itemIds: selectedItems })
        });
        closeModal();
        loadItems();
        alert('Oglasi su uspesno obrisani');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    function showAddFeatureModal() {
      showModal('Dodaj feature toggle', 'Kreirajte novi feature flag', 
        \`<div class="form-group">
          <label>Naziv</label>
          <input type="text" id="feature-name" class="input" placeholder="npr. dark_mode">
        </div>
        <div class="form-group">
          <label>Opis</label>
          <input type="text" id="feature-desc" class="input" placeholder="Opis funkcionalnosti">
        </div>\`,
        \`<button class="btn btn-secondary" onclick="closeModal()">Odustani</button>
        <button class="btn" onclick="addFeature()">Dodaj</button>\`);
    }

    async function addFeature() {
      const name = document.getElementById('feature-name').value;
      const description = document.getElementById('feature-desc').value;
      if (!name) { alert('Unesite naziv'); return; }
      
      try {
        await api('/api/admin/feature-toggles', { 
          method: 'POST',
          body: JSON.stringify({ name, description, isEnabled: true })
        });
        closeModal();
        loadSettings();
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    function showSendNotificationModal() {
      showModal('Posalji notifikaciju', 'Posaljite push ili email notifikaciju korisnicima', 
        \`<div class="form-group">
          <label>Tip</label>
          <select id="notif-type" class="input">
            <option value="push">Push notifikacija</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div class="form-group">
          <label>Ciljna grupa</label>
          <select id="notif-target" class="input">
            <option value="all">Svi korisnici</option>
            <option value="premium">Premium korisnici</option>
          </select>
        </div>
        <div class="form-group">
          <label>Naslov</label>
          <input type="text" id="notif-title" class="input" placeholder="Naslov notifikacije">
        </div>
        <div class="form-group">
          <label>Poruka</label>
          <textarea id="notif-message" class="input" rows="3" placeholder="Tekst poruke"></textarea>
        </div>\`,
        \`<button class="btn btn-secondary" onclick="closeModal()">Odustani</button>
        <button class="btn" onclick="sendNotification()">Posalji</button>\`);
    }

    async function sendNotification() {
      const type = document.getElementById('notif-type').value;
      const targetType = document.getElementById('notif-target').value;
      const title = document.getElementById('notif-title').value;
      const message = document.getElementById('notif-message').value;
      
      if (!title || !message) { alert('Unesite naslov i poruku'); return; }
      
      try {
        await api('/api/admin/notifications/send', { 
          method: 'POST',
          body: JSON.stringify({ type, targetType, title, message })
        });
        closeModal();
        loadNotifications();
        alert('Notifikacija je uspesno poslata');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    // ========== Subscription Plans ==========
    async function loadPlans() {
      try {
        const data = await api('/api/admin/subscription-plans');
        const tbody = document.getElementById('plans-table');
        if (!data.plans?.length) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:40px;">Nema planova</td></tr>';
        } else {
          tbody.innerHTML = data.plans.map(p => \`
            <tr>
              <td><strong>\${p.displayName}</strong><br><span style="color:var(--text-tertiary);font-size:12px;">\${p.name}</span></td>
              <td>\${p.priceRsd.toLocaleString('sr-RS')} RSD</td>
              <td>\${p.durationDays} dana</td>
              <td>\${p.maxAds || 'Bez limita'}</td>
              <td><span class="badge badge-\${p.isActive ? 'success' : 'warning'}">\${p.isActive ? 'Aktivan' : 'Neaktivan'}</span></td>
              <td>
                <button class="btn btn-sm" onclick="editPlan('\${p.id}')">Uredi</button>
                <button class="btn btn-sm btn-danger" onclick="deletePlan('\${p.id}')">Obrisi</button>
              </td>
            </tr>
          \`).join('');
        }
      } catch (e) {
        document.getElementById('plans-table').innerHTML = '<tr><td colspan="6" style="color:var(--error);text-align:center;">Greska pri ucitavanju</td></tr>';
      }
    }

    function showAddPlanModal() {
      showModal('Dodaj novi plan', 'Kreirajte novi plan pretplate', 
        \`<div class="form-group">
          <label>Interni naziv (jedinstveno)</label>
          <input type="text" id="plan-name" class="input" placeholder="npr. basic">
        </div>
        <div class="form-group">
          <label>Prikazani naziv</label>
          <input type="text" id="plan-display-name" class="input" placeholder="npr. Standard">
        </div>
        <div class="form-group">
          <label>Opis</label>
          <textarea id="plan-description" class="input" rows="2"></textarea>
        </div>
        <div style="display:flex;gap:16px;">
          <div class="form-group" style="flex:1;">
            <label>Cena (RSD)</label>
            <input type="number" id="plan-price" class="input" placeholder="500">
          </div>
          <div class="form-group" style="flex:1;">
            <label>Trajanje (dana)</label>
            <input type="number" id="plan-duration" class="input" value="30">
          </div>
        </div>
        <div class="form-group">
          <label>Max oglasa (prazno = bez limita)</label>
          <input type="number" id="plan-max-ads" class="input" placeholder="5">
        </div>\`,
        \`<button class="btn btn-secondary" onclick="closeModal()">Odustani</button>
        <button class="btn" onclick="savePlan()">Sacuvaj plan</button>\`);
    }

    async function savePlan() {
      try {
        const planData = {
          name: document.getElementById('plan-name').value,
          displayName: document.getElementById('plan-display-name').value,
          description: document.getElementById('plan-description').value,
          priceRsd: parseInt(document.getElementById('plan-price').value) || 0,
          durationDays: parseInt(document.getElementById('plan-duration').value) || 30,
          maxAds: document.getElementById('plan-max-ads').value ? parseInt(document.getElementById('plan-max-ads').value) : null
        };
        
        if (!planData.name || !planData.displayName) {
          alert('Unesite interni naziv i prikazani naziv');
          return;
        }
        
        await api('/api/admin/subscription-plans', { method: 'POST', body: JSON.stringify(planData) });
        closeModal();
        loadPlans();
        alert('Plan uspesno kreiran!');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function deletePlan(planId) {
      if (!confirm('Da li ste sigurni da zelite da obrisete ovaj plan?')) return;
      try {
        await api(\`/api/admin/subscription-plans/\${planId}\`, { method: 'DELETE' });
        loadPlans();
        alert('Plan obrisan!');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function editPlan(planId) {
      try {
        const data = await api('/api/admin/subscription-plans');
        const plan = data.plans.find(p => p.id === planId);
        if (!plan) {
          alert('Plan nije pronadjen');
          return;
        }
        
        showModal('Uredi plan', 'Izmenite postojeci plan pretplate', 
          \`<div class="form-group">
            <label>Interni naziv</label>
            <input type="text" id="edit-plan-name" class="input" value="\${plan.name}" disabled style="opacity:0.6;">
          </div>
          <div class="form-group">
            <label>Prikazani naziv</label>
            <input type="text" id="edit-plan-display-name" class="input" value="\${plan.displayName || ''}">
          </div>
          <div class="form-group">
            <label>Opis</label>
            <textarea id="edit-plan-description" class="input" rows="2">\${plan.description || ''}</textarea>
          </div>
          <div style="display:flex;gap:16px;">
            <div class="form-group" style="flex:1;">
              <label>Cena (RSD)</label>
              <input type="number" id="edit-plan-price" class="input" value="\${plan.priceRsd || 0}">
            </div>
            <div class="form-group" style="flex:1;">
              <label>Trajanje (dana)</label>
              <input type="number" id="edit-plan-duration" class="input" value="\${plan.durationDays || 30}">
            </div>
          </div>
          <div class="form-group">
            <label>Max oglasa (prazno = bez limita)</label>
            <input type="number" id="edit-plan-max-ads" class="input" value="\${plan.maxAds || ''}">
          </div>
          <div class="form-group">
            <label style="display:flex;align-items:center;gap:8px;">
              <input type="checkbox" id="edit-plan-active" \${plan.isActive !== false ? 'checked' : ''}> Aktivan
            </label>
          </div>\`,
          \`<button class="btn btn-secondary" onclick="closeModal()">Odustani</button>
          <button class="btn" onclick="updatePlan('\${planId}')">Sacuvaj izmene</button>\`);
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }
    
    async function updatePlan(planId) {
      try {
        const planData = {
          displayName: document.getElementById('edit-plan-display-name').value,
          description: document.getElementById('edit-plan-description').value,
          priceRsd: parseInt(document.getElementById('edit-plan-price').value) || 0,
          durationDays: parseInt(document.getElementById('edit-plan-duration').value) || 30,
          maxAds: document.getElementById('edit-plan-max-ads').value ? parseInt(document.getElementById('edit-plan-max-ads').value) : null,
          isActive: document.getElementById('edit-plan-active').checked
        };
        
        await api(\`/api/admin/subscription-plans/\${planId}\`, { method: 'PUT', body: JSON.stringify(planData) });
        closeModal();
        loadPlans();
        alert('Plan uspesno azuriran!');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    // ========== Item Statistics ==========
    async function loadItemStats() {
      try {
        const data = await api('/api/admin/items-stats');
        
        // Overview stats
        const overview = document.getElementById('item-stats-overview');
        overview.innerHTML = \`
          <div class="stat-card">
            <div class="stat-icon">\u{1F441}</div>
            <div class="stat-value">\${data.overview.totalViews}</div>
            <div class="stat-label">Ukupno pregleda</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">\u{1F4C5}</div>
            <div class="stat-value">\${data.overview.totalBookings}</div>
            <div class="stat-label">Ukupno rezervacija</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">\u2705</div>
            <div class="stat-value">\${data.overview.completedBookings}</div>
            <div class="stat-label">Zavrsene rezervacije</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">\u{1F4B0}</div>
            <div class="stat-value">\${data.overview.avgPricePerDay} RSD</div>
            <div class="stat-label">Prosecna cena/dan</div>
          </div>
        \`;

        // Items table
        const tbody = document.getElementById('item-stats-table');
        if (!data.items?.length) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:40px;">Nema podataka</td></tr>';
        } else {
          tbody.innerHTML = data.items.map(i => \`
            <tr>
              <td><strong>\${i.title}</strong></td>
              <td>\${i.views}</td>
              <td>\${i.bookings}</td>
              <td>\${i.completedBookings}</td>
              <td>\${i.avgPrice} RSD</td>
              <td><strong>\${i.revenue.toLocaleString('sr-RS')} RSD</strong></td>
            </tr>
          \`).join('');
        }
      } catch (e) {
        document.getElementById('item-stats-table').innerHTML = '<tr><td colspan="6" style="color:var(--error);text-align:center;">Greska pri ucitavanju</td></tr>';
      }
    }

    // ========== User Management Extended ==========
    async function showUserDetails(userId) {
      try {
        const data = await api(\`/api/admin/users/\${userId}/details\`);
        const user = data.user;
        
        const content = \`
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
            <div><strong>Email:</strong> \${user.email}</div>
            <div><strong>Telefon:</strong> \${user.phone || '-'}</div>
            <div><strong>Grad:</strong> \${user.city || '-'}</div>
            <div><strong>Oglasi:</strong> \${user.itemsCount}</div>
            <div><strong>Rezervacije:</strong> \${user.bookingsCount}</div>
            <div><strong>Registracija:</strong> \${new Date(user.createdAt).toLocaleDateString('sr-RS')}</div>
          </div>
          
          <h4 style="margin-bottom:12px;">Verifikacije</h4>
          <div style="display:flex;gap:12px;margin-bottom:20px;">
            <label><input type="checkbox" id="verify-email" \${user.emailVerified ? 'checked' : ''}> Email</label>
            <label><input type="checkbox" id="verify-phone" \${user.phoneVerified ? 'checked' : ''}> Telefon</label>
            <label><input type="checkbox" id="verify-document" \${user.documentVerified ? 'checked' : ''}> Dokument</label>
          </div>
          
          <h4 style="margin-bottom:12px;">Pretplata</h4>
          <div style="display:flex;gap:12px;margin-bottom:20px;">
            <select id="user-subscription" class="input" style="flex:1;">
              <option value="free" \${user.subscriptionType === 'free' ? 'selected' : ''}>Besplatno</option>
              <option value="basic" \${user.subscriptionType === 'basic' ? 'selected' : ''}>Standard</option>
              <option value="premium" \${user.subscriptionType === 'premium' ? 'selected' : ''}>Premium</option>
            </select>
            <input type="number" id="user-sub-days" class="input" value="30" style="width:100px;" placeholder="Dana">
          </div>
        \`;
        
        const actions = \`
          <button class="btn btn-secondary" onclick="closeModal()">Zatvori</button>
          <button class="btn" onclick="saveUserVerifications('\${userId}')">Sacuvaj verifikacije</button>
          <button class="btn btn-primary" onclick="saveUserSubscription('\${userId}')">Sacuvaj pretplatu</button>
        \`;
        
        showModal('Korisnik: ' + (user.name || user.email), '', content, actions);
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function resetUserPassword(userId) {
      if (!confirm('Da li ste sigurni? Nova privremena lozinka ce biti generisana.')) return;
      try {
        const data = await api(\`/api/admin/users/\${userId}/reset-password\`, { method: 'POST' });
        alert('Nova privremena lozinka: ' + data.tempPassword + '\\n\\nKopirajte ovu lozinku i prosledite je korisniku.');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function saveUserVerifications(userId) {
      try {
        const verifications = [
          { type: 'email', value: document.getElementById('verify-email').checked },
          { type: 'phone', value: document.getElementById('verify-phone').checked },
          { type: 'document', value: document.getElementById('verify-document').checked }
        ];
        
        for (const v of verifications) {
          await api(\`/api/admin/users/\${userId}/verify\`, {
            method: 'POST',
            body: JSON.stringify({ verificationType: v.type, verified: v.value })
          });
        }
        alert('Verifikacije sacuvane!');
        closeModal();
        loadUsers();
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function saveUserSubscription(userId) {
      try {
        const subscriptionType = document.getElementById('user-subscription').value;
        const durationDays = parseInt(document.getElementById('user-sub-days').value) || 30;
        
        await api(\`/api/admin/users/\${userId}/subscription\`, {
          method: 'POST',
          body: JSON.stringify({ subscriptionType, durationDays })
        });
        alert('Pretplata sacuvana!');
        closeModal();
        loadUsers();
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    // ========== User Reports ==========
    async function loadUserReports() {
      try {
        const data = await api('/api/admin/reported-users');
        const tbody = document.getElementById('user-reports-table');
        
        if (!data.reports?.length) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:40px;">Nema prijava korisnika</td></tr>';
        } else {
          tbody.innerHTML = data.reports.map(r => \`
            <tr>
              <td><strong>\${r.reportedUser?.name || r.reportedUser?.email || 'Nepoznat'}</strong></td>
              <td>\${r.reporter?.name || r.reporter?.email || 'Nepoznat'}</td>
              <td>\${r.reason}</td>
              <td><span class="badge badge-\${r.status === 'resolved' ? 'success' : r.status === 'dismissed' ? 'warning' : 'info'}">\${r.status}</span></td>
              <td>\${new Date(r.createdAt).toLocaleDateString('sr-RS')}</td>
              <td>
                \${r.status === 'pending' ? \`
                  <button class="btn btn-sm" onclick="resolveUserReport('\${r.id}', 'resolved')">Resi</button>
                  <button class="btn btn-sm btn-danger" onclick="resolveUserReport('\${r.id}', 'dismissed')">Odbaci</button>
                \` : '-'}
              </td>
            </tr>
          \`).join('');
        }
      } catch (e) {
        document.getElementById('user-reports-table').innerHTML = '<tr><td colspan="6" style="color:var(--error);text-align:center;">Greska pri ucitavanju</td></tr>';
      }
    }

    async function resolveUserReport(reportId, status) {
      const notes = prompt('Unesite napomenu (opciono):');
      try {
        await api(\`/api/admin/reported-users/\${reportId}/resolve\`, {
          method: 'POST',
          body: JSON.stringify({ status, adminNotes: notes || '' })
        });
        loadUserReports();
        alert('Prijava resena!');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    // ========== Error Logs ==========
    async function loadErrorLogs() {
      try {
        const data = await api('/api/admin/error-logs');
        const tbody = document.getElementById('error-logs-table');
        
        if (!data.logs?.length) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-tertiary);padding:40px;">Nema logova gresaka</td></tr>';
        } else {
          tbody.innerHTML = data.logs.map(l => \`
            <tr>
              <td><span class="badge badge-\${l.level === 'error' ? 'error' : l.level === 'warning' ? 'warning' : 'info'}">\${l.level}</span></td>
              <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;">\${l.message}</td>
              <td>\${l.endpoint || '-'}</td>
              <td>\${l.ipAddress || '-'}</td>
              <td>\${new Date(l.createdAt).toLocaleString('sr-RS')}</td>
            </tr>
          \`).join('');
        }
      } catch (e) {
        document.getElementById('error-logs-table').innerHTML = '<tr><td colspan="5" style="color:var(--error);text-align:center;">Greska pri ucitavanju</td></tr>';
      }
    }

    async function clearErrorLogs() {
      if (!confirm('Da li ste sigurni da zelite da obrisete sve logove gresaka?')) return;
      try {
        await api('/api/admin/error-logs/clear', { method: 'DELETE' });
        loadErrorLogs();
        alert('Logovi obrisani!');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    // ========== App Versions ==========
    async function loadAppVersions() {
      try {
        const data = await api('/api/admin/app-versions');
        const tbody = document.getElementById('versions-table');
        const stats = document.getElementById('version-stats');
        
        // Version stats
        const webVersion = data.versions?.find(v => v.platform === 'web')?.version || 'N/A';
        const androidVersion = data.versions?.find(v => v.platform === 'android')?.version || 'N/A';
        const iosVersion = data.versions?.find(v => v.platform === 'ios')?.version || 'N/A';
        
        stats.innerHTML = \`
          <div class="stat-card">
            <div class="stat-icon">\u{1F310}</div>
            <div class="stat-value">\${webVersion}</div>
            <div class="stat-label">Web verzija</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">\u{1F916}</div>
            <div class="stat-value">\${androidVersion}</div>
            <div class="stat-label">Android verzija</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">\u{1F34E}</div>
            <div class="stat-value">\${iosVersion}</div>
            <div class="stat-label">iOS verzija</div>
          </div>
        \`;
        
        if (!data.versions?.length) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:40px;">Nema verzija</td></tr>';
        } else {
          tbody.innerHTML = data.versions.map(v => \`
            <tr>
              <td><span class="badge badge-\${v.platform === 'web' ? 'info' : v.platform === 'android' ? 'success' : 'warning'}">\${v.platform}</span></td>
              <td><strong>\${v.version}</strong></td>
              <td>\${v.buildNumber || '-'}</td>
              <td>\${v.isRequired ? 'Da' : 'Ne'}</td>
              <td>\${new Date(v.releasedAt).toLocaleDateString('sr-RS')}</td>
              <td>
                <button class="btn btn-sm btn-danger" onclick="deleteVersion('\${v.id}')">Obrisi</button>
              </td>
            </tr>
          \`).join('');
        }
      } catch (e) {
        document.getElementById('versions-table').innerHTML = '<tr><td colspan="6" style="color:var(--error);text-align:center;">Greska pri ucitavanju</td></tr>';
      }
    }

    function showAddVersionModal() {
      const content = \`
        <div class="form-group">
          <label>Platforma</label>
          <select id="version-platform" class="input" style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);">
            <option value="web">Web</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
          </select>
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label>Verzija (npr. 1.0.0)</label>
          <input type="text" id="version-number" class="input" placeholder="1.0.0" style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);">
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label>Build broj</label>
          <input type="number" id="version-build" class="input" placeholder="1" style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);">
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label>Napomene o izdanju</label>
          <textarea id="version-notes" class="input" rows="2" style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);"></textarea>
        </div>
        <div class="form-group" style="margin-top:12px;">
          <label><input type="checkbox" id="version-required"> Obavezno azuriranje</label>
        </div>
      \`;
      const actions = \`
        <button class="btn btn-secondary" onclick="closeModal()">Otkazi</button>
        <button class="btn btn-primary" onclick="saveVersion()">Sacuvaj</button>
      \`;
      showModal('Dodaj novu verziju', 'Unesite informacije o novoj verziji aplikacije', content, actions);
    }

    async function saveVersion() {
      try {
        const versionData = {
          platform: document.getElementById('version-platform').value,
          version: document.getElementById('version-number').value,
          buildNumber: parseInt(document.getElementById('version-build').value) || null,
          releaseNotes: document.getElementById('version-notes').value,
          isRequired: document.getElementById('version-required').checked
        };
        await api('/api/admin/app-versions', { method: 'POST', body: JSON.stringify(versionData) });
        closeModal();
        loadAppVersions();
        alert('Verzija uspesno dodata!');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function deleteVersion(versionId) {
      if (!confirm('Da li ste sigurni da zelite da obrisete ovu verziju?')) return;
      try {
        await api(\`/api/admin/app-versions/\${versionId}\`, { method: 'DELETE' });
        loadAppVersions();
        alert('Verzija obrisana!');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    // ========== Security (2FA) ==========
    async function loadSecurity() {
      try {
        // Load 2FA status
        const twoFaData = await api('/api/admin/2fa/status');
        const twoFaDiv = document.getElementById('2fa-status');
        
        if (twoFaData.enabled) {
          twoFaDiv.innerHTML = \`
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
              <span class="badge badge-success">Aktivno</span>
              <span>Dvofaktorska autentifikacija je ukljucena</span>
            </div>
            <button class="btn btn-danger" onclick="disable2FA()">Iskljuci 2FA</button>
          \`;
        } else {
          twoFaDiv.innerHTML = \`
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
              <span class="badge badge-warning">Neaktivno</span>
              <span>Dvofaktorska autentifikacija nije ukljucena</span>
            </div>
            <button class="btn btn-primary" onclick="setup2FA()">Podesi 2FA</button>
          \`;
        }

        // Load server status
        const statusData = await api('/api/admin/deployment-status');
        const statusDiv = document.getElementById('server-status');
        
        const uptimeHours = Math.floor(statusData.status.uptime / 3600);
        const uptimeMinutes = Math.floor((statusData.status.uptime % 3600) / 60);
        const memoryMB = Math.round(statusData.status.memoryUsage.heapUsed / 1024 / 1024);
        
        statusDiv.innerHTML = \`
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;">
            <div style="padding:16px;background:var(--background);border-radius:8px;">
              <div style="font-weight:500;margin-bottom:4px;">Server status</div>
              <span class="badge badge-success">\${statusData.status.server}</span>
            </div>
            <div style="padding:16px;background:var(--background);border-radius:8px;">
              <div style="font-weight:500;margin-bottom:4px;">Baza podataka</div>
              <span class="badge badge-success">\${statusData.status.database}</span>
            </div>
            <div style="padding:16px;background:var(--background);border-radius:8px;">
              <div style="font-weight:500;margin-bottom:4px;">Uptime</div>
              <span>\${uptimeHours}h \${uptimeMinutes}m</span>
            </div>
            <div style="padding:16px;background:var(--background);border-radius:8px;">
              <div style="font-weight:500;margin-bottom:4px;">Memorija</div>
              <span>\${memoryMB} MB</span>
            </div>
            <div style="padding:16px;background:var(--background);border-radius:8px;">
              <div style="font-weight:500;margin-bottom:4px;">Node.js</div>
              <span>\${statusData.status.nodeVersion}</span>
            </div>
          </div>
        \`;
      } catch (e) {
        document.getElementById('2fa-status').innerHTML = '<p style="color:var(--error);">Greska pri ucitavanju</p>';
      }
    }

    let current2FASecret = '';
    
    async function setup2FA() {
      try {
        const data = await api('/api/admin/2fa/setup', { method: 'POST' });
        current2FASecret = data.secret;
        
        const qrCodeUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(data.qrCodeUrl)}\`;
        
        const overlay = document.getElementById('modal-overlay');
        overlay.innerHTML = \`
          <div class="modal" style="max-width:500px;">
            <h2>Podesavanje 2FA</h2>
            <p style="margin-bottom:16px;"><strong>1. Skenirajte QR kod</strong> pomocu Google Authenticator, Authy ili slicne aplikacije:</p>
            <div style="text-align:center;padding:20px;background:var(--background);border-radius:8px;margin-bottom:16px;">
              <img src="\${qrCodeUrl}" alt="2FA QR Code" style="border-radius:8px;width:200px;height:200px;"/>
            </div>
            <p style="margin-bottom:8px;color:var(--text-tertiary);font-size:13px;">Ili rucno unesite tajni kljuc:</p>
            <div style="text-align:center;padding:12px;background:var(--background);border-radius:8px;margin-bottom:16px;">
              <code style="font-size:16px;letter-spacing:3px;font-weight:bold;">\${data.secret}</code>
            </div>
            
            <p style="margin-bottom:12px;"><strong>2. Unesite 6-cifreni kod</strong> iz aplikacije:</p>
            <div style="margin-bottom:16px;">
              <input type="text" id="2fa-code" class="input" placeholder="000000" maxlength="6" 
                     style="text-align:center;font-size:24px;letter-spacing:8px;font-weight:bold;"
                     oninput="this.value = this.value.replace(/[^0-9]/g, '')">
            </div>
            
            <details style="margin-top:16px;">
              <summary style="cursor:pointer;color:var(--text-tertiary);">Rezervni kodovi (sacuvajte ih)</summary>
              <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px;padding:16px;background:var(--background);border-radius:8px;margin-top:8px;">
                \${data.backupCodes.map(c => \`<code style="font-size:12px;">\${c}</code>\`).join('')}
              </div>
            </details>
            
            <div class="modal-actions">
              <button class="btn btn-secondary" onclick="closeModal()">Otkazi</button>
              <button class="btn btn-primary" onclick="enable2FA()">Aktiviraj 2FA</button>
            </div>
          </div>
        \`;
        overlay.classList.remove('hidden');
        overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function enable2FA() {
      const code = document.getElementById('2fa-code')?.value;
      if (!code || code.length !== 6) {
        alert('Unesite 6-cifreni kod iz aplikacije');
        return;
      }
      try {
        await api('/api/admin/2fa/enable', { method: 'POST', body: JSON.stringify({ code }) });
        closeModal();
        loadSecurity();
        alert('2FA uspesno aktivirano! Prilikom sledece prijave bice potreban kod iz aplikacije.');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function disable2FA() {
      if (!confirm('Da li ste sigurni da zelite da iskljucite 2FA?')) return;
      try {
        await api('/api/admin/2fa/disable', { method: 'POST' });
        loadSecurity();
        alert('2FA deaktivirano!');
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    // ========== CSV Export ==========
    async function exportCSV(type) {
      try {
        const blob = await api(\`/api/admin/export/\${type}\`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`\${type}_export.csv\`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (e) {
        alert('Greska pri eksportovanju: ' + e.message);
      }
    }

    // ========== User Reputation ==========
    async function showUserReputation(userId) {
      try {
        const data = await api(\`/api/admin/users/\${userId}/reputation\`);
        const rep = data.reputation;
        
        const content = \`
          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:48px;font-weight:bold;color:var(--primary);">\${rep.score}</div>
            <div style="color:var(--text-tertiary);">Reputation Score</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div><strong>Prosecna ocena:</strong> \${rep.avgRating}/5</div>
            <div><strong>Ukupno recenzija:</strong> \${rep.totalReviews}</div>
            <div><strong>Kao vlasnik:</strong> \${rep.completedAsOwner} transakcija</div>
            <div><strong>Kao zakupac:</strong> \${rep.completedAsRenter} transakcija</div>
            <div><strong>Oglasa:</strong> \${rep.itemsCount}</div>
            <div><strong>Clan od:</strong> \${new Date(rep.memberSince).toLocaleDateString('sr-RS')}</div>
          </div>
          <div style="margin-top:16px;">
            <strong>Verifikacije:</strong>
            \${rep.emailVerified ? '<span class="badge badge-success">Email</span>' : ''}
            \${rep.phoneVerified ? '<span class="badge badge-success">Telefon</span>' : ''}
            \${rep.documentVerified ? '<span class="badge badge-success">Dokument</span>' : ''}
          </div>
        \`;
        
        showModal('Reputacija korisnika', '', content, \`<button class="btn btn-secondary" onclick="closeModal()">Zatvori</button>\`);
      } catch (e) {
        alert('Greska: ' + e.message);
      }
    }

    async function checkAuth() {
      if (!token) return false;
      try {
        const data = await api('/api/admin/me');
        admin = data.admin;
        return true;
      } catch (e) {
        localStorage.removeItem('admin_token');
        token = null;
        return false;
      }
    }

    async function init() {
      const isAuth = await checkAuth();
      if (isAuth) {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('admin-name').textContent = admin.name || 'Admin';
        document.getElementById('admin-role').textContent = admin.role || 'admin';
        document.getElementById('admin-avatar').textContent = (admin.name || 'A').charAt(0).toUpperCase();
        showPage('dashboard');
      }
    }

    let pending2FA = false;
    
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const twoFactorCode = document.getElementById('twoFactorCode').value;
      const btn = document.getElementById('login-btn');
      const error = document.getElementById('login-error');
      const twoFAGroup = document.getElementById('2fa-group');
      
      btn.disabled = true;
      btn.textContent = 'Prijava u toku...';
      error.classList.add('hidden');

      try {
        const body = { email, password };
        if (pending2FA && twoFactorCode) {
          body.twoFactorCode = twoFactorCode;
        }
        
        const data = await api('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        
        // Check if 2FA is required
        if (data.requires2FA) {
          pending2FA = true;
          twoFAGroup.classList.remove('hidden');
          document.getElementById('twoFactorCode').focus();
          error.textContent = data.message;
          error.style.color = 'var(--primary)';
          error.classList.remove('hidden');
          return;
        }
        
        // Login successful
        pending2FA = false;
        twoFAGroup.classList.add('hidden');
        token = data.token;
        admin = data.admin;
        localStorage.setItem('admin_token', token);
        
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('admin-name').textContent = admin.name || 'Admin';
        document.getElementById('admin-role').textContent = admin.role || 'admin';
        document.getElementById('admin-avatar').textContent = (admin.name || 'A').charAt(0).toUpperCase();
        showPage('dashboard');
      } catch (err) {
        error.style.color = 'var(--error)';
        error.textContent = err.message;
        error.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Prijavi se';
      }
    });

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => showPage(btn.dataset.page));
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('admin_token');
      token = null;
      admin = null;
      pending2FA = false;
      document.getElementById('dashboard').classList.add('hidden');
      document.getElementById('login-page').classList.remove('hidden');
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
      document.getElementById('twoFactorCode').value = '';
      document.getElementById('2fa-group').classList.add('hidden');
    });

    init();
  </script>
</body>
</html>
`;

// server/seed-categories.ts
init_schema();
import { eq as eq6 } from "drizzle-orm";
async function seedCategories() {
  console.log("[SEED] Starting category seeding...");
  let sortOrder = 0;
  for (const [key, cat] of Object.entries(PREDEFINED_CATEGORIES)) {
    const existingCat = await db.select().from(categories).where(eq6(categories.slug, cat.slug)).limit(1);
    let categoryId;
    if (existingCat.length === 0) {
      const [newCat] = await db.insert(categories).values({
        name: cat.name,
        slug: cat.slug,
        sortOrder: sortOrder++,
        isActive: true
      }).returning();
      categoryId = newCat.id;
      console.log(`[SEED] Created category: ${cat.name}`);
    } else {
      categoryId = existingCat[0].id;
      console.log(`[SEED] Category already exists: ${cat.name}`);
    }
    let subSortOrder = 0;
    for (const sub of cat.subcategories) {
      const fullSlug = `${cat.slug}-${sub.slug}`;
      const existingSub = await db.select().from(subcategories).where(eq6(subcategories.categoryId, categoryId)).limit(100);
      const found = existingSub.find((s) => s.slug === fullSlug || s.name === sub.name);
      if (!found) {
        await db.insert(subcategories).values({
          categoryId,
          name: sub.name,
          slug: fullSlug,
          sortOrder: subSortOrder++,
          isActive: true
        });
        console.log(`[SEED]   Created subcategory: ${sub.name}`);
      }
    }
  }
  console.log("[SEED] Category seeding complete!");
}
async function migrateItemsToNewCategories() {
  console.log("[MIGRATE] Starting item migration to new category structure...");
  const categoryMapping = {
    "Elektri\u010Dni alati": "elektricni-alati",
    "Akumulatorski alati": "akumulatorski-alati",
    "Ru\u010Dni alati": "rucni-alati",
    "Ba\u0161tenski alati": "bastenski-alati",
    "Gra\u0111evinska oprema": "masine-beton-teski-radovi",
    "Oprema za \u010Di\u0161\u0107enje": "oprema-za-ciscenje",
    "Auto-mehanika": "auto-servis",
    "Merni/laserski": "merni-alati-oprema"
  };
  const subcategoryMapping = {
    "Bu\u0161ilice": "busilice",
    "Brusilice": "brusilice",
    "Testere": "testere",
    "\u010Ceki\u0107 bu\u0161ilice": "stemaci-cekic-busilice",
    "Betonijeri": "betonijeri",
    "Agregati": "agregati",
    "Ma\u0161ine za se\u010Denje": "masine-za-secenje",
    "Pera\u010Di pod pritiskom": "peraci-pod-pritiskom",
    "Lan\u010Dane testere": "lancane-testere",
    "Kosilice": "kosilice",
    "Trimeri": "trimeri"
  };
  const allCategories = await db.select().from(categories);
  const allSubcategories = await db.select().from(subcategories);
  const { items: items3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const allItems = await db.select().from(items3);
  for (const item of allItems) {
    if (item.categoryId) continue;
    const catSlug = categoryMapping[item.category] || "ostalo-specijalni-alati";
    const matchedCat = allCategories.find((c) => c.slug === catSlug);
    if (!matchedCat) {
      console.log(`[MIGRATE] No category match for: ${item.category}`);
      continue;
    }
    let matchedSub = null;
    if (item.subCategory) {
      const subSlug = subcategoryMapping[item.subCategory];
      if (subSlug) {
        matchedSub = allSubcategories.find(
          (s) => s.categoryId === matchedCat.id && s.slug.includes(subSlug)
        );
      }
    }
    if (!matchedSub) {
      matchedSub = allSubcategories.find(
        (s) => s.categoryId === matchedCat.id && s.slug.endsWith("-ostalo")
      );
    }
    await db.update(items3).set({
      categoryId: matchedCat.id,
      subcategoryId: matchedSub?.id || null
    }).where(eq6(items3.id, item.id));
    console.log(`[MIGRATE] Updated item ${item.title} -> ${matchedCat.name} / ${matchedSub?.name || "N/A"}`);
  }
  console.log("[MIGRATE] Item migration complete!");
}
async function seedFeatureToggles() {
  console.log("[SEED] Starting feature toggles seeding...");
  const defaultToggles = [
    { name: "guest_browsing", description: "Omogucava pregledanje oglasa bez prijave", isEnabled: true },
    { name: "early_adopter_program", description: "Prvih 100 korisnika dobija premium besplatno 30 dana", isEnabled: true },
    { name: "email_notifications", description: "Slanje email notifikacija korisnicima", isEnabled: true },
    { name: "push_notifications", description: "Push notifikacije za mobilnu aplikaciju", isEnabled: false },
    { name: "location_filter", description: "Filtriranje oglasa po lokaciji", isEnabled: true },
    { name: "stripe_payments", description: "Stripe placanje za pretplate", isEnabled: false },
    { name: "premium_popup", description: "Prikazuje popup za premium pretplatu korisnicima", isEnabled: true }
  ];
  for (const toggle of defaultToggles) {
    const existing = await db.select().from(featureToggles).where(eq6(featureToggles.name, toggle.name)).limit(1);
    if (existing.length === 0) {
      await db.insert(featureToggles).values({
        name: toggle.name,
        description: toggle.description,
        isEnabled: toggle.isEnabled,
        enabledForPercentage: 100
      });
      console.log(`[SEED] Created feature toggle: ${toggle.name}`);
    } else {
      console.log(`[SEED] Feature toggle already exists: ${toggle.name}`);
    }
  }
  console.log("[SEED] Feature toggles seeding complete!");
}
async function seedAppVersions() {
  console.log("[SEED] Starting app versions seeding...");
  const defaultVersions = [
    { platform: "web", version: "1.0.0", buildNumber: 1, releaseNotes: "Inicijalno izdanje platforme", isRequired: false },
    { platform: "android", version: "1.0.0", buildNumber: 1, releaseNotes: "Inicijalno izdanje za Android", isRequired: false },
    { platform: "ios", version: "1.0.0", buildNumber: 1, releaseNotes: "Inicijalno izdanje za iOS", isRequired: false }
  ];
  for (const ver of defaultVersions) {
    const existing = await db.select().from(appVersions).where(eq6(appVersions.platform, ver.platform)).limit(1);
    if (existing.length === 0) {
      await db.insert(appVersions).values({
        platform: ver.platform,
        version: ver.version,
        buildNumber: ver.buildNumber,
        releaseNotes: ver.releaseNotes,
        isRequired: ver.isRequired
      });
      console.log(`[SEED] Created app version: ${ver.platform} v${ver.version}`);
    } else {
      console.log(`[SEED] App version already exists: ${ver.platform}`);
    }
  }
  console.log("[SEED] App versions seeding complete!");
}

// server/index.ts
import * as fs3 from "fs";
import * as path3 from "path";
import { scrypt as scrypt4, randomBytes as randomBytes5 } from "crypto";
import { promisify as promisify4 } from "util";
import { fileURLToPath as fileURLToPath3 } from "url";
import { dirname as dirname3 } from "path";
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = dirname3(__filename3);
var scryptAsync4 = promisify4(scrypt4);
async function hashPasswordForAdmin(password) {
  const salt = randomBytes5(16).toString("hex");
  const buf = await scryptAsync4(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function initializeAdminAccount() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@vikendmajstor.rs";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  try {
    const existingAdmin = await storage.getUserByEmail(adminEmail);
    if (existingAdmin) {
      if (!existingAdmin.isAdmin) {
        await storage.updateUserAdmin(existingAdmin.id, { isAdmin: true, isActive: true });
        console.log(`[ADMIN] Updated existing user to admin: ${adminEmail}`);
      }
      return;
    }
    if (!adminPassword) {
      console.error("[ADMIN] ERROR: No admin account exists and ADMIN_DEFAULT_PASSWORD not set!");
      console.error("[ADMIN] Set ADMIN_DEFAULT_PASSWORD environment variable to create initial admin.");
      return;
    }
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
    console.warn("[ADMIN] WARNING: Change admin password immediately after first login!");
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
  app2.use((req, res, next) => {
    if (req.path.startsWith('/api/objects/upload/') && req.method === 'PUT') {
      return next();
    }
    express.json({
      verify: (req2, _res, buf) => {
        req2.rawBody = buf;
      }
    })(req, res, next);
  });
  app2.use((req, res, next) => {
    if (req.path.startsWith('/api/objects/upload/') && req.method === 'PUT') {
      return next();
    }
    express.urlencoded({ extended: false })(req, res, next);
  });
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path4 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path4.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
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
    const appJsonPath = path3.resolve(process.cwd(), "app.json");
    const appJsonContent = fs3.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path3.resolve(
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
  const customLandingPath = path3.resolve(
    process.cwd(),
    "server",
    "landing",
    "index.html"
  );
  const landingPageTemplate = LANDING_PAGE_TEMPLATE;
  const adminPanelTemplate = ADMIN_PANEL_TEMPLATE;
  const appName = getAppName();
  const hasCustomLanding = fs3.existsSync(customLandingPath);
  log("Serving static Expo files with dynamic manifest routing");
  app2.get("/admin", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(adminPanelTemplate);
  });
  app2.get("/admin/*", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(adminPanelTemplate);
  });
  log("Admin panel available at /admin");
  app2.get("/favicon.png", (_req, res) => {
    const faviconPath = path3.resolve(process.cwd(), "server", "templates", "favicon.png");
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
    const termsPath = path3.resolve(process.cwd(), "server", "landing", "uslovi-koriscenja.html");
    if (fs3.existsSync(termsPath)) {
      res.sendFile(termsPath);
    } else {
      res.status(404).send("Page not found");
    }
  });
  app2.get("/politika-privatnosti", (_req, res) => {
    const privacyPath = path3.resolve(process.cwd(), "server", "landing", "politika-privatnosti.html");
    if (fs3.existsSync(privacyPath)) {
      res.sendFile(privacyPath);
    } else {
      res.status(404).send("Page not found");
    }
  });
  app2.get("/terms-of-service", (_req, res) => {
    const termsPath = path3.resolve(process.cwd(), "server", "templates", "terms.html");
    if (fs3.existsSync(termsPath)) {
      res.sendFile(termsPath);
    } else {
      res.status(404).send("Page not found");
    }
  });
  app2.get("/privacy-policy", (_req, res) => {
    const privacyPath = path3.resolve(process.cwd(), "server", "templates", "privacy.html");
    if (fs3.existsSync(privacyPath)) {
      res.sendFile(privacyPath);
    } else {
      res.status(404).send("Page not found");
    }
  });
  app2.get("/legal", (_req, res) => {
    const legalPath = path3.resolve(process.cwd(), "server", "templates", "legal.html");
    if (fs3.existsSync(legalPath)) {
      res.sendFile(legalPath);
    } else {
      res.status(404).send("Page not found");
    }
  });
  app2.get("/refund-policy", (_req, res) => {
    const refundPath = path3.resolve(process.cwd(), "server", "templates", "refund.html");
    if (fs3.existsSync(refundPath)) {
      res.sendFile(refundPath);
    } else {
      res.status(404).send("Page not found");
    }
  });
  app2.get("/contact", (_req, res) => {
    const contactPath = path3.resolve(process.cwd(), "server", "templates", "contact.html");
    if (fs3.existsSync(contactPath)) {
      res.sendFile(contactPath);
    } else {
      res.status(404).send("Page not found");
    }
  });
  app2.get("/auth/google/callback", (_req, res) => {
    const callbackPath = path3.resolve(process.cwd(), "server", "templates", "google-callback.html");
    if (fs3.existsSync(callbackPath)) {
      res.sendFile(callbackPath);
    } else {
      res.status(404).send("Callback page not found");
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
  const staticOptions = {
    maxAge: "7d",
    etag: true,
    lastModified: true
  };
  app2.use("/assets", express.static(path3.resolve(process.cwd(), "assets"), staticOptions));
  app2.use("/demo-images", express.static(path3.resolve(process.cwd(), "server/public/demo-images"), staticOptions));
  app2.use("/images", express.static(path3.resolve(process.cwd(), "server/landing/images"), staticOptions));
  app2.use("/uploads", express.static(path3.resolve(__dirname, "uploads", "public"), staticOptions));
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    const hostname = req.hostname || req.headers.host?.split(":")[0] || "";
    const isAppSubdomain = hostname === "app.vikendmajstor.rs" || hostname.includes("app.");
    if (isAppSubdomain) {
      const webBuildPath = path3.resolve(process.cwd(), "static-build", "web");
      return express.static(webBuildPath)(req, res, () => {
        const indexPath = path3.join(webBuildPath, "index.html");
        if (fs3.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
        next();
      });
    }
    next();
  });
  app2.use(express.static(path3.resolve(process.cwd(), "static-build")));
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
  registerAdminRoutes(app);
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
  try {
    await seedCategories();
    await migrateItemsToNewCategories();
  } catch (error) {
    console.error("[SEED] Error seeding categories:", error);
  }
  try {
    await seedFeatureToggles();
    await seedAppVersions();
  } catch (error) {
    console.error("[SEED] Error seeding admin data:", error);
  }
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
