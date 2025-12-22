import { db } from "./db";
import { users, items } from "../shared/schema";
import { eq, like } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { objectStorageClient } from "./objectStorage";
import { setObjectAclPolicy } from "./objectAcl";
import { getCityCoordinates } from "../shared/cityCoordinates";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${derivedKey.toString("hex")}.${salt}`;
}

const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;

async function uploadImage(localPath: string, remoteName: string): Promise<string> {
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
    
    const contentType = remoteName.endsWith('.png') ? 'image/png' : 'image/jpeg';
    await file.save(fileBuffer, {
      contentType,
      resumable: false,
    });
    
    await setObjectAclPolicy(file, {
      owner: "system",
      visibility: "public",
    });
    
    return `/public-objects/items/${remoteName}`;
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error);
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(remoteName)}`;
  }
}

const DEMO_EMAIL_SUFFIX = "@demo.vikendmajstor.rs";

export async function seedDemoData(): Promise<{ users: number; items: number }> {
  console.log("[SEED] Starting demo data seed...");
  
  const imageFiles = [
    { local: "attached_assets/generated_images/cordless_power_drill_product_shot.png", remote: "demo-drill-1.png" },
    { local: "attached_assets/generated_images/rotary_hammer_drill_photo.png", remote: "demo-drill-2.png" },
    { local: "attached_assets/generated_images/angle_grinder_product_photo.png", remote: "demo-grinder-1.png" },
    { local: "attached_assets/generated_images/impact_driver_product_photo.png", remote: "demo-grinder-2.png" },
    { local: "attached_assets/generated_images/circular_saw_tool_product_photo.png", remote: "demo-saw-1.png" },
    { local: "attached_assets/generated_images/table_saw_product_photo.png", remote: "demo-saw-2.png" },
    { local: "attached_assets/generated_images/concrete_mixer_product_photo.png", remote: "demo-mixer-1.png" },
    { local: "attached_assets/generated_images/air_compressor_product_photo.png", remote: "demo-mixer-2.png" },
    { local: "attached_assets/generated_images/pressure_washer_product_photo.png", remote: "demo-washer-1.png" },
    { local: "attached_assets/generated_images/leaf_blower_product_photo.png", remote: "demo-washer-2.png" },
    { local: "attached_assets/generated_images/lawn_mower_product_photo.png", remote: "demo-mower-1.png" },
    { local: "attached_assets/generated_images/hedge_trimmer_product_photo.png", remote: "demo-mower-2.png" },
    { local: "attached_assets/generated_images/electric_sander_product_photo.png", remote: "demo-sander-1.png" },
    { local: "attached_assets/generated_images/jigsaw_power_tool_photo.png", remote: "demo-sander-2.png" },
    { local: "attached_assets/generated_images/rotary_hammer_drill_photo.png", remote: "demo-hammer-1.png" },
    { local: "attached_assets/generated_images/welding_machine_product_photo.png", remote: "demo-hammer-2.png" },
    { local: "attached_assets/generated_images/electric_chainsaw_product_photo.png", remote: "demo-chainsaw-1.png" },
    { local: "attached_assets/generated_images/tile_cutter_product_photo.png", remote: "demo-chainsaw-2.png" },
    { local: "attached_assets/generated_images/extension_ladder_product_photo.png", remote: "demo-scaffold-1.png" },
    { local: "attached_assets/generated_images/portable_generator_product_photo.png", remote: "demo-scaffold-2.png" },
  ];
  
  console.log("[SEED] Uploading images...");
  const imageUrls: string[] = [];
  for (const img of imageFiles) {
    const url = await uploadImage(img.local, img.remote);
    imageUrls.push(url);
  }
  console.log(`[SEED] Uploaded ${imageUrls.length} images`);
  
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
      images: [imageUrls[0], imageUrls[1]],
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
      images: [imageUrls[2], imageUrls[3]],
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
      images: [imageUrls[4], imageUrls[5]],
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
      images: [imageUrls[6], imageUrls[7]],
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
      images: [imageUrls[8], imageUrls[9]],
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
      images: [imageUrls[10], imageUrls[11]],
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
      images: [imageUrls[12], imageUrls[13]],
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
      images: [imageUrls[14], imageUrls[15]],
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
      images: [imageUrls[16], imageUrls[17]],
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
      images: [imageUrls[18], imageUrls[19]],
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
      images: [imageUrls[0], imageUrls[1]],
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
      images: [imageUrls[12], imageUrls[13]],
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
      images: [imageUrls[8], imageUrls[9]],
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
      images: [imageUrls[6], imageUrls[7]],
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
      images: [imageUrls[14], imageUrls[15]],
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
      images: [imageUrls[4], imageUrls[5]],
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
      images: [imageUrls[18], imageUrls[19]],
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
      images: [imageUrls[2], imageUrls[3]],
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
      images: [imageUrls[10], imageUrls[11]],
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
  
  const demoUsersList = await db.select().from(users).where(like(users.email, `%${DEMO_EMAIL_SUFFIX}`));
  
  let itemsDeleted = 0;
  let usersDeleted = 0;
  
  for (const user of demoUsersList) {
    const deletedItems = await db.delete(items).where(eq(items.ownerId, user.id)).returning();
    itemsDeleted += deletedItems.length;
    
    await db.delete(users).where(eq(users.id, user.id));
    usersDeleted++;
    console.log(`[SEED] Deleted demo user: ${user.name} and ${deletedItems.length} items`);
  }
  
  console.log(`[SEED] Demo data deletion complete: ${usersDeleted} users, ${itemsDeleted} items`);
  return { users: usersDeleted, items: itemsDeleted };
}

export async function getDemoDataStats(): Promise<{ users: number; items: number }> {
  const demoUsersList = await db.select().from(users).where(like(users.email, `%${DEMO_EMAIL_SUFFIX}`));
  
  let totalItems = 0;
  for (const user of demoUsersList) {
    const userItems = await db.select().from(items).where(eq(items.ownerId, user.id));
    totalItems += userItems.length;
  }
  
  return { users: demoUsersList.length, items: totalItems };
}
