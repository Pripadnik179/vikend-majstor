#!/bin/bash
# Pokreni ovo u Replit Shell-u

# 1. Idi u cpanel-git-ready folder
cd ~/workspace/cpanel-git-ready

# 2. Inicijalizuj Git
git init

# 3. Dodaj remote
git remote add origin https://github.com/Pripadnik/Vikend-Maj.git

# 4. Dodaj sve fajlove
git add .

# 5. Napravi commit
git commit -m "cPanel deployment - VikendMajstor"

# 6. Kreiraj cpanel branch i push-uj
git branch -M cpanel
git push -u origin cpanel --force

echo "GOTOVO! Sada na cPanel-u uradi:"
echo "git clone -b cpanel https://github.com/Pripadnik/Vikend-Maj.git ."
