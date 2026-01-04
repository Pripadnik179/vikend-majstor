# VikendMajstor - cPanel Deployment Guide

## Potrebni fajlovi

Folder `cpanel-deploy/` sadrzi sve potrebne fajlove za deployment na cPanel:

```
cpanel-deploy/
├── index.js                      # Buildovan server (main file)
├── app.js                        # Entry point za cPanel Node.js
├── package.json                  # Production dependencies (samo mysql2, express, itd.)
├── add-unique-constraints.sql    # SQL za dodavanje UNIQUE constraints
└── templates/                    # HTML template fajlovi
    ├── landing-page.html
    ├── terms.html
    ├── privacy.html
    ├── legal.html
    ├── refund.html
    ├── contact.html
    ├── google-callback.html
    └── favicon.png
```

## VAZNO: Posle importa baze

Nakon sto importujete `mysql-export.sql` u phpMyAdmin, pokrenite i `add-unique-constraints.sql` 
da dodate nedostajuce UNIQUE indexe na tabele.

## Koraci za deployment

### 1. Upload fajlova
Uploadujte ceo sadrzaj `cpanel-deploy/` foldera u root folder Node.js aplikacije na cPanel-u.

### 2. Struktura na cPanel-u
Na cPanel-u, struktura treba da izgleda ovako:
```
app.vikendmajstor.rs/
├── index.js
├── app.js
├── package.json
├── node_modules/      # Generise se posle npm install
└── templates/
    └── ...
```

### 3. Environment varijable
Podesite sledece environment varijable u cPanel Node.js app konfiguraciji:

```
MYSQL_URL=mysql://vikendma_vikendmajstor_user:VASA_LOZINKA@localhost:3306/vikendma_vikendmajstor_db
SESSION_SECRET=vas_session_secret
NODE_ENV=production
SMTP_HOST=mail.vikendmajstor.rs
SMTP_PORT=587
SMTP_USER=noreply@vikendmajstor.rs
SMTP_PASSWORD=vasa_smtp_lozinka
```

### 4. Node.js konfiguracija na cPanel-u
- Node.js verzija: 20.x ili novija
- Application mode: Production
- Application root: folder gde ste uploadovali fajlove
- Application URL: app.vikendmajstor.rs
- Application startup file: `app.js`

### 5. Instalacija dependencies
U cPanel Node.js sekciji, kliknite "Run NPM Install" ili pokrenite:
```bash
npm install --production
```

### 6. Restart aplikacije
Restartujte aplikaciju u cPanel Node.js sekciji.

## Troubleshooting

### Greska: ENOTFOUND
Ako dobijete gresku da ne moze da nadje MySQL host, proverite da li je hostname `localhost` u MYSQL_URL.

### Greska: Access denied
Proverite korisnicko ime i lozinku u MYSQL_URL, kao i permisije korisnika u phpMyAdmin.

### Greska: ER_NO_SUCH_TABLE
Tabele nisu kreirane. Importujte `mysql-export.sql` u phpMyAdmin.
