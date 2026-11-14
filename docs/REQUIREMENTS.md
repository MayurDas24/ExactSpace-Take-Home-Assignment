# Requirement-by-requirement review

Sources: `chat-app/reactjs_chat_assignment.md`, `photo-gallery/reactjs_photo_gallery_assignment.md`, their visual references, and the user's explicit requirement to deliver both independent applications without publishing.

## Chat application

| Requirement                                | Implementation and evidence                                                         | Status       |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | ------------ |
| Single-page React app                      | Independent React/Vite package; browser launch verified                             | Complete     |
| Textbox and send button                    | Labeled textarea, functional submit button, Enter support                           | Complete     |
| Messages above textbox                     | Scrollable message thread above composer                                            | Complete     |
| Random username per message                | Uniform sample from Alan, Bob, Carol, Dean, Elin; boundary test covers all five     | Complete     |
| Like button at right of each message       | `Message.jsx`, independent functional updates                                       | Complete     |
| Visible count and increment on every click | Repeated-click component and browser tests; starts at zero                          | Complete     |
| Emoji options (optional)                   | Accessible picker inserts at cursor                                                 | Complete     |
| @mentions (optional)                       | Button lists users; typing filters; keyboard selection and highlighting             | Complete     |
| Socket.IO/Express pub/sub (optional)       | Client-only implementation; two other stretch goals selected                        | Not selected |
| Reference-inspired thread                  | Avatars, author/time, bubbles, composer; unnecessary channel sidebar omitted        | Complete     |
| Validation and persistence                 | Blank/oversize rejection, safe rendering, validated browser storage, failure notice | Complete     |

## Photo gallery

| Requirement                                        | Implementation and evidence                                                 | Status                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| Single-page React app                              | Independent React/Vite package; browser launch verified                     | Complete                                                |
| One column resembling reference                    | Image at left, author and likes at right; desktop/mobile review             | Complete                                                |
| Use `download_url` and `author`                    | Validated metadata drives image, original link, credit, and heading         | Complete                                                |
| Fetch paginated Picsum feed                        | Requests `/v2/list?page=N`, beginning at 1; contract tests assert URLs      | Implemented; live service recheck outstanding           |
| Load next page near bottom                         | IntersectionObserver with 300px prefetch margin; browser scroll test        | Complete                                                |
| Append, retain existing photos                     | Ordered unique append; previous counts retained                             | Complete                                                |
| Continue until an empty page                       | End state only on empty array; overlapping-only pages keep progressing      | Complete                                                |
| Font Awesome thumbs-up                             | `faThumbsUp` with bundled React Font Awesome component                      | Complete                                                |
| Counts initialized to zero                         | Session state defaults each image to zero                                   | Complete                                                |
| Every click increases count                        | Per-photo repeated-click tests; not a toggle                                | Complete                                                |
| Loading, failure, empty states                     | Skeleton, timeout/HTTP/network/payload errors, retry, empty/end UI          | Complete                                                |
| Recover failed images                              | Per-image error state and retry, verified in browser                        | Complete                                                |
| Open photo preview                                 | Native modal, Escape/close, focus restoration, original link                | Complete                                                |
| Real photos successfully render from live endpoint | Service timed out in browser and independent HTTPS clients                  | Not verified — external connectivity/service limitation |
| Public repo and email submission from brief        | User explicitly prohibited pushing without permission; no publication/email | Intentionally pending user action                       |

## Combined deliverables

| Deliverable                                           | Evidence                                                                                  | Status                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------- |
| Full local clone named `exact-space-react-assignment` | Original Git history and references retained                                              | Complete                                 |
| Both projects independently installed                 | Separate manifests, lockfiles, clean installs and configurations                          | Complete                                 |
| Both applications runnable locally                    | Ports 5173 and 5174; optional Windows start/stop helper                                   | Complete                                 |
| Responsive, keyboard-usable interfaces                | Desktop/tablet/mobile review; 320/390/768px overflow checks; automated accessibility scan | Complete                                 |
| Tests and production builds for both                  | Component/model tests, production Chrome tests, lint and builds                           | Complete; see verification log           |
| Dependency review                                     | Full npm audit for each package                                                           | Complete; see verification log           |
| Separate setup/run documentation                      | Root README plus both application READMEs                                                 | Complete                                 |
| Final requirement review                              | This document and verification report                                                     | Complete with live-service qualification |
| Complete successful live acceptance                   | Requires Picsum API and image service to respond from the review machine                  | Outstanding external recheck             |

All mandatory code paths are implemented. The controlled tests and builds are complete; live Picsum success cannot honestly be marked verified while the prescribed external endpoint is unreachable.
