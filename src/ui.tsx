import type { InputHTMLAttributes, ReactNode } from "react";
import { ArrowLeft, Check, CircleCheck, HeartPulse, OctagonAlert, ShoppingBag, TriangleAlert } from "lucide-react";
import { tierMeta, tierOf, type Metric, type Tier } from "./data";
import { useT } from "./i18n";

export type Page =
  | "welcome" | "login" | "register" | "home" | "profile" | "quiz" | "quizResult" | "catalog"
  | "labs" | "checkout" | "tracking" | "result" | "timeline";

export function Button({ children, variant = "primary", className = "", disabled, onClick, type = "button" }: {
  children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; className?: string; disabled?: boolean; onClick?: () => void; type?: "button" | "submit";
}) {
  const v = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-[0_6px_16px_-6px_rgba(31,90,196,.7)]",
    secondary: "border border-brand-200 bg-white text-brand-800 hover:bg-brand-50",
    ghost: "text-brand-700 hover:bg-brand-50",
    danger: "bg-bad-solid text-white hover:bg-bad",
  }[variant];
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-[15px] font-bold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45 ${v} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-line bg-white p-5 shadow-[0_1px_0_rgba(13,27,46,.03)] ${className}`}>{children}</section>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-600">{children}</p>;
}

export function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`font-display text-[30px] font-semibold leading-[1.1] lg:text-[44px] tracking-tight text-ink ${className}`}>{children}</h1>;
}

export function TierBadge({ tier, size = "md" }: { tier: Tier; size?: "sm" | "md" | "lg" }) {
  const t = useT();
  const m = tierMeta[tier];
  const Icon = tier === "green" ? CircleCheck : tier === "amber" ? TriangleAlert : OctagonAlert;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${m.bg} ${m.text} ${m.border} font-bold ${size === "sm" ? "px-2.5 py-1 text-[11px]" : size === "lg" ? "whitespace-nowrap px-3 py-1.5 text-sm" : "px-3.5 py-1.5 text-xs"}`}>
      <Icon size={size === "sm" ? 13 : size === "lg" ? 17 : 15} strokeWidth={2.5} /> {t(m.en)}
    </span>
  );
}

export const stages = ["Pahami", "Rencanakan", "Koordinasi", "Pantau", "Tindak lanjut"];
export const stageOf: Partial<Record<Page, number>> = { quiz: 0, quizResult: 0, labs: 1, catalog: 1, checkout: 2, tracking: 3, result: 4, timeline: 4 };

export function JourneyBar({ stage }: { stage: number }) {
  const t = useT();
  return (
    <div className="flex items-center gap-1.5" aria-label={t(`Langkah ${stage + 1} dari 5: ${stages[stage]}`, `Step ${stage + 1} of 5: ${t(stages[stage])}`)}>
      {stages.map((s, i) => (
        <div key={s} className="flex-1">
          <div className={`h-1.5 rounded-full ${i < stage ? "bg-brand-600" : i === stage ? "bg-brand-500" : "bg-brand-100"}`} />
          <p className={`mt-1.5 hidden truncate text-[10px] font-bold uppercase tracking-wide sm:block ${i === stage ? "text-brand-700" : "text-mute"}`}>{t(s)}</p>
        </div>
      ))}
    </div>
  );
}

export function Avatar({ name, src, size = "sm" }: { name: string; src?: string; size?: "sm" | "lg" }) {
  const t = useT();
  const initials = name.split(" ").filter(Boolean).map((word) => word[0]).slice(0, 2).join("").toUpperCase() || "?";
  const sizing = size === "lg" ? "size-24 text-2xl" : "size-10 text-sm";
  return src ? (
    <img src={src} alt={t(`Profil ${name || "Pengguna"}`, `${name || "User"} profile`)} className={`${sizing} rounded-full object-cover ring-2 ring-white/70`} />
  ) : (
    <span className={`grid ${sizing} place-items-center rounded-full bg-brand-100 font-extrabold text-brand-800 ring-2 ring-white/70`}>{initials}</span>
  );
}

