# VikendMajstor - cPanel Deployment

## Brza Instalacija

### 1. Na cPanel-u (prvi put)

```bash
cd ~/vikendapp
git clone -b cpanel https://github.com/Pripadnik/Vikend-Maj.git .
npm install
```

### 2. Podesi Environment Varijable

U cPanel Node.js App podesi:
- `MYSQL_URL` - MySQL connection string
- `SESSION_SECRET` - Secret za sesije
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` - Za email

### 3. Pokreni aplikaciju

```bash
npm start
```

---

## Ažuriranje (svaki put)

```bash
cd ~/vikendapp
git pull origin cpanel
npm install
# Restartuj aplikaciju u cPanel-u
```

---

## Debug Endpoints

Posle prvog deploya pozovi:

```
https://app.vikendmajstor.rs/api/debug/seed-categories?key=vikend2024fix
https://app.vikendmajstor.rs/api/debug/fix-image-urls?key=vikend2024fix
```

---

## Struktura

```
vikendapp/
├── index.js          # Server (Express + API)
├── package.json      # Dependencies
├── static-build/     # Expo Web frontend
└── uploads/
    ├── public/       # Uploadovane slike
    └── temp/         # Privremeni fajlovi
```
