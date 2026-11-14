# ExactSpace React Assignment

Two independent, production-ready React applications built as part of the ExactSpace React take-home assignment:

- **Common** — A responsive team conversation interface with messaging, reactions, emoji support, and teammate mentions.
- **Luma** — A responsive, single-column infinite photo gallery with sequential pagination, interactive likes, and accessible image previews.

Both applications are independently structured, implemented, tested, and documented. The original assignment briefs, reference images, and Git history are preserved.

---

## Applications

| Application | Description | Development URL |
|---|---|---|
| **Common — Team Chat** | Interactive messaging, random authors, repeated likes, emoji picker, @mentions, and local persistence. | http://127.0.0.1:5173 |
| **Luma — Photo Gallery** | Infinite photo feed, sequential pagination, photographer information, likes, image previews, and retry handling. | http://127.0.0.1:5174 |

## 1. Common — Team Conversation Interface

Common is a responsive, single-page React messaging application designed around a clean conversation interface and an intuitive message composer.

### Features

- **Messaging:** Send messages using the send button or Enter. Shift+Enter inserts a new line.
- **Random Authors:** Every submitted message receives a randomly assigned author from the required list: Alan, Bob, Carol, Dean, and Elin.
- **Message Reactions:** Each message has an independent thumbs-up counter that starts at zero and increments on every click.
- **Emoji Picker:** Insert emojis at the cursor position or replace selected text.
- **Teammate Mentions:** Type `@` or use the mention button to discover teammates. Supports filtering and keyboard navigation.
- **Local Persistence:** Messages and likes are stored using browser localStorage and restored on subsequent visits.
- **Input Validation:** Rejects blank messages, trims unnecessary whitespace, and enforces a 2,000 UTF-16 code-unit input limit.
- **Responsive Design:** Supports desktop and mobile layouts.
- **Accessibility:** Keyboard interactions, visible focus states, safe text rendering, and screen-reader announcements.

### Technical Implementation

- React 19
- Vite 7
- JavaScript
- CSS
- Browser localStorage
- Vitest and React Testing Library
- Playwright
- ESLint

**Architecture:** Components are separated into the main application, message composer, message display, icon components, and reusable chat model/storage helpers.

**Important scope note:** Common is a local chat simulation. It does not implement real-time messaging, authentication, a backend, Socket.IO, or cross-device synchronization. The five author names represent simulated participants.

---

## 2. Luma — Infinite Photo Gallery

Luma is a responsive, single-column photo gallery that presents photographs alongside photographer information and interactive like controls.

It uses the prescribed Lorem Picsum API as its external photo source.

### Features

- **Photo Feed:** Displays photographs in a vertical image-and-author layout.
- **Sequential Pagination:** Fetches pages sequentially, beginning with page 1.
- **Infinite Scrolling:** Uses IntersectionObserver to request the next page when the user approaches the bottom of the feed.
- **Manual Pagination:** Provides a Discover More fallback, including environments without IntersectionObserver.
- **Photographer Information:** Displays the author associated with each photograph.
- **Interactive Likes:** Each photograph starts with zero likes and increments on every click.
- **Image Preview:** Opens an accessible image dialog with the original full-resolution image link.
- **Image Recovery:** Supports retrying individual images when loading fails.
- **Request Handling:** Includes loading skeletons, timeout handling, error states, empty states, and retry functionality.
- **Duplicate Prevention:** Prevents duplicate photo entries while appending subsequent pages.
- **Request Safety:** Prevents overlapping requests, supports cancellation, and retains existing photos after failed requests.
- **Responsive Design:** Supports desktop, tablet, and mobile layouts.
- **Accessibility:** Keyboard navigation, Escape-to-close, focus management, visible focus states, and reduced-motion support.

### API Integration

The gallery uses:

`https://picsum.photos/v2/list`

The application retrieves photographer information and image URLs from the API response. Thumbnail dimensions are derived from the provided image URLs, while the preview links to the original image.

### External API Availability Notice — 14 November 2026

