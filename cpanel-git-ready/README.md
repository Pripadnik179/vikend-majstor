# VikendMajstor - cPanel Deployment

## Struktura fajlova

```
vikendapp-git/
├── index.js          # Glavni server fajl (bundled)
├── package.json      # Dependencies (type: module)
├── static-build/     # Expo web build
│   ├── index.html
│   ├── _expo/
│   └── assets/
└── uploads/          # Folder za upload slika
    ├── public/
    └── temp/
```

## Deployment na cPanel (prvi put)

### 1. Git Clone
U cPanel -> Git Version Control -> Create:
- Clone URL: `https://github.com/Pripadnik/Vikend-Maj.git`
- Branch: `cpanel`
- Repository Path: `/home/vikendma/vikendapp-git`

### 2. Node.js App Setup
U cPanel -> Setup Node.js App -> Create Application:
- Node.js version: `20`
- Application mode: `Production`
- Application root: `vikendapp-git`
- Application URL: `app.vikendmajstor.rs`
- Application startup file: `index.js`

### 3. Environment Variables
Dodaj ove varijable u Node.js App:
```
MYSQL_URL=mysql://vikendma_vikendmajstor_user:Caralazara13%40@localhost:3306/vikendma_vikendmajstor_db
SESSION_SECRET=vikendmajstor2024secretkey
NODE_ENV=production
```

### 4. Install i Start
1. Klikni "Run NPM Install"
2. Sacekaj da se zavrsi
3. Klikni "Start App" ili "Restart"

---

## Azuriranje aplikacije

### Na Replit-u:
```bash
cd cpanel-git-ready
git add .
git commit -m "Opis izmene"
git push origin cpanel
```

### Na cPanel-u:
1. Git Version Control -> vikendapp-git -> "Update from Remote"
2. Setup Node.js App -> "Restart"

---

## Debug Endpoints (posle prvog deploya)

```
https://app.vikendmajstor.rs/api/debug/seed-categories?key=vikend2024fix
https://app.vikendmajstor.rs/api/debug/fix-image-urls?key=vikend2024fix
```

---

## Troubleshooting

### Greska "Cannot find package X"
1. Proveri da li je paket u package.json
2. U File Manager obrisi `node_modules` folder (ako postoji u app folderu)
3. U nodevenv folderu obrisi `node_modules` i `package-lock.json`
4. Ponovo "Run NPM Install"

### 500 Internal Server Error
- Proveri Errors log u cPanel -> Metrics -> Errors
- Proveri Environment Variables
- Proveri da li MySQL baza radi
