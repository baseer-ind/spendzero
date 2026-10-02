# User Image Privacy

Rules for photos a user brings to Project Future (profile photo, dream covers
uploaded from gallery or camera).

## Principles

1. **On-device only.** An uploaded or captured photo is read with `FileReader`
   into a `data:` URL and stored in the browser's localStorage. It is **never
   uploaded to any server** — not ours, not a third party. There is no backend
   image store in this build.
2. **No stranger's face.** A profile photo can only be the user's own uploaded
   or captured image, or their initials. We never assign a random stock person's
   face as a profile picture. The curated/search image sources are disabled for
   the `profile` kind in the picker.
3. **User-controlled.** Every photo can be changed or removed from the same
   picker (`onRemove`). Removing a profile photo reverts to initials; removing a
   cover reverts to the goal emoji / default art.
4. **Minimal footprint.** Uploaded images are downscaled and JPEG-compressed in
   the canvas cropper (`cropToDataURL`, ~800px, quality 0.82) before storage, so
   `data:` URLs stay small enough for localStorage quota.

## Permissions

- Gallery: a normal file input (`accept="image/*"`).
- Camera: a file input with `capture="environment"`; the browser/OS prompts for
  camera permission. We request nothing until the user taps "Take a photo".

## What we store

| Item | Where | Leaves device? |
|------|-------|----------------|
| Profile photo | `state.profilePhoto` (localStorage) | No |
| Dream cover (uploaded) | `dream.cover` as `data:` URL | No |
| Dream cover (curated/search) | `dream.cover` as remote URL | It's a public image URL; the photo itself was never the user's |

## Resilience

All localStorage reads/writes are wrapped in try/catch; a private-mode or
quota-exceeded failure degrades to defaults rather than crashing. Images that
fail to load fall back via the `Img` component.
