import { db } from "./db";
import { users, items } from "../shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { objectStorageClient } from "./objectStorage";
import { setObjectAclPolicy } from "./objectAcl";

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

async function seed() {
  console.log("Starting seed...");
  
  const imageFiles = [
    { local: "attached_assets/generated_images/cordless_power_drill.png", remote: "cordless-power-drill.png" },
    { local: "attached_assets/generated_images/angle_grinder_tool.png", remote: "angle-grinder.png" },
    { local: "attached_assets/generated_images/circular_saw_tool.png", remote: "circular-saw.png" },
    { local: "attached_assets/generated_images/pressure_washer_machine.png", remote: "pressure-washer.png" },
    { local: "attached_assets/generated_images/concrete_mixer_machine.png", remote: "concrete-mixer.png" },
    { local: "attached_assets/generated_images/gasoline_chainsaw.png", remote: "chainsaw.png" },
    { local: "attached_assets/generated_images/electric_orbital_sander.png", remote: "orbital-sander.png" },
    { local: "attached_assets/generated_images/portable_power_generator.png", remote: "generator.png" },
    { local: "attached_assets/generated_images/rotary_hammer_drill.png", remote: "rotary-hammer.png" },
    { local: "attached_assets/generated_images/tile_cutter_machine.png", remote: "tile-cutter.png" },
  ];
  
  console.log("Uploading images...");
  const imageUrls: string[] = [];
  for (const img of imageFiles) {
    const url = await uploadImage(img.local, img.remote);
    imageUrls.push(url);
    console.log(`Uploaded: ${img.remote}`);
  }
  
  console.log("Creating users...");
  const hashedPassword = await hashPassword("demo123");
  
  const demoUsers = [
    { 
      email: "marko@demo.com", 
      name: "Marko Petrović", 
      phone: "+381641234567",
      city: "Beograd",
      district: "Novi Beograd",
      role: "owner" as const,
      rating: "4.8",
      totalRatings: 12,
      subscriptionType: "premium" as const,
    },
    { 
      email: "jelena@demo.com", 
      name: "Jelena Nikolić", 
      phone: "+381642345678",
      city: "Novi Sad",
      district: "Liman",
      role: "owner" as const,
      rating: "4.5",
      totalRatings: 8,
      subscriptionType: "basic" as const,
    },
    { 
      email: "stefan@demo.com", 
      name: "Stefan Jovanović", 
      phone: "+381643456789",
      city: "Niš",
      district: "Centar",
      role: "owner" as const,
      rating: "4.9",
      totalRatings: 15,
      subscriptionType: "premium" as const,
    },
    { 
      email: "ana@demo.com", 
      name: "Ana Đorđević", 
      phone: "+381644567890",
      city: "Kragujevac",
      district: "Aerodrom",
      role: "owner" as const,
      rating: "4.2",
      totalRatings: 5,
      subscriptionType: "free" as const,
    },
    { 
      email: "nikola@demo.com", 
      name: "Nikola Stojanović", 
      phone: "+381645678901",
      city: "Subotica",
      district: "Centar",
      role: "owner" as const,
      rating: "4.7",
      totalRatings: 10,
      subscriptionType: "basic" as const,
    },
  ];
  
  const createdUsers: { id: string; city: string; district: string }[] = [];
  
  for (const userData of demoUsers) {
    const subscriptionEndDate = userData.subscriptionType !== 'free' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null;
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
    
    if (existingUser.length > 0) {
      const user = existingUser[0];
      createdUsers.push({ id: user.id, city: userData.city, district: userData.district || "" });
      console.log(`Using existing user: ${userData.name}`);
    } else {
      const [user] = await db.insert(users).values({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone,
        city: userData.city,
        district: userData.district,
        role: userData.role,
        rating: userData.rating,
        totalRatings: userData.totalRatings,
        subscriptionType: userData.subscriptionType,
        subscriptionEndDate,
      }).returning();
      
      createdUsers.push({ id: user.id, city: userData.city, district: userData.district || "" });
      console.log(`Created user: ${userData.name}`);
    }
  }
  
  console.log("Creating items...");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  // imageUrls mapping:
  // 0: cordless power drill, 1: angle grinder, 2: circular saw, 3: pressure washer
  // 4: concrete mixer, 5: chainsaw, 6: orbital sander, 7: generator, 8: rotary hammer, 9: tile cutter
  
  const demoItems = [
    {
      ownerIndex: 0,
      title: "Bosch profesionalna bušilica GSB 18V",
      description: "Profesionalna akumulatorska bušilica Bosch sa dva akumulatora. Idealna za bušenje u betonu, drvu i metalu. Uključena torba za nošenje i set burgija.",
      category: "Električni alati",
      subCategory: "Bušilice",
      toolType: "Akumulatorska bušilica",
      brand: "Bosch",
      powerSource: "Akumulator",
      powerWatts: 650,
      pricePerDay: 800,
      deposit: 5000,
      images: [imageUrls[0]], // cordless power drill
      rating: "4.8",
      totalRatings: 6,
      isFeatured: true,
    },
    {
      ownerIndex: 0,
      title: "Makita kružna testera 190mm",
      description: "Snažna električna kružna testera za precizno sečenje drva. Dubina reza do 66mm. Laser za precizno vođenje.",
      category: "Električni alati",
      subCategory: "Testere",
      toolType: "Kružna testera",
      brand: "Makita",
      powerSource: "Struja",
      powerWatts: 1800,
      pricePerDay: 1200,
      deposit: 8000,
      images: [imageUrls[2]], // circular saw
      rating: "4.9",
      totalRatings: 8,
      isFeatured: false,
    },
    {
      ownerIndex: 1,
      title: "Kärcher perač pod pritiskom K5",
      description: "Profesionalni perač pod pritiskom za čišćenje dvorišta, automobila, fasada. Pritisak do 145 bara. Uključeno crevo od 8m.",
      category: "Oprema za čišćenje",
      subCategory: "Perači pod pritiskom",
      brand: "Kärcher",
      powerSource: "Struja",
      powerWatts: 2100,
      pricePerDay: 1500,
      deposit: 10000,
      images: [imageUrls[3]], // pressure washer
      rating: "4.6",
      totalRatings: 4,
      isFeatured: false,
    },
    {
      ownerIndex: 1,
      title: "Stihl benzinska lančana testera MS 250",
      description: "Profesionalna benzinska lančana testera za sečenje drveća i ogreva. Dužina mača 40cm. Automatsko podmazivanje lanca.",
      category: "Baštenski alati",
      subCategory: "Lančane testere",
      brand: "Stihl",
      powerSource: "Benzin",
      pricePerDay: 1800,
      deposit: 12000,
      images: [imageUrls[5]], // chainsaw
      rating: "4.5",
      totalRatings: 3,
      isFeatured: true,
    },
    {
      ownerIndex: 2,
      title: "DeWalt ugaona brusilica 230mm",
      description: "Profesionalna ugaona brusilica za sečenje i brušenje metala i kamena. Snaga 2200W. Uključeni zaštitni poklopac i ručka.",
      category: "Električni alati",
      subCategory: "Brusilice",
      toolType: "Ugaona brusilica",
      brand: "DeWalt",
      powerSource: "Struja",
      powerWatts: 2200,
      pricePerDay: 900,
      deposit: 6000,
      images: [imageUrls[1]], // angle grinder
      rating: "4.9",
      totalRatings: 7,
      isFeatured: false,
    },
    {
      ownerIndex: 2,
      title: "Hilti TE 7-C SDS-Plus čekić bušilica",
      description: "Profesionalni čekić za bušenje u betonu i zidariji. Energija udara 2.6J. Uključen kofer sa setom burgija.",
      category: "Električni alati",
      subCategory: "Čekić bušilice",
      brand: "Hilti",
      powerSource: "Struja",
      powerWatts: 800,
      pricePerDay: 1100,
      deposit: 8000,
      images: [imageUrls[8]], // rotary hammer
      rating: "4.7",
      totalRatings: 5,
      isFeatured: false,
    },
    {
      ownerIndex: 3,
      title: "Betonijer mešalica 160L",
      description: "Električna mešalica za beton kapaciteta 160 litara. Idealna za manje građevinske radove. Točkovi za lako premeštanje.",
      category: "Građevinska oprema",
      subCategory: "Betonijeri",
      brand: "Lescha",
      powerSource: "Struja",
      powerWatts: 650,
      pricePerDay: 1500,
      deposit: 10000,
      images: [imageUrls[4]], // concrete mixer
      rating: "4.3",
      totalRatings: 2,
      isFeatured: false,
    },
    {
      ownerIndex: 3,
      title: "Bosch orbitalna brusilica GEX 125",
      description: "Profesionalna orbitalna brusilica za finu obradu drveta. Prečnik ploče 125mm. Priključak za usisavanje prašine.",
      category: "Električni alati",
      subCategory: "Brusilice",
      toolType: "Orbitalna brusilica",
      brand: "Bosch",
      powerSource: "Struja",
      powerWatts: 350,
      pricePerDay: 600,
      deposit: 4000,
      images: [imageUrls[6]], // orbital sander
      rating: "4.4",
      totalRatings: 3,
      isFeatured: false,
    },
    {
      ownerIndex: 4,
      title: "Honda agregat EU 22i",
      description: "Tihi inverterski agregat snage 2.2kW. Idealan za kampovanje, gradilište ili rezervno napajanje. Potrošnja samo 1L/h.",
      category: "Građevinska oprema",
      subCategory: "Agregati",
      brand: "Honda",
      powerSource: "Benzin",
      pricePerDay: 2500,
      deposit: 20000,
      images: [imageUrls[7]], // generator
      rating: "4.6",
      totalRatings: 4,
      isFeatured: false,
    },
    {
      ownerIndex: 4,
      title: "Rubi mašina za sečenje pločica",
      description: "Profesionalna mašina za sečenje keramičkih pločica do 60cm. Dijamantski disk i sistem vodenog hlađenja.",
      category: "Građevinska oprema",
      subCategory: "Mašine za sečenje",
      toolType: "Mašina za pločice",
      brand: "Rubi",
      powerSource: "Struja",
      powerWatts: 800,
      pricePerDay: 1200,
      deposit: 8000,
      images: [imageUrls[9]], // tile cutter
      rating: "4.8",
      totalRatings: 6,
      isFeatured: false,
    },
  ];
  
  for (const itemData of demoItems) {
    const owner = createdUsers[itemData.ownerIndex];
    
    await db.insert(items).values({
      ownerId: owner.id,
      title: itemData.title,
      description: itemData.description,
      category: itemData.category,
      subCategory: itemData.subCategory || null,
      toolType: itemData.toolType || null,
      brand: itemData.brand || null,
      powerSource: itemData.powerSource || null,
      powerWatts: itemData.powerWatts || null,
      pricePerDay: itemData.pricePerDay,
      deposit: itemData.deposit,
      city: owner.city,
      district: owner.district,
      images: itemData.images,
      rating: itemData.rating,
      totalRatings: itemData.totalRatings,
      isFeatured: itemData.isFeatured,
      isAvailable: true,
      expiresAt,
    });
    
    console.log(`Created item: ${itemData.title}`);
  }
  
  console.log("\nSeed completed successfully!");
  console.log(`Created ${demoUsers.length} users`);
  console.log(`Created ${demoItems.length} items`);
  console.log("\nDemo login credentials:");
  console.log("Email: marko@demo.com (Premium)");
  console.log("Email: jelena@demo.com (Standard)");
  console.log("Email: stefan@demo.com (Premium)");
  console.log("Email: ana@demo.com (Free)");
  console.log("Email: nikola@demo.com (Standard)");
  console.log("Password for all: demo123");
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
