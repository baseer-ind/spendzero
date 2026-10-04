import { supabase, MEDIA_BUCKET } from "./supabase";
import type { Profile } from "./assessment";

/**
 * Cloud sync for SELFly (Supabase Postgres + Storage). All writes are
 * best-effort and owner-scoped by RLS. Photos go to private Storage; structured
 * data to normalised tables. The local store stays the in-session source of
 * truth and offline cache; these helpers push/pull and migrate.
 *
 * Nothing here ever touches a service-role key — only the authed user's session.
 */

export type CloudDream = {
  id: string; name: string; emoji: string; target: number; saved: number; cover?: string;
};
export type CloudDecision = {
  id: string; category: string; amount: number; trigger: string;
  choice: "enjoyed" | "redirected"; dreamId?: string; at: number;
};
export type CloudSnapshot = {
  name: string | null;
  profile: Profile | null;
  profilePhoto: string | null;
  dreams: CloudDream[];
  decisionLog: CloudDecision[];
  storySeen: boolean;
  postGoalSeen: boolean;
};

/** Reject if a promise takes too long, so the UI never hangs on a slow backend. */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms)),
  ]);
}

function extFromDataUri(d: string): string {
  const m = /^data:image\/(png|jpeg|jpg|webp)/i.exec(d);
  return m ? (m[1].toLowerCase() === "jpeg" ? "jpg" : m[1].toLowerCase()) : "jpg";
}

function dataUriToBlob(d: string): Blob {
  const [head, b64] = d.split(",");
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function isStoragePath(v?: string | null): boolean {
  return !!v && !/^(data:|https?:|<svg|u_)/i.test(v);
}

/** Upload a data: image to the user's private media folder; return its path. */
async function uploadImage(uid: string, folder: string, name: string, dataUri: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const path = `${uid}/${folder}/${name}.${extFromDataUri(dataUri)}`;
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, dataUriToBlob(dataUri), { upsert: true, contentType: dataUriToBlob(dataUri).type });
    if (error) return null;
    return path;
  } catch {
    return null;
  }
}

async function signed(path: string): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve a local image ref to something storable in the DB:
 * - data: image  → upload to Storage, return its path
 * - URL / SVG / undefined → pass through unchanged
 */
async function coverToStored(uid: string, folder: string, name: string, resolved?: string): Promise<string | null> {
  if (!resolved) return null;
  if (/^data:image/i.test(resolved)) return await uploadImage(uid, folder, name, resolved);
  return resolved; // remote URL or SVG illustration
}

// ---- Auth ----

export type CloudAuthResult = { ok: true; uid: string } | { ok: false; error: string };

export async function cloudSignUp(name: string, email: string, password: string): Promise<CloudAuthResult> {
  if (!supabase) return { ok: false, error: "Cloud not configured." };
  let data, error;
  try {
    ({ data, error } = await withTimeout(
      supabase.auth.signUp({ email, password, options: { data: { name } } }),
      15000, "Sign up",
    ));
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
  if (error) {
    const msg = /registered|exists/i.test(error.message)
      ? "An account with this email already exists. Sign in instead."
      : error.message;
    return { ok: false, error: msg };
  }
  const uid = data.user?.id;
  if (!uid) return { ok: false, error: "Could not create the account. Try again." };
  // ensure a profile row exists (no reliance on a DB trigger)
  try { await supabase.from("profiles").upsert({ user_id: uid, name, email }, { onConflict: "user_id" }); } catch { /* best effort */ }
  return { ok: true, uid };
}

export async function cloudSignIn(email: string, password: string): Promise<CloudAuthResult> {
  if (!supabase) return { ok: false, error: "Cloud not configured." };
  let data, error;
  try {
    ({ data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }), 15000, "Sign in",
    ));
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
  if (error) return { ok: false, error: /invalid/i.test(error.message) ? "Wrong email or password." : error.message };
  const uid = data.user?.id;
  return uid ? { ok: true, uid } : { ok: false, error: "Sign in failed. Try again." };
}

export async function cloudSignOut(): Promise<void> {
  if (!supabase) return;
  try { await supabase.auth.signOut(); } catch { /* ignore */ }
}

export async function cloudRecover(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: "Cloud not configured." };
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function currentSession(): Promise<{ uid: string; name: string; email: string } | null> {
  if (!supabase) return null;
  try {
    const { data } = await withTimeout(supabase.auth.getSession(), 6000, "Session");
    const u = data.session?.user;
    if (!u) return null;
    return { uid: u.id, name: (u.user_metadata?.name as string) || "", email: u.email ?? "" };
  } catch {
    return null;
  }
}

// ---- Data: push ----

