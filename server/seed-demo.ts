import { db } from "./db";
import { users, items } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { objectStorageClient } from "./objectStorage";

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
    
    await file.save(fileBuffer, {
      contentType: 'image/jpeg',
      resumable: false,
    });
    
    return `https://storage.googleapis.com/${bucketId}/${destination}`;
  } catch (error) {
    console.error(`Error uploading ${localPath}:`, error);
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(remoteName)}`;
  }
}

async function seed() {
  console.log("Starting seed...");
  
  const imageFiles = [
    { local: "attached_assets/stock_images/power_drill_tool_con_6e5bd958.jpg", remote: "drill-1.jpg" },
    { local: "attached_assets/stock_images/power_drill_tool_con_9805d62e.jpg", remote: "drill-2.jpg" },
    { local: "attached_assets/stock_images/electric_circular_sa_6755b2fd.jpg", remote: "circular-saw-1.jpg" },
    { local: "attached_assets/stock_images/electric_circular_sa_16027191.jpg", remote: "circular-saw-2.jpg" },
    { local: "attached_assets/stock_images/pressure_washer_clea_fbdfbb21.jpg", remote: "pressure-washer-1.jpg" },
    { local: "attached_assets/stock_images/pressure_washer_clea_fb9ad42a.jpg", remote: "pressure-washer-2.jpg" },
    { local: "attached_assets/stock_images/lawn_mower_garden_eq_bf9c4527.jpg", remote: "lawn-mower-1.jpg" },
    { local: "attached_assets/stock_images/lawn_mower_garden_eq_2af14b5e.jpg", remote: "lawn-mower-2.jpg" },
    { local: "attached_assets/stock_images/angle_grinder_power__8dc7c250.jpg", remote: "angle-grinder-1.jpg" },
    { local: "attached_assets/stock_images/angle_grinder_power__60352035.jpg", remote: "angle-grinder-2.jpg" },
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
  
  console.log("Creating items...");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
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
      images: [imageUrls[0], imageUrls[1]],
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
      images: [imageUrls[2], imageUrls[3]],
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
      images: [imageUrls[4], imageUrls[5]],
      rating: "4.6",
      totalRatings: 4,
      isFeatured: false,
    },
    {
      ownerIndex: 1,
      title: "Honda benzinska kosilica HRX 476",
      description: "Samohodna benzinska kosilica sa mulčiranjem. Širina košenja 47cm. Idealna za veće travnjake do 1000m2.",
      category: "Baštenski alati",
      subCategory: "Kosilice",
      toolType: "Benzinska kosilica",
      brand: "Honda",
      powerSource: "Benzin",
      pricePerDay: 2000,
      deposit: 15000,
      images: [imageUrls[6], imageUrls[7]],
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
      images: [imageUrls[8], imageUrls[9]],
      rating: "4.9",
      totalRatings: 7,
      isFeatured: false,
    },
    {
      ownerIndex: 2,
      title: "Bosch udarni odvijač GDR 18V",
      description: "Kompaktni akumulatorski udarni odvijač. Moment zatezanja 180Nm. Dva akumulatora u kompletu.",
      category: "Električni alati",
      subCategory: "Odvijači",
      toolType: "Udarni odvijač",
      brand: "Bosch",
      powerSource: "Akumulator",
      pricePerDay: 700,
      deposit: 4000,
      images: [imageUrls[0]],
      rating: "4.7",
      totalRatings: 5,
      isFeatured: false,
    },
    {
      ownerIndex: 3,
      title: "Stihl električna lančana testera",
      description: "Električna lančana testera za orezivanje drveća i sečenje ogreva. Dužina mača 35cm. Automatsko podmazivanje lanca.",
      category: "Baštenski alati",
      subCategory: "Lančane testere",
      brand: "Stihl",
      powerSource: "Struja",
      powerWatts: 1800,
      pricePerDay: 1000,
      deposit: 7000,
      images: [imageUrls[2]],
      rating: "4.3",
      totalRatings: 2,
      isFeatured: false,
    },
    {
      ownerIndex: 3,
      title: "Hilti SDS-Plus čekić bušilica",
      description: "Profesionalni čekić za bušenje u betonu i zidariji. Energija udara 2.6J. Uključen kofer sa setom burgija.",
      category: "Električni alati",
      subCategory: "Čekić bušilice",
      brand: "Hilti",
      powerSource: "Struja",
      powerWatts: 800,
      pricePerDay: 1100,
      deposit: 8000,
      images: [imageUrls[1]],
      rating: "4.4",
      totalRatings: 3,
      isFeatured: false,
    },
    {
      ownerIndex: 4,
      title: "Husqvarna električni trimer za travu",
      description: "Lagan električni trimer za održavanje ivica travnjaka. Širina košenja 35cm. Automatsko odmotavanje najlona.",
      category: "Baštenski alati",
      subCategory: "Trimeri",
      brand: "Husqvarna",
      powerSource: "Struja",
      powerWatts: 900,
      pricePerDay: 600,
      deposit: 3000,
      images: [imageUrls[7]],
      rating: "4.6",
      totalRatings: 4,
      isFeatured: false,
    },
    {
      ownerIndex: 4,
      title: "Metabo vibraciona brusilica",
      description: "Precizna vibraciona brusilica za finu obradu drveta. Elektronska regulacija broja okretaja. Priključak za usisavanje prašine.",
      category: "Električni alati",
      subCategory: "Brusilice",
      toolType: "Vibraciona brusilica",
      brand: "Metabo",
      powerSource: "Struja",
      powerWatts: 300,
      pricePerDay: 500,
      deposit: 3000,
      images: [imageUrls[9]],
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