During final verification, the prescribed Picsum API and image endpoints repeatedly returned **Cloudflare Error 522 — Connection Timed Out**.

The observed Cloudflare diagnostic reported:
- Browser: Working
- Cloudflare: Working
- Origin host (`picsum.photos`): Error

The issue was reproduced through multiple Cloudflare locations, including Chennai, Bangalore, and New Delhi.

The application was also tested using independent requests to the external service. Successful live photo retrieval could not be verified during this period.

**Implementation and verification status:**
- The prescribed Picsum API integration is implemented.
- Request timeout and error handling are implemented.
- Retry functionality is implemented.
- Infinite scrolling and sequential pagination are implemented.
- Likes, image previews, and image recovery are implemented.
- Automated tests verify successful API responses using controlled test fixtures, as well as network failures, timeouts, retries, and empty responses.
- No hardcoded production photographs or replacement mock-data feed has been introduced.

The gallery retains the prescribed API integration and displays a retryable error state when the external service is unavailable.

**Important:** Automated tests establish the application's behavior under controlled API responses; they do not establish that the live Picsum service is currently operational. Successful live photo loading remains unverified pending recovery of the external service.

---

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, JavaScript, CSS |
| Build Tool | Vite 7 |
| Unit Testing | Vitest 4 |
| Component Testing | React Testing Library |
| Browser Testing | Playwright |
| Code Quality | ESLint 10 |
| Icons | Local SVG icons and bundled Font Awesome thumbs-up icon |
| Storage | Browser localStorage for Common |
| External API | Lorem Picsum API for Luma |

Both applications have independent dependencies, package manifests, lockfiles, Vite configurations, and production builds.

There is no shared workspace package or runtime dependency between the applications.

---

## Prerequisites

- Node.js **24 LTS recommended**, or Node.js **22.13+ on the 22.x line**.
- npm 10 or newer.
- A modern browser such as Google Chrome.
- Internet access for dependency installation and the gallery's external photo service.

No backend, database, API keys, authentication credentials, or environment variables are required.

No `.env` configuration is necessary. Environment files are ignored by Git.

On Windows PowerShell, use `npm.cmd` instead of `npm` if script execution policy prevents the npm PowerShell launcher from running.

---

## Installation and Execution

Both applications run independently and can be started in separate terminals.

### 1. Clone the repository

```bash
git clone https://github.com/exact-space/react-assignments.git
cd exact-space-react-assignment
```

If working from the provided local project folder, skip the cloning step.

### 2. Start Common — Chat App

Open Terminal 1:

```powershell
cd chat-app
npm ci
npm run dev
```

Open:

http://127.0.0.1:5173

### 3. Start Luma — Photo Gallery

Open Terminal 2:

```powershell
cd photo-gallery
npm ci
npm run dev
```

Open:

http://127.0.0.1:5174

### Optional: Start Both Applications Together

From the repository root, run:

```powershell
.\Start-Apps.ps1
```

To stop only the servers started by this helper:

```powershell
.\Start-Apps.ps1 -Stop
```

The helper checks occupied ports and stores logs in the ignored `.local/` directory.

---

## Testing and Verification

Both applications include unit tests, browser-based end-to-end tests, linting, and production builds.

Run the following commands independently inside each application directory.

### Common — Chat App

```powershell
cd chat-app

npm.cmd run lint
npm.cmd test
npm.cmd run build

npx.cmd playwright install chromium
npm.cmd run test:e2e

npm.cmd audit
```

### Luma — Photo Gallery

```powershell
cd photo-gallery

npm.cmd run lint
npm.cmd test
npm.cmd run build

npx.cmd playwright install chromium
npm.cmd run test:e2e

npm.cmd audit
```

