# Luma — photo gallery

A responsive single-page React gallery implementing [the original assignment](reactjs_photo_gallery_assignment.md): one column of image-and-author rows, sequential pagination, and repeatable Font Awesome thumbs-up counts.

## Setup and execution

Use Node 24 LTS (or Node 22.13+ on the 22.x line) and npm 10+.

```powershell
cd photo-gallery
npm ci
npm run dev
```

Open http://127.0.0.1:5174. No environment variables, keys, backend or account are required. Use `npm.cmd` if PowerShell blocks npm's `.ps1` launcher.

**Network dependency:** the application requests `https://picsum.photos/v2/list?page=1`, then pages 2, 3, and so on. On 14 November 2026, both the API and image endpoint timed out from the development computer; successful live loading could not be verified. The UI shows a retry state after 15 seconds. It never substitutes fake photos. Check the endpoint in your browser and select **Try again** once reachable. Detailed findings are in [VERIFICATION.md](../docs/VERIFICATION.md).

## Features and behavior

- One vertical list, with images beside author information and like controls, following the supplied JPG/PNG structure.
- Uses each item's `author` and `download_url`. Thumbnails derive an appropriately sized Picsum image from that URL; the preview links to the original full-resolution URL.
- IntersectionObserver prefetches the next page within 300px of the bottom. **Discover more** also works manually and when IntersectionObserver is unavailable.
- Only one request can run at a time. Incoming ids are deduplicated, failures retain existing photos, retries request the same page, and only an empty response ends pagination.
- Likes start at zero, belong to an individual photo, and increment on every click. Likes remain while scrolling but reset on reload.
- Skeleton loading, empty/end states, HTTP/network/malformed-data/timeout handling, request cancellation, and per-image retry.
- Native accessible image dialog with Escape, focus containment/restoration, backdrop close, and an original-image link.
- Lazy-loaded thumbnails, reduced-motion support, mobile/tablet layouts, visible keyboard focus, and local Font Awesome SVG icons.

## Tests and production build

```powershell
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit
npm run preview
```

Open http://127.0.0.1:6174 for production preview. Browser tests require `npm run build` first and use controlled API/image responses for reproducibility and failure-path coverage. They do **not** assert that Picsum is currently online. Set `$env:PLAYWRIGHT_CHANNEL = 'chrome'` before running browser tests to use an installed Chrome instead of downloading Chromium.

## Source map

- `src/App.jsx`: layout, IntersectionObserver, photo likes, preview selection.
- `src/usePhotoFeed.js`: serial requests, page progression, timeout, abort, retry, deduplication.
- `src/api.js`: API requests, payload validation, safe Picsum URLs and resizing.
- `src/PhotoCard.jsx`, `src/PhotoImage.jsx`, `src/PhotoDialog.jsx`: independent display and interaction components.
- `src/App.test.jsx`, `e2e/gallery.spec.js`: API/state/interaction and production-browser tests.

No proxy is necessary for a normally reachable Picsum service with CORS support. A CORS error should be investigated at the service/network level, not bypassed by disabling browser security. Image licensing and attribution remain with the originating photographers and Lorem Picsum. The collection is not downloaded or republished by this application.

The screenshot below uses **labeled visual test fixtures**, not live photographs. Fixtures are only injected by browser tests; none are served by the normal application.

![Luma layout with visual test fixtures](../docs/screenshots/gallery-fixture-desktop.png)

See the [repository README](../README.md) for both applications.
