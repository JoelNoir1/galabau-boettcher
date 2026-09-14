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

## Live-Domain

Die Seite läuft unter **https://galabau-böttcher.com/**. In canonical, og:url,
JSON-LD, robots.txt und sitemap.xml steht die Punycode-Schreibweise
`https://xn--galabau-bttcher-htb.com/` – das ist dieselbe Adresse und die
Form, die Suchmaschinen erwarten.

## Offene Punkte / Checkliste

1. **Kontakt läuft über WhatsApp, nicht über ein Formular.** Ein Kontakt-
   formular gibt es nicht mehr und damit auch keinen Formulardienst, keinen
   Server und keinen Access Key. Die Schaltflächen sind einfache Links auf
   `https://wa.me/4915233991890?text=…` mit vorbelegter Nachricht:
   - Kontaktbereich der Startseite (`.wa-card`)
   - schwebender Button unten rechts, erst ab 56em (`.wa-float`)
   - Schnellkontakt-Leiste auf kleinen Displays (`.quick-contact`)
   Ändert sich die Rufnummer oder der Nachrichtentext, müssen alle
   `wa.me`-Links angepasst werden (je 2–3 Stellen pro Seite).
   Der Datenschutzhinweis dazu steht in `datenschutz/` (Abschnitt 4).
2. **Google-Bewertungen:** Unter `#bewertungen` in `index.html` steht die
   echte Rezension von Christian Lang (5,0 aus 1 Google-Rezension). Weitere
   echte Rezensionen können als zusätzliche `.tst`-Karten ergänzt werden;
   dann `.tst-single` zu `.tst-track` ändern und Anzahl/`aggregateRating`
   (JSON-LD im `<head>`) anpassen. Den Button-Link auf das Google-Profil
   bei Vorliegen der kurzen Profil-URL (`https://g.page/r/…`) ersetzen.
3. **Fotos ohne Instagram-Overlay:** Drei Originale (`ZAUNBAU1.jpg`,
   `termin sichern.jpg`, `1.jpg`) sind Instagram-Posts mit eingebranntem
   Werbetext. Für die Website schneidet `tools/optimize-images.py`
   (Dict `INSTA_CROPS`) den textfreien Bildbereich aus. Liegen die
   Originalfotos ohne Overlay vor: in `content/originale/` ersetzen und
   die Ausschnitte in `INSTA_CROPS` entfernen.
4. **Impressum/Datenschutz:** `[PLATZHALTER]`-Stellen ausfüllen (USt-ID,
   Hoster, ggf. Handwerkskammer) und rechtlich prüfen lassen.
5. **Projekt-Orte prüfen:** In `projekte/index.html` sind die Orte gesetzt
   (Zaunbau & Abriss: „Region Kyffhäuserkreis", Dachpflege: „Region Erfurt").
   Bei Bedarf durch die konkreten Orte ersetzen. Das Einzugsgebiet
   (Kyffhäuserkreis, Sömmerda, Erfurt, Sangerhausen, Nordthüringen) ist in
   Titeln, Meta-Description, OG-Tags und `areaServed` (JSON-LD) hinterlegt.

## Bilder austauschen / neue Bilder hinzufügen

Neue Original-Fotos nach `content/originale/` legen, in
`tools/optimize-images.py` im Dict `PHOTOS` eintragen und ausführen:

```
python -m pip install Pillow   (einmalig)
python tools/optimize-images.py
```

Das Skript erzeugt automatisch AVIF/WebP/JPG in 480/800/1200 px sowie
quadratische 600-px-Kacheln für das Instagram-Grid (inkl. EXIF-Korrektur).

- **Hero-Foto:** Die Startseite zeigt einen 4:5-Ausschnitt des
  Pflaster-Projekts (`hero-pflaster-*`, erzeugt von der Funktion `hero()` in
  der Pipeline, bewusst stärker komprimiert, weil es das LCP-Element ist).
  Für ein anderes Motiv dort die Quelldatei und den Ausschnitt ändern.
- **Vorher/Nachher:** Echtes Bildpaar (`vorher-*` / `nachher-*`, Erdarbeiten →
  Bodenplatte) ist eingebunden. Für weitere Paare die Quelldateien nach
  `content/originale/` legen, in `tools/optimize-images.py` eintragen und
  ausführen; dann die Bildpfade im `.ba`-Block in `projekte/index.html` tauschen.

## Logo austauschen

Die Bild-Pipeline erzeugt aus `content/originale/logo.png.jpeg` drei Dateien:

- `logo-mark-200.webp` (4 KB) – Header, im kritischen Ladepfad
- `logo-mark.webp` (20 KB) – Footer, Über-uns-Karte, Kontaktkarte
- `logo-mark.png` (185 KB) – nur noch als `logo`-Angabe im JSON-LD; wird
  nicht mehr an Browser ausgeliefert

Für ein neues Logo die Quelldatei unter gleichem Namen ersetzen und
`python tools/optimize-images.py` ausführen.

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
