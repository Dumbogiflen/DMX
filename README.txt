DMX Address PWA
===============

Indhold
-------
- index.html
- style.css
- app.js
- manifest.webmanifest
- sw.js
- icon.svg

Funktioner
----------
- DMX-adresse 1-512
- 9 DIP-switches (1,2,4,8,16,32,64,128,256)
- Numerisk keypad
- Kanalantal pr. lampe
- Næste/forrige lampe med valgt kanalantal
- Hurtigvalg til kanalantal
- Advarsel hvis lampen går ud over DMX 512
- Gemmer seneste adresse og kanalantal lokalt
- Offline via service worker

Test på Windows
---------------
PWA/offline-funktionen kræver normalt, at siden serveres via HTTP/HTTPS,
ikke bare åbnes direkte som en lokal fil.

Hvis Python er installeret:
1. Åbn Kommandoprompt i denne mappe.
2. Kør:
   python -m http.server 8080
3. Åbn:
   http://localhost:8080

På iPhone
---------
Filerne skal ligge på en HTTPS-adresse for at service worker/offline-installation
fungerer korrekt.

Åbn siden i Safari -> Del -> Føj til hjemmeskærm.

Bemærk
------
Dette er første version/prototype. Den kan udvides med fixture-profiler,
egne presets, flere universer, favoritter m.m.
