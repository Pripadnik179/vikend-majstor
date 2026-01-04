# VikendMajstor - Uputstvo za cPanel Deployment

## Pre nego sto pocnete

### Potrebno vam je:
1. cPanel pristup sa "Setup Node.js App" opcijom
2. MySQL baza kreirana na cPanel-u
3. SMTP kredencijali za email

---

## KORAK 1: Kreirajte MySQL bazu

1. Ulogujte se u cPanel
2. Idite na **MySQL Databases**
3. Kreirajte novu bazu:
   - Database Name: `vikendma_vikendmajstor_db`
4. Kreirajte korisnika:
   - Username: `vikendma_user`
   - Password: (izaberite sigurnu lozinku)
5. Dodajte korisnika na bazu sa **ALL PRIVILEGES**

---

## KORAK 2: Importujte tabele u bazu

1. Idite na **phpMyAdmin**
2. Izaberite vasu bazu (`vikendma_vikendmajstor_db`)
3. Kliknite na tab **Import**
4. Izaberite fajl `mysql-export.sql` iz ovog foldera
5. Kliknite **Go**
6. Sacekajte da se import zavrsi (traje ~30 sekundi)

---

## KORAK 3: Uploadujte fajlove

### Opcija A: Preko File Manager-a
1. U cPanel-u idite na **File Manager**
2. Navigujte do foldera vase aplikacije (npr. `/home/vikendma/vikendapp`)
3. **Obrisite sve stare fajlove** iz tog foldera
4. Uploadujte sve fajlove iz ovog foldera

### Opcija B: Preko FTP/SFTP
1. Konektujte se na server preko FileZilla ili slicnog programa
2. Navigujte do `/home/vikendma/vikendapp`
3. Uploadujte sve fajlove

### Struktura na serveru treba da bude:
```
vikendapp/
├── app.js                    (entry point - VAZNO!)
├── index.js                  (buildovan server)
├── package.json              (dependencies)
├── app.json                  (Expo config)
├── mysql-export.sql          (mozete obrisati posle importa)
├── server/
│   ├── templates/            (HTML fajlovi)
│   ├── landing/              (landing stranice)
│   ├── public/
│   │   └── demo-images/      (slike alata)
│   └── uploads/              (folder za upload korisnickih slika)
│       ├── public/           (javne slike)
│       └── temp/             (privremeni fajlovi)
├── shared/
│   └── schema.ts             (baza schema)
├── assets/                   (ikonice)
└── static-build/             (Expo web build)
```

**VAZNO:** Folder `server/uploads/` mora imati write permission (755 ili 775) da bi korisnici mogli uploadovati slike.

---

## KORAK 4: Podesite Node.js App

1. U cPanel-u idite na **Setup Node.js App**
2. Ako vec imate app, kliknite **Edit** (olovka ikonica)
3. Ako nemate, kliknite **Create Application**
4. Podesite sledece:
   - **Node.js version**: 20.x (ili najnovija dostupna)
   - **Application mode**: Production
   - **Application root**: vikendapp (ili putanja do vase app)
   - **Application URL**: app.vikendmajstor.rs
   - **Application startup file**: `app.js`

---

## KORAK 5: Dodajte Environment Variables

U istom "Setup Node.js App" prozoru, skrolujte dole do **Environment variables** i dodajte:

| Name | Value |
|------|-------|
| MYSQL_URL | mysql://vikendma_user:VASA_LOZINKA@localhost:3306/vikendma_vikendmajstor_db |
| SESSION_SECRET | neka_duga_tajna_vrednost_32_karaktera |
| NODE_ENV | production |
| SMTP_HOST | mail.vikendmajstor.rs |
| SMTP_PORT | 587 |
| SMTP_USER | noreply@vikendmajstor.rs |
| SMTP_PASSWORD | vasa_smtp_lozinka |

**VAZNO:** Zamenite VASA_LOZINKA sa pravom lozinkom baze!

---

## KORAK 6: Instalirajte dependencies

1. U "Setup Node.js App" prozoru kliknite **Run NPM Install**
2. Sacekajte da se zavrsi (traje 1-2 minuta)
3. Ako dobijete gresku, proverite da li je package.json uploadovan ispravno

---

## KORAK 7: Startujte aplikaciju

1. Kliknite **Start** ili **Restart**
2. Sacekajte 30 sekundi
3. Otvorite https://app.vikendmajstor.rs

---

## Verifikacija da sve radi

### Landing stranica
- [ ] https://app.vikendmajstor.rs - prikazuje landing
- [ ] https://app.vikendmajstor.rs/favicon.png - prikazuje ikonicu
- [ ] https://app.vikendmajstor.rs/uslovi-koriscenja - prikazuje uslove

### API
- [ ] https://app.vikendmajstor.rs/api/categories - vraca JSON listu kategorija
- [ ] https://app.vikendmajstor.rs/api/items - vraca JSON listu alata

---

## Troubleshooting

### Greska: "Cannot GET /"
- Proverite da li postoji `server/templates/landing-page.html`
- Proverite da li su fajlovi uploadovani u pravi folder

### Greska: "Cannot find module"
- Pokrenite ponovo **Run NPM Install**
- Proverite da li je package.json uploadovan

### Greska: "ECONNREFUSED" ili "Access denied"
- Proverite MYSQL_URL u environment variables
- Proverite da li korisnik ima pristup bazi

### Greska: 500 Internal Server Error
- Pogledajte error log u cPanel-u (Errors sekcija)
- Proverite da li su sve tabele importovane u bazu

---

## Kontakt za pomoc

Ako imate problema, sacuvajte:
1. Screenshot greske
2. Sadrzaj error loga iz cPanel-a
3. Listu koraka koje ste uradili

Zatim se javite za pomoc sa ovim informacijama.
