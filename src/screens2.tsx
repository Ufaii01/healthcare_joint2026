import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, Clock3, MapPin, Minus, Plus, ShieldCheck, Star, TriangleAlert, Wallet, X } from "lucide-react";
import { labPrice, labs, metrics, rp, testByKey, tests, type HistoryEntry, type Metric, type TestKey } from "./data";
import { locale, useLang, useT } from "./i18n";
import { usePeople } from "./members";
import { Button, Card, Check2, Eyebrow, Field, inputCls, Title, type Page } from "./ui";
import type { Profile } from "./screens1";

export type Booking = { date: string; slot: string; address: string; notes: string };
export const COLLECTION_FEE = 25000;

export type Courier = { name: string; role: string; plate: string; phone: string };
export type Qty = Partial<Record<TestKey, number>>;
export const qtyOf = (qty: Qty | undefined, k: TestKey) => qty?.[k] ?? 1;
export const unitsOf = (cart: TestKey[], qty?: Qty) => cart.reduce((s, k) => s + qtyOf(qty, k), 0);
export const MAX_QTY = 9;

type UnitSrc = { cart: TestKey[]; qty?: Qty; assign?: Partial<Record<TestKey, string[]>> };
export const orderUnits = (o: UnitSrc) => {
  const units = o.cart.flatMap((k) => Array.from({ length: qtyOf(o.qty, k) }, (_, i) => ({ key: k, i, owner: o.assign?.[k]?.[i] ?? "main" })));
  const show = units.length > 1 && (o.cart.some((k) => qtyOf(o.qty, k) > 1) || units.some((u) => u.owner !== "main"));
  return units.map((u) => ({ ...u, show: show || u.owner !== "main" }));
};
export const unitName = (u: { key: TestKey; owner: string; show: boolean }, tr: (id: string, en?: string) => string, nameOf: (id?: string) => string) =>
  tr(testByKey[u.key].tested) + (u.show ? ` (${nameOf(u.owner)})` : "");

