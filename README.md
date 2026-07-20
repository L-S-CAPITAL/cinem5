# CineM5

**Interactive 3D stage + cinematic Shot Deck** for the Canon EOS M5 with the EF-M 22mm f/2 STM pancake.

Cinema + M5. Spin the body, study the glass, then open the deck for exposure recipes pulled from moody, film-style frames.

## Kit locked

| | |
|---|---|
| **Body** | Canon EOS M5 · 24.2MP APS-C · Dual Pixel CMOS AF · DIGIC 7 |
| **Lens** | EF-M 22mm f/2 STM · ≈35mm FOV · close focus **0.15 m / 0.49 ft** |

## Features

- Procedural **Three.js** M5 body with a true **pancake** 22mm f/2 STM
- Orbit / zoom / pan · Hero · Front · Top · Lens views
- Black / silver finish switcher
- Soft bloom stage, red pedestal ring, auto-rotate
- **Shot Deck** — six cinematic frames with **f / ISO / shutter** explainers

### Shot Deck

| Shot | Aperture | ISO | Shutter |
|------|----------|-----|---------|
| Neon Rain Street | f/2 | 3200 | 1/60 |
| Golden Hour Portrait | f/2 | 200 | 1/500 |
| Close Focus · Dew Macro | f/5.6 | 400 | 1/200 |
| Tungsten Jazz Bar | f/2 | 2500 | 1/50 |
| Urban Action Freeze | f/4 | 400 | 1/1600 |
| Blue Hour Landscape | f/8 | 200 | 1/30 |
| Boudoir Soft Light | f/2 | 800 | 1/160 | **10-frame album** |
| Erotic Black & White | f/2.8 | 1600 | 1/125 | **10-frame album** |
| Raw Flash Editorial (TR-style) | f/5.6 | 200 | 1/200 | **10-frame album** |

### Style albums

Each of the three intimate/flash cards includes a **10-photo album** under `shots/albums/`:

- `boudoir/` — soft light, silk, lingerie / implied nude
- `erotic-bw/` — monochrome chiaroscuro & form
- `raw-flash/` — hard on-camera flash diary (TR-adjacent)

These are **original generated style references**, not copyrighted Terry Richardson Diaries images. Explicit full nudes are limited by content moderation.

## Run

Serve over HTTP (ES modules need a local server):

```bash
cd cinem5
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) → **Shot Deck**.

## Stack

- Three.js r170 (CDN + import map)
- OrbitControls, RoomEnvironment, UnrealBloomPass
- Pure HTML / CSS / JS — no build step

## License

Personal / portfolio showcase. Canon, EOS, and EF-M are trademarks of Canon Inc. Not affiliated with Canon.
