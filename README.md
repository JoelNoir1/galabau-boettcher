# Website: Garten- & Landschaftsbau Böttcher

Moderne, statische Unternehmenswebsite – HTML5, CSS3, Vanilla-JavaScript.
Keine Frameworks, keine externen Requests (Fonts selbst gehostet, Karte per
Zwei-Klick), dadurch DSGVO-freundlich ohne Cookie-Banner und sehr schnell.

## Struktur

```
index.html                  Startseite (alle Sektionen)
leistungen/index.html       Leistungsseite mit 6 Kategorien (22 Leistungen)
projekte/index.html         Referenzen + Vorher/Nachher-Slider + Lightbox
impressum/  datenschutz/    Rechtsseiten (Platzhalter markiert)
css/main.css                Design-System (Farben aus dem Logo abgeleitet)
js/main.js                  Alle Interaktionen (Vanilla JS)
assets/fonts|img/           Selbst gehostete Fonts, optimierte Bilder
content/originale/          Original-Fotos (Quelle für die Bild-Pipeline)
tools/optimize-images.py    Bild-Pipeline (Python + Pillow)
```

## Vor dem Livegang – Checkliste

1. **Domain eintragen:** Überall nach `[PLATZHALTER-DOMAIN]` suchen
   (index.html, leistungen/, projekte/, impressum/, datenschutz/, sitemap.xml,
   robots.txt) und `www.galabau-boettcher.de` durch die echte Domain ersetzen.
2. **Kontaktformular anbinden:** In `js/main.js` oben `CONFIG.formEndpoint`
   setzen. Ohne Endpoint öffnet das Formular das E-Mail-Programm (mailto).
   - *Variante PHP (klassisches Hosting):* kleines Mail-Skript hochladen und
     `formEndpoint: "/kontakt.php"` eintragen.
   - *Variante Web3Forms:* kostenlosen Access-Key auf web3forms.com holen,
     `formEndpoint: "https://api.web3forms.com/submit"` eintragen und im
     Formular ein `<input type="hidden" name="access_key" value="…">` ergänzen.
   - Danach die Datenschutzerklärung (Abschnitt 4) entsprechend ergänzen.
3. **Platzhalter-Bewertungen ersetzen:** Die drei Karten unter `#bewertungen`
   in `index.html` sind sichtbar als Platzhalter markiert – vor Livegang
   zwingend durch echte Kundenstimmen ersetzen (rechtlich relevant!).
4. **Platzhalter-Zahlen prüfen:** Sektion „Zahlen" in `index.html`
   (100+ Projekte / 10+ Jahre / 100 % Leidenschaft) mit echten Werten belegen.
5. **Impressum/Datenschutz:** `[PLATZHALTER]`-Stellen ausfüllen (USt-ID,
   Hoster, ggf. Handwerkskammer) und rechtlich prüfen lassen.
6. **Projekt-Orte eintragen:** In `projekte/index.html` steht als Ort bisher
   „Region Kyffhäuserland" – durch echte Orte ersetzen.

## Bilder austauschen / neue Bilder hinzufügen

Neue Original-Fotos nach `content/originale/` legen, in
`tools/optimize-images.py` im Dict `PHOTOS` eintragen und ausführen:

```
python -m pip install Pillow   (einmalig)
python tools/optimize-images.py
```

Das Skript erzeugt automatisch AVIF/WebP/JPG in 480/800/1200 px sowie
quadratische 600-px-Kacheln für das Instagram-Grid (inkl. EXIF-Korrektur).

- **Hero-Foto:** Sobald ein sauberes Querformat-Foto existiert, in
  `index.html` den Block `.hero__bg` durch den vorbereiteten
  `.hero__photo`-Block ersetzen (Kommentar im HTML zeigt die Stelle).
- **Vorher/Nachher:** Die Platzhalter `assets/img/ph-vorher.svg` /
  `ph-nachher.svg` in `projekte/index.html` durch echte Bildpaare ersetzen.

## Logo austauschen

Alle Seiten referenzieren `assets/img/logo-mark.png` (+ `.webp`).
Eine höher aufgelöste PNG/SVG einfach unter **gleichem Dateinamen**
überschreiben – kein Code-Edit nötig. (Quelle des aktuellen Zuschnitts:
`content/originale/logo.png.jpeg`, verarbeitet durch die Bild-Pipeline.)

## Instagram-Grid aktualisieren

Die Kacheln unter `#instagram` in `index.html` sind statisch (DSGVO-freundlich,
kein Cookie-Banner nötig). Für neue Beiträge: Bild exportieren, per Pipeline
optimieren, Dateinamen im HTML anpassen. Eine automatische Einbindung über die
Instagram-Graph-API kann später nachgerüstet werden (Meta-Business-Konto und
Access-Token erforderlich).

## Dark Mode

Vollständig vorbereitet: In `css/main.css` ist die Palette unter
`:root[data-theme="dark"]` definiert. Aktivierung z. B. per
`<html data-theme="dark">` oder künftigem Toggle-Button.

## Lokale Vorschau

```
python -m http.server 8123
```

Dann http://localhost:8123 im Browser öffnen. (Direktes Öffnen der
HTML-Dateien per Doppelklick funktioniert ebenfalls.)
