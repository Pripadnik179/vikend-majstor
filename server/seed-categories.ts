import { db } from "./db";
import { categories, subcategories, PREDEFINED_CATEGORIES } from "../shared/schema";
import { eq } from "drizzle-orm";

export async function seedCategories() {
  console.log("[SEED] Starting category seeding...");

  let sortOrder = 0;
  for (const [key, cat] of Object.entries(PREDEFINED_CATEGORIES)) {
    const existingCat = await db.select().from(categories).where(eq(categories.slug, cat.slug)).limit(1);
    
    let categoryId: string;
    if (existingCat.length === 0) {
      const [newCat] = await db.insert(categories).values({
        name: cat.name,
        slug: cat.slug,
        sortOrder: sortOrder++,
        isActive: true,
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
      const existingSub = await db.select().from(subcategories)
        .where(eq(subcategories.categoryId, categoryId))
        .limit(100);
      
      const found = existingSub.find(s => s.slug === fullSlug || s.name === sub.name);
      if (!found) {
        await db.insert(subcategories).values({
          categoryId,
          name: sub.name,
          slug: fullSlug,
          sortOrder: subSortOrder++,
          isActive: true,
        });
        console.log(`[SEED]   Created subcategory: ${sub.name}`);
      }
    }
  }

  console.log("[SEED] Category seeding complete!");
}

export async function migrateItemsToNewCategories() {
  console.log("[MIGRATE] Starting item migration to new category structure...");

  const categoryMapping: Record<string, string> = {
    "Električni alati": "elektricni-alati",
    "Akumulatorski alati": "akumulatorski-alati",
    "Ručni alati": "rucni-alati",
    "Baštenski alati": "bastenski-alati",
    "Građevinska oprema": "masine-beton-teski-radovi",
    "Oprema za čišćenje": "oprema-za-ciscenje",
    "Auto-mehanika": "auto-servis",
    "Merni/laserski": "merni-alati-oprema",
  };

  const subcategoryMapping: Record<string, string> = {
    "Bušilice": "busilice",
    "Brusilice": "brusilice",
    "Testere": "testere",
    "Čekić bušilice": "stemaci-cekic-busilice",
    "Betonijeri": "betonijeri",
    "Agregati": "agregati",
    "Mašine za sečenje": "masine-za-secenje",
    "Perači pod pritiskom": "peraci-pod-pritiskom",
    "Lančane testere": "lancane-testere",
    "Kosilice": "kosilice",
    "Trimeri": "trimeri",
  };

  const allCategories = await db.select().from(categories);
  const allSubcategories = await db.select().from(subcategories);

  const { items } = await import("../shared/schema");
  const allItems = await db.select().from(items);

  for (const item of allItems) {
    if (item.categoryId) continue;

    const catSlug = categoryMapping[item.category] || "ostalo-specijalni-alati";
    const matchedCat = allCategories.find(c => c.slug === catSlug);
    
    if (!matchedCat) {
      console.log(`[MIGRATE] No category match for: ${item.category}`);
      continue;
    }

    let matchedSub = null;
    if (item.subCategory) {
      const subSlug = subcategoryMapping[item.subCategory];
      if (subSlug) {
        matchedSub = allSubcategories.find(s => 
          s.categoryId === matchedCat.id && s.slug.includes(subSlug)
        );
      }
    }

    if (!matchedSub) {
      matchedSub = allSubcategories.find(s => 
        s.categoryId === matchedCat.id && s.slug.endsWith("-ostalo")
      );
    }

    await db.update(items).set({
      categoryId: matchedCat.id,
      subcategoryId: matchedSub?.id || null,
    }).where(eq(items.id, item.id));

    console.log(`[MIGRATE] Updated item ${item.title} -> ${matchedCat.name} / ${matchedSub?.name || 'N/A'}`);
  }

  console.log("[MIGRATE] Item migration complete!");
}