If Google Chrome is already installed, Playwright can use it instead of downloading Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run test:e2e
```

Browser tests use the production build and controlled API/image responses for reproducible verification.

### Verified Results

| Verification | Common | Luma |
|---|---|---|
| ESLint | Passed | Passed |
| Unit tests | Passed | 11/11 passed |
| Production build | Passed | Passed |
| Playwright E2E tests | 2/2 passed | 2/2 passed |
| npm audit | 0 vulnerabilities | 0 vulnerabilities |
| Automated accessibility scan | 0 violations | 0 violations |

The gallery's automated tests cover successful responses, pagination, duplicate prevention, likes, image retries, timeouts, empty states, and image previews.

The test results are based on controlled test environments and should not be interpreted as proof of live third-party API availability.

### Production Preview

To preview the production build, run:

```powershell
npm.cmd run preview
```

- Common production preview: http://127.0.0.1:6173
- Luma production preview: http://127.0.0.1:6174

Production assets are generated independently in each application's `dist/` directory.

---

## Project Structure

```text
exact-space-react-assignment/
│
├── chat-app/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Composer.jsx
│   │   ├── Message.jsx
│   │   ├── chat.js
│   │   ├── Icon.jsx
│   │   ├── App.test.jsx
│   │   └── styles/
│   ├── e2e/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── reactjs_chat_assignment.md
│
├── photo-gallery/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.test.jsx
│   │   ├── api.js
│   │   ├── usePhotoFeed.js
│   │   └── components/
│   ├── e2e/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── reactjs_photo_gallery_assignment.md
│
├── docs/
│   ├── IMPLEMENTATION-PLAN.md
│   ├── REQUIREMENTS.md
│   ├── IMPLEMENTATION.md
│   ├── VERIFICATION.md
│   └── screenshots/
│
├── Start-Apps.ps1
└── README.md
```

The source tree above is a high-level overview; refer to each application's directory for its complete implementation.

---

## Documentation and Visual Evidence

The repository includes additional documentation covering implementation decisions, original requirements, and verification.

- [Original requirements and implementation roadmap](docs/IMPLEMENTATION-PLAN.md)
- [Requirement-by-requirement completion review](docs/REQUIREMENTS.md)
- [Engineering decisions and implementation summary](docs/IMPLEMENTATION.md)
- [Testing, accessibility, and external API verification](docs/VERIFICATION.md)

### Common — Chat App

- [Desktop screenshot](docs/screenshots/chat-desktop.png)
- [Mobile screenshot](docs/screenshots/chat-mobile.png)

### Luma — Photo Gallery

- [Desktop gallery screenshot](docs/screenshots/gallery-fixture-desktop.png)
- [Mobile gallery screenshot](docs/screenshots/gallery-fixture-mobile.png)
- [Image preview screenshot](docs/screenshots/gallery-fixture-preview.png)
- [Observed live API timeout](docs/screenshots/gallery-network-check.png)

**Screenshot clarification:** Gallery screenshots containing labeled fixture images are generated during browser testing. They demonstrate the layout and interactions using controlled test data and are not representations of photographs retrieved from the live Picsum service.

---

## Scope and Limitations

### Common
- Local conversation simulation with randomly assigned authors.
- No real-time multi-user messaging or Socket.IO server.
- No authentication or remote synchronization.
- Messages and likes persist in browser localStorage.
- Storage is browser- and origin-specific.

### Luma
- Depends on the external Picsum API for live photographs.
- Live photo availability is subject to external service uptime and network connectivity.
- Likes begin at zero and reset on page reload.
- Retry and fallback states are provided for network and image-loading failures.
- Manual pagination is available when native infinite scrolling is unavailable.

Neither application claims functionality that has not been implemented or verified.

---

## Final Submission Notes

Both applications are maintained as independent React projects within one repository.

- Original assignment requirements and reference materials are preserved.
- Both applications have independent dependency management and execution workflows.
- Automated testing and production builds have been completed.
- External service limitations are documented transparently.
- No code has been pushed to the original GitHub repository.
- No deployment or publication has been performed.

The project is ready for submission, subject to the documented limitation that successful live Picsum photo retrieval could not be verified during the 14 November 2026 testing window.

**Built with React, Vite, and a focus on clean architecture, usability, accessibility, and reliable application behavior.**