export function SiteHeader({ page, go, cartCount, name, avatar, isRegistered }: { page: Page; go: (p: Page) => void; cartCount: number; name: string; avatar?: string; isRegistered: boolean }) {
  const t = useT();
  const landing = page === "welcome";
  const links: { page: Page; label: string }[] = [
    { page: "home", label: t("Dashboard", "Dashboard") },
    { page: "quiz", label: t("Cek Kesehatan", "Health Check") },
    { page: "labs", label: t("Tes", "Tests") },
    { page: "tracking", label: t("Lacak Pesanan", "Track Order") },
    { page: "timeline", label: t("Linimasa", "Timeline") },
  ];
  const group = (p: Page): Page => (p === "quizResult" ? "quiz" : p === "catalog" || p === "checkout" ? "labs" : p === "result" ? "timeline" : p);
  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur print:hidden ${landing ? "border-white/10 bg-brand-900/90 text-white" : "border-line bg-white/90"}`}>
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-6 px-6 lg:px-10">
        <button onClick={() => go(isRegistered ? "home" : "welcome")} className="flex items-center gap-2.5" aria-label={t("Beranda Cek Sehat", "Cek Sehat home")}>
          <span className={`grid size-10 place-items-center rounded-2xl ${landing ? "bg-white text-brand-700" : "bg-brand-600 text-white"}`}><HeartPulse size={21} strokeWidth={2.5} /></span>
          <span className="font-display text-xl font-semibold">Cek Sehat</span>
        </button>
        {isRegistered && !landing && (
          <nav className="hidden items-center gap-1 md:flex" aria-label={t("Utama", "Main")}>
            {links.map((l) => {
              const on = group(page) === l.page;
              return <button key={l.page} onClick={() => go(l.page)} aria-current={on ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${on ? "bg-brand-100 text-brand-800" : "text-mute hover:bg-brand-50 hover:text-ink"}`}>{l.label}</button>;
            })}
          </nav>
        )}
        <div className="flex items-center gap-2">
          {isRegistered && !landing ? (
            <>
              <button onClick={() => go("profile")} className="rounded-full" title={t("Buka profil", "Open profile")} aria-label={t("Buka profil", "Open profile")}>
                <Avatar name={name} src={avatar} />
              </button>
            </>
          ) : (
            <>
              {page !== "login" && <Button variant={landing ? "secondary" : "ghost"} className="min-h-10 !px-4 !text-sm" onClick={() => go("login")}>{t("Masuk", "Sign in")}</Button>}
              {page !== "register" && <Button className="min-h-10 !px-5 !text-sm" onClick={() => go("register")}>{landing ? t("Mulai", "Get started") : t("Buat akun", "Create account")}</Button>}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function FlowHeader({ onBack }: { page: Page; onBack: () => void }) {
  const t = useT();
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-6 lg:px-10 print:hidden">
      <button onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:border-brand-200 hover:bg-brand-50">
        <ArrowLeft size={17} /> {t("Kembali", "Back")}
      </button>
    </div>
  );
}

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="mt-16 border-t border-line bg-white print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 py-8 text-sm text-mute md:flex-row lg:px-10">
        <p className="flex items-center gap-2 font-semibold text-ink"><HeartPulse size={16} className="text-brand-600" /> Cek Sehat</p>
        <p>{t("Hasil skrining bukan diagnosis. Selalu konsultasikan dengan dokter berlisensi. Situs demo dengan data contoh.", "Screening results are not a diagnosis. Always consult a licensed doctor. This is a demo site with sample data.")}</p>
      </div>
    </footer>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[15px] text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputCls} ${className}`} {...props} />;
}

export function Check2({ on }: { on: boolean }) {
  return (
    <span className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white"}`}>
      {on && <Check size={14} strokeWidth={3.5} />}
    </span>
  );
}

export type GaugeM = Pick<Metric, "name" | "unit" | "min" | "max" | "segments">;
export function Gauge({ m, value }: { m: GaugeM; value: number }) {
  const t = useT();
  const cx = 130, cy = 120, r = 92;
  const frac = (v: number) => Math.min(1, Math.max(0, (v - m.min) / (m.max - m.min)));
  const pt = (f: number, rad = r) => { const a = Math.PI * (1 - f); return [cx + rad * Math.cos(a), cy - rad * Math.sin(a)]; };
  const arc = (a: number, b: number) => { const [x1, y1] = pt(a), [x2, y2] = pt(b); return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`; };
  const f = frac(value); const [nx, ny] = pt(f, r - 30); const tier = tierOf(m, value);
  return (
    <svg viewBox="0 0 260 150" className="mx-auto w-full max-w-[320px]" role="img" aria-label={`${t(m.name)}: ${value} ${m.unit}, ${t(tierMeta[tier].en)}`}>
      {m.segments.map((s, i) => (
        <path key={i} d={arc(frac(s.from) + 0.004, frac(s.to) - 0.004)} fill="none" stroke={tierMeta[s.tier].hex} strokeWidth={20} />
      ))}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#0d1b2e" strokeWidth={4} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={9} fill="#0d1b2e" /><circle cx={cx} cy={cy} r={3.5} fill="white" />
      <text x={cx - r} y={cy + 20} textAnchor="middle" fontSize="10" fill="#56667b" fontWeight="600">{m.min}</text>
      <text x={cx + r} y={cy + 20} textAnchor="middle" fontSize="10" fill="#56667b" fontWeight="600">{m.max}</text>
    </svg>
  );
}

