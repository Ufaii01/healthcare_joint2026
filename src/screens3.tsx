import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, BellRing, CalendarCheck, Check, CircleCheck, Download, FlaskConical, HeartPulse, MapPin, Package, Phone, Siren, Stethoscope, Truck, X, Moon, Minus, Wallet, type LucideIcon } from "lucide-react";
import { useT, useLang, locale } from "./i18n";
import { fastingPlan, fmtDate, labs, metrics, rp, testByKey, tierMeta, tierOf, type HistoryEntry, type Metric, type Segment, type Tier, type TestKey } from "./data";
import { Button, Card, Eyebrow, Gauge, Title, TierBadge, type GaugeM, type Page } from "./ui";
import type { Profile } from "./screens1";
import { isNumericRow, panels, parseNum, rowValue, tierIdx, type Row } from "./panels";
import { usePeople } from "./members";
import { orderUnits, unitName, unitsOf, type Order } from "./screens2";

const steps: { en: string; id: string; icon: LucideIcon; time: string; enT: string; idT: string; timeT: string }[] = [
  { en: "Dipesan", id: "Pesanan Anda sudah tercatat", icon: Check, time: "", enT: "Ordered", idT: "Your order has been recorded", timeT: "" },
  { en: "Kurir mengantar paket alat", id: "Paket alat ambil sampel menuju alamat Anda", icon: Truck, time: "", enT: "Courier delivering your kit", idT: "Your sample collection kit is on its way to your address", timeT: "" },
  { en: "Paket sudah diterima", id: "Ambil sampel sendiri, kapan pun Anda siap", icon: Package, time: "Fleksibel, tanpa perlu menunggu petugas", enT: "Kit received", idT: "Collect your sample yourself whenever you are ready", timeT: "Flexible, no need to wait for an agent" },
  { en: "Petugas dalam perjalanan", id: "Menuju lokasi Anda untuk mengambil sampel", icon: Truck, time: "Setelah Anda menekan “Sampel selesai diambil”", enT: "Agent on the way", idT: "Heading to your location to pick up your sample", timeT: "After you tap “Sample collected”" },
  { en: "Diperiksa", id: "Sedang dianalisis di laboratorium", icon: FlaskConical, time: "", enT: "Being tested", idT: "Being analysed at the laboratory", timeT: "" },
  { en: "Hasil siap", id: "Siap Anda lihat", icon: CircleCheck, time: "Kami akan memberi tahu Anda", enT: "Results ready", idT: "Ready for you to view", timeT: "We will let you know" },
];
const LAST = steps.length - 1;

const payLabel: Record<string, [string, string]> = { pickup: ["Bayar saat penjemputan", "Pay at pickup"], va: ["Transfer bank", "Bank transfer"] };

