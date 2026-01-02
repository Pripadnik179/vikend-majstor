# Checklist za P2P Rental Aplikaciju

Koristite ovu listu za proveru da li druga aplikacija ima sve potrebne komponente.

---

## 1. LANDING STRANICA

### Hero Sekcija
- [ ] Glavni naslov (headline)
- [ ] Podnaslov sa opisom vrednosti
- [ ] CTA dugmad (minimalno 2 - za vlasnike i korisnike)
- [ ] Pozadinska slika ili gradient
- [ ] Responzivan dizajn (mobilni i desktop)

### Social Proof
- [ ] Statistika: Broj korisnika (npr. "500+ korisnika")
- [ ] Statistika: Broj proizvoda (npr. "2000+ alata")
- [ ] Statistika: Prosecni rejting (npr. "4.8 prosecna ocena")
- [ ] Ikone uz statistike

### Feature Preview
- [ ] Horizontalni scroll sa proizvodima
- [ ] Proizvodi se ucitavaju iz baze (ne mock data)
- [ ] Prikaz slike, naslova, cene
- [ ] Link ka detaljima proizvoda

### Testimonials Carousel
- [ ] Rotirajuce recenzije korisnika
- [ ] Ime i uloga korisnika (vlasnik/korisnik)
- [ ] Rejting sa zvezdicama
- [ ] Paginacija (tackice ili strelice)
- [ ] Auto-rotate ili manual navigation

### Trust Badges
- [ ] Bezbednosna poruka #1 (npr. "Enkripcija podataka")
- [ ] Bezbednosna poruka #2 (npr. "Email verifikacija")
- [ ] Bezbednosna poruka #3 (npr. "0% provizije")
- [ ] Ikone uz poruke

### Sticky CTA (Mobile)
- [ ] Sticky footer na mobilnom
- [ ] Blur efekat pozadine
- [ ] CTA dugme za registraciju
- [ ] Sakriva se na scroll gore (opciono)

### Dual-Path UX
- [ ] Odvojen tok za vlasnike proizvoda
- [ ] Odvojen tok za korisnike/rentere
- [ ] Jasna navigacija izmedju tokova

---

## 2. AUTENTIFIKACIJA

### Email/Password
- [ ] Registracija sa minimalnim poljima (email + lozinka)
- [ ] Login forma
- [ ] "Zaboravljena lozinka" funkcionalnost
- [ ] Validacija email formata
- [ ] Validacija jacine lozinke

### Email Verifikacija
- [ ] Slanje verifikacionog emaila nakon registracije
- [ ] Verifikacioni link sa tokenom
- [ ] Stranica za potvrdu verifikacije
- [ ] Resend verification opcija
- [ ] SMTP konfiguracija (SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PORT)

### Google OAuth
- [ ] "Nastavi sa Google" dugme
- [ ] Web implementacija
- [ ] Mobilna implementacija (Expo AuthSession)
- [ ] Google Cloud Console konfiguracija
- [ ] Redirect URI podesavanje

### Apple Sign-In
- [ ] "Nastavi sa Apple" dugme (iOS only)
- [ ] expo-apple-authentication integracija
- [ ] Fallback za non-iOS platforme

### Guest Browsing
- [ ] Pregledanje proizvoda bez registracije
- [ ] Ogranicene akcije za goste
- [ ] Prompt za registraciju kod akcija

### Bezbednost Auth
- [ ] Rate limiting na login endpoint
- [ ] IP blokiranje nakon X neuspelih pokusaja
- [ ] Secure session cookies
- [ ] Token-based auth za mobilnu aplikaciju
- [ ] Logout funkcionalnost

---

## 3. ADMIN PANEL (/admin)

### Pristup
- [ ] Ruta /admin dostupna
- [ ] Provera isAdmin=true za pristup
- [ ] Redirect za non-admin korisnike
- [ ] Standalone verzija za admin subdomen (opciono)

### Dashboard
- [ ] Ukupan broj korisnika
- [ ] Ukupan broj proizvoda
- [ ] Broj aktivnih oglasa
- [ ] Broj pending moderation
- [ ] Grafici aktivnosti (opciono)
- [ ] Real-time statistike

### User Management
- [ ] Lista svih korisnika
- [ ] Pretraga korisnika
- [ ] Filtriranje (po statusu, roli, datumu)
- [ ] Suspend/Activate korisnika
- [ ] Bulk akcije (suspend vise korisnika)
- [ ] Istorija aktivnosti korisnika
- [ ] Pregled detalja korisnika

### Item Moderation
- [ ] Lista svih proizvoda
- [ ] Filtriranje po statusu (pending/approved/rejected)
- [ ] Approve proizvod
- [ ] Reject proizvod (sa razlogom)
- [ ] Delete proizvod
- [ ] Bulk operacije
- [ ] Pregled detalja proizvoda

### Reported Items
- [ ] Lista prijavljenih proizvoda
- [ ] Razlog prijave
- [ ] Ko je prijavio
- [ ] Resolution akcije (dismiss, warn, remove)
- [ ] Istorija resenja

