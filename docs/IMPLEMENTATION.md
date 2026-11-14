# Implementation summary

## Starting point

The complete upstream repository was cloned with its Git history at commit `067019d`. It contained two briefs and visual references, not existing React source. Both applications were implemented independently within the original directories. The original assignment Markdown and image files remain unchanged; the original one-line root README is also retained in `docs/UPSTREAM-README.md`.

The gallery's open upstream issue concerns a reference image failing to open. Both downloaded gallery references were inspected locally and depict a single vertical list with each author's name beside the photo. This implementation preserves that structure with updated typography, spacing, color, loading states, and responsive sizing.

## Technical decisions

### Independent React/Vite packages

Each app owns its dependencies, npm lockfile, configuration, development/preview ports, tests, CSS, and build output. A shared monorepo package would add coupling without helping this assignment. No router is needed for the single-page tasks. There is no backend or secret management because neither mandatory brief requires a private service.

React component state is sufficient. Functional updates prevent lost increments during repeated like clicks. A dedicated hook handles the gallery's asynchronous lifecycle; presentational components stay independent of request orchestration.

### Chat

`createMessage` validates and trims text, creates a unique id, timestamps the submission, initializes likes, and samples uniformly from the exact five-name author list. The composer rejects blanks, enforces a 2,000-code-unit limit, preserves multiline input, and avoids submitting while the user is composing with an IME.

The emoji/mention picker retains cursor selection. Mentions work from the `@` button or a typed token and support filtering, keyboard navigation, dismissal and safe highlighting. Text is rendered as React text nodes; arbitrary HTML is never interpreted.

The app persists messages and likes in validated, versioned local storage. Every record's author, timestamp, text, count, and id is checked before loading. Storage errors do not disable the session. Persistence is intentionally local and no online presence or real collaboration is claimed.

### Gallery

`usePhotoFeed` serializes requests with an AbortController ref and advances the page only after a successful nonempty response. It aborts on unmount, ignores stale responses, sets a 15-second timeout, retries the current failed page, and deduplicates ids while retaining existing photos and likes. A page of overlapping ids is not mistaken for end-of-feed; only an empty array ends pagination.

IntersectionObserver prefetches near the bottom. A visible manual load button supports keyboard users and browsers without the observer. Error states stop automatic retries, avoiding retry storms. The public endpoint remains exactly the service named in the assignment.

The API adapter validates the payload and restricts image URLs to HTTPS Picsum image paths. Thumbnail and preview sizes are derived from the provided `download_url` while retaining the original aspect ratio. Original links remain available. Images are lazy-loaded, decoding is asynchronous, and image failures have a separate retry control. Font Awesome SVGs are locally bundled rather than loaded through a third-party script.

The native modal dialog supplies focus containment and Escape semantics. Opening records the previous focused control, locks background scrolling, and restores focus on close. Photos remain in a single column at every viewport width.

### Tooling and security

The final manifests support Node 22.13+ on the Node 22 line and Node 24+. Clean installs use committed npm lockfiles. The initial npm peer-resolution problem was resolved with a compatible installation path; subsequent `npm ci` verification uses the normal system npm installation.

Vitest was upgraded to 4.1.12 after auditing identified vulnerabilities in earlier versions. ESLint, its base config and jsdom were updated to compatible supported releases. The final audit covers development as well as production dependencies. Servers bind only to `127.0.0.1`, and sensitive/local/build files are ignored.

The Windows helper starts hidden background processes, verifies readiness, checks occupied ports, and stops only recorded process ids whose creation timestamps still match. It does not change system configuration or install services.

## File changes

| Area                      | Created or updated                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository                | Updated `README.md`; added `.gitignore`, `.nvmrc`, `Start-Apps.ps1`                                                                                                 |
| Both apps                 | Added `package.json`, `package-lock.json`, `index.html`, `public/favicon.svg`, `vite.config.js`, `eslint.config.js`, `playwright.config.js`, individual `README.md` |
| Chat source               | `App.jsx`, `Composer.jsx`, `Message.jsx`, `Icon.jsx`, `chat.js`, `main.jsx`, `styles.css`                                                                           |
| Gallery source            | `App.jsx`, `usePhotoFeed.js`, `api.js`, `PhotoCard.jsx`, `PhotoImage.jsx`, `PhotoDialog.jsx`, `main.jsx`, `styles.css`                                              |
| Tests                     | Each app's `src/App.test.jsx`, `src/test/setup.js`, and `e2e/*.spec.js`                                                                                             |
| Documentation             | Requirements, roadmap, implementation decisions, verification results, validation logs, screenshots, upstream README copy                                           |
| Generated local artifacts | Separate `node_modules/` and `dist/` directories, ignored local server logs; these are excluded from the submission ZIP                                             |

## Deliberate scope boundaries

The two selected chat stretch goals are emoji and mentions. The optional Socket.IO/Express service is not implemented. There is no authentication, remote message delivery, database, gallery persistence, collection filtering, or unrelated social feature. The infinite feed accumulates items in memory; a production service with an extremely large corpus could introduce virtualization, but it would add unnecessary complexity here.

The only outstanding integration verification is successful access to the live Picsum service from this computer. The service timed out outside the app as well as inside it. Controlled browser and integration tests cover its expected contracts; this does not establish live service availability. See `VERIFICATION.md` for the precise evidence and recheck procedure.

No push, pull request, public repository creation, deployment, or email was performed.