export function Tracking({ orders, selectedId, setSelectedId, advance, openResult, go }: {
  orders: Order[]; selectedId: string | null; setSelectedId: (id: string | null) => void; advance: (id: string) => void; openResult: (o: Order, k: TestKey, i: number) => void; go: (p: Page) => void;
}) {
  const t = useT(); const { nameOf: nameOf0 } = usePeople();
  const deleted = t("Dihapus", "Deleted");
  const nameFor = (o: Order) => (id?: string) => { const n = nameOf0(id); return n === deleted && o.names?.[id ?? ""] ? `${o.names[id ?? ""]} (${deleted})` : n; };
  const order = orders.find((o) => o.id === selectedId);
  if (order) return <OrderDetail order={order} advance={advance} openResult={openResult} />;
  return (
    <div className="rise py-12">
      <Eyebrow>{t("Lacak pesanan", "Track orders")}</Eyebrow>
      <Title className="mt-3">{t("Pesanan Anda", "Your orders")}</Title>
      <p className="mt-3 text-lg text-mute">{orders.length ? t("Pilih pesanan untuk memantau petugas dan sampel Anda.", "Select an order to follow your agent and sample.") : t("Pesanan yang Anda buat akan muncul di sini.", "Orders you place will show up here.")}</p>
      {orders.length === 0 ? (
        <Card className="mt-9 flex flex-col items-center py-16 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-700"><Package size={28} /></span>
          <h2 className="mt-5 font-display text-2xl font-semibold">{t("Belum ada pesanan", "No orders yet")}</h2>
          <p className="mt-2 max-w-sm text-mute">{t("Setelah Anda memesan penjemputan sampel di rumah, Anda dapat memantau perkembangannya di sini.", "Once you book an at-home sample pickup, you can follow its progress here.")}</p>
          <Button className="mt-6" onClick={() => go("labs")}>{t("Pesan pemeriksaan", "Book a test")} <ArrowRight size={18} /></Button>
        </Card>
      ) : (
        <ul className="mt-9 space-y-4">
          {orders.map((o) => {
            const lab = labs.find((l) => l.id === o.labId) ?? labs[0];
            const done = o.step >= LAST;
            return (
              <li key={o.id}>
                <button onClick={() => setSelectedId(o.id)} className="flex w-full items-center gap-5 rounded-3xl border border-line bg-white p-5 text-left transition hover:border-brand-200 hover:shadow-sm">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${done ? "bg-ok-bg text-ok" : "bg-brand-50 text-brand-700"}`}>{done ? <CircleCheck size={22} /> : <Truck size={22} />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-wider text-mute">{o.id}</span>
                    <span className="mt-0.5 block font-bold">{orderUnits(o).map((u) => unitName(u, t, nameFor(o))).join(", ")}</span>
                    <span className="block text-[13px] text-mute">{t(lab.name)} · {fmtDate(o.date, { weekday: "short", day: "numeric", month: "short" })}, {o.slot}</span>
                  </span>
                  <span className="hidden text-right sm:block">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${done ? "bg-ok-bg text-ok" : "bg-brand-100 text-brand-800"}`}>{t(steps[o.step].en, steps[o.step].enT)}</span>
                    <span className="mt-1 block text-sm font-bold">{rp(o.total)}</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-brand-600" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function OrderDetail({ order, advance, openResult }: { order: Order; advance: (id: string) => void; openResult: (o: Order, k: TestKey, i: number) => void }) {
  const t = useT(); const { nameOf: nameOf0, members } = usePeople(); const { lang } = useLang();
  const deleted = t("Dihapus", "Deleted");
  const nameOf = (id?: string) => { const n = nameOf0(id); return n === deleted && order.names?.[id ?? ""] ? `${order.names[id ?? ""]} (${deleted})` : n; };
  const alive = (id: string) => id === "main" || members.some((m) => m.id === id);
  const [showPrep, setShowPrep] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const { cart, step } = order;
  const units = unitsOf(cart, order.qty);
  const lab = labs.find((l) => l.id === order.labId) ?? labs[0];
  const fastH = Math.max(0, ...cart.map((k) => testByKey[k].fastHours ?? 0));
  const slot = order.slot;
  const fp = fastH ? fastingPlan(slot, fastH) : null;
  const shortDate = fmtDate(order.date, { day: "numeric", month: "short" });
  const dateLabel = fmtDate(order.date, { weekday: "long", day: "numeric", month: "long" });
  const created = `${new Date(order.createdAt).toLocaleDateString(locale(), { day: "numeric", month: "short" })} · ${new Date(order.createdAt).toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":")}`;
  const stepTime = (i: number, base: string) => i === 0 ? created : i === 1 ? t(`Tiba ${shortDate}, ${slot}`, `Arrives ${shortDate}, ${slot}`) : i === 3 && step === 3 ? t("Estimasi tiba sekitar 15 menit", "Estimated arrival in about 15 minutes") : i === 4 ? t(`Biasanya ${lab.result.toLowerCase()}`, `Usually ${t(lab.result).toLowerCase()}`) : base;
  const c = order.courier;
  const initials = c.name.split(" ").map((w) => w[0]).join("");
  return (
    <div className="rise py-12">
      <Eyebrow>{t("Pesanan", "Order")} {order.id}</Eyebrow>
      <Title className="mt-3">{step >= LAST ? t("Hasil Anda sudah siap", "Your results are ready") : t("Memantau sampel Anda", "Tracking your sample")}</Title>
      <p className="mt-3 text-lg text-mute">{units} {t("pemeriksaan", units === 1 ? "test" : "tests")} · {t(lab.name)}</p>

      <div className="mt-9 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
      <div>
      {showPrep && step < 3 && fp && (
        <div role="status" className="mb-5 rounded-3xl border-2 border-brand-600 bg-brand-50 p-4">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white"><BellRing size={18} /></span>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2"><p className="text-[11px] font-extrabold uppercase tracking-wider text-brand-700">{t("Petunjuk persiapan", "Preparation instructions")}</p>
                <button onClick={() => setShowPrep(false)} aria-label={t("Tutup", "Close")} className="-mr-1 -mt-1 grid size-8 place-items-center rounded-full text-mute hover:bg-white"><X size={16} /></button></div>
              <p className="mt-1 font-bold leading-snug text-brand-900">{t(`Jangan lupa berpuasa selama ${fastH} jam sebelum penjemputan pada ${shortDate}.`, `Remember to fast for ${fastH} hours before pickup on ${shortDate}.`)}</p>
              <p className="mt-1 text-sm text-brand-800">{t(`Makan terakhir paling lambat pukul ${fp.start}${fp.prev ? " malam sebelumnya" : ""}. Air putih boleh diminum. Hindari kopi, teh, dan minuman manis hingga sampel Anda diambil.`, `Have your last meal by ${fp.start}${fp.prev ? " the evening before" : ""}. Water is fine. Avoid coffee, tea, and sweet drinks until your sample is collected.`)}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-brand-700"><Moon size={13} /> {t(`Pengingat juga diatur pada ${fp.reminder}`, `A reminder is also set for ${fp.reminder}`)}</p>
            </div>
          </div>
        </div>
      )}

      <Card className="p-7">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div><p className="text-xs font-bold uppercase tracking-wider text-mute">{t("Penjemputan", "Pickup")}</p><p className="font-bold">{dateLabel}</p></div>
          <p className="rounded-xl bg-paper px-3 py-1.5 text-sm font-bold">{slot}</p>
        </div>
        <ol className="mt-5">
          {steps.map((s, i) => {
            const done = i < step, cur = i === step; const Icon = s.icon;
            return (
              <li key={s.en} className="relative flex gap-4 pb-7 last:pb-0" aria-current={cur ? "step" : undefined}>
                {i < steps.length - 1 && <span className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${done ? "bg-brand-600" : "bg-line"}`} />}
                <span className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 ${done ? "border-brand-600 bg-brand-600 text-white" : cur ? "pulse-ring border-brand-600 bg-white text-brand-700" : "border-line bg-white text-slate-400"}`}>
                  {done ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                </span>
                <div className="pt-0.5">
                  <p className={`font-bold leading-tight ${done || cur ? "text-ink" : "text-slate-400"}`}>{t(s.en, s.enT)}</p>
                  <p className={`text-[13px] font-semibold ${cur ? "text-brand-700" : "text-slate-400"}`}>{t(s.id, s.idT)}</p>
                  <p className={`mt-0.5 text-xs ${done || cur ? "text-mute" : "text-slate-400"}`}>{i === 0 ? stepTime(0, t(s.time, s.timeT)) : done ? t("Selesai", "Done") : stepTime(i, t(s.time, s.timeT))}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {step === 2 && (
        <Card className="mt-5 border-2 border-brand-600 bg-brand-50 p-5">
          <p className="font-bold text-brand-900">{t("Sudah selesai mengambil sampel?", "Done collecting your sample?")}</p>
          <p className="mt-1 text-sm text-brand-800">{t("Beri tahu mitra agar petugas segera menjemput sampel Anda di alamat pengambilan.", "Let our partner know so an agent can pick up your sample from your collection address.")}</p>
          <Button className="mt-4 w-full" onClick={() => setConfirming(true)}>{t("Sampel selesai diambil", "Sample collected")} <ArrowRight size={18} /></Button>
        </Card>
      )}
      {step >= LAST ? (
        <Card className="mt-5 p-5">
          <p className="font-bold">{t("Hasil Anda sudah siap", "Your results are ready")}</p>
          <div className="mt-3 space-y-2">
            {orderUnits(order).map((u) => (
              <Button key={`${u.key}${u.i}`} variant="secondary" disabled={!alive(u.owner)} className="w-full justify-between" onClick={() => openResult(order, u.key, u.i)}>{unitName(u, t, nameOf)} <ArrowRight size={18} /></Button>
            ))}
          </div>
        </Card>
      ) : step !== 2 && (
        <Button variant="secondary" className="mt-5 w-full border-dashed" onClick={() => advance(order.id)}>{t(`Demo: lanjut ke “${steps[step + 1].en}”`, `Demo: advance to “${steps[step + 1].enT}”`)}</Button>
      )}
      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onClick={() => setConfirming(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <span className="grid size-12 place-items-center rounded-2xl bg-warn-bg text-warn"><Siren size={22} /></span>
            <h2 id="confirm-title" className="mt-4 font-display text-2xl font-semibold">{t("Kirim kurir sekarang?", "Send the courier now?")}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-mute">{lang === "id" ? <>Jika Anda menekan “Ya, kirim kurir”, kami akan <strong className="text-ink">langsung memesan kurir</strong> untuk datang ke alamat Anda dan membawa sampel kembali ke {lab.name}.</> : <>If you tap “Yes, send courier”, we will <strong className="text-ink">book a courier right away</strong> to come to your address and bring your sample back to {lab.name}.</>}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-ink">
              <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-ok" strokeWidth={3} /> {t("Pastikan semua sampel sudah diambil dan tersegel sesuai petunjuk.", "Make sure all samples are collected and sealed as instructed.")}</li>
              <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-ok" strokeWidth={3} /> {t("Tetap berada di lokasi, kurir akan tiba sekitar 15 menit.", "Stay at your location, the courier will arrive in about 15 minutes.")}</li>
              <li className="flex gap-2"><X size={16} className="mt-0.5 shrink-0 text-bad" strokeWidth={3} /> {t("Tindakan ini tidak dapat dibatalkan.", "This action cannot be undone.")}</li>
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => setConfirming(false)}>{t("Belum, kembali", "Not yet, go back")}</Button>
              <Button onClick={() => { setConfirming(false); advance(order.id); }}>{t("Ya, kirim kurir", "Yes, send courier")}</Button>
            </div>
          </div>
        </div>
      )}
      </div>
      <aside className="space-y-5 lg:sticky lg:top-28">
        {(step === 1 || step === 3) && (
          <Card className="overflow-hidden p-0">
            {(step === 1 || step === 3) && (
              <div className="bg-brand-900 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-200">{step === 3 ? t("Estimasi petugas tiba", "Estimated agent arrival") : t("Status kurir", "Courier status")}</p>
                <p className="font-display text-3xl font-semibold">{step === 3 ? t("± 15 menit", "± 15 minutes") : t("Mengantar paket alat", "Delivering your kit")}</p>
                <div className="mt-5 flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-white/15"><MapPin size={15} /></span>
                  <div className="relative h-1.5 flex-1 rounded-full bg-white/20"><div className="h-full w-[68%] rounded-full bg-sky-300" /><span className="pulse-ring absolute left-[68%] top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-700"><Truck size={14} /></span></div>
                  <span className="grid size-8 place-items-center rounded-full bg-white/15"><Check size={15} /></span>
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-brand-200"><span>{step === 3 ? t("Posisi petugas", "Agent location") : t("Pos kurir", "Courier hub")}</span><span>{t("Lokasi Anda", "Your location")}</span></div>
              </div>
            )}
            <div className="flex items-center gap-3 p-4">
              <span className="grid size-12 place-items-center rounded-full bg-brand-100 font-bold text-brand-800">{initials}</span>
              <div className="flex-1"><p className="font-bold">{c.name}</p><p className="text-[13px] text-mute">{t(c.role)} · {c.plate}</p></div>
              <a href={`tel:${c.phone}`} aria-label={t("Telepon petugas", "Call the agent")} className="grid size-11 place-items-center rounded-full bg-brand-600 text-white"><Phone size={18} /></a>
            </div>
          </Card>
        )}

        <Card>
          <h2 className="font-display text-xl font-semibold">{t("Detail pesanan", "Order details")}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex gap-3"><FlaskConical size={17} className="mt-0.5 shrink-0 text-brand-600" /><div><dt className="font-bold">{t(lab.name)}</dt><dd className="text-mute">{t(lab.area)}</dd></div></div>
            <div className="flex gap-3"><Package size={17} className="mt-0.5 shrink-0 text-brand-600" /><div><dt className="font-bold">{units} {t("pemeriksaan", units === 1 ? "test" : "tests")} · {t("1 sampel tersegel", "1 sealed sample")}</dt><dd className="text-mute">{orderUnits(order).map((u) => unitName(u, t, nameOf)).join(", ")}</dd></div></div>
            <div className="flex gap-3"><CalendarCheck size={17} className="mt-0.5 shrink-0 text-brand-600" /><div><dt className="font-bold">{t("Jadwal paket alat tiba", "Kit delivery schedule")}</dt><dd className="text-mute">{dateLabel}, {slot}</dd></div></div>
            <div className="flex gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-brand-600" /><div><dt className="font-bold">{t("Alamat penjemputan", "Pickup address")}</dt><dd className="text-mute">{order.address}</dd>{order.notes && <dd className="text-mute">{t("Catatan", "Notes")}: {order.notes}</dd>}</div></div>
            <div className="flex gap-3"><Wallet size={17} className="mt-0.5 shrink-0 text-brand-600" /><div><dt className="font-bold">{payLabel[order.pay] ? t(...payLabel[order.pay]) : order.pay}</dt><dd className="text-mute">{t(`Total ${rp(order.total)} (termasuk biaya pengambilan)`, `Total ${rp(order.total)} (including collection fee)`)}</dd></div></div>
          </dl>
        </Card>
      </aside>
      </div>
    </div>
  );
}

// ---------- Gauge ----------
const content: Record<Metric["key"], { tips: string[]; tipsEn: string[]; advice: string; adviceEn: string; specialty: string; specialtyEn: string }> = {
  glucose: { tips: ["Atur piring makan: setengah sayuran, seperempat protein, seperempat nasi.", "Berjalan kaki 30 menit, lima hari seminggu.", "Ganti minuman manis dengan air putih atau teh tanpa gula."], tipsEn: ["Plan your plate: half vegetables, a quarter protein, a quarter rice.", "Walk for 30 minutes, five days a week.", "Swap sweet drinks for water or unsweetened tea."], advice: "Gula darah puasa Anda berada di atas rentang ideal. Kurangi minuman manis, tambahkan jalan kaki 20 menit setelah makan malam, dan periksa ulang dalam waktu dekat untuk melihat apakah nilainya mulai turun.", adviceEn: "Your fasting blood sugar is above the ideal range. Cut back on sweet drinks, add a 20-minute walk after dinner, and retest soon to see whether it starts to come down.", specialty: "Penyakit Dalam (Sp.PD)", specialtyEn: "Internal Medicine (Sp.PD)" },
  cholesterol: { tips: ["Pilih makanan yang dipanggang atau dikukus, bukan digoreng.", "Tambahkan oat, kacang-kacangan, dan buah sebagai sumber serat larut.", "Pertahankan olahraga secara teratur."], tipsEn: ["Choose baked or steamed food instead of fried.", "Add oats, nuts, and fruit as sources of soluble fibre.", "Keep exercising regularly."], advice: "Kolesterol Anda berada di batas atas. Kurangi makanan goreng, santan, dan jeroan, serta tingkatkan asupan serat dan aktivitas fisik. Periksa ulang untuk melihat hasilnya.", adviceEn: "Your cholesterol is at the upper limit. Cut back on fried food, coconut milk, and offal, and increase your fibre intake and physical activity. Retest to see the results.", specialty: "Jantung (Sp.JP)", specialtyEn: "Cardiology (Sp.JP)" },
  hemoglobin: { tips: ["Sertakan daging merah tanpa lemak, telur, bayam, atau tempe dalam menu Anda.", "Padukan makanan kaya zat besi dengan vitamin C.", "Hindari teh atau kopi sesaat setelah makan."], tipsEn: ["Include lean red meat, eggs, spinach, or tempeh in your meals.", "Pair iron-rich foods with vitamin C.", "Avoid tea or coffee right after meals."], advice: "Hemoglobin Anda sedikit di luar rentang normal. Perbanyak makanan kaya zat besi dan periksa ulang untuk memastikan; nilai rendah yang menetap perlu ditinjau oleh dokter.", adviceEn: "Your haemoglobin is slightly outside the normal range. Eat more iron-rich foods and retest to confirm; a persistently low value should be reviewed by a doctor.", specialty: "Penyakit Dalam (Sp.PD)", specialtyEn: "Internal Medicine (Sp.PD)" },
  urine: { tips: ["Minum air cukup.", "Batasi garam.", "Hindari menahan buang air kecil."], tipsEn: ["Drink enough water.", "Limit salt.", "Do not hold in urine."], advice: "Protein urin Anda berada di atas rentang ideal. Cukupi cairan, kurangi garam, dan periksa ulang urin dalam waktu dekat.", adviceEn: "Your urine protein is above the ideal range. Stay hydrated, cut back on salt, and retest your urine soon.", specialty: "Dokter penyakit dalam / ginjal", specialtyEn: "Internal medicine / nephrology" },
  kidney: { tips: ["Minum 8 gelas air sehari, kecuali dokter menyarankan lain.", "Batasi garam dan makanan olahan.", "Hindari obat pereda nyeri seperti ibuprofen tanpa anjuran dokter."], tipsEn: ["Drink 8 glasses of water a day, unless your doctor advises otherwise.", "Limit salt and processed food.", "Avoid painkillers such as ibuprofen unless a doctor recommends them."], advice: "Kreatinin Anda sedikit meningkat. Cukupi cairan, batasi garam dan obat pereda nyeri, lalu periksa ulang dalam waktu dekat untuk melihat apakah nilainya stabil.", adviceEn: "Your creatinine is slightly elevated. Stay well hydrated, limit salt and painkillers, and retest soon to see whether it stays stable.", specialty: "Ginjal-Hipertensi (Sp.PD-KGH)", specialtyEn: "Nephrology-Hypertension (Sp.PD-KGH)" },
};

type Pair = [string, string];
const guide: Record<Metric["key"], { maintain: Pair[]; restore: Pair[]; note: Record<Tier, Pair> }> = {
  glucose: {
    maintain: [["Pertahankan pola makan seimbang: batasi nasi putih berlebih, minuman manis, dan camilan tinggi gula.", "Keep a balanced diet: limit excess white rice, sugary drinks, and high-sugar snacks."], ["Bergerak aktif minimal 150 menit per minggu, misalnya jalan cepat 30 menit lima hari.", "Stay active for at least 150 minutes a week, e.g. a 30-minute brisk walk five days."], ["Jaga berat badan ideal dan tidur 7–8 jam per malam.", "Keep a healthy weight and sleep 7–8 hours a night."]],
    restore: [["Kurangi gula dan karbohidrat olahan; ganti nasi putih sebagian dengan nasi merah, ubi, atau sayuran.", "Cut sugar and refined carbs; swap some white rice for brown rice, sweet potato, or vegetables."], ["Jalan kaki 10–15 menit setelah makan untuk menekan lonjakan gula darah.", "Walk 10–15 minutes after meals to blunt blood sugar spikes."], ["Turunkan berat badan 5–7% jika berlebih; ini terbukti menurunkan risiko diabetes.", "Lose 5–7% of body weight if overweight; this is proven to lower diabetes risk."], ["Ganti minuman manis dengan air putih dan periksa ulang gula darah puasa dalam 3 bulan.", "Replace sweet drinks with water and recheck fasting glucose in 3 months."]],
    note: { green: ["Gula darah puasa Anda berada di rentang sehat. Pertahankan kebiasaan saat ini dan cek rutin setahun sekali.", "Your fasting glucose is in the healthy range. Keep up your current habits and check once a year."], amber: ["Angka Anda berada di rentang pradiabetes. Ini masih bisa dikembalikan normal dengan perubahan gaya hidup. Belum perlu obat, tetapi mohon periksa ulang dalam 3 bulan.", "Your number is in the prediabetes range. This can still be reversed with lifestyle changes. No medication needed yet, but please recheck in 3 months."], red: ["Angka Anda berada di rentang diabetes. Mohon segera berkonsultasi untuk pemeriksaan lanjutan (HbA1c) dan rencana penanganan. Jangan menunda.", "Your number is in the diabetes range. Please consult soon for follow-up testing (HbA1c) and a management plan. Do not delay."] },
  },
  cholesterol: {
    maintain: [["Pilih makanan dipanggang atau dikukus; batasi gorengan, jeroan, dan lemak jenuh.", "Choose baked or steamed food; limit fried food, offal, and saturated fat."], ["Tambahkan oat, kacang-kacangan, dan buah sebagai sumber serat.", "Add oats, legumes, and fruit for fibre."], ["Olahraga teratur dan jangan merokok.", "Exercise regularly and do not smoke."]],
    restore: [["Ganti lemak jenuh (santan kental, gorengan, kulit ayam) dengan ikan, alpukat, dan minyak zaitun.", "Replace saturated fat (rich coconut milk, fried food, chicken skin) with fish, avocado, and olive oil."], ["Perbanyak serat larut: oat, apel, kacang-kacangan, dan sayuran.", "Eat more soluble fibre: oats, apples, legumes, and vegetables."], ["Olahraga aerobik 30 menit, 5 kali seminggu, dan turunkan berat badan jika berlebih.", "Do 30 minutes of aerobic exercise 5 times a week and lose weight if overweight."], ["Berhenti merokok dan periksa ulang profil lipid dalam 3 bulan.", "Quit smoking and recheck your lipid profile in 3 months."]],
    note: { green: ["Kolesterol total Anda baik. Pertahankan pola makan dan aktivitas Anda.", "Your total cholesterol is good. Keep up your diet and activity."], amber: ["Kolesterol Anda di batas tinggi. Perubahan pola makan dan olahraga biasanya cukup untuk menurunkannya. Mohon periksa ulang dalam 3 bulan.", "Your cholesterol is borderline high. Diet and exercise changes are usually enough to bring it down. Please recheck in 3 months."], red: ["Kolesterol Anda tinggi dan meningkatkan risiko penyakit jantung. Mohon berkonsultasi untuk menilai perlunya obat penurun kolesterol.", "Your cholesterol is high and raises heart disease risk. Please consult to assess whether cholesterol-lowering medication is needed."] },
  },
  hemoglobin: {
    maintain: [["Sertakan sumber zat besi: daging merah tanpa lemak, hati ayam, telur, bayam, atau tempe.", "Include iron sources: lean red meat, chicken liver, eggs, spinach, or tempeh."], ["Padukan dengan vitamin C (jeruk, jambu) agar zat besi terserap lebih baik.", "Pair with vitamin C (orange, guava) to absorb iron better."], ["Hindari teh atau kopi sesaat setelah makan karena menghambat penyerapan zat besi.", "Avoid tea or coffee right after meals as they block iron absorption."]],
    restore: [["Tingkatkan makanan kaya zat besi di setiap kali makan: daging, hati, telur, bayam, kacang merah.", "Eat iron-rich food at every meal: meat, liver, eggs, spinach, kidney beans."], ["Minum jus jeruk atau makan buah segar bersama makanan; jauhkan teh dan kopi dari waktu makan.", "Have orange juice or fresh fruit with meals; keep tea and coffee away from mealtimes."], ["Tanyakan ke dokter atau apoteker tentang suplemen zat besi dan asam folat.", "Ask a doctor or pharmacist about iron and folic acid supplements."], ["Periksa ulang hemoglobin dalam 6 minggu.", "Recheck hemoglobin in 6 weeks."]],
    note: { green: ["Kadar hemoglobin Anda normal. Tidak ada tanda anemia; pertahankan asupan zat besi yang cukup.", "Your hemoglobin is normal. No sign of anaemia; keep getting enough iron."], amber: ["Hemoglobin Anda sedikit di luar rentang normal, kemungkinan anemia ringan. Perbaiki asupan zat besi dan periksa ulang dalam 6 minggu.", "Your hemoglobin is slightly outside the normal range, possibly mild anaemia. Improve your iron intake and recheck in 6 weeks."], red: ["Hemoglobin Anda rendah dan bisa menimbulkan lemas atau sesak. Mohon segera berkonsultasi untuk mencari penyebabnya.", "Your hemoglobin is low and may cause fatigue or breathlessness. Please consult soon to find the cause."] },
  },
  urine: {
    maintain: [["Minum air putih cukup agar urin tetap jernih.", "Drink enough water to keep urine pale."], ["Batasi garam dan makanan olahan.", "Limit salt and processed food."], ["Jangan menahan buang air kecil dan jaga kebersihan area intim.", "Do not hold in urine and keep good hygiene."]],
    restore: [["Perbanyak minum air putih dan kurangi garam.", "Drink more water and cut back on salt."], ["Hindari olahraga berat dan obat pereda nyeri (NSAID) sebelum pemeriksaan ulang.", "Avoid strenuous exercise and NSAID painkillers before retesting."], ["Kontrol tekanan darah dan gula darah.", "Keep blood pressure and blood sugar in check."], ["Periksa ulang urin dalam 1 bulan.", "Recheck your urine in 1 month."]],
    note: { green: ["Hasil urin Anda normal, tidak ada tanda protein atau infeksi. Pertahankan hidrasi yang baik.", "Your urine result is normal, with no sign of protein or infection. Keep hydrating well."], amber: ["Ada sedikit protein dalam urin Anda. Bisa sementara akibat dehidrasi atau aktivitas berat. Periksa ulang dalam 1 bulan.", "There is a little protein in your urine. It can be temporary from dehydration or heavy activity. Please recheck in 1 month."], red: ["Protein urin Anda tinggi dan dapat menandakan masalah ginjal. Mohon segera berkonsultasi dengan dokter.", "Your urine protein is high and may point to a kidney problem. Please see a doctor soon."] },
  },
  kidney: {
    maintain: [["Minum cukup air, sekitar 8 gelas sehari, kecuali dokter menyarankan lain.", "Drink enough water, about 8 glasses a day, unless your doctor advises otherwise."], ["Batasi garam dan makanan olahan; jaga tekanan darah tetap normal.", "Limit salt and processed food; keep blood pressure normal."], ["Hindari obat pereda nyeri seperti ibuprofen tanpa anjuran dokter.", "Avoid painkillers such as ibuprofen without a doctor's advice."]],
    restore: [["Cukupi cairan harian dan hindari dehidrasi, terutama saat berolahraga atau cuaca panas.", "Stay hydrated and avoid dehydration, especially when exercising or in hot weather."], ["Kurangi garam, makanan kemasan, dan protein berlebihan.", "Cut back on salt, packaged food, and excess protein."], ["Hentikan obat pereda nyeri (NSAID) dan suplemen tanpa anjuran dokter.", "Stop NSAID painkillers and supplements unless a doctor advises them."], ["Kontrol tekanan darah dan gula darah, lalu periksa ulang kreatinin dalam 2 bulan.", "Keep blood pressure and blood sugar in check, then recheck creatinine in 2 months."]],
    note: { green: ["Kreatinin Anda normal, menandakan fungsi ginjal yang baik. Pertahankan hidrasi dan pola makan sehat.", "Your creatinine is normal, indicating good kidney function. Keep hydrating and eating well."], amber: ["Kreatinin Anda sedikit meningkat. Bisa disebabkan kurang minum atau obat tertentu. Perbaiki hidrasi dan periksa ulang dalam 2 bulan.", "Your creatinine is slightly raised. This can come from low fluid intake or certain medicines. Improve hydration and recheck in 2 months."], red: ["Kreatinin Anda tinggi, menandakan ginjal mungkin tidak menyaring dengan baik. Mohon segera berkonsultasi dengan dokter untuk pemeriksaan lanjutan.", "Your creatinine is high, suggesting your kidneys may not be filtering well. Please see a doctor soon for further testing."] },
  },
};

const DoctorNote = ({ metric, tier }: { metric: Metric["key"]; tier: Tier }) => {
  const t = useT();
  const [id, en] = guide[metric].note[tier];
  return (
    <div className="mt-4 rounded-3xl border border-line bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">A</span>
        <div><p className="text-xs font-bold uppercase tracking-wider text-mute">{t("Catatan dokter", "Doctor's note")}</p><p className="text-sm font-bold">dr. Anisa Rahma, Sp.PD</p></div>
      </div>
      <p className="mt-3 text-[15px] italic leading-relaxed text-ink">“{t(id, en)}”</p>
    </div>
  );
};

export type ResultSel = { metric: Metric["key"]; value: number; date: string; lab: string; demo: boolean; owner?: string; id?: string };

export function Result({ sel, setSel, profile, go, onRetest }: { sel: ResultSel; setSel: (s: ResultSel) => void; profile: Profile; go: (p: Page) => void; onRetest: (k: TestKey) => void }) {
  const t = useT(); const { nameOf } = usePeople();
  const m = metrics[sel.metric]; const tier = tierOf(m, sel.value); const meta = tierMeta[tier];
  const c = content[sel.metric]; const [refer, setRefer] = useState(false); const [reminded, setReminded] = useState(false);
  const testKey: TestKey = sel.metric === "hemoglobin" ? "anemia" : sel.metric;
  const next = new Date(sel.date + "T00:00:00"); next.setFullYear(next.getFullYear() + 1);
  const nextLabel = next.toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" });
  const val = sel.value.toFixed(m.decimals);
  const resId = sel.id ?? `${sel.metric}${sel.date}`;
  const numRows: Row[] = panels[sel.metric].groups.flatMap((g) => g.rows).filter(isNumericRow);
  const mainRow = numRows.find((r) => r.main)!;
  const [paramEn, setParamEn] = useState("");
  const subRow = numRows.find((r) => !r.main && r.en === paramEn);
  const sub = subRow ? rowValue(subRow, tier, resId) : null;
  const subM: GaugeM | null = subRow && sub ? (() => {
    const pts = subRow.vals.map((s, i) => ({ v: parseNum(s), tier: (subRow.flags![i] === "n" ? "green" : (["green", "amber", "red"] as Tier[])[i]) as Tier })).sort((a, b) => a.v - b.v);
    const max = Math.max(pts[pts.length - 1].v * 1.4, sub.num * 1.1, 1); const segs: Segment[] = [];
    let from = 0;
    pts.forEach((p, i) => {
      const to = i === pts.length - 1 ? max : (p.v + pts[i + 1].v) / 2;
      if (segs.length && segs[segs.length - 1].tier === p.tier) segs[segs.length - 1].to = to; else segs.push({ from, to, tier: p.tier });
      from = to;
    });
    const r = (n: number) => Number(n.toPrecision(3));
    return { name: subRow.id, unit: subRow.unit ?? "", min: 0, max: r(max), segments: segs.map((s) => ({ ...s, from: r(s.from), to: r(s.to) })) };
  })() : null;
  const subTier: Tier = subM && sub ? tierOf(subM, sub.num) : "green";
  return (
    <div className="rise py-12">
      <div className="hidden border-b border-line pb-4 print:block">
        <p className="font-display text-xl font-semibold">{t("Cek Sehat — Hasil Pemeriksaan", "Cek Sehat — Test Results")}</p>
        <p className="text-sm">{profile.name} · {profile.age} {t("th", "yrs")} · {profile.gender === "Male" ? t("Laki-laki", "Male") : t("Perempuan", "Female")} · {t(sel.lab)}</p>
      </div>
      <Eyebrow>{t("Hasil", "Result")} · {fmtDate(sel.date)}</Eyebrow>
      <Title className="mt-3">{t(m.name)}</Title>
      <p className="mt-2 text-lg text-mute">{sel.owner && <span className="mr-2 inline-block rounded-full bg-brand-50 px-3 py-0.5 text-sm font-bold text-brand-800">{nameOf(sel.owner)}</span>}{t(sel.lab)}</p>

      <div className="mt-9 grid items-start gap-8 lg:grid-cols-[440px_1fr]">
      <Card className="p-7 text-center lg:sticky lg:top-28">
        {numRows.length > 1 && (
          <label className="mb-5 flex items-center gap-3 text-left">
            <span className="text-[13px] font-bold">{t("Parameter", "Parameter")}</span>
            <select value={subRow ? subRow.en : ""} onChange={(e) => setParamEn(e.target.value)} className="min-h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm font-semibold">
              <option value="">{t(mainRow.id, mainRow.en)}{mainRow.unit ? ` (${mainRow.unit})` : ""} · {t("utama", "main")}</option>
              {numRows.filter((r) => !r.main).map((r) => <option key={r.en} value={r.en}>{t(r.id, r.en)}{r.unit ? ` (${r.unit})` : ""}</option>)}
            </select>
          </label>
        )}
        {subRow && sub && subM ? (
          <div>
            <Gauge m={subM} value={sub.num} />
            <p className="-mt-5 font-display text-5xl font-semibold leading-none">{sub.num.toLocaleString(locale(), { minimumFractionDigits: sub.dec, maximumFractionDigits: sub.dec })}</p>
            <p className="mt-1 text-sm font-semibold text-mute">{t(subRow.id, subRow.en)} · {subRow.unit}</p>
            <div className="mt-4 flex flex-col items-center gap-2"><span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold text-white ${tierMeta[subTier].solid} ${subTier === "amber" ? "!text-ink" : ""}`}>{t(tierMeta[subTier].en)}</span></div>
            <div className="mt-5 flex justify-center gap-4 text-xs font-semibold">{(["green", "amber", "red"] as Tier[]).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={`size-3 rounded-full ${tierMeta[k].solid}`} />{t(tierMeta[k].en)}</span>)}</div>
            <p className="mt-5 rounded-xl bg-paper px-3 py-2.5 text-[13px] leading-snug text-mute"><strong className="text-ink">{t("Rujukan", "Reference")}:</strong> {subRow.ref.replace(/^P /, t("P ", "F ")).replace(" · L ", t(" · L ", " · M "))} {subRow.unit}</p>
          </div>
        ) : (
          <>
        <Gauge m={m} value={sel.value} />
        <p className="-mt-5 font-display text-5xl font-semibold leading-none">{val}</p>
        <p className="mt-1 text-sm font-semibold text-mute">{m.unit}</p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold text-white ${meta.solid} ${tier === "amber" ? "!text-ink" : ""}`}>{t(meta.en)} <span className="font-semibold opacity-90">· {t(meta.id, ({ green: "Normal", amber: "Possible", red: "Likely" })[tier])}</span></span>
        </div>
        <div className="mt-5 flex justify-center gap-4 text-xs font-semibold">
          {(["green", "amber", "red"] as Tier[]).map((k) => <span key={k} className="flex items-center gap-1.5"><span className={`size-3 rounded-full ${tierMeta[k].solid}`} />{t(tierMeta[k].en)}</span>)}
        </div>
        <p className="mt-4 rounded-xl bg-paper px-3 py-2.5 text-[13px] leading-snug text-mute">
          <strong className="text-ink">{t(`Untuk ${profile.gender === "Male" ? "laki-laki" : profile.gender ? "perempuan" : "orang dewasa"} usia ${profile.age} tahun:`, `For ${profile.gender === "Male" ? "men" : profile.gender ? "women" : "adults"} aged ${profile.age}:`)}</strong> {t(m.refText(profile.gender))}
        </p>
          </>
        )}
      </Card>

      <div className="[&>*:first-child]:mt-0">
      {tier === "green" && (
        <Card className="mt-4 border-ok-solid/40 bg-ok-bg">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ok"><CircleCheck size={22} /> {t("Kondisi Anda baik", "You are in good shape")}</h2>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ok">{t("Cara tetap normal", "How to stay in range")}</p>
          <ul className="mt-2 space-y-2">{guide[sel.metric].maintain.map(([id, en]) => <li key={id} className="flex gap-2.5 text-[15px] text-ink"><Check size={18} className="mt-0.5 shrink-0 text-ok" strokeWidth={3} />{t(id, en)}</li>)}</ul>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-4">
            <CalendarCheck className="shrink-0 text-ok" />
            <div className="flex-1"><p className="text-xs font-bold uppercase tracking-wider text-mute">{t("Pemeriksaan rutin berikutnya", "Next routine check-up")}</p><p className="font-bold">{nextLabel}</p></div>
            <button onClick={() => setReminded(true)} className="min-h-10 rounded-xl bg-ok px-3 text-[13px] font-bold text-white">{reminded ? t("Pengingat diatur", "Reminder set") : t("Ingatkan saya", "Remind me")}</button>
          </div>
        </Card>
      )}

      {tier === "amber" && (
        <Card className="mt-4 border-warn-solid/60 bg-warn-bg">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-warn"><HeartPulse size={22} /> {t("Perlu dipantau", "Needs monitoring")}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink">{t(c.advice, c.adviceEn)}</p>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-warn">{t("Cara kembali ke normal", "How to get back to normal")}</p>
          <ul className="mt-2 space-y-2">{guide[sel.metric].restore.map(([id, en]) => <li key={id} className="flex gap-2.5 text-[15px] text-ink"><Minus size={18} className="mt-0.5 shrink-0 text-warn" strokeWidth={3} />{t(id, en)}</li>)}</ul>
          <div className="mt-4 rounded-2xl bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-warn">{t("Periksa ulang", "Retest")} {t(m.retest.amber)}</p>
            <Button className="mt-3 w-full" onClick={() => onRetest(testKey)}>{t("Pesan pemeriksaan ulang", "Book a retest")} <ArrowRight size={18} /></Button>
          </div>
        </Card>
      )}

      {tier === "red" && (
        <div className="mt-4 overflow-hidden rounded-3xl border-2 border-bad-solid bg-bad-bg">
          <div className="flex items-start gap-3 bg-bad-solid p-4 text-white" role="alert">
            <Siren className="mt-0.5 shrink-0" />
            <div><p className="text-lg font-extrabold leading-tight">{t("Segera hubungi dokter.", "Contact a doctor right away.")}</p><p className="mt-1 text-sm text-white/90">{t("Hasil ini jauh di luar rentang sehat. Ini adalah hasil skrining, bukan diagnosis, tetapi perlu ditinjau oleh tenaga profesional.", "This result is well outside the healthy range. It is a screening result, not a diagnosis, but it needs to be reviewed by a professional.")}</p></div>
          </div>
          <div className="p-5">
            <p className="text-[15px] leading-relaxed text-ink">{t(c.advice, c.adviceEn).replace("berada di atas rentang ideal", "berada dalam rentang berisiko tinggi").replace("is above the ideal range", "is in the high-risk range")}</p>
            <Button variant="danger" className="mt-4 w-full" onClick={() => setRefer(!refer)}><Stethoscope size={18} /> {t("Rujuk saya ke dokter", "Refer me to a doctor")}</Button>
            {refer && (
              <div className="rise mt-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-bad">{t("Tersedia hari ini", "Available today")} · {t(c.specialty, c.specialtyEn)}</p>
                {[["dr. Anisa Rahma, Sp.PD", t("RS Pondok Indah · Telekonsultasi 16:00", "RS Pondok Indah · Teleconsultation 16:00"), "(021) 555-0142", "+62215550142"], ["dr. Hendra Gunawan, Sp.PD", t("Klinik Mitra Sehat · Kunjungan 18:30", "Klinik Mitra Sehat · Visit 18:30"), "(021) 555-0187", "+62215550187"]].map(([n, d, p, href]) => (
                  <div key={n} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                    <span className="grid size-11 place-items-center rounded-full bg-bad-bg font-bold text-bad">{n.split(" ")[1][0]}</span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{n}</p><p className="text-xs text-mute">{d}</p></div>
                    <a href={`tel:${href}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-ink px-3 text-xs font-bold text-white"><Phone size={14} /> {p}</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Card className="mt-4 overflow-hidden !p-0">
        <div className="border-b border-line bg-paper px-5 py-3"><h2 className="font-display text-lg font-semibold">{t(...panels[sel.metric].title)}</h2></div>
        {panels[sel.metric].groups.map((g, gi) => (
          <div key={gi}>
            {g.title && <p className="bg-brand-50 px-5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-800">{t(...g.title)}</p>}
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-5 text-sm">
              {gi === 0 && <><span className="pt-3 text-[11px] font-bold uppercase text-mute">{t("Parameter", "Parameter")}</span><span className="pt-3 text-right text-[11px] font-bold uppercase text-mute">{t("Hasil", "Result")}</span><span className="pt-3 text-right text-[11px] font-bold uppercase text-mute">{t("Rujukan", "Reference")}</span></>}
              {g.rows.map((row) => {
                const ti = tierIdx(tier); const flag = row.main ? (tier === "green" ? "n" : tier === "amber" ? "h" : "h") : row.flags![ti];
                const v = row.main ? val : isNumericRow(row) ? (() => { const rv = rowValue(row, tier, resId); return rv.num.toLocaleString(locale(), { minimumFractionDigits: rv.dec, maximumFractionDigits: rv.dec }); })() : row.vals[ti];
                return (
                  <div key={row.id + row.en} className="col-span-3 grid grid-cols-subgrid items-center border-b border-line/60 py-2.5 last:border-0">
                    <span className="font-semibold">{t(row.id, row.en)}</span>
                    <span className={`text-right font-bold ${flag === "n" ? "text-ink" : "text-bad"}`}>{t(v, v.replace("Negatif", "Negative").replace("Positif", "Positive").replace("Kuning muda", "Pale yellow").replace("Kuning tua", "Dark yellow").replace("Kuning", "Yellow").replace("Jernih", "Clear").replace("Agak keruh", "Slightly cloudy").replace("Sedikit", "Few").replace("Sedang", "Moderate").replace("Hialin", "Hyaline"))} {row.unit && <span className="text-xs font-semibold text-mute">{row.unit}</span>}{flag !== "n" && <span className="ml-1 text-xs">{flag === "h" ? "▲" : "▼"}</span>}</span>
                    <span className="text-right text-xs text-mute">{row.ref.replace(/^P /, t("P ", "F ")).replace(" · L ", t(" · L ", " · M ")).replace("Negatif", t("Negatif", "Negative")).replace("Jernih", t("Jernih", "Clear")).replace("Sedikit", t("Sedikit", "Few"))}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <p className="px-5 pb-3 pt-1 text-[11px] text-mute">{t("Nilai rincian bersifat contoh/demo.", "Breakdown values are demo samples.")}</p>
      </Card>

      <DoctorNote metric={sel.metric} tier={tier} />

      <Button variant="secondary" className="mt-4 w-full print:hidden"><Download size={18} /> {t("Unduh sebagai PDF", "Download as PDF")}</Button>

      {sel.demo && (
        <div className="mt-6 rounded-2xl border border-dashed border-brand-200 p-3 print:hidden">
          <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-mute">{t("Demo · lihat hasil lainnya", "Demo · see other results")}</p>
          <div className="grid grid-cols-3 gap-2">
            {(["green", "amber", "red"] as Tier[]).map((k) => (
              <button key={k} onClick={() => setSel({ ...sel, value: m.samples[k] })} aria-pressed={k === tier}
                className={`min-h-10 rounded-xl border-2 text-xs font-bold ${k === tier ? `${tierMeta[k].border} ${tierMeta[k].bg} ${tierMeta[k].text}` : "border-line bg-white text-mute"}`}>{t(tierMeta[k].en)}</button>
            ))}
          </div>
        </div>
      )}
      <Button variant="ghost" className="mt-3 w-full print:hidden" onClick={() => go("timeline")}>{t("Lihat linimasa kesehatan saya", "View my health timeline")} <ArrowRight size={18} /></Button>
      </div>
      </div>
    </div>
  );
}

// ---------- Timeline ----------
const chartMetrics: Metric["key"][] = ["glucose", "cholesterol", "hemoglobin", "kidney", "urine"];

type Range = "1m" | "3m" | "year";
type Pt = { id: string; date: string; value: number; tier: Tier };
type Series = { key: string; label: [string, string]; unit: string; decimals: number; band?: [number, number]; pts: Pt[] };
const ts = (d: string) => new Date(d + "T00:00:00").getTime();
const rangeWindow = (r: Range, endDate: string) => {
  const e = new Date(endDate + "T00:00:00"); const n = r === "1m" ? 1 : r === "3m" ? 3 : 12;
  return { from: new Date(e.getFullYear(), e.getMonth() + 1 - n, 1), to: new Date(e.getFullYear(), e.getMonth() + 1, 1), n };
};
function seriesFor(metric: Metric["key"], entries: HistoryEntry[]): Series[] {
  const m = metrics[metric];
  const base = entries.filter((h) => h.metric === metric).sort((a, b) => a.date.localeCompare(b.date));
  const g = m.segments.filter((s) => s.tier === "green")[0];
  return panels[metric].groups.flatMap((gr) => gr.rows).flatMap((row): Series[] => {
    if (row.main) return [{ key: row.en, label: [row.id, row.en], unit: m.unit, decimals: m.decimals, band: [g.from, g.to], pts: base.map((p) => ({ id: p.id, date: p.date, value: p.value, tier: tierOf(m, p.value) })) }];
    if (!isNumericRow(row)) return [];
    const dec = Math.max(...row.vals.map((s) => (s.includes(",") ? s.split(",")[1].length : 0)));
    const lt = /^<\s*([\d.,]+)$/.exec(row.ref), gt = /^>\s*([\d.,]+)$/.exec(row.ref), rg = /^([\d.,]+)–([\d.,]+)$/.exec(row.ref);
    const n = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
    const band: [number, number] | undefined = lt ? [0, n(lt[1])] : gt ? [n(gt[1]), n(gt[1]) * 1.6] : rg ? [n(rg[1]), n(rg[2])] : undefined;
    return [{ key: row.en, label: [row.id, row.en], unit: row.unit ?? "", decimals: dec, band, pts: base.map((p) => {
      const tier = tierOf(m, p.value); const rv = rowValue(row, tier, p.id);
      return { id: p.id, date: p.date, value: rv.num, tier: rv.flag === "n" ? "green" : tier };
    }) }];
  });
}

function TrendChart({ series, range, selId, setSelId }: { series: Series; range: Range; selId: string; setSelId: (id: string) => void }) {
  const t0_ = useT();
  const pts = series.pts;
  const W = 340, H = 210, L = 44, R = 14, T = 26, B = 30;
  const vals = pts.map((p) => p.value);
  const lo0 = Math.min(...vals, series.band?.[0] ?? Infinity), hi0 = Math.max(...vals, series.band?.[1] ?? -Infinity);
  const pad = ((hi0 - lo0) || Math.abs(hi0) || 1) * 0.12; const lo = lo0 >= 0 ? Math.max(0, lo0 - pad) : lo0 - pad, hi = hi0 + pad;
  const win = rangeWindow(range, pts[pts.length - 1].date); const f0 = win.from.getTime(), f1 = win.to.getTime();
  const px = (ms: number) => L + ((ms - f0) / (f1 - f0)) * (W - L - R);
  const x = (d: string) => px(ts(d));
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(p.date)} ${y(p.value)}`).join(" ");
  const fmtTick = (v: number) => String(Number(v.toFixed(series.decimals > 0 ? 1 : 0)));
  const ticks = [lo0, (lo0 + hi0) / 2, hi0];
  const band = series.band && { top: y(Math.min(series.band[1], hi)), bot: y(Math.max(series.band[0], lo)) };
  const marks = range === "1m"
    ? [1, 8, 15, 22, 29].filter((d) => d <= Math.round((f1 - f0) / 86400000)).map((d) => { const dt = new Date(win.from.getFullYear(), win.from.getMonth(), d); return { ms: dt.getTime(), label: dt.toLocaleDateString(locale(), { day: "numeric", month: "short" }) }; })
    : Array.from({ length: win.n }, (_, i) => { if (win.n > 6 && i % 2 === 1) return null; const d = new Date(win.from.getFullYear(), win.from.getMonth() + i, 1); const d2 = new Date(win.from.getFullYear(), win.from.getMonth() + i + 1, 1); return { ms: (d.getTime() + d2.getTime()) / 2, label: d.toLocaleDateString(locale(), { month: "short", year: "2-digit" }) }; }).filter((v): v is { ms: number; label: string } => !!v);
  const grid = range === "1m" ? marks.map((m) => m.ms) : Array.from({ length: win.n + 1 }, (_, i) => new Date(win.from.getFullYear(), win.from.getMonth() + i, 1).getTime());
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t0_(`Tren ${series.label[0]} dari waktu ke waktu`, `${series.label[1]} trend over time`)}>
      {band && <rect x={L} width={W - L - R} y={band.top} height={Math.max(0, band.bot - band.top)} fill="#14a062" opacity="0.12" />}
      {ticks.map((v, i) => <g key={i}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#e1e9f3" /><text x={L - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#56667b" fontWeight="600">{fmtTick(v)}</text></g>)}
      {band && <text x={W - R - 4} y={band.top + 12} textAnchor="end" fontSize="9" fill="#0b6b43" fontWeight="700">{t0_("RENTANG NORMAL", "NORMAL RANGE")}</text>}
      {grid.map((ms, i) => <line key={i} x1={px(ms)} x2={px(ms)} y1={T} y2={H - B + 4} stroke="#cfd9e6" strokeDasharray={range !== "1m" && (i === 0 || i === grid.length - 1) ? undefined : "2 3"} />)}
      {marks.map((m, i) => <text key={i} x={px(m.ms)} y={H - 10} textAnchor={range === "1m" ? (i === 0 ? "start" : "middle") : "middle"} fontSize="9.5" fill="#56667b" fontWeight="600">{m.label}</text>)}
      <path d={line} fill="none" stroke="#1f5ac4" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p) => {
        const on = p.id === selId;
        return (
          <g key={p.id} onClick={() => setSelId(p.id)} className="cursor-pointer">
            <circle cx={x(p.date)} cy={y(p.value)} r={16} fill="transparent" />
            <circle cx={x(p.date)} cy={y(p.value)} r={on ? 8 : 6} fill={tierMeta[p.tier].hex} stroke="white" strokeWidth={3} />
            {on && <circle cx={x(p.date)} cy={y(p.value)} r={11} fill="none" stroke="#1f5ac4" strokeWidth={2} />}
            <text x={x(p.date)} y={y(p.value) - 14} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#0d1b2e">{p.value.toLocaleString(locale(), { maximumFractionDigits: series.decimals })}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Timeline({ entries: all, openResult }: { entries: HistoryEntry[]; openResult: (e: HistoryEntry) => void }) {
  const t = useT();
  const { members, nameOf } = usePeople();
  const [person, setPerson] = useState("main");
  const who = person === "main" || members.some((m) => m.id === person) ? person : "main";
  const mine = all.filter((e) => (e.owner ?? "main") === who);
  return (
    <div className="rise py-12">
      <Eyebrow>{t("Tindak lanjut", "Follow-up")}</Eyebrow>
      <Title className="mt-3">{t("Linimasa kesehatan", "Health timeline")}</Title>
      {members.length > 0 && (
        <label className="mt-5 flex w-full max-w-sm flex-col gap-1.5">
          <span className="text-[13px] font-bold">{t("Lihat linimasa untuk", "Show timeline for")}</span>
          <select value={who} onChange={(e) => setPerson(e.target.value)} className="min-h-12 rounded-xl border border-line bg-white px-3 font-semibold">
            <option value="main">{nameOf("main")} ({t("akun utama", "main account")})</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
      )}
      {mine.length === 0 ? (
        <Card className="mt-9 p-8 text-center">
          <p className="font-display text-xl font-semibold">{t(`Belum ada hasil untuk ${nameOf(who)}`, `No results yet for ${nameOf(who)}`)}</p>
          <p className="mx-auto mt-2 max-w-md text-mute">{t("Pesan tes dan pilih orang ini sebagai pemilik tes. Hasilnya akan muncul di sini begitu pesanan selesai.", "Order a test and pick this person as its owner. Results will appear here once the order is done.")}</p>
        </Card>
      ) : <TimelineBody key={who} entries={mine} openResult={openResult} />}
    </div>
  );
}

function TimelineBody({ entries, openResult }: { entries: HistoryEntry[]; openResult: (e: HistoryEntry) => void }) {
  const t = useT();
  const avail = chartMetrics.filter((k) => entries.some((e) => e.metric === k));
  const [metric, setMetric] = useState<Metric["key"]>(avail[0]);
  const m = metrics[metric];
  const [range, setRange] = useState<Range>("year");
  const [paramKey, setParamKey] = useState("");
  const options = useMemo(() => seriesFor(metric, entries), [metric, entries]);
  const ser = options.find((s) => s.key === paramKey) ?? options[0];
  const allPts = ser.pts;
  const fromMs = rangeWindow(range, allPts[allPts.length - 1].date).from.getTime();
  const pts = allPts.filter((p) => ts(p.date) >= fromMs);
  const [selId, setSelId] = useState(allPts[allPts.length - 1].id);
  const cur = pts.find((p) => p.id === selId) ?? pts[pts.length - 1];
  const prev = allPts[allPts.indexOf(cur) - 1];
  const delta = prev ? cur.value - prev.value : 0;
  const first = pts[0], last = pts[pts.length - 1]; const total = last.value - first.value;
  const switchMetric = (k: Metric["key"]) => { setMetric(k); setParamKey(""); const p = entries.filter((h) => h.metric === k).sort((a, b) => a.date.localeCompare(b.date)); setSelId(p[p.length - 1].id); };
  const dates = Array.from(new Set(entries.map((h) => h.date))).sort().reverse();
  return (
    <div>
      <div className="mt-9 grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
      <Card className="px-4 pb-5 pt-6 lg:sticky lg:top-28">
        <div className="px-2">
          <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist">
            {avail.map((k) => (
              <button key={k} role="tab" aria-selected={k === metric} onClick={() => switchMetric(k)}
                className={`min-h-10 shrink-0 rounded-full px-4 text-[13px] font-bold transition ${k === metric ? "bg-brand-600 text-white" : "bg-paper text-mute hover:text-ink"}`}>{t(metrics[k].name)}</button>
            ))}
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div><p className="text-xs font-bold uppercase tracking-wider text-mute">{t("Tren sejak", "Trend since")} {fmtDate(first.date, { month: "short", year: "numeric" })}</p>
              <p className="flex items-center gap-1 font-display text-2xl font-semibold">{total === 0 ? <Minus size={20} /> : total < 0 ? <ArrowDownRight size={22} className="text-ok" /> : <ArrowUpRight size={22} className="text-bad" />}{Math.abs(total).toFixed(ser.decimals)} <span className="text-sm font-semibold text-mute">{ser.unit}</span></p></div>
            <TierBadge tier={last.tier} />
          </div>
        </div>
        {options.length > 1 && (
          <label className="mx-2 mt-4 flex items-center gap-3">
            <span className="text-[13px] font-bold">{t("Parameter", "Parameter")}</span>
            <select value={ser.key} onChange={(e) => { setParamKey(e.target.value); setSelId(""); }} className="min-h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm font-semibold">
              {options.map((o) => <option key={o.key} value={o.key}>{t(...o.label)}{o.unit ? ` (${o.unit})` : ""}</option>)}
            </select>
          </label>
        )}
        <div className="mt-2"><div className="mb-2 flex justify-end gap-1" role="group" aria-label={t("Rentang waktu", "Time range")}>
            {([["1m", "1 Bulan", "1 Month"], ["3m", "3 Bulan", "3 Months"], ["year", "Tahun", "Year"]] as const).map(([k, id, en]) => (
              <button key={k} onClick={() => setRange(k)} aria-pressed={range === k} className={`min-h-9 rounded-lg px-3 text-xs font-bold ${range === k ? "bg-ink text-white" : "bg-paper text-mute hover:text-ink"}`}>{t(id, en)}</button>
            ))}
          </div>
          <TrendChart series={{ ...ser, pts }} range={range} selId={cur.id} setSelId={setSelId} /></div>
        <div className="mx-2 mt-1 flex items-center justify-between rounded-2xl bg-paper p-3">
          <div><p className="text-xs text-mute">{fmtDate(cur.date)}</p><p className="font-bold">{cur.value.toLocaleString(locale(), { maximumFractionDigits: ser.decimals })} {ser.unit}{prev && <span className={`ml-2 text-xs font-bold ${delta <= 0 ? "text-ok" : "text-bad"}`}>{delta > 0 ? "+" : ""}{delta.toFixed(ser.decimals)} {t("dibanding sebelumnya", "vs previous")}</span>}</p></div>
          <TierBadge tier={cur.tier} size="sm" />
        </div>
      </Card>

      <div>
      <h2 className="font-display text-2xl font-semibold">{t("Riwayat", "History")}</h2>
      <div className="mt-5">
        {dates.map((d, di) => (
          <div key={d} className="relative flex gap-4 pb-6 last:pb-0">
            {di < dates.length - 1 && <span className="absolute left-[7px] top-5 h-full w-px bg-line" />}
            <span className="relative z-10 mt-1.5 size-4 shrink-0 rounded-full border-4 border-white bg-brand-600 ring-2 ring-brand-200" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-mute">{fmtDate(d, { day: "numeric", month: "long", year: "numeric" })}</p>
              <div className="mt-2 space-y-2">
                {entries.filter((h) => h.date === d).map((h) => {
                  const mm = metrics[h.metric]; const tr = tierOf(mm, h.value);
                  return (
                    <button key={h.id} onClick={() => openResult(h)} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition hover:border-brand-200">
                      <span className={`h-10 w-1.5 shrink-0 rounded-full ${tierMeta[tr].solid}`} />
                      <span className="min-w-0 flex-1"><span className="block truncate font-bold">{t(h.label)}</span><span className="block text-[13px] text-mute">{h.value} {mm.unit} · {t(h.lab)}</span></span>
                      <TierBadge tier={tr} size="sm" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
      </div>
    </div>
  );
}
