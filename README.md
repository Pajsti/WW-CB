# WW-CB 🌍

Web je připravenej na nasazení třeba na **GitHub Pages** a je strukturovanej tak, aby šel snadno rozšiřovat (články, fotogalerie, feedy atd.).

---

## 🔥 Funkce webu

* 📄 Vícestránkový web (index, o nás, články, kontakt…)
* 🖼️ Fotogalerie (data řízená přes JSON)
* 📰 Články / feed načítaný z `feed.json`
* 🎨 Vlastní CSS styl (žádnej Bootstrap copy-paste)
* ⚡ Rychlý load
* 🌐 Připraveno na low-resource servery

---

## 📁 Struktura projektu

```

WW-CB-main/
├── index.html
├── about.html
├── article.html
├── contact.html
├── fotogalerie.html
├── bylo-nebylo.html
├── footer.html
├── css/
│   └── style.css
├── data/
│   ├── feed.json
│   └── gallery.json
├── gallery/
│   └── mcr-2025/
│       ├── foto1.jpg
│       ├── foto2.jpg
│       └── ...
├── favicon.ico

```

## ✏️ Úpravy & rozšíření

* Přidání článku → upravíš `data/feed.json`
* Přidání fotek → nahraješ do `gallery/` + update `gallery.json`
* Styl → `css/style.css`
