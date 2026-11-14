# Requirements and implementation plan

## Investigation

Upstream: https://github.com/exact-space/react-assignments, commit `067019d`.
All eight tracked files and the eleven-commit history were inventoried. There is no starter application, package manifest, existing test suite, or backend. The two Markdown briefs define independent applications. The GIFs are identical chat references; the gallery JPG and PNG are reference layouts. Issue #1 reports inability to open the gallery reference, rather than an application defect. The local JPG opens successfully.

The request to complete both projects and keep work local takes precedence over the gallery brief's instruction to publish and email a repository. No publication or email is part of this implementation.

## Chat application

- Required: one-page React app; text entry; send button; message thread above composer; random author from Alan, Bob, Carol, Dean, Elin; a right-aligned like button and visible count per message; every click increments.
- Selected optional goals: emoji picker and @mentions. Socket.IO is optional and outside this client-only implementation.
- Components: application shell, message list, message item, composer, emoji/mention controls.
- Model: `{id, text, author, createdAt, likes}`; React state and validated local storage. No authentication or actual remote participants implied.
- Interactions: submit with button or Enter; Shift+Enter newline; whitespace rejection; 2,000-character maximum; random author at submission; independent repeated likes; insert emoji or user at cursor; persistent messages and likes.
- Edge cases: invalid/unavailable storage, long unbroken content, empty thread, keyboard composition, focus retention, narrow screens.

## Photo gallery

- Required: one-page React app; single column resembling the supplied reference, image on left and author/like on right; fetch sequential Picsum `/v2/list?page=N` feeds; append as the bottom is approached; stop only on an empty page; use `download_url` and `author`; Font Awesome thumbs-up; counters start at zero and increment on every click.
- Components: gallery shell, photo row, image preview, paginated feed hook, API adapter.
- Model: validated photo metadata keyed by id, independent like counters; current page, loading/error/end status. Session state only, so new visits start at zero.
- API: public Picsum HTTPS API, no credentials. Abort outstanding requests on unmount; serialize requests; reject malformed payloads; deduplicate repeated ids without treating overlaps as end-of-feed; retry the same failed page.
- Interactions: automatic IntersectionObserver loading, manual load-more fallback, retry, repeated likes, keyboard-accessible image preview.
- Edge cases: delayed/failed requests, invalid metadata, duplicate photos, empty first/final page, broken images, reduced motion, no IntersectionObserver, mobile layouts.

## Quality and milestones

1. Preserve briefs and references; establish independent packages and lockfiles.
2. Implement both required flows and selected chat enhancements.
3. Add responsive styling, semantic controls, keyboard focus, polite status messages, loading/error/empty states.
4. Run component/integration tests for actual interactions and state transitions, browser tests for both apps, live Picsum checks, desktop/mobile visual review, production builds and dependency audits.
5. Record verification results, limitations, file changes, and requirement coverage; provide separate setup instructions and local Windows launch support.

Use React, Vite, Vitest/Testing Library, Playwright and CSS. Keep runtime state local; no backend, account, secret, shared package workspace, or deployment is necessary.