### Messages Monitoring
- [ ] Pregled konverzacija
- [ ] Pretraga poruka
- [ ] Filtriranje po korisniku
- [ ] Read-only pristup

### Analytics
- [ ] Conversion funnel (poseta -> registracija -> oglas -> transakcija)
- [ ] Popularne kategorije
- [ ] Aktivni gradovi
- [ ] Trend registracija
- [ ] Revenue metrike (ako ima placanja)

### Admin Logs (Audit Trail)
- [ ] Log svih admin akcija
- [ ] Ime admina
- [ ] Tip akcije
- [ ] Target (korisnik/proizvod ID)
- [ ] Detalji akcije
- [ ] IP adresa
- [ ] Timestamp
- [ ] Filtriranje i pretraga

### Feature Toggles
- [ ] Lista svih feature flags
- [ ] Enable/Disable toggle
- [ ] Opis feature-a
- [ ] Dodavanje novog feature-a
- [ ] Brisanje feature-a

### System Settings
- [ ] Early Adopter statistika (iskorisceno/preostalo/ukupno)
- [ ] Reset Early Adopter brojaca
- [ ] Premium Popup toggle
- [ ] Ostala sistemska podesavanja

### Notifications
- [ ] Forma za slanje notifikacija
- [ ] Tip: Push / Email
- [ ] Ciljna grupa: svi / premium / free
- [ ] Naslov i poruka
- [ ] Istorija poslatih notifikacija
- [ ] Broj poslatih

### CSV Export
- [ ] Export korisnika u CSV
- [ ] Export proizvoda u CSV
- [ ] Filtriranje pre exporta

### Subscriptions
- [ ] Lista svih pretplata
- [ ] Status pretplate
- [ ] Datum isteka
- [ ] Manuelno dodeljivanje premium-a

---

## 4. MONETIZACIJA

### Subscription Tiers
- [ ] Tier 1: Besplatno (Free) - ogranicenja definisana
- [ ] Tier 2: Standard - benefiti definisani
- [ ] Tier 3: Premium - benefiti definisani
- [ ] Jasna razlika izmedju tierova
- [ ] Upgrade flow

### Early Adopter Program
- [ ] Definisan broj korisnika (npr. prvih 100)
- [ ] Automatsko dodeljivanje premium statusa
- [ ] Trajanje besplatnog premium-a (npr. 30 dana)
- [ ] isEarlyAdopter flag u bazi
- [ ] Admin reset funkcionalnost

### Ad Expiration
- [ ] Definisan period isteka (npr. 30 dana)
- [ ] expiresAt polje u items tabeli
- [ ] Automatsko deaktiviranje isteklih oglasa
- [ ] Notifikacija vlasniku pre isteka
- [ ] Opcija obnavljanja

### Free Ad Limits
- [ ] Definisan lifetime limit (npr. 5 oglasa)
- [ ] Brojac kreiranih oglasa po korisniku
- [ ] Blokiranje kreiranja nakon limita
- [ ] Poruka o dostignutom limitu

### Promotional Modals
- [ ] Modal za upgrade na premium
- [ ] Modal za dostignut limit oglasa
- [ ] Modal za early adopter ponudu
- [ ] Dizajn uskadjen sa app-om
- [ ] Dismiss opcija

---

## 5. DATABASE SCHEMA

### Users Tabela
- [ ] id (UUID)
- [ ] email (unique)
- [ ] password (hashed)
- [ ] firstName, lastName
- [ ] role (owner/renter/both)
- [ ] isAdmin (boolean)
- [ ] isEarlyAdopter (boolean)
- [ ] premiumUntil (timestamp, nullable)
- [ ] subscriptionTier (free/standard/premium)
- [ ] isEmailVerified (boolean)
- [ ] isSuspended (boolean)
- [ ] city (string)
- [ ] latitude, longitude (float)
- [ ] createdAt, updatedAt

### Items Tabela
- [ ] id (UUID)
- [ ] ownerId (FK -> users)
- [ ] title
- [ ] description
- [ ] pricePerDay (decimal)
- [ ] categoryId (FK -> categories)
- [ ] images (array/JSON)
- [ ] isActive (boolean)
- [ ] isFeatured (boolean)
- [ ] status (pending/approved/rejected)
- [ ] expiresAt (timestamp)
- [ ] city, latitude, longitude
- [ ] createdAt, updatedAt

### Categories Tabela
- [ ] id (UUID)
- [ ] name
- [ ] icon (string)
- [ ] parentId (FK -> categories, nullable) - za 3-level hierarchy
- [ ] sortOrder
- [ ] createdAt

### Bookings Tabela
- [ ] id (UUID)
- [ ] itemId (FK -> items)
- [ ] renterId (FK -> users)
- [ ] startDate
- [ ] endDate
- [ ] status (pending/confirmed/cancelled/completed)
- [ ] totalPrice
- [ ] paymentMethod
- [ ] createdAt, updatedAt

### Conversations Tabela
- [ ] id (UUID)
- [ ] itemId (FK -> items)
- [ ] participant1Id (FK -> users)
- [ ] participant2Id (FK -> users)
- [ ] lastMessageAt
- [ ] createdAt

