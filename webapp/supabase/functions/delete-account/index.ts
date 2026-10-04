import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * SELFly — account deletion (server-side).
 *
 * Deletes the caller's data, their Storage media, and finally their Supabase
 * Auth user. The service-role key is used ONLY here, inside the Edge Function;
 * it is never exposed to the browser. verify_jwt is enabled, so only an
 * authenticated caller reaches this code, and we delete exactly that user.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // Identify the caller from their JWT.
    const asUser = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userErr } = await asUser.auth.getUser();
    const uid = userData?.user?.id;
    if (userErr || !uid) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const admin = createClient(url, serviceRole);

    // 1) data rows
    await Promise.all([
      admin.from("decisions").delete().eq("user_id", uid),
      admin.from("dreams").delete().eq("user_id", uid),
      admin.from("achievements").delete().eq("user_id", uid),
      admin.from("consumption_sessions").delete().eq("user_id", uid),
      admin.from("profiles").delete().eq("user_id", uid),
    ]);

    // 2) storage media
    for (const sub of ["profile", "dreams"]) {
      const { data: files } = await admin.storage.from("user-media").list(`${uid}/${sub}`);
      if (files?.length) {
        await admin.storage.from("user-media").remove(files.map((f) => `${uid}/${sub}/${f.name}`));
      }
    }

    // 3) the auth user itself
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) {
      return new Response(JSON.stringify({ error: delErr.message }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
