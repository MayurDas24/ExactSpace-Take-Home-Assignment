# Verification report

Verification date: **14 November 2026 (Asia/Calcutta)**. The final clean-install verification ran on Windows with Node **22.16.0**, npm **10.9.2**, and installed Google Chrome. Node **24.22.1** was also used during development checks.

## Final automated results

| Check                                             | Chat app                              | Photo gallery                           |
| ------------------------------------------------- | ------------------------------------- | --------------------------------------- |
| Independent `npm ci`                              | Passed                                | Passed                                  |
| `npm run lint`                                    | Passed, no findings                   | Passed, no findings                     |
| `npm test`                                        | **7 / 7 passed**                      | **11 / 11 passed**                      |
| `npm run build`                                   | Passed                                | Passed                                  |
| `npm run test:e2e` in Chrome, production build    | **2 / 2 passed**                      | **2 / 2 passed**                        |
| `npm audit` including development dependencies    | **0 vulnerabilities**                 | **0 vulnerabilities**                   |
| JavaScript errors in successful browser workflows | None observed                         | None observed with controlled responses |
| Browser console errors in final visual review     | None observed                         | None observed with controlled responses |
| Axe WCAG 2 A/AA and 2.1 AA automated scan         | 0 violations in reviewed conversation | 0 violations in reviewed feed and modal |
| Horizontal overflow at 320, 390, 768px            | None                                  | None                                    |
| Start/stop/restart via Windows helper             | Passed                                | Passed                                  |

Raw final command logs: [chat](chat-app-validation.txt), [gallery](photo-gallery-validation.txt). Browser/viewport/accessibility findings are recorded in [browser-review.json](browser-review.json). Automated accessibility checks complement, but do not replace, a full assistive-technology review.

The only emitted process warning during browser tests was the test runner's `NO_COLOR`/`FORCE_COLOR` environment conflict. It concerns terminal coloring, not application behavior. Application lint, test, build and audit commands completed successfully.

## Production output

| Asset      | Chat                      | Gallery                   |
| ---------- | ------------------------- | ------------------------- |
| HTML       | 0.57 kB / 0.37 kB gzip    | 0.62 kB / 0.40 kB gzip    |
| CSS        | 9.17 kB / 2.86 kB gzip    | 10.17 kB / 2.92 kB gzip   |
| JavaScript | 232.95 kB / 73.33 kB gzip | 328.17 kB / 98.25 kB gzip |

Each app has its own generated `dist/`. Production browser tests start Vite preview against those actual build files on ports 6173/6174, rather than only testing a development render.

## Covered behavior

Chat checks exercise blank input rejection, allowed random-author assignment, every username boundary, trimming and length limits, independent repeated likes, button and Enter submission, multiline entry, IME protection, emojis, typed/button mentions, keyboard selection, safe rendered text, storage restoration/corruption/failure, focus, persistence after reload, and long mobile content.

Gallery checks exercise ordered page requests, append and deduplication, duplicate-only pages, independent repeated likes, single in-flight requests, HTTP failure and same-page retry, network failure, empty first/final pages, malformed/unsafe metadata rejection, image resize derivation, broken-image recovery, manual pagination fallback, unmount cancellation, timeouts, stale-response protection under StrictMode, automatic scrolling, native dialog Escape and focus restoration, and mobile layout.

Deterministic tests intercept the external API and images. This allows reproducible success, empty, invalid, slow, and failure conditions without depending on third-party uptime. It is not a claim that those responses came from the live service.

## Live Picsum integration — outstanding external recheck

The prescribed endpoint `https://picsum.photos/v2/list?page=1` did **not** return a successful response during verification on this computer:

1. The actual React application reached its 15-second timeout and displayed the retry state.
2. An independent PowerShell HTTPS request timed out after 20 seconds.
3. Direct IPv4 curl checks against the API and image endpoint timed out after 12 seconds without receiving bytes.
4. DNS resolved the public service addresses. Two alternative addresses from that same DNS result were tried directly with the original HTTPS host; both timed out after 8 seconds.
5. An independent web retrieval attempt also failed to access the service.

This establishes an external reachability problem during testing; it does **not** establish whether the cause is regional routing, network policy, or service availability. It was not an observed CORS response: no API response arrived. No system DNS, proxy, firewall, browser security, or production data source was changed.

The implementation still uses the assignment's actual endpoint. It handles the timeout, offers a retry, and has no silent mock-data fallback. **Successful live photo rendering, live pagination, and live CORS behavior remain unverified.** This is the remaining qualification before calling the entire assignment's live acceptance fully verified.

To complete the external recheck:

1. Open `https://picsum.photos/v2/list?page=1` from the review computer and confirm a JSON array is returned.
2. Open the gallery at http://127.0.0.1:5174 and choose **Try again** if necessary.
3. Confirm real photos and authors render; scroll down until the next page appends; click a like twice; open and close a photo preview.
4. If the endpoint remains unreachable, retry after service/network connectivity is restored. Do not disable CORS protections or present fixture screenshots as live verification.

## Visual evidence

- [Chat desktop](screenshots/chat-desktop.png) and [mobile](screenshots/chat-mobile.png): actual locally submitted messages, no seeded production conversation.
- [Gallery desktop](screenshots/gallery-fixture-desktop.png), [mobile](screenshots/gallery-fixture-mobile.png), and [preview](screenshots/gallery-fixture-preview.png): clearly labeled generated test images injected only in the QA browser.
- [Live gallery timeout](screenshots/gallery-network-check.png): the actual observed service-error state.

The original reference images were inspected before implementation. The final desktop/mobile layouts and modal screenshots were inspected after implementation. Contrast defects found during the first automated visual review were corrected and rescanned successfully.

## Local handoff

Both development servers were restarted and left running on `127.0.0.1:5173` and `127.0.0.1:5174`. The start/stop helper was tested by starting both, stopping both, confirming the ports were free, and starting them again. No global npm package, service, system configuration, GitHub repository, remote branch, deployment, or email was changed.

The submission ZIP contains both source projects, separate lockfiles, original briefs/reference assets, documentation, tests, and screenshots. It excludes `.git`, `node_modules`, generated `dist`, temporary server state, and test-run caches. The complete local clone retains its Git history and installed dependencies.
