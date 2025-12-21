#!/bin/bash
# VikendMajstor - Build script za cPanel deployment
# Pokreni ovaj script na Replit-u pre exporta

set -e

echo "=== VikendMajstor Production Build ==="
echo ""

# Kreiraj production folder
echo "[1/6] Kreiram production folder strukturu..."
rm -rf production/dist
mkdir -p production/dist/server
mkdir -p production/dist/shared

# Kompajliraj TypeScript za MySQL verziju
echo "[2/6] Kompajliram TypeScript (MySQL verzija)..."

# Kopiraj i kompajliraj schema-mysql
cp shared/schema-mysql.ts production/dist/shared/schema.ts

# Kopiraj server fajlove za MySQL
echo "[3/6] Kopiram server fajlove..."
cp -r server/templates production/dist/server/
cp -r server/landing production/dist/server/
cp -r server/admin production/dist/server/

# Kopiraj static build i assets
echo "[4/6] Kopiram static assets..."
if [ -d "static-build" ]; then
  cp -r static-build production/dist/
fi
if [ -d "assets" ]; then
  cp -r assets production/dist/
fi

# Kopiraj package.json sa MySQL dependencijama
echo "[5/6] Kreiram production package.json..."
cat > production/package.json << 'EOF'
{
  "name": "vikendmajstor-api",
  "version": "1.0.0",
  "description": "VikendMajstor P2P Tool Rental Platform API",
  "main": "dist/server/index.js",
  "scripts": {
    "start": "node dist/server/index.js"
  },
  "dependencies": {
    "drizzle-orm": "^0.38.3",
    "drizzle-zod": "^0.5.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "express-session": "^1.17.3",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "jose": "^5.2.0",
    "mysql2": "^3.9.0",
    "nodemailer": "^6.9.8",
    "resend": "^2.1.0",
    "zod": "^3.22.4",
    "zod-validation-error": "^2.1.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Kopiraj app.json
echo "[6/6] Kopiram app.json..."
cp app.json production/

echo ""
echo "=== Build završen! ==="
echo ""
echo "Sledeći koraci:"
echo "1. Upload production/ folder na cPanel"
echo "2. Pokreni SQL skriptu (production/create-tables-mysql.sql)"
echo "3. Konfiguriši environment varijable"
echo "4. Pokreni Node.js aplikaciju"
echo ""
echo "Za detaljna uputstva pogledaj: production/DEPLOYMENT-GUIDE.md"
