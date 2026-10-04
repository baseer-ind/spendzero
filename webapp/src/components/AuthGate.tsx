import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { SelflyMark, SelflyGlyph } from "@/components/brand/SelflyMark";

/**
 * Gates the whole app behind account creation / sign-in. Until the viewer has
 * an account (device-local for the beta), they see the welcome + auth screen.
 * SSR-safe: before hydration we render a branded splash (same on server and
 * first client paint) to avoid a flash or hydration mismatch.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { hydrated, authed } = useStore();

  if (!hydrated) return <Splash />;
  if (!authed) return <AuthScreen />;
  return <>{children}</>;
}

function Splash() {
  return (
    <div className="min-h-screen bg-background text-foreground grid place-items-center">
      <div className="flex flex-col items-center gap-4 animate-rise">
        <SelflyGlyph size={52} />
        <SelflyMark size={26} showSpark={false} />
      </div>
    </div>
  );
}

export function AuthScreen() {
  const { register, login, recoverPassword, cloudEnabled } = useStore();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const res =
      mode === "signup"
        ? await register({ name, email, password })
        : await login({ email, password });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    if (res.ok && res.pendingVerification) {
      setMode("signin");
      setNotice("Almost there — we've emailed you a verification link. Verify, then sign in.");
      return;
    }
    // on success the gate re-renders into the app automatically
  }

  async function forgot() {
    setError(null);
    setNotice(null);
    if (!cloudEnabled) { setError("Password recovery needs the cloud account system."); return; }
    setBusy(true);
    const res = await recoverPassword(email);
    setBusy(false);
    if (res.ok) setNotice("Check your email for a link to reset your password.");
    else setError(res.error ?? "Couldn't send the reset email.");
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen overflow-hidden grain">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 55% at 50% 0%, oklch(0.79 0.105 82 / 0.14), transparent 60%), radial-gradient(90% 40% at 20% 100%, oklch(0.72 0.14 248 / 0.10), transparent 70%)",
          }}
        />

        <div className="px-7 pt-20 pb-8">
          <SelflyGlyph size={46} />
          <div className="mt-6">
            <SelflyMark size={18} showSpark={false} />
          </div>
          <h1 className="font-display text-[38px] leading-[1.05] mt-3 text-balance">
            {mode === "signup" ? (
              <>
                Save your
                <br />
                <span className="italic text-shimmer-gold">SELFly profile.</span>
              </>
            ) : (
              <>
                Welcome back to
                <br />
                <span className="italic text-shimmer-gold">your future.</span>
              </>
            )}
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground max-w-[32ch]">
            {mode === "signup"
              ? "Create an account to keep your pattern, your dreams and your progress — on any device."
              : "Every craving you skip moves the money you'd have spent toward your dreams."}
          </p>
        </div>

        <div className="px-7">
          {mode === "signup" && (
            <Field
              label="Your name"
              value={name}
              onChange={setName}
              placeholder="Aarav"
              autoComplete="name"
            />
          )}
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@email.com"
            type="email"
            autoComplete="email"
          />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="At least 6 characters"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            onEnter={submit}
          />

          {error && <p className="mt-4 text-[13px] text-destructive">{error}</p>}
          {notice && <p className="mt-4 text-[13px] text-gold">{notice}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="mt-6 h-13 w-full rounded-full py-4 text-center font-medium text-background disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, oklch(0.92 0.09 84), oklch(0.72 0.12 80))",
            }}
          >
            {busy ? "One moment…" : mode === "signup" ? "Create my account" : "Sign in"}
          </button>

          {mode === "signin" && cloudEnabled && (
            <button onClick={forgot} disabled={busy} className="mt-4 w-full text-center text-[12px] text-foreground/45">
              Forgot password? <span className="text-gold">Reset it</span>
            </button>
          )}

          <button
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError(null);
              setNotice(null);
            }}
            className="mt-5 w-full text-center text-[13px] text-foreground/60"
          >
            {mode === "signup" ? (
              <>Already have an account? <span className="text-gold">Sign in</span></>
            ) : (
              <>New here? <span className="text-gold">Create an account</span></>
            )}
          </button>

          <p className="mt-8 text-center text-[11px] leading-relaxed text-foreground/35">
            {cloudEnabled
              ? "Your account is secured by Supabase. No real money ever moves — shopping is simulated."
              : "Your account is stored on this device for now. No real money ever moves."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  onEnter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  onEnter?: () => void;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] outline-none placeholder:text-foreground/30 focus:border-gold/50"
      />
    </label>
  );
}
