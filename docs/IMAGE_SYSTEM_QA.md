# Image System QA

Manual + automated checks for the dream-cover and profile-photo system.

## Automated (smoke.mjs)

The Playwright smoke test (`webapp/smoke.mjs`) asserts:
- The cover picker is offered on the first-goal step ("Add a cover…").
- The profile photo affordance is present and labelled ("Change profile photo").

Run: build with `NITRO_PRESET=node-server`, start `.output/server/index.mjs` on
127.0.0.1:3000, then `node smoke.mjs`. Expect `ISSUES: ✅ none`.

## Manual matrix

| # | Scenario | Expected |
|---|----------|----------|
| 1 | First goal → Add a cover → Suggested | India-relevant thumbnails for the goal theme; tap → cover set on dream |
| 2 | Add a cover → Search "Goa beach" → pick | Query returns images; pick sets cover |
| 3 | Add a cover → Upload / Camera → choose file | Cropper opens; zoom + move; "Use photo" sets cover |
| 4 | Camera capture (mobile) | OS camera permission prompt; captured photo → cropper |
| 5 | Home hero + collection cards | Show the chosen cover for the active/other dreams |
| 6 | Future screen dream card | Thumbnail shows cover; ✎ badge opens picker to change/remove |
| 7 | Profile photo → Upload | Cropper (1:1); sets round avatar |
| 8 | Profile photo → Remove | Reverts to initials (never a stock face) |
| 9 | Reload after setting cover + photo | Both persist (localStorage) |
| 10 | Restart browser / offline | Both persist; remote covers fall back to gradient+emoji if URL fails |
| 11 | Private window / quota full | No crash; defaults render (try/catch around storage) |

## Privacy checks

- Uploaded/captured images never hit the network (verify: no upload request in
  devtools when choosing a gallery photo).
- Profile "Suggested"/"Search" tabs are not available — profile photo is the
  user's own image or initials only.
- Removing a photo clears it from state.

## Known acceptable console noise

In the sandboxed preview, remote image hosts fail with `ERR_CERT_AUTHORITY_INVALID`
/ `ERR_TUNNEL_CONNECTION_FAILED` through the agent proxy. These resolve in a real
browser; the `Img` fallback covers them regardless.