const metricOf = (k: TestKey): Metric["key"] | null => (k === "anemia" ? "hemoglobin" : k === "urine" ? "urine" : k);
const jitter = { glucose: 4, cholesterol: 6, hemoglobin: 0.4, kidney: 0.05, urine: 4 } as const;
export function orderResults(orders: Order[], validOwners: Set<string>): HistoryEntry[] {
  return orders.filter((o) => o.step >= 5).flatMap((o) => {
    const lab = labs.find((l) => l.id === o.labId) ?? labs[0];
    return orderUnits(o).flatMap((u) => {
      const mk = metricOf(u.key); if (!mk || (u.owner !== "main" && !validOwners.has(u.owner))) return [];
      let h = 0; for (const ch of `${o.id}${u.key}${u.i}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      const tier = (["green", "green", "amber", "green", "red"] as const)[h % 5];
      const m = metrics[mk]; const j = jitter[mk] * (((h >> 3) % 5) - 2) / 2;
      const value = Number((m.samples[tier] + j).toFixed(m.decimals));
      return [{ id: `${o.id}-${u.key}-${u.i}`, date: o.date, label: testByKey[u.key].tested, metric: mk, value, lab: lab.name, owner: u.owner }];
    });
  });
}

export type Order = {
  names?: Record<string, string>;
  assign?: Partial<Record<TestKey, string[]>>;
  qty?: Qty; v?: number; id: string; createdAt: string; cart: TestKey[]; labId: string; date: string; slot: string;
  address: string; notes: string; pay: string; total: number; step: number; courier: Courier;
};
const couriers: Courier[] = [
  { name: "Budi Santoso", role: "Flebotomis", plate: "B 4281 KZI", phone: "+6281200000001" },
  { name: "Rina Kartika", role: "Flebotomis", plate: "B 3377 SFA", phone: "+6281200000002" },
  { name: "Agus Prasetyo", role: "Flebotomis", plate: "B 6109 UDR", phone: "+6281200000003" },
];

export function pricing(cart: TestKey[], labId: string, qty?: Qty) {
  const lab = labs.find((l) => l.id === labId) ?? labs[0];
  const tests_ = cart.reduce((s, k) => s + labPrice(labId, k) * qtyOf(qty, k), 0);
  const discount = unitsOf(cart, qty) >= 2 ? tests_ * 0.05 : 0;
  const fee = cart.length ? COLLECTION_FEE : 0;
  return { lab, tests: tests_, discount, fee, total: tests_ - discount + fee };
}

export function Catalog({ cart, setCart, qty, setQty, labId, go }: { cart: TestKey[]; setCart: (c: TestKey[]) => void; qty: Qty; setQty: (q: Qty) => void; labId: string; go: (p: Page) => void }) {
  const t = useT();
  const lab = labs.find((l) => l.id === labId) ?? labs[0];
  const available = tests.filter((x) => lab.tests.includes(x.key));
  const [ack, setAck] = useState(false);
  const toggle = (k: TestKey) => { setAck(false); setCart(cart.includes(k) ? cart.filter((x) => x !== k) : [...cart, k]); if (cart.includes(k)) setQty({ ...qty, [k]: 1 }); };
  const changeQty = (k: TestKey, d: number) => {
    const n = qtyOf(qty, k) + d;
    if (n < 1) return toggle(k);
    setQty({ ...qty, [k]: Math.min(MAX_QTY, n) });
  };
  const fasting = cart.filter((k) => testByKey[k].prep === "fasting");
  const normal = cart.filter((k) => testByKey[k].prep === "normal");
  const conflict = fasting.length > 0 && normal.length > 0;
  const total = cart.reduce((s, k) => s + labPrice(labId, k) * qtyOf(qty, k), 0);
  const units = unitsOf(cart, qty);
  const fastNames = fasting.map((k) => t(testByKey[k].tested)).join(" & ");
  const normalNames = normal.map((k) => t(testByKey[k].tested)).join(" & ");
  return (
    <div className="rise py-12">
      <Eyebrow>{t("Rencanakan kunjungan", "Plan your visit")}</Eyebrow>
      <Title className="mt-2">{t("Pilih pemeriksaan Anda", "Choose your tests")}</Title>
      <p className="mt-3 max-w-xl text-lg text-mute">{t("Tambahkan sebanyak yang Anda perlukan. Satu kali kunjungan petugas, satu kali pengambilan darah.", "Add as many as you need. One visit from our phlebotomist, one blood draw.")}</p>
      <p className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-4 pr-1.5 text-sm"><MapPin size={14} className="text-brand-600" /><span>{t("Pemeriksaan tersedia di", "Tests available at")} <strong>{lab.name}</strong></span><button className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100" onClick={() => go("labs")}>{t("Ganti lab", "Change lab")}</button></p>

      <div className="mt-9 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
      <div>
      {conflict && (
        <div role="alert" className={`mb-6 rounded-2xl border-2 p-4 ${ack ? "border-ok-solid bg-ok-bg" : "border-warn-solid bg-warn-bg"}`}>
          <div className="flex gap-3">
            {ack ? <Check className="mt-0.5 shrink-0 text-ok" strokeWidth={3} /> : <TriangleAlert className="mt-0.5 shrink-0 text-warn" />}
            <div>
              <p className={`font-extrabold ${ack ? "text-ok" : "text-warn"}`}>{ack ? t("Persiapan ditetapkan: puasa untuk semua pemeriksaan", "Preparation set: fasting for all tests") : t("Persiapan saling bertentangan", "Conflicting preparation")}</p>
              {ack ? (
                <p className="mt-1 text-sm leading-relaxed text-ok">{t("Kami akan mengingatkan Anda untuk berpuasa 10–12 jam dan hanya minum air putih, sesuai untuk semua pemeriksaan yang dipilih.", "We will remind you to fast for 10–12 hours and drink only water, which suits all of the selected tests.")}</p>
              ) : (
                <>
                  <p className="mt-1 text-sm leading-relaxed text-warn"><strong>{fastNames}</strong> {t("memerlukan puasa, tetapi", "requires fasting, but")} <strong>{normalNames}</strong> {t("mengharuskan Anda makan dan minum seperti biasa.", "requires you to eat and drink as usual.")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => setAck(true)} className="min-h-10 rounded-xl bg-warn px-4 text-[13px] font-bold text-white">{t("Puasa untuk semua (disarankan)", "Fast for all (recommended)")}</button>
                    <button onClick={() => setCart(cart.filter((k) => testByKey[k].prep !== "normal"))} className="min-h-10 rounded-xl border border-warn/40 bg-white px-4 text-[13px] font-bold text-warn">{t("Pesan terpisah", "Book separately")}</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {available.map((x) => {
          const on = cart.includes(x.key); const Icon = x.icon;
          return (
            <article key={x.key} className={`row-span-3 grid grid-rows-subgrid gap-y-3 rounded-3xl border-2 bg-white p-4 transition ${on ? "border-brand-600 shadow-[0_8px_24px_-12px_rgba(31,90,196,.5)]" : "border-line"}`}>
              <div className="flex items-start gap-4">
                <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${on ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-700"}`}><Icon size={26} /></span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-semibold leading-tight">{t(x.tested)}</h2>
                  <p className="mt-0.5 text-[13px] font-semibold text-brand-700">{t(x.testName)}</p>
                  <p className="mt-1.5 text-[13px] leading-snug text-mute">{t(x.blurb)}</p>
                </div>
              </div>
              <details className="group self-start rounded-xl bg-paper">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
                  {t("Detail", "Details")} <ChevronDown size={16} className="text-brand-600 transition group-open:rotate-180" />
                </summary>
                <div className="px-3 pb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-mute">{t("Sebelum pemeriksaan", "Before the test")}</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px] leading-snug text-ink marker:font-bold marker:text-brand-600">
                    {x.prereqs.map((r) => <li key={r}>{t(r)}</li>)}
                  </ol>
                </div>
              </details>
              <div className="flex items-center justify-between self-end">
                <div><p className="text-lg font-extrabold">{rp(labPrice(labId, x.key))}</p><p className="flex items-center gap-1 text-xs text-mute"><Clock3 size={12} /> {t("Hasil", "Results")}: {t(x.turnaround)}</p></div>
                {on ? (
                  <div className="inline-flex items-center rounded-xl bg-brand-100 text-brand-800" role="group" aria-label={t("Jumlah", "Quantity")}>
                    <button onClick={() => changeQty(x.key, -1)} aria-label={t("Kurangi", "Decrease")} className="grid size-11 place-items-center rounded-l-xl hover:bg-brand-200">{qtyOf(qty, x.key) === 1 ? <X size={16} strokeWidth={3} /> : <Minus size={16} strokeWidth={3} />}</button>
                    <span className="min-w-8 text-center text-base font-extrabold tabular-nums" aria-live="polite">{qtyOf(qty, x.key)}</span>
                    <button onClick={() => changeQty(x.key, 1)} disabled={qtyOf(qty, x.key) >= MAX_QTY} aria-label={t("Tambah jumlah", "Increase")} className="grid size-11 place-items-center rounded-r-xl hover:bg-brand-200 disabled:opacity-40"><Plus size={16} strokeWidth={3} /></button>
                  </div>
                ) : (
                  <button onClick={() => toggle(x.key)} aria-pressed={false} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700"><Plus size={16} strokeWidth={3} /> {t("Tambah", "Add")}</button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      </div>

      <aside className="rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-28">
        <div className="flex items-center justify-between"><h2 className="font-display text-2xl font-semibold">{t("Pesanan Anda", "Your order")}</h2><span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">{units} {t("pemeriksaan", units === 1 ? "test" : "tests")}</span></div>
        {cart.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-paper p-5 text-center text-sm text-mute">{t("Tambahkan pemeriksaan untuk memulai pemesanan. Belum yakin memilih yang mana?", "Add a test to start your booking. Not sure which to choose?")} <button className="font-bold text-brand-700 underline" onClick={() => go("quiz")}>{t("Coba Cek Kesehatan Pintar", "Try the Smart Health Check")}</button></p>
        ) : (
          <ul className="mt-5 space-y-3">
            {cart.map((k) => { const x = testByKey[k]; const I = x.icon; return (
              <li key={k} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"><I size={18} /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{t(x.tested)}</span><span className="block text-xs text-mute">{rp(labPrice(labId, k) * qtyOf(qty, k))}{qtyOf(qty, k) > 1 && ` · ${qtyOf(qty, k)} × ${rp(labPrice(labId, k))}`}</span></span>
                <span className="inline-flex items-center rounded-lg border border-line">
                  <button onClick={() => changeQty(k, -1)} aria-label={t("Kurangi", "Decrease")} className="grid size-8 place-items-center text-mute hover:text-ink"><Minus size={14} /></button>
                  <span className="min-w-5 text-center text-sm font-bold tabular-nums">{qtyOf(qty, k)}</span>
                  <button onClick={() => changeQty(k, 1)} disabled={qtyOf(qty, k) >= MAX_QTY} aria-label={t("Tambah jumlah", "Increase")} className="grid size-8 place-items-center text-mute hover:text-ink disabled:opacity-40"><Plus size={14} /></button>
                </span>
                <button onClick={() => toggle(k)} aria-label={t(`Hapus ${x.tested}`, `Remove ${t(x.tested)}`)} className="grid size-8 place-items-center rounded-full text-mute hover:bg-bad-bg hover:text-bad"><X size={16} /></button>
              </li>); })}
          </ul>
        )}
        <div className="mt-5 flex items-end justify-between border-t border-line pt-4"><span className="text-sm font-semibold text-mute">{t("Subtotal", "Subtotal")}</span><span className="font-display text-3xl font-semibold">{rp(total)}</span></div>
        <p className="mt-1 text-xs text-mute">{t("Biaya pengambilan sampel di rumah ditambahkan satu kali saat pembayaran.", "The at-home sample collection fee is added once at checkout.")}</p>
        <Button disabled={!cart.length} className="mt-5 w-full" onClick={() => go("checkout")}>{t("Lanjut ke Pemesanan", "Continue to booking")} <ArrowRight size={16} /></Button>
      </aside>
      </div>
    </div>
  );
}

export function Labs({ labId, setLabId }: { cart: TestKey[]; labId: string; setLabId: (id: string) => void; go: (p: Page) => void }) {
  const t = useT();
  return (
    <div className="rise py-12">
      <Eyebrow>{t("Pilih laboratorium", "Choose a laboratory")}</Eyebrow>
      <Title className="mt-2">{t("Pilih laboratorium mitra", "Choose a partner laboratory")}</Title>
      <p className="mt-3 max-w-2xl text-lg text-mute">{t("Mulai dengan memilih laboratorium. Selanjutnya Anda dapat memilih pemeriksaan yang tersedia di laboratorium tersebut.", "Start by choosing a laboratory. Next, you can pick from the tests available there.")}</p>
      <div className="mt-9 grid gap-5 lg:grid-cols-3">
        {labs.map((l) => {
          const on = l.id === labId;
          const list = l.tests.map((k) => ({ ...testByKey[k], price: labPrice(l.id, k) })).sort((a, b) => a.price - b.price);
          const lo = list[0].price; const hi = list[list.length - 1].price;
          return (
            <article key={l.id} onClick={() => setLabId(l.id)}
              className={`relative row-span-7 grid cursor-pointer grid-rows-subgrid gap-y-2 rounded-3xl border-2 bg-white p-5 text-left transition ${on ? "border-brand-600 shadow-[0_8px_24px_-12px_rgba(31,90,196,.5)]" : "border-line hover:border-brand-200"}`}>
              <span className="w-fit self-start rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">{t(l.tag)}</span>
              <h2 className="font-display text-xl font-semibold leading-tight">{l.name}</h2>
              <p className="flex items-center gap-1 text-[13px] text-mute"><MapPin size={13} /> {t(l.area)} · {t(l.distance)}</p>
              <details className="group self-start rounded-xl bg-paper" onClick={(e) => e.stopPropagation()}>
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-bold text-ink [&::-webkit-details-marker]:hidden">
                  {t("Pemeriksaan", "Tests")} ({list.length}) <ChevronDown size={16} className="text-brand-600 transition group-open:rotate-180" />
                </summary>
                <ul className="space-y-2 px-3 pb-3">
                  {list.map((x) => (
                    <li key={x.key} className="flex items-center justify-between gap-3 text-[13px]"><span className="font-semibold">{t(x.tested)}</span><span className="text-mute">{rp(x.price)}</span></li>
                  ))}
                </ul>
              </details>
              <div className="mt-1 grid grid-cols-2 gap-3 border-t border-line pt-4 text-[13px]">
                <div><p className="text-mute">{t("Hasil", "Results")}</p><p className="font-bold">{t(l.result)}</p></div>
                <div><p className="text-mute">{t("Penjemputan tercepat", "Earliest pickup")}</p><p className="font-bold">{t(l.slots)}</p></div>
                <div><p className="text-mute">{t("Penilaian", "Rating")}</p><p className="flex items-center gap-1 font-bold"><Star size={14} className="fill-warn-solid text-warn-solid" /> {l.rating} <span className="font-medium text-mute">({l.reviews.toLocaleString(locale())})</span></p></div>
                <div><p className="text-mute">{t("Kisaran harga", "Price range")}</p><p className="font-extrabold leading-tight text-brand-800">{lo === hi ? rp(lo) : `${rp(lo)} – ${rp(hi)}`}</p></div>
              </div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ok"><ShieldCheck size={14} /> {t(l.accredited)}</p>
              <Button className="mt-2 w-full" onClick={() => setLabId(l.id)}>{t("Pilih lab ini", "Choose this lab")} <ArrowRight size={16} /></Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

const slots = [
  { id: "05:30 – 06:30" },
  { id: "06:30 – 07:30" },
  { id: "07:30 – 09:00" },
  { id: "09:00 – 11:00" },
  { id: "13:00 – 15:00" },
];

export function Checkout({ cart, qty, labId, booking, setBooking, profile, onConfirm }: {
  cart: TestKey[]; qty: Qty; labId: string; booking: Booking; setBooking: (b: Booking) => void; profile: Profile; onConfirm: (o: Order) => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const p = pricing(cart, labId, qty);
  const [pay, setPay] = useState("pickup");
  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(2026, 9, 15 + i);
    return { iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, dow: d.toLocaleDateString(locale(), { weekday: "short" }), day: d.getDate(), mon: d.toLocaleDateString(locale(), { month: "short" }) };
  }), [lang]);
  const { members, nameOf } = usePeople();
  const [assign, setAssign] = useState<Partial<Record<TestKey, string[]>>>({});
  const owners = new Set(members.map((m) => m.id));
  const ids = ["main", ...members.map((m) => m.id)];
  const ownerOf = (k: TestKey, i: number) => { const v = assign[k]?.[i] ?? ids[i] ?? "main"; return v === "main" || owners.has(v) ? v : "main"; };
  const setOwner = (k: TestKey, i: number, v: string) => setAssign({ ...assign, [k]: Array.from({ length: qtyOf(qty, k) }, (_, n) => (n === i ? v : ownerOf(k, n))) });
  const taken = (k: TestKey, i: number, id: string) => Array.from({ length: qtyOf(qty, k) }, (_, n) => n).some((n) => n !== i && ownerOf(k, n) === id);
  const needPeople = members.length > 0 || cart.some((k) => qtyOf(qty, k) > 1);
  const dupes = cart.filter((k) => new Set(Array.from({ length: qtyOf(qty, k) }, (_, i) => ownerOf(k, i))).size < qtyOf(qty, k));
  const ok = booking.date && booking.slot && booking.address.trim() && dupes.length === 0;
  const set = (patch: Partial<Booking>) => setBooking({ ...booking, ...patch });
  const confirm = () => {
    const now = new Date();
    const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
    onConfirm({
      v: 2, id: `CS-${ymd}-${String(Math.floor(1000 + Math.random() * 9000))}`, createdAt: now.toISOString(), cart, qty: { ...qty }, names: Object.fromEntries(["main", ...members.map((m) => m.id)].map((id) => [id, nameOf(id)])), assign: Object.fromEntries(cart.map((k) => [k, Array.from({ length: qtyOf(qty, k) }, (_, i) => ownerOf(k, i))])), labId,
      date: booking.date, slot: booking.slot, address: booking.address.trim(), notes: booking.notes.trim(), pay, total: p.total,
      step: 0, courier: couriers[Math.floor(Math.random() * couriers.length)],
    });
  };
  return (
    <div className="rise py-12">
      <Eyebrow>{t("Jadwalkan penjemputan", "Schedule your pickup")}</Eyebrow>
      <Title className="mt-3">{t("Kapan petugas sebaiknya datang?", "When should our phlebotomist come?")}</Title>

      <div className="mt-9 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
      <div className="rounded-3xl border border-line bg-white p-7">

      {needPeople && (
        <div className="mb-8 rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-brand-800">{t("Tes ini untuk siapa?", "Who is each test for?")}</h2>
          <p className="mt-1 text-sm text-brand-800">{t("Pilih pemilik tiap tes. Hasilnya akan masuk ke linimasa orang tersebut.", "Choose who each test belongs to. Results go to that person's timeline.")}</p>
          <div className="mt-4 space-y-2">
            {cart.flatMap((k) => Array.from({ length: qtyOf(qty, k) }, (_, i) => (
              <label key={`${k}${i}`} className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm font-bold">{t(testByKey[k].tested)}{qtyOf(qty, k) > 1 && <span className="ml-1 text-mute">#{i + 1}</span>}</span>
                <select value={ownerOf(k, i)} onChange={(e) => setOwner(k, i, e.target.value)} aria-label={`${t(testByKey[k].tested)} #${i + 1}`} className="min-h-10 rounded-lg border border-line bg-white px-2 text-sm font-semibold">
                  <option value="main" disabled={taken(k, i, "main")}>{nameOf("main")} ({t("akun utama", "main account")})</option>
                  {members.map((m) => <option key={m.id} value={m.id} disabled={taken(k, i, m.id)}>{m.name}</option>)}
                </select>
              </label>
            )))}
          </div>
          {dupes.length > 0 && (
            <p role="alert" className="mt-4 rounded-xl bg-warn-bg p-3 text-sm font-semibold text-warn">
              {t(`Satu orang tidak bisa dipakai untuk dua tes yang sama (${dupes.map((k) => testByKey[k].tested).join(", ")}). Pilih orang lain, kurangi jumlah, atau tambahkan orang baru dari Dashboard atau Akun saya.`, `One person cannot be used for the same test twice (${dupes.map((k) => t(testByKey[k].tested)).join(", ")}). Pick another person, reduce the quantity, or add a new person from the Dashboard or My account.`)}
            </p>
          )}
        </div>
      )}

      <h2 className="text-sm font-extrabold uppercase tracking-wider text-mute">{t("Tanggal", "Date")}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {days.map((d) => {
          const on = booking.date === d.iso;
          return (
            <button key={d.iso} onClick={() => set({ date: d.iso })} aria-pressed={on}
              className={`flex flex-col items-center rounded-2xl border-2 py-3 transition ${on ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-200"}`}>
              <span className={`text-xs font-bold uppercase ${on ? "text-brand-100" : "text-mute"}`}>{d.dow}</span>
              <span className="font-display text-2xl font-semibold">{d.day}</span>
              <span className={`text-xs font-semibold ${on ? "text-brand-100" : "text-mute"}`}>{d.mon}</span>
            </button>
          );
        })}
      </div>

      <h2 className="mt-6 text-sm font-extrabold uppercase tracking-wider text-mute">{t("Waktu kunjungan", "Visit time")}</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {slots.map((s) => {
          const on = booking.slot === s.id;
          return (
            <button key={s.id} onClick={() => set({ slot: s.id })} aria-pressed={on}
              className={`rounded-2xl border-2 p-3 text-left transition ${on ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:border-brand-200"}`}>
              <span className="block text-[15px] font-bold">{s.id}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <Field label={t("Alamat penjemputan", "Pickup address")}>
          <textarea rows={3} className={`${inputCls} resize-none`} value={booking.address} onChange={(e) => set({ address: e.target.value })} placeholder={profile.address} />
        </Field>
        <Field label={t("Catatan untuk petugas (opsional)", "Notes for the phlebotomist (optional)")} hint={t("Kode gerbang, patokan, lantai", "Gate code, landmark, floor")}>
          <input className={inputCls} placeholder={t("Kode gerbang, patokan, lantai…", "Gate code, landmark, floor…")} value={booking.notes} onChange={(e) => set({ notes: e.target.value })} />
        </Field>
      </div>

      <h2 className="mt-7 text-sm font-extrabold uppercase tracking-wider text-mute">{t("Pembayaran", "Payment")}</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {[["pickup", t("Bayar saat penjemputan", "Pay at pickup"), t("QRIS atau tunai kepada petugas", "QRIS or cash to the phlebotomist")], ["va", t("Transfer bank", "Bank transfer"), t("Virtual account dikirim setelah pemesanan", "Virtual account sent after booking")]].map(([id, title, d]) => (
          <button key={id} onClick={() => setPay(id)} aria-pressed={pay === id} className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left ${pay === id ? "border-brand-600 bg-brand-50" : "border-line bg-white"}`}>
            <Wallet size={20} className="text-brand-600" />
            <span className="flex-1"><span className="block font-bold">{title}</span><span className="block text-[13px] text-mute">{d}</span></span>
            <Check2 on={pay === id} />
          </button>
        ))}
      </div>

      </div>

      <aside className="rounded-3xl border border-line bg-white p-7 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl font-semibold">{t("Ringkasan harga", "Price summary")}</h2>
        <p className="mt-0.5 text-[13px] text-mute">{p.lab.name}</p>
        <dl className="mt-4 space-y-2.5 text-[15px]">
          {cart.map((k) => (
            <div key={k} className="flex justify-between"><dt className="text-mute">{t(testByKey[k].tested)}{qtyOf(qty, k) > 1 && ` × ${qtyOf(qty, k)}`}</dt><dd className="font-semibold">{rp(labPrice(labId, k) * qtyOf(qty, k))}</dd></div>
          ))}
          {p.discount > 0 && <div className="flex justify-between text-ok"><dt>{t("Diskon beberapa pemeriksaan (5%)", "Multi-test discount (5%)")}</dt><dd className="font-semibold">−{rp(p.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-mute">{t("Pengambilan di rumah (sekali)", "Home collection (one-time)")}</dt><dd className="font-semibold">{rp(p.fee)}</dd></div>
          <div className="flex items-end justify-between border-t border-line pt-3"><dt className="font-bold">{t("Total", "Total")}</dt><dd className="font-display text-3xl font-semibold text-brand-800">{rp(p.total)}</dd></div>
        </dl>
        <Button className="mt-6 w-full" disabled={!ok} onClick={confirm}>{t("Konfirmasi pesanan", "Confirm order")} <ArrowRight size={18} /></Button>
        <p className="mt-3 text-center text-xs text-mute">{t("Jadwal dapat diubah gratis hingga 3 jam sebelum penjemputan. Pembayaran hanya simulasi dalam demo ini.", "You can reschedule for free up to 3 hours before pickup. Payment is simulated in this demo.")}</p>
      </aside>
      </div>
    </div>
  );
}
