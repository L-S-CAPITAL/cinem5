# FrameDeck · CineM5

**Interactive 3D kit stage + Shot Deck packs** for creators (including 18+ intimate looks).

> *Pick a look. Copy f / ISO / shutter. Shoot content that sells.*

Kit demo: **Canon EOS M5 + EF-M 22mm f/2 STM** (~35mm FOV).

## Live local

```bash
cd cinem5
python3 -m http.server 8080
```

- **Stage + Deck:** http://localhost:8080  
- **Store:** http://localhost:8080/store.html  
- **Cheat sheets:** http://localhost:8080/packs/pdfs/  

## Pack catalog

Every Shot Deck look is a pack:

| Pack | Price | NSFW | Album |
|------|-------|------|-------|
| Golden Hour Portrait | Free | | 10 frames |
| Blue Hour Landscape | Free | | 10 frames |
| Neon Rain Street | $15 | | 10 frames |
| Macro Dew | $12 | | 10 frames |
| Jazz Bar | $15 | | 10 frames |
| Action Freeze | $12 | | 10 frames |
| Boudoir Soft Light | $19 | 18+ | 10 frames |
| Erotic B&W | $19 | 18+ | 10 frames |
| Raw Flash Editorial | $19 | 18+ | 10 frames |

**Bundles:** Starter $29 · Intimate $49 · All $89

## Checkout

Edit `content/checkout-config.js`:

```js
export const CHECKOUT_MODE = "external"; // was "demo"
// paste real Gumroad / Lemon Squeezy URLs into PRODUCT_URLS
```

Demo mode unlocks packs in-browser (no charge).  
Return URL after purchase: `https://yoursite/?unlocked=pack-boudoir`

## Stack

- Three.js 3D stage  
- ES modules, no build step  
- Pack schema in `content/catalog.js`  
- Soft entitlements in localStorage (Phase 2: auth + webhooks)

## GitHub

https://github.com/L-S-CAPITAL/cinem5

## License / legal

Educational photography product. Not affiliated with Canon.  
EOS / EF-M are trademarks of Canon Inc. Intimate packs are 18+.
