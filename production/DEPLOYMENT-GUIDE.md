# VikendMajstor - Uputstvo za Deploy na cPanel

## Preduslovi

1. **cPanel SSD Pro hosting** sa:
   - Node.js 18+ podrškom
   - MySQL 8.0+ bazom podataka
   - SSH pristupom

2. **Domenski setup**:
   - `vikendmajstor.rs` - Landing stranica
   - `app.vikendmajstor.rs` - Mobilna aplikacija (Expo web)
   - `api.vikendmajstor.rs` - Backend API

---

## Korak 1: Kreiranje MySQL baze podataka

1. Uloguj se u cPanel
2. Idi na **MySQL Databases**
3. Kreiraj novu bazu: `vikendma_vikendmajstor`
4. Kreiraj korisnika: `vikendma_admin` sa sigurnom lozinkom
5. Dodeli korisniku SVE privilegije na bazi

### Pokretanje SQL skripte

1. Idi na **phpMyAdmin** u cPanel-u
2. Izaberi `vikendma_vikendmajstor` bazu
3. Klikni na **Import** tab
4. Upload-uj `create-tables-mysql.sql` fajl
5. Klikni **Go** da izvršiš SQL

---

## Korak 2: Priprema fajlova za upload

### Na Replit-u pokreni:

```bash
# Kompiluj TypeScript u JavaScript
npm run build

# Kreiraj production folder strukturu
mkdir -p production/dist
cp -r dist/* production/dist/
cp -r server/templates production/dist/server/
cp -r server/landing production/dist/server/
cp -r server/admin production/dist/server/
cp -r static-build production/dist/
cp -r assets production/dist/
cp package.json production/
cp app.json production/
```

---

## Korak 3: Modifikacija za MySQL

Zameni PostgreSQL module sa MySQL u sledećim fajlovima:

### `dist/server/db.js` - zameni sa:
```javascript
const { drizzle } = require("drizzle-orm/mysql2");
const mysql = require("mysql2/promise");
const schema = require("../shared/schema-mysql");

const pool = mysql.createPool(process.env.DATABASE_URL);
const db = drizzle(pool, { schema, mode: "default" });

module.exports = { pool, db };
```

### Ili jednostavnije - kopiraj već pripremljene MySQL fajlove:
- `shared/schema-mysql.ts` → kompajliraj i koristi
- `server/db-mysql.ts` → kompajliraj i koristi
- `server/storage-mysql.ts` → kompajliraj i koristi

---

## Korak 4: Environment Variables

U cPanel-u, kreiraj `.env` fajl u root-u aplikacije:

```env
# Database
DATABASE_URL=mysql://vikendma_admin:LOZINKA@localhost:3306/vikendma_vikendmajstor

# Session
SESSION_SECRET=tvoj-veoma-dug-i-siguran-session-secret-minimum-32-karaktera

# Email (SMTP)
SMTP_HOST=mail.vikendmajstor.rs
SMTP_PORT=465
SMTP_USER=info@vikendmajstor.rs
SMTP_PASSWORD=tvoja-smtp-lozinka

# Object Storage (opciono - za slike)
# Ako koristiš Replit Object Storage, nastavi da koristiš njihov URL
# Ili konfiguriši lokalno skladištenje

# Production
NODE_ENV=production
PORT=5000
```

---

## Korak 5: Upload fajlova na server

### Opcija A: Preko cPanel File Manager

1. Idi na **File Manager**
2. Navigiraj do `/home/vikendma/vikendmajstor/`
3. Upload-uj sve fajlove iz `production/` foldera

### Opcija B: Preko SSH (preporučeno)

```bash
# Konektuj se na server
ssh vikendma@vikendmajstor.rs

# Idi u folder aplikacije
cd /home/vikendma/vikendmajstor

# Upload fajlove koristeći SCP sa lokalnog računara:
scp -r production/* vikendma@vikendmajstor.rs:/home/vikendma/vikendmajstor/
```

---

## Korak 6: Instalacija dependencija

Preko SSH:

```bash
cd /home/vikendma/vikendmajstor

# Instaliraj production dependencije
npm install --production

# Instaliraj dodatne MySQL dependencije ako nisu uključene
npm install mysql2
```

---

## Korak 7: Konfiguracija Node.js aplikacije u cPanel

1. Idi na **Setup Node.js App** u cPanel-u
2. Kreiraj novu aplikaciju:
   - **Node.js version**: 18.x ili novije
   - **Application mode**: Production
   - **Application root**: `/home/vikendma/vikendmajstor`
   - **Application URL**: `api.vikendmajstor.rs`
   - **Application startup file**: `dist/server/index.js`

3. Klikni **Create**

4. Dodaj environment varijable klikom na **Edit** pored aplikacije

---

## Korak 8: Testiranje

1. Otvori `https://api.vikendmajstor.rs/` - trebalo bi da vidiš landing stranicu
2. Otvori `https://api.vikendmajstor.rs/admin` - admin panel
3. Testiraj API: `https://api.vikendmajstor.rs/api/items`

---

## Korak 9: Ažuriranje mobilne aplikacije

U `client/lib/query-client.ts`, osiguraj da production domen ukazuje na API:

```typescript
export function getApiUrl(): string {
  // Za production
  if (process.env.EXPO_PUBLIC_DOMAIN === 'vikendmajstor.rs') {
    return 'https://api.vikendmajstor.rs';
  }
  // ... ostatak koda
}
```

Zatim rebuild mobilnu aplikaciju sa novim domenom.

---

## Troubleshooting

### "Cannot find module" greška
- Proveri da li su sve dependencije instalirane: `npm install`
- Proveri putanje u import statement-ima

### Database connection greška
- Proveri DATABASE_URL format: `mysql://user:pass@host:port/database`
- Proveri da li MySQL user ima sve privilegije

### 502 Bad Gateway
- Proveri da li Node.js aplikacija radi: `pm2 status` ili restart u cPanel
- Proveri logove: `tail -f /home/vikendma/logs/error.log`

### Email ne stiže
- Proveri SMTP kredencijale
- Proveri SPF/DKIM rekorde za domen

---

## Održavanje

### Restart aplikacije
U cPanel Setup Node.js App, klikni **Restart**

### Pregled logova
```bash
tail -f /home/vikendma/logs/vikendmajstor.log
```

### Backup baze
U cPanel, idi na **Backup** > **Download a MySQL Database Backup**

---

## Admin pristup

- **URL**: `https://api.vikendmajstor.rs/admin`
- **Email**: `admin@vikendmajstor.rs`
- **Lozinka**: `Caralazara13`

> ⚠️ OBAVEZNO promeni lozinku nakon prvog logovanja!