### Messages Tabela
- [ ] id (UUID)
- [ ] conversationId (FK -> conversations)
- [ ] senderId (FK -> users)
- [ ] content
- [ ] isRead (boolean)
- [ ] createdAt

### Reviews Tabela
- [ ] id (UUID)
- [ ] itemId (FK -> items)
- [ ] userId (FK -> users)
- [ ] rating (1-5)
- [ ] comment
- [ ] createdAt

### FeatureToggles Tabela
- [ ] id (UUID)
- [ ] name (unique)
- [ ] description
- [ ] isEnabled (boolean)
- [ ] createdAt, updatedAt

### AdminLogs Tabela
- [ ] id (UUID)
- [ ] adminId (FK -> users)
- [ ] action (string)
- [ ] targetType (user/item/booking/etc)
- [ ] targetId (UUID)
- [ ] details (JSON)
- [ ] ipAddress
- [ ] createdAt

### AppVersions Tabela
- [ ] id (UUID)
- [ ] platform (web/android/ios)
- [ ] version
- [ ] forceUpdate (boolean)
- [ ] releaseNotes
- [ ] createdAt

---

## 6. BEZBEDNOST

### HTTP Security (Helmet)
- [ ] helmet middleware aktivan
- [ ] Content Security Policy (CSP)
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Strict-Transport-Security

### Rate Limiting
- [ ] express-rate-limit instaliran
- [ ] Limit na auth endpoints
- [ ] Limit na API endpoints
- [ ] Custom response za rate limit

### XSS Zastita
- [ ] express-validator za input validaciju
- [ ] Sanitizacija korisnickog unosa
- [ ] Escape HTML u outputu

### Password Security
- [ ] scrypt algoritam za hashing
- [ ] Salt generisanje
- [ ] Timing-safe comparison

### Session Security
- [ ] httpOnly flag na cookies
- [ ] secure flag (production)
- [ ] sameSite flag
- [ ] Session secret u env varijabli
- [ ] Session expiration

### CORS
- [ ] Definisani allowed origins
- [ ] Credentials: true
- [ ] Allowed methods/headers

### CSP za Admin Panel
- [ ] scriptSrcAttr: ["'unsafe-inline'"] za onclick handlere
- [ ] Ili delegirani event listeneri (bezbednije)

---

## 7. INFRASTRUKTURA

### Frontend
- [ ] Expo (React Native)
- [ ] TypeScript konfigurisan
- [ ] TanStack React Query za state
- [ ] React Navigation
- [ ] Error Boundary komponenta

### Backend
- [ ] Express.js
- [ ] TypeScript
- [ ] RESTful API struktura
- [ ] Modularni routing

### Database
- [ ] PostgreSQL (development)
- [ ] MySQL (production) - ako je potrebno
- [ ] Drizzle ORM konfigurisan
- [ ] Migracije spremne

### Object Storage
- [ ] Replit Object Storage ili S3
- [ ] Upload endpoint za slike
- [ ] Max file size ogranicenje
- [ ] Allowed file types validacija

### Email Service
- [ ] SMTP konfiguracija ili
- [ ] Resend API integracija
- [ ] Email templates

### Environment Variables
- [ ] DATABASE_URL
- [ ] SESSION_SECRET
- [ ] SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PORT
- [ ] RESEND_API_KEY (ako se koristi)
- [ ] Google OAuth credentials
- [ ] Stripe keys (ako ima placanja)

---

## 8. MOBILNA APLIKACIJA (Expo)

### Konfiguracija
- [ ] app.json podeseno (name, slug, version)
- [ ] Bundle identifier (iOS i Android)
- [ ] App icon generisan
- [ ] Splash screen generisan

### Navigacija
- [ ] Bottom tab navigator
- [ ] Stack navigatori po sekcijama
- [ ] Header konfiguracija
- [ ] Deep linking

### UI/UX
- [ ] iOS 26 Liquid Glass dizajn
- [ ] Safe area insets
- [ ] Keyboard avoiding
- [ ] Dark/Light mode (opciono)
- [ ] Custom fonts

### Permissions
- [ ] Camera (za slike proizvoda)
- [ ] Location (za filtriranje po blizini)
- [ ] Notifications (push notifikacije)
- [ ] Proper permission request flow

---

## 9. TESTIRANJE

### Funkcionalno
- [ ] Registracija radi
- [ ] Login radi
- [ ] Kreiranje oglasa radi
- [ ] Pretraga proizvoda radi
- [ ] Slanje poruka radi
- [ ] Booking flow radi

### Admin Panel
- [ ] Sve stranice se ucitavaju
- [ ] CRUD operacije rade
- [ ] Export radi
- [ ] Logs se kreiraju

### Bezbednost
- [ ] SQL injection testiran
- [ ] XSS testiran
- [ ] Rate limiting testiran
- [ ] Auth bypass testiran

---

## Napomene

- Ovaj checklist je baziran na VikendMajstor aplikaciji
- Prilagodite nazive i specificnosti za vasu aplikaciju
- Oznacite [ ] sa [x] kada je stavka implementirana
- Prioritizujte core funkcionalnosti pre dodatnih feature-a

---

*Generisano: Januar 2026*
