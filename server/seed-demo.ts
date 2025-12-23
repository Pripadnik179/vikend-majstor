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

// Demo slike - direktni Unsplash URL-ovi (pouzdani za produkciju)
const DEMO_IMAGES = {
  drill: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=400&fit=crop',
  ],
  grinder: [
    'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop',
  ],
  saw: [
    'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=600&h=400&fit=crop',
  ],
  mixer: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=600&h=400&fit=crop',
  ],
  washer: [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=400&fit=crop',
  ],
  mower: [
    'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600&h=400&fit=crop',
  ],
  sander: [
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop',
  ],
  hammer: [
    'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=400&fit=crop',
  ],
  chainsaw: [
    'https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&h=400&fit=crop',
  ],
  scaffold: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=600&h=400&fit=crop',
  ],
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
      title: "Bosch profesionalna bušilica GSB 18V",
      description: "Profesionalna akumulatorska bušilica Bosch sa dva akumulatora. Idealna za bušenje u betonu, drvu i metalu. Uključena torba za nošenje i set burgija.",
      category: "Električni alati",
      subCategory: "Bušilice",
      brand: "Bosch",
      powerSource: "Akumulator",
      powerWatts: 650,
      pricePerDay: 800,
      deposit: 5000,
      images: DEMO_IMAGES.drill,
      isFeatured: true,
    },
    {
      ownerIndex: 0,
      title: "DeWalt ugaona brusilica 230mm",
      description: "Profesionalna ugaona brusilica za sečenje i brušenje metala i kamena. Snaga 2200W. Uključeni zaštitni poklopac i ručka.",
      category: "Električni alati",
      subCategory: "Brusilice",
      brand: "DeWalt",
      powerSource: "Električni (struja)",
      powerWatts: 2200,
      pricePerDay: 900,
      deposit: 6000,
      images: DEMO_IMAGES.grinder,
      isFeatured: false,
    },
    {
      ownerIndex: 1,
      title: "Makita kružna testera 190mm",
      description: "Snažna električna kružna testera za precizno sečenje drva. Dubina reza do 66mm. Laser za precizno vođenje.",
      category: "Električni alati",
      subCategory: "Testere",
      brand: "Makita",
      powerSource: "Električni (struja)",
      powerWatts: 1800,
      pricePerDay: 1200,
      deposit: 8000,
      images: DEMO_IMAGES.saw,
      isFeatured: true,
    },
    {
      ownerIndex: 1,
      title: "Betonijer mešalica 160L",
      description: "Električna mešalica za beton kapaciteta 160 litara. Idealna za manje građevinske radove. Točkovi za lako premeštanje.",
      category: "Građevinske mašine",
      subCategory: "Mešalice",
      brand: "Lescha",
      powerSource: "Električni (struja)",
      powerWatts: 650,
      pricePerDay: 1500,
      deposit: 10000,
      images: DEMO_IMAGES.mixer,
      isFeatured: false,
    },
    {
      ownerIndex: 2,
      title: "Kärcher perač pod pritiskom K5",
      description: "Profesionalni perač pod pritiskom za čišćenje dvorišta, automobila, fasada. Pritisak do 145 bara. Uključeno crevo od 8m.",
      category: "Oprema za čišćenje",
      subCategory: "Perači pod pritiskom",
      brand: "Kärcher",
      powerSource: "Električni (struja)",
      powerWatts: 2100,
      pricePerDay: 1500,
      deposit: 10000,
      images: DEMO_IMAGES.washer,
      isFeatured: true,
    },
    {
      ownerIndex: 2,
      title: "Husqvarna motorna kosilica",
      description: "Profesionalna benzinska kosilica za travu. Širina košenja 53cm. Kanta za sakupljanje trave 70L.",
      category: "Bašta",
      subCategory: "Košenje",
      brand: "Husqvarna",
      powerSource: "Benzinski",
      pricePerDay: 1200,
      deposit: 8000,
      images: DEMO_IMAGES.mower,
      isFeatured: false,
    },
    {
      ownerIndex: 3,
      title: "Bosch orbitalna brusilica GEX 125",
      description: "Profesionalna orbitalna brusilica za finu obradu drveta. Prečnik ploče 125mm. Priključak za usisavanje prašine.",
      category: "Električni alati",
      subCategory: "Brusilice",
      brand: "Bosch",
      powerSource: "Električni (struja)",
      powerWatts: 350,
      pricePerDay: 600,
      deposit: 4000,
      images: DEMO_IMAGES.sander,
      isFeatured: false,
    },
    {
      ownerIndex: 3,
      title: "Hilti TE 7-C SDS-Plus čekić bušilica",
      description: "Profesionalni čekić za bušenje u betonu i zidariji. Energija udara 2.6J. Uključen kofer sa setom burgija.",
      category: "Električni alati",
      subCategory: "Bušilice",
      brand: "Hilti",
      powerSource: "Električni (struja)",
      powerWatts: 800,
      pricePerDay: 1100,
      deposit: 8000,
      images: DEMO_IMAGES.hammer,
      isFeatured: true,
    },
    {
      ownerIndex: 4,
      title: "Stihl benzinska lančana testera MS 250",
      description: "Profesionalna benzinska lančana testera za sečenje drveća i ogreva. Dužina mača 40cm. Automatsko podmazivanje lanca.",
      category: "Bašta",
      subCategory: "Orezivanje",
      brand: "Stihl",
      powerSource: "Benzinski",
      pricePerDay: 1800,
      deposit: 12000,
      images: DEMO_IMAGES.chainsaw,
      isFeatured: false,
    },
    {
      ownerIndex: 5,
      title: "Građevinska skela set 8m",
      description: "Komplet građevinske skele visine do 8 metara. Aluminijumska konstrukcija, lagana za montažu. Uključene sigurnosne ograde.",
      category: "Građevinske mašine",
      subCategory: "Skele",
      brand: "Generic",
      powerSource: "Ručni",
      pricePerDay: 2000,
      deposit: 15000,
      images: DEMO_IMAGES.scaffold,
      isFeatured: true,
    },
    {
      ownerIndex: 5,
      title: "Milwaukee akumulatorska bušilica M18",
      description: "Snažna akumulatorska udarna bušilica Milwaukee. Dva akumulatora od 5Ah, punjač i kofer u kompletu.",
      category: "Akumulatorski alati",
      subCategory: "Bušilice",
      brand: "Milwaukee",
      powerSource: "Akumulator",
      powerWatts: 700,
      pricePerDay: 1000,
      deposit: 7000,
      images: DEMO_IMAGES.drill,
      isFeatured: false,
    },
    {
      ownerIndex: 6,
      title: "Festool tračna brusilica BS 75",
      description: "Profesionalna tračna brusilica za brušenje velikih površina. Širina trake 75mm. Uključen set brusnih traka.",
      category: "Električni alati",
      subCategory: "Brusilice",
      brand: "Festool",
      powerSource: "Električni (struja)",
      powerWatts: 1010,
      pricePerDay: 800,
      deposit: 5000,
      images: DEMO_IMAGES.sander,
      isFeatured: false,
    },
    {
      ownerIndex: 6,
      title: "Metabo potapajuća pumpa za prljavu vodu",
      description: "Snažna potapajuća pumpa kapaciteta 18000L/h. Idealna za ispumpavanje podruma, bazena. Može da prečisti čestice do 30mm.",
      category: "Građevinske mašine",
      subCategory: "Pumpe",
      brand: "Metabo",
      powerSource: "Električni (struja)",
      powerWatts: 1100,
      pricePerDay: 700,
      deposit: 4000,
      images: DEMO_IMAGES.washer,
      isFeatured: false,
    },
    {
      ownerIndex: 7,
      title: "Vibroploca za sabijanje zemlje 90kg",
      description: "Profesionalna vibroploca za sabijanje tla i peska. Težina 90kg, benzinski motor. Idealna za pripremu terena.",
      category: "Građevinske mašine",
      subCategory: "Vibroploci",
      brand: "Wacker Neuson",
      powerSource: "Benzinski",
      pricePerDay: 2500,
      deposit: 20000,
      images: DEMO_IMAGES.mixer,
      isFeatured: true,
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
      deposit: 6000,
      images: DEMO_IMAGES.hammer,
      isFeatured: false,
    },
    {
      ownerIndex: 8,
      title: "Einhell električna šrafciger glodalica",
      description: "Višenamenska električna alatka za glodanje drva. Uključen set glodala različitih oblika.",
      category: "Električni alati",
      subCategory: "Glodalice",
      brand: "Einhell",
      powerSource: "Električni (struja)",
      powerWatts: 1200,
      pricePerDay: 700,
      deposit: 4500,
      images: DEMO_IMAGES.saw,
      isFeatured: false,
    },
    {
      ownerIndex: 8,
      title: "Honda agregat EU 22i",
      description: "Tihi inverterski agregat snage 2.2kW. Idealan za kampovanje, gradilište ili rezervno napajanje.",
      category: "Građevinske mašine",
      subCategory: "Agregati",
      brand: "Honda",
      powerSource: "Benzinski",
      pricePerDay: 2500,
      deposit: 20000,
      images: DEMO_IMAGES.scaffold,
      isFeatured: true,
    },
    {
      ownerIndex: 9,
      title: "Rubi mašina za sečenje pločica TX-900",
      description: "Profesionalna mašina za sečenje keramičkih pločica do 90cm. Dijamantski disk i sistem vodenog hlađenja.",
      category: "Građevinske mašine",
      subCategory: "Mašine za sečenje",
      brand: "Rubi",
      powerSource: "Električni (struja)",
      powerWatts: 800,
      pricePerDay: 1200,
      deposit: 8000,
      images: DEMO_IMAGES.grinder,
      isFeatured: false,
    },
    {
      ownerIndex: 9,
      title: "Black+Decker električna kosačica",
      description: "Električna kosačica za travnjake do 400m2. Širina košenja 38cm, kanta 45L.",
      category: "Bašta",
      subCategory: "Košenje",
      brand: "Black+Decker",
      powerSource: "Električni (struja)",
      powerWatts: 1400,
      pricePerDay: 600,
      deposit: 4000,
      images: DEMO_IMAGES.mower,
      isFeatured: false,
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
