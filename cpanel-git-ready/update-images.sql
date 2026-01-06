-- SQL za azuriranje slika u MySQL bazi
-- Pokreni ovo u phpMyAdmin na cPanel-u

-- Azuriraj slike za svaki item (dodeli odgovarajuce slike po tipu alata)

-- Busilice
UPDATE items SET images = '["/demo-images/busilica_makita.png"]' 
WHERE title LIKE '%busilica%' OR title LIKE '%Busilica%' OR title LIKE '%busenje%';

-- Brusilice
UPDATE items SET images = '["/demo-images/brusilica_villager.png"]' 
WHERE title LIKE '%brusilica%' OR title LIKE '%Brusilica%';

-- Testere (cirkular, ubodna)
UPDATE items SET images = '["/demo-images/cirkular_bosch.png"]' 
WHERE title LIKE '%cirkular%' OR title LIKE '%testera%' OR title LIKE '%Cirkular%' OR title LIKE '%Testera%';

-- Mesalice
UPDATE items SET images = '["/demo-images/mesalica_beton_ingco.png"]' 
WHERE title LIKE '%mesalica%' OR title LIKE '%mešalica%' OR title LIKE '%Mesalica%';

-- Sekaci
UPDATE items SET images = '["/demo-images/sekac_husqvarna.png"]' 
WHERE title LIKE '%sekac%' OR title LIKE '%sekač%' OR title LIKE '%Sekac%';

-- Rendisalice
UPDATE items SET images = '["/demo-images/rende_makita.png"]' 
WHERE title LIKE '%rende%' OR title LIKE '%rendisalica%' OR title LIKE '%Rende%';

-- Vibratori za beton
UPDATE items SET images = '["/demo-images/vibrator_beton_raider.png"]' 
WHERE title LIKE '%vibrator%' OR title LIKE '%Vibrator%';

-- Glodalice
UPDATE items SET images = '["/demo-images/glodalica_bosch.png"]' 
WHERE title LIKE '%glodalica%' OR title LIKE '%Glodalica%';

-- Za sve ostale koji jos uvek imaju placeholder, dodeli busilicu kao default
UPDATE items SET images = '["/demo-images/busilica_makita.png"]' 
WHERE images LIKE '%placeholder%';

-- Proveri rezultat
SELECT id, title, images FROM items LIMIT 20;