export async function pushProfile(uid: string, p: {
  name: string | null; email: string; profile: Profile | null;
  profilePhoto?: string; storySeen: boolean; postGoalSeen: boolean;
}): Promise<void> {
  if (!supabase) return;
  let photo_path: string | null | undefined = undefined;
  if (p.profilePhoto !== undefined) {
    photo_path = await coverToStored(uid, "profile", "avatar", p.profilePhoto);
  }
  const row: Record<string, unknown> = {
    user_id: uid,
    name: p.name ?? "",
    email: p.email,
    spending_profile: p.profile,
    onboarding_done: !!p.profile,
    prefs: { storySeen: p.storySeen, postGoalSeen: p.postGoalSeen },
    updated_at: new Date().toISOString(),
  };
  if (photo_path !== undefined) row.photo_path = photo_path;
  try { await supabase.from("profiles").upsert(row, { onConflict: "user_id" }); } catch { /* best effort */ }
}

export async function pushDream(uid: string, d: CloudDream): Promise<void> {
  if (!supabase) return;
  const cover_path = await coverToStored(uid, "dreams", d.id, d.cover);
  try {
    await supabase.from("dreams").upsert({
      id: d.id, user_id: uid, name: d.name, emoji: d.emoji,
      target: d.target, saved: d.saved, cover_path,
    }, { onConflict: "id" });
  } catch { /* best effort */ }
}

export async function deleteDreamCloud(id: string): Promise<void> {
  if (!supabase) return;
  try { await supabase.from("dreams").delete().eq("id", id); } catch { /* ignore */ }
}

export async function pushDecision(uid: string, d: CloudDecision): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("decisions").upsert({
      id: d.id, user_id: uid, category: d.category, amount: d.amount,
      choice: d.choice, trigger: d.trigger, dream_id: d.dreamId ?? null,
      created_at: new Date(d.at).toISOString(),
    }, { onConflict: "id" });
  } catch { /* best effort */ }
}

// ---- Data: pull ----

export async function pullSnapshot(uid: string): Promise<CloudSnapshot | null> {
  if (!supabase) return null;
  try {
    const [{ data: prof }, { data: dreams }, { data: decisions }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("dreams").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
      supabase.from("decisions").select("*").eq("user_id", uid).order("created_at", { ascending: true }),
    ]);

    const outDreams: CloudDream[] = [];
    for (const d of dreams ?? []) {
      let cover: string | undefined = d.cover_path ?? undefined;
      if (isStoragePath(d.cover_path)) cover = (await signed(d.cover_path)) ?? undefined;
      outDreams.push({ id: d.id, name: d.name, emoji: d.emoji ?? "✨", target: Number(d.target), saved: Number(d.saved), cover });
    }

    let profilePhoto: string | null = prof?.photo_path ?? null;
    if (isStoragePath(prof?.photo_path)) profilePhoto = (await signed(prof!.photo_path)) ?? null;

    const prefs = (prof?.prefs ?? {}) as { storySeen?: boolean; postGoalSeen?: boolean };
    return {
      name: prof?.name ?? null,
      profile: (prof?.spending_profile ?? null) as Profile | null,
      profilePhoto,
      dreams: outDreams,
      decisionLog: (decisions ?? []).map((x) => ({
        id: x.id, category: x.category ?? "", amount: Number(x.amount), trigger: x.trigger ?? "",
        choice: x.choice, dreamId: x.dream_id ?? undefined, at: new Date(x.created_at).getTime(),
      })),
      storySeen: prefs.storySeen ?? !!prof?.onboarding_done,
      postGoalSeen: prefs.postGoalSeen ?? !!prof?.onboarding_done,
    };
  } catch {
    return null;
  }
}

/** Delete all of the signed-in user's cloud rows and stored media (best effort). */
export async function deleteAllCloudData(uid: string): Promise<void> {
  if (!supabase) return;
  try {
    await Promise.all([
      supabase.from("decisions").delete().eq("user_id", uid),
      supabase.from("dreams").delete().eq("user_id", uid),
      supabase.from("achievements").delete().eq("user_id", uid),
      supabase.from("consumption_sessions").delete().eq("user_id", uid),
      supabase.from("profiles").delete().eq("user_id", uid),
    ]);
    // remove the user's media folder
    for (const sub of ["profile", "dreams"]) {
      const { data } = await supabase.storage.from(MEDIA_BUCKET).list(`${uid}/${sub}`);
      if (data?.length) {
        await supabase.storage.from(MEDIA_BUCKET).remove(data.map((f) => `${uid}/${sub}/${f.name}`));
      }
    }
  } catch {
    /* best effort */
  }
}

/** True if the user already has cloud data (so we pull instead of migrate-up). */
export async function hasCloudData(uid: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { count } = await supabase.from("dreams").select("id", { count: "exact", head: true }).eq("user_id", uid);
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}
