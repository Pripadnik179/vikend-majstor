import { db } from "./db";
import { users, items, bookings, conversations, messages, reviews } from "../shared/schema";
import { eq, like, or, inArray } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { getCityCoordinates } from "../shared/cityCoordinates";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${derivedKey.toString("hex")}.${salt}`;
}

// Demo slike - korisničke slike alata
const DEMO_IMAGES = {
  busilica: ['/demo-images/busilica_makita.png'],
  brusilica: ['/demo-images/brusilica_villager.png'],
  ubodnaTesera: ['/demo-images/ubodna_testera_villager.png'],
  cirkularMetabo: ['/demo-images/cirkular_metabo.png'],
  mesalica: ['/demo-images/mesalica_beton_ingco.png'],
  sekac: ['/demo-images/sekac_husqvarna.png'],
  rende: ['/demo-images/rende_makita.png'],
  vibrator: ['/demo-images/vibrator_beton_raider.png'],
  glodalica: ['/demo-images/glodalica_bosch.png'],
  cirkularBosch: ['/demo-images/cirkular_bosch.png'],
};

const DEMO_EMAIL_SUFFIX = "@demo.vikendmajstor.rs";

export async function seedDemoData(): Promise<{ users: number; items: number }> {
  console.log("[SEED] Starting demo data seed...");
  console.log("[SEED] Using external Unsplash URLs for demo images");
  
  console.log("[SEED] Creating demo users...");
  const hashedPassword = await hashPassword("demo123");
  
  const demoUsers = [
    { 
      email: `marko${DEMO_EMAIL_SUFFIX}`, 
      name: "Marko Petrović", 
      phone: "+381641234567",
      city: "Beograd",
      district: "Novi Beograd",
      subscriptionType: "premium" as const,
    },
    { 
      email: `jelena${DEMO_EMAIL_SUFFIX}`, 
      name: "Jelena Nikolić", 
      phone: "+381642345678",
      city: "Novi Sad",
      district: "Liman",
      subscriptionType: "basic" as const,
    },
    { 
      email: `stefan${DEMO_EMAIL_SUFFIX}`, 
      name: "Stefan Jovanović", 
      phone: "+381643456789",
      city: "Niš",
      district: "Centar",
      subscriptionType: "premium" as const,
    },
    { 
      email: `ana${DEMO_EMAIL_SUFFIX}`, 
      name: "Ana Đorđević", 
      phone: "+381644567890",
      city: "Kragujevac",
      district: "Aerodrom",
      subscriptionType: "free" as const,
    },
    { 
      email: `nikola${DEMO_EMAIL_SUFFIX}`, 
      name: "Nikola Stojanović", 
      phone: "+381645678901",
      city: "Subotica",
      district: "Centar",
      subscriptionType: "basic" as const,
    },
    { 
      email: `milica${DEMO_EMAIL_SUFFIX}`, 
      name: "Milica Marković", 
      phone: "+381646789012",
      city: "Zrenjanin",
      district: "Centar",
      subscriptionType: "premium" as const,
    },
    { 
      email: `dragan${DEMO_EMAIL_SUFFIX}`, 
      name: "Dragan Ilić", 
      phone: "+381647890123",
      city: "Čačak",
      district: "Centar",
      subscriptionType: "basic" as const,
    },
    { 
      email: `jovana${DEMO_EMAIL_SUFFIX}`, 
      name: "Jovana Pavlović", 
      phone: "+381648901234",
      city: "Leskovac",
      district: "Centar",
      subscriptionType: "free" as const,
    },
    { 
      email: `milan${DEMO_EMAIL_SUFFIX}`, 
      name: "Milan Todorović", 
      phone: "+381649012345",
      city: "Valjevo",
      district: "Centar",
      subscriptionType: "premium" as const,
    },
    { 
      email: `tamara${DEMO_EMAIL_SUFFIX}`, 
      name: "Tamara Kostić", 
      phone: "+381640123456",
      city: "Šabac",
      district: "Centar",
      subscriptionType: "basic" as const,
    },
  ];
  
  const createdUsers: { id: string; city: string; district: string }[] = [];
  let usersCreated = 0;
  
  for (const userData of demoUsers) {
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
    
    if (existingUser.length > 0) {
      const user = existingUser[0];
      createdUsers.push({ id: user.id, city: userData.city, district: userData.district || "" });
      console.log(`[SEED] Demo user already exists: ${userData.name}`);
    } else {
      const subscriptionEndDate = userData.subscriptionType !== 'free' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null;
      
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
        isActive: true,
      }).returning();
      
      createdUsers.push({ id: user.id, city: userData.city, district: userData.district || "" });
      usersCreated++;
      console.log(`[SEED] Created demo user: ${userData.name}`);
    }
  }
  
  console.log("[SEED] Creating demo items...");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const demoItems = [
    {
      ownerIndex: 0,
      title: "Električna bušilica Makita DP4011",
      description: "Profesionalna električna bušilica Makita DP4011. Snaga 720W, podesiva brzina, ergonomska drška. Idealna za bušenje u drvu i metalu.",
      category: "Električni alati",
      subCategory: "Bušilice",
      brand: "Makita",
      powerSource: "Električni (struja)",
      powerWatts: 720,
      pricePerDay: 800,
      deposit: 5000,
      images: DEMO_IMAGES.busilica,
      isFeatured: true,
    },
    {
      ownerIndex: 0,
      title: "VLN 433 ugaona brusilica Villager",
      description: "Ugaona brusilica Villager VLN 433. Snažna i izdržljiva, idealna za sečenje i brušenje metala. Uključeni zaštitni poklopac i ručka.",
      category: "Električni alati",
      subCategory: "Brusilice",
      brand: "Villager",
      powerSource: "Električni (struja)",
      powerWatts: 850,
      pricePerDay: 600,
      deposit: 4000,
      images: DEMO_IMAGES.brusilica,
      isFeatured: false,
    },
    {
      ownerIndex: 1,
      title: "Električna ubodna testera Villager",
      description: "Električna ubodna testera Villager za precizno sečenje drva, plastike i tankog metala. Podesiv ugao sečenja, jednostavna zamena lista.",
      category: "Električni alati",
      subCategory: "Testere",
      brand: "Villager",
      powerSource: "Električni (struja)",
      powerWatts: 650,
      pricePerDay: 500,
      deposit: 3000,
      images: DEMO_IMAGES.ubodnaTesera,
      isFeatured: false,
    },
    {
      ownerIndex: 1,
      title: "Ručni cirkular KS 55 FS Metabo",
      description: "Profesionalni ručni cirkular Metabo KS 55 FS. Dubina reza do 55mm, vođica za precizno sečenje. Snaga 1200W.",
      category: "Električni alati",
      subCategory: "Testere",
      brand: "Metabo",
      powerSource: "Električni (struja)",
      powerWatts: 1200,
      pricePerDay: 900,
      deposit: 6000,
      images: DEMO_IMAGES.cirkularMetabo,
      isFeatured: true,
    },
    {
      ownerIndex: 2,
      title: "Mešalica za beton 200L INGCO",
      description: "Električna mešalica za beton INGCO kapaciteta 200 litara. Snaga 850W, čelični bubanj, točkovi za lako premeštanje. Idealna za građevinske radove.",
      category: "Građevinske mašine",
      subCategory: "Mešalice",
      brand: "INGCO",
      powerSource: "Električni (struja)",
      powerWatts: 850,
      pricePerDay: 1500,
      deposit: 10000,
      images: DEMO_IMAGES.mesalica,
      isFeatured: true,
    },
    {
      ownerIndex: 2,
      title: "Husqvarna električni sekač za beton",
      description: "Profesionalni Husqvarna električni ručni sekač za beton i asfalt. Dijamantski disk, vodeno hlađenje. Idealan za građevinske i renovacijske radove.",
      category: "Građevinske mašine",
      subCategory: "Sekači",
      brand: "Husqvarna",
      powerSource: "Električni (struja)",
      powerWatts: 2200,
      pricePerDay: 2000,
      deposit: 15000,
      images: DEMO_IMAGES.sekac,
      isFeatured: true,
    },
    {
      ownerIndex: 3,
      title: "Električno ručno rende Makita",
      description: "Električno ručno rende za drvo Makita. Širina rendisanja 82mm, podesiva dubina. Idealno za obradu drvenih površina i uklanjanje viška materijala.",
      category: "Električni alati",
      subCategory: "Rendisalice",
      brand: "Makita",
      powerSource: "Električni (struja)",
      powerWatts: 620,
      pricePerDay: 700,
      deposit: 5000,
      images: DEMO_IMAGES.rende,
      isFeatured: false,
    },
    {
      ownerIndex: 3,
      title: "Vibrator za beton Raider",
      description: "Vibrator za beton Raider sa fleksibilnom iglom. Idealan za vibriranje betona i uklanjanje mehurića vazduha. Snaga 1350W.",
      category: "Građevinske mašine",
      subCategory: "Vibratori",
      brand: "Raider",
      powerSource: "Električni (struja)",
      powerWatts: 1350,
      pricePerDay: 1000,
      deposit: 7000,
      images: DEMO_IMAGES.vibrator,
      isFeatured: false,
    },
    {
      ownerIndex: 4,
      title: "Električna glodalica Bosch POF 1400 ACE",
      description: "Električna glodalica za drvo Bosch POF 1400 ACE. Snaga 1400W, elektronska regulacija brzine, sistem za usisavanje prašine. Idealna za precizne radove u drvetu.",
      category: "Električni alati",
      subCategory: "Glodalice",
      brand: "Bosch",
      powerSource: "Električni (struja)",
      powerWatts: 1400,
      pricePerDay: 1200,
      deposit: 8000,
      images: DEMO_IMAGES.glodalica,
      isFeatured: true,
    },
    {
      ownerIndex: 5,
      title: "Bosch klatna testera GCM 8 SJL",
      description: "Profesionalna klatna testera Bosch za precizno sečenje drva pod uglom. Širina reza do 312mm, laserska vođica. Idealna za stolare i podopolagače.",
      category: "Električni alati",
      subCategory: "Testere",
      brand: "Bosch",
      powerSource: "Električni (struja)",
      powerWatts: 1600,
      pricePerDay: 1500,
      deposit: 12000,
      images: DEMO_IMAGES.cirkularBosch,
      isFeatured: true,
    },
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
      expiresAt,
    });
    
    itemsCreated++;
  }
  
  console.log(`[SEED] Demo data seeding complete: ${usersCreated} users, ${itemsCreated} items`);
  return { users: usersCreated, items: itemsCreated };
}

export async function deleteDemoData(): Promise<{ users: number; items: number }> {
  console.log("[SEED] Deleting demo data...");
  
  const demoUsersList = await db.select().from(users).where(
    or(
      like(users.email, `%${DEMO_EMAIL_SUFFIX}`),
      like(users.email, `%@demo.com`)
    )
  );
  
  if (demoUsersList.length === 0) {
    console.log("[SEED] No demo users found to delete");
    return { users: 0, items: 0 };
  }
  
  const demoUserIds = demoUsersList.map(u => u.id);
  console.log(`[SEED] Found ${demoUserIds.length} demo users to delete`);
  
  // Get all items owned by demo users
  const demoItems = await db.select().from(items).where(inArray(items.ownerId, demoUserIds));
  const demoItemIds = demoItems.map(i => i.id);
  console.log(`[SEED] Found ${demoItemIds.length} demo items to delete`);
  
  // 1. Delete reviews involving demo users or demo items
  if (demoItemIds.length > 0) {
    const deletedReviews = await db.delete(reviews).where(inArray(reviews.itemId, demoItemIds)).returning();
    console.log(`[SEED] Deleted ${deletedReviews.length} reviews for demo items`);
  }
  const deletedReviewsByUser = await db.delete(reviews).where(
    or(
      inArray(reviews.reviewerId, demoUserIds),
      inArray(reviews.revieweeId, demoUserIds)
    )
  ).returning();
  console.log(`[SEED] Deleted ${deletedReviewsByUser.length} reviews by/for demo users`);
  
  // 2. Delete bookings involving demo users or demo items
  if (demoItemIds.length > 0) {
    const deletedBookings = await db.delete(bookings).where(inArray(bookings.itemId, demoItemIds)).returning();
    console.log(`[SEED] Deleted ${deletedBookings.length} bookings for demo items`);
  }
  const deletedBookingsByUser = await db.delete(bookings).where(
    or(
      inArray(bookings.renterId, demoUserIds),
      inArray(bookings.ownerId, demoUserIds)
    )
  ).returning();
  console.log(`[SEED] Deleted ${deletedBookingsByUser.length} bookings by demo users`);
  
  // 3. Get conversations involving demo users, then delete messages and conversations
  const demoConversations = await db.select().from(conversations).where(
    or(
      inArray(conversations.user1Id, demoUserIds),
      inArray(conversations.user2Id, demoUserIds)
    )
  );
  const demoConversationIds = demoConversations.map(c => c.id);
  
  if (demoConversationIds.length > 0) {
    const deletedMessages = await db.delete(messages).where(inArray(messages.conversationId, demoConversationIds)).returning();
    console.log(`[SEED] Deleted ${deletedMessages.length} messages from demo conversations`);
    
    const deletedConversations = await db.delete(conversations).where(inArray(conversations.id, demoConversationIds)).returning();
    console.log(`[SEED] Deleted ${deletedConversations.length} conversations involving demo users`);
  }
  
  // 4. Delete items owned by demo users
  let itemsDeleted = 0;
  if (demoItemIds.length > 0) {
    const deletedItems = await db.delete(items).where(inArray(items.id, demoItemIds)).returning();
    itemsDeleted = deletedItems.length;
    console.log(`[SEED] Deleted ${itemsDeleted} demo items`);
  }
  
  // 5. Finally delete demo users
  const deletedUsers = await db.delete(users).where(inArray(users.id, demoUserIds)).returning();
  const usersDeleted = deletedUsers.length;
  console.log(`[SEED] Deleted ${usersDeleted} demo users`);
  
  console.log(`[SEED] Demo data deletion complete: ${usersDeleted} users, ${itemsDeleted} items`);
  return { users: usersDeleted, items: itemsDeleted };
}

export async function getDemoDataStats(): Promise<{ users: number; items: number }> {
  const demoUsersList = await db.select().from(users).where(
    or(
      like(users.email, `%${DEMO_EMAIL_SUFFIX}`),
      like(users.email, `%@demo.com`)
    )
  );
  
  let totalItems = 0;
  for (const user of demoUsersList) {
    const userItems = await db.select().from(items).where(eq(items.ownerId, user.id));
    totalItems += userItems.length;
  }
  
  return { users: demoUsersList.length, items: totalItems };
}
