import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarClock, Check, ClipboardList, Eye, EyeOff, FlaskConical, Info, LockKeyhole, Package, Plus, ShieldCheck, Sparkles, TrendingUp, Truck } from "lucide-react";
import { AddMemberForm, usePeople } from "./members";
import { fastingPlan, fmtDate, metrics, questions, reasons, rp, testByKey, tests, tierOf, type HistoryEntry, type TestKey } from "./data";
import { useT } from "./i18n";
import { Avatar, Button, Card, Check2, Eyebrow, Field, inputCls, TextInput, Title, TierBadge, stages, type Page } from "./ui";

export type Profile = { name: string; email: string; age: string; gender: "Female" | "Male" | ""; contact: string; address: string; avatar: string };
export type Answers = Record<string, number[]>;

export function Welcome({ go }: { go: (p: Page) => void }) {
  const t = useT();
  const steps = [
    [ClipboardList, t("Cek 2 menit", "2-minute check"), t("Jawab 7 pertanyaan singkat tentang gaya hidup dan keluhan. Kami menyarankan tes yang relevan, misalnya gula darah atau kolesterol.", "Answer 7 short questions about lifestyle and symptoms. We suggest relevant tests, such as blood sugar or cholesterol.")],
    [FlaskConical, t("Pilih lab & tes", "Pick lab & tests"), t("Pilih lab mitra, lalu tes yang tersedia di sana beserta jumlahnya. Beberapa tes digabung dalam satu pengambilan sampel.", "Pick a partner lab, then the tests it offers and how many of each. Several tests share one sample collection.")],
    [Package, t("Jadwalkan", "Schedule"), t("Pilih tanggal dan jam kurir mengantar alat ambil sampel mandiri ke alamat Anda. Anda juga mendapat panduan puasa sesuai jadwal itu.", "Choose the date and time window when the courier delivers your self-collection kit to your address. You also get fasting guidance matched to that slot.")],
    [Truck, t("Ambil & kirim", "Collect & ship"), t("Ambil sampel sendiri kapan saja setelah kit tiba, lalu tekan tombol selesai. Kurir datang menjemput dan membawanya ke lab, dengan pelacakan langsung.", "Collect your sample whenever you like once the kit arrives, then tap done. A courier picks it up and takes it to the lab, with live tracking.")],
    [TrendingUp, t("Hasil & tindak lanjut", "Results & follow-up"), t("Terima hasil tiap tes dengan penanda warna (normal, waspada, tinggi) dan saran langkah berikutnya. Pantau perubahan angka dari waktu ke waktu di linimasa dan tes ulang bila perlu.", "Get each result with a colour marker (normal, watch, high) and next-step advice. Track changes over time on the timeline and retest when needed.")],
  ] as const;
  return (
    <div className="rise">
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="pointer-events-none absolute -right-24 -top-32 size-[520px] rounded-full bg-brand-500/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 size-80 rounded-full bg-sky-300/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-100"><Sparkles size={14} /> {t("Skrining kesehatan jarak jauh", "Remote health screening")}</span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight lg:text-7xl">{t("Kenali angka kesehatan Anda.", "Know your health numbers.")}<br /><span className="text-brand-200">{t("Tanpa keluar rumah.", "Without leaving home.")}</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-100">{t("Isi kuesioner cerdas, pesan beberapa tes dalam satu kunjungan, pantau kurir menuju lab, dan baca hasil yang menjelaskan langkah Anda selanjutnya.", "Complete a smart questionnaire, book several tests in one visit, track the courier on the way to the lab, and read results that explain your next steps.")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button className="!min-h-14 bg-white !px-7 !text-base !text-brand-800 hover:!bg-brand-50 !shadow-none" onClick={() => go("register")}>{t("Buat profil saya", "Create my profile")} <ArrowRight size={18} /></Button>
              <button onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })} className="min-h-14 rounded-2xl border border-white/25 px-7 text-base font-bold hover:bg-white/10">{t("Cara kerjanya", "How it works")}</button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-brand-100">
              {[t("Lab terakreditasi KAN", "KAN-accredited labs"), t("Pengiriman sampel tersegel", "Sealed sample delivery"), t("Hasil dalam Bahasa Indonesia & Inggris", "Results in Indonesian & English")].map((item) => <span key={item} className="flex items-center gap-2"><BadgeCheck size={16} className="text-sky-300" /> {item}</span>)}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-[28px] bg-white p-6 text-ink shadow-2xl shadow-black/30">
              <div className="flex items-start justify-between">
                <div><p className="text-xs font-bold uppercase tracking-wider text-mute">{t("Gula darah puasa", "Fasting blood glucose")}</p><p className="mt-1 font-display text-6xl font-semibold leading-none">112 <span className="text-lg font-semibold text-mute">mg/dL</span></p></div>
                <TierBadge tier="amber" />
              </div>
              <div className="mt-7">
                <div className="relative flex h-3 overflow-hidden rounded-full"><span className="w-[35%] bg-ok-solid" /><span className="w-[22%] bg-warn-solid" /><span className="flex-1 bg-bad-solid" /></div>
                <div className="relative -mt-[22px] ml-[43%] h-8 w-1 rounded bg-ink" />
                <div className="mt-2 flex justify-between text-[11px] font-bold text-mute"><span>{t("Normal", "Normal")} &lt;100</span><span>{t("Berisiko", "At risk")} 100–125</span><span>{t("Tinggi", "High")} 126+</span></div>
              </div>
              <p className="mt-5 rounded-xl bg-warn-bg p-3 text-sm font-semibold text-warn">{t("Tes ulang dalam 3 bulan. Kurangi minuman manis dan berjalan kaki setelah makan malam.", "Retest in 3 months. Cut back on sugary drinks and take a walk after dinner.")}</p>
            </div>
            <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl bg-white p-4 text-ink shadow-xl">
              <span className="grid size-11 place-items-center rounded-full bg-brand-100 text-brand-700"><Truck size={20} /></span>
              <div><p className="text-sm font-bold">{t("Kurir tiba dalam 12 menit", "Courier arriving in 12 minutes")}</p><p className="text-xs text-mute">Budi Santoso · B 4281 KZI</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <Eyebrow>{t("Satu perjalanan kesehatan", "One health journey")}</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight">{t("Lima langkah dari “saya penasaran” hingga “saya tahu apa yang harus dilakukan”.", "Five steps from “I’m curious” to “I know what to do”.")}</h2>
        <ol className="mt-12 grid gap-5 md:grid-cols-5">
          {steps.map(([Icon, title, d], i) => (
            <li key={title} className="relative rounded-3xl border border-line bg-white p-6">
              <span className="font-display text-5xl font-semibold text-brand-100">{i + 1}</span>
              <span className="mt-4 grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon size={21} /></span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mute">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-brand-50">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 py-16 md:grid-cols-3 lg:px-10">
          {[
            [t("Hasil yang mudah dibaca", "Results that are easy to read"), t("Setiap nilai ditampilkan pada pengukur dengan penilaian hijau, kuning, atau merah, plus langkah selanjutnya yang jelas.", "Every value is shown on a gauge with a green, yellow, or red rating, plus a clear next step.")],
            [t("Rentang yang sesuai untuk Anda", "Ranges that fit you"), t("Kami memakai usia dan jenis kelamin Anda untuk menghitung rentang normal, sehingga angka dinilai dengan adil.", "We use your age and sex to calculate normal ranges, so your numbers are judged fairly.")],
            [t("Satu kunjungan, banyak tes", "One visit, many tests"), t("Kenali persiapan yang bertentangan seperti puasa sebelum memesan, bukan setelah kurir tiba.", "Spot conflicting preparation such as fasting before you book, not after the courier arrives.")],
          ].map(([title, d]) => (
            <div key={title} className="rounded-3xl bg-white p-7"><h3 className="font-display text-2xl font-semibold">{title}</h3><p className="mt-2 leading-relaxed text-mute">{d}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center lg:px-10">
        <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold leading-tight">{t("Siap melihat gambaran kesehatan Anda dengan lebih jelas?", "Ready to see your health more clearly?")}</h2>
        <Button className="mt-8 !min-h-14 !px-8 !text-base" onClick={() => go("register")}>{t("Buat profil saya", "Create my profile")} <ArrowRight size={18} /></Button>
      </section>
    </div>
  );
}

export function Login({ go, onLogin, initialEmail }: { go: (p: Page) => void; onLogin: (email: string, password: string) => boolean; initialEmail: string }) {
  const t = useT();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [authError, setAuthError] = useState(false);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const valid = validEmail && password.length >= 6;
  const fillSample = () => {
    setEmail("sari.wulandari@example.com");
    setPassword("ceksehat123");
    setTouched(false);
    setRecoverySent(false);
    setAuthError(false);
  };

  return (
    <div className="rise grid gap-12 py-12 lg:grid-cols-[1fr_440px] lg:py-16">
      <form className="max-w-xl" onSubmit={(e) => { e.preventDefault(); setTouched(true); setAuthError(false); if (valid && !onLogin(email.trim(), password)) setAuthError(true); }}>
        <Eyebrow>{t("Selamat datang kembali", "Welcome back")}</Eyebrow>
        <Title className="mt-3">{t("Masuk ke Cek Sehat", "Sign in to Cek Sehat")}</Title>
        <p className="mt-3 text-lg text-mute">{t("Lanjutkan perjalanan kesehatan Anda, tinjau pemesanan, dan lihat hasil terbaru Anda.", "Continue your health journey, review your bookings, and see your latest results.")}</p>

        <div className="mt-9 space-y-5">
          <Field label={t("Alamat email", "Email address")}>
            <TextInput
              type="email"
              autoComplete="email"
              placeholder={t("anda@example.com", "you@example.com")}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setAuthError(false); }}
              className={touched && !validEmail ? "border-bad-solid" : ""}
            />
          </Field>
          <Field label={t("Kata sandi", "Password")}>
            <div className="relative">
              <TextInput
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t("Masukkan kata sandi Anda", "Enter your password")}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(false); }}
                className={`pr-24 ${touched && password.length < 6 ? "border-bad-solid" : ""}`}
              />
              <Button
                variant="ghost"
                className="absolute right-2 top-1/2 !min-h-10 -translate-y-1/2 !px-3 !text-xs"
                onClick={() => setShowPassword((shown) => !shown)}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                {showPassword ? t("Sembunyikan", "Hide") : t("Tampilkan", "Show")}
              </Button>
            </div>
          </Field>
        </div>

        {touched && !valid && <p className="mt-4 text-sm font-semibold text-bad">{t("Masukkan email yang valid dan kata sandi minimal 6 karakter.", "Enter a valid email and a password of at least 6 characters.")}</p>}
        {authError && <p className="mt-4 text-sm font-semibold text-bad">{t("Email atau kata sandi tidak cocok dengan akun demo ini.", "The email or password doesn’t match this demo account.")}</p>}
        {recoverySent && <p className="mt-4 rounded-2xl bg-ok-bg px-4 py-3 text-sm font-semibold text-ok">{t("Petunjuk pengaturan ulang kata sandi telah dikirim untuk demo ini.", "Password reset instructions have been sent for this demo.")}</p>}

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button type="submit" className="!min-h-14 !px-8">{t("Masuk", "Sign in")} <ArrowRight size={18} /></Button>
          <Button variant="ghost" onClick={() => setRecoverySent(true)}>{t("Lupa kata sandi?", "Forgot password?")}</Button>
          <button type="button" className="text-sm font-bold text-brand-700 hover:underline" onClick={fillSample}>{t("Isi akun contoh", "Fill in sample account")}</button>
        </div>

        <p className="mt-7 text-sm text-mute">
          {t("Baru di Cek Sehat?", "New to Cek Sehat?")}{" "}
          <Button variant="ghost" className="!min-h-0 !p-0 align-baseline" onClick={() => go("register")}>{t("Buat akun", "Create account")}</Button>
        </p>
      </form>

      <aside className="h-fit overflow-hidden rounded-3xl bg-brand-900 p-8 text-white lg:sticky lg:top-28">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/10"><LockKeyhole size={22} /></span>
        <h2 className="mt-5 font-display text-2xl font-semibold leading-tight">{t("Informasi kesehatan Anda, semua di satu tempat", "Your health information, all in one place")}</h2>
        <p className="mt-3 leading-relaxed text-brand-100">{t("Masuklah untuk melanjutkan tepat dari tempat Anda berhenti di seluruh perjalanan skrining Anda.", "Sign in to pick up right where you left off in your screening journey.")}</p>
        <ul className="mt-7 space-y-4">
          {[t("Lanjutkan Cek Kesehatan Cerdas Anda", "Continue your Smart Health Check"), t("Lacak penjemputan sampel yang aktif", "Track your active sample pickup"), t("Tinjau hasil dan tren kesehatan", "Review your results and health trends")].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm font-semibold">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-brand-100"><Check size={14} strokeWidth={3} /></span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8 flex items-center gap-2 border-t border-white/10 pt-5 text-xs font-semibold text-brand-200"><ShieldCheck size={15} /> {t("Pengalaman demo yang aman · tanpa data kesehatan asli", "A safe demo experience · no real health data")}</p>
      </aside>
    </div>
  );
}

export function Register({ profile, setProfile, onContinue }: { profile: Profile; setProfile: (p: Profile) => void; onContinue: (password: string) => void }) {
  const t = useT();
  const [touched, setTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const set = (k: keyof Profile, v: string) => setProfile({ ...profile, [k]: v } as Profile);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email);
  const valid = profile.name.trim() && validEmail && password.length >= 6 && Number(profile.age) > 0 && profile.gender && profile.contact.trim().length >= 9 && profile.address.trim();
  const err = (bad: boolean) => (touched && bad ? "border-bad-solid" : "");
  const rows = [[t("Hemoglobin", "Hemoglobin"), t("12,0 – 15,5 g/dL", "12.0 – 15.5 g/dL"), t("13,0 – 17,0 g/dL", "13.0 – 17.0 g/dL")], [t("Kreatinin", "Creatinine"), t("0,6 – 1,1 mg/dL", "0.6 – 1.1 mg/dL"), t("0,7 – 1,3 mg/dL", "0.7 – 1.3 mg/dL")], [t("Kolesterol HDL", "HDL cholesterol"), t("di atas 50 mg/dL", "above 50 mg/dL"), t("di atas 40 mg/dL", "above 40 mg/dL")]];
  return (
    <div className="rise grid gap-12 py-12 lg:grid-cols-[1fr_440px] lg:py-16">
      <form onSubmit={(e) => { e.preventDefault(); setTouched(true); if (valid) onContinue(password); }}>
        <Eyebrow>{t("Langkah 0 · Buat profil", "Step 0 · Create profile")}</Eyebrow>
        <Title className="mt-3">{t("Ceritakan sedikit tentang Anda", "Tell us a little about yourself")}</Title>
        <p className="mt-3 max-w-xl text-lg text-mute">{t("Kurang dari satu menit. Data Anda tetap privat dan hanya dibagikan kepada lab yang Anda pilih.", "Less than a minute. Your data stays private and is only shared with the lab you choose.")}</p>
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2"><Field label={t("Nama lengkap", "Full name")}>
            <input className={`${inputCls} ${err(!profile.name.trim())}`} placeholder={t("mis. Sari Wulandari", "e.g. Sari Wulandari")} value={profile.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          </Field></div>
          <div className="md:col-span-2"><Field label={t("Email address", "Email address")} hint={t("Gunakan email ini untuk masuk ke akun Anda.", "Use this email to sign in to your account.")}>
            <TextInput
              type="email"
              autoComplete="email"
              placeholder={t("anda@example.com", "you@example.com")}
              value={profile.email}
              onChange={(e) => set("email", e.target.value)}
              className={err(!validEmail)}
            />
          </Field></div>
          <div className="md:col-span-2"><Field label={t("Password", "Password")} hint={t("Minimal 6 karakter.", "At least 6 characters.")}>
            <div className="relative">
              <TextInput
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t("Buat kata sandi", "Create a password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`pr-24 ${err(password.length < 6)}`}
              />
              <Button type="button" variant="ghost" className="absolute right-2 top-1/2 !min-h-10 -translate-y-1/2 !px-3 !text-xs" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                {showPassword ? t("Sembunyikan", "Hide") : t("Tampilkan", "Show")}
              </Button>
            </div>
          </Field></div>
          <Field label={t("Usia", "Age")}>
            <input className={`${inputCls} ${err(!(Number(profile.age) > 0))}`} inputMode="numeric" placeholder="34" value={profile.age} onChange={(e) => set("age", e.target.value.replace(/\D/g, "").slice(0, 3))} />
          </Field>
          <div>
            <span className="mb-1.5 block text-[13px] font-bold">{t("Jenis kelamin", "Sex")}</span>
            <div className={`grid grid-cols-2 gap-2 rounded-2xl ${touched && !profile.gender ? "ring-2 ring-bad-solid" : ""}`} role="radiogroup" aria-label={t("Jenis kelamin", "Sex")}>
              {(["Female", "Male"] as const).map((g) => (
                <button type="button" role="radio" aria-checked={profile.gender === g} key={g} onClick={() => set("gender", g)}
                  className={`min-h-[52px] rounded-2xl border text-[15px] font-bold transition ${profile.gender === g ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink hover:border-brand-200"}`}>{g === "Female" ? t("Perempuan", "Female") : t("Laki-laki", "Male")}</button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2"><Field label={t("Telepon / WhatsApp", "Phone / WhatsApp")} hint={t("Kurir akan menghubungi nomor ini.", "The courier will contact this number.")}>
            <input className={`${inputCls} ${err(profile.contact.trim().length < 9)}`} inputMode="tel" placeholder="0812 3456 7890" value={profile.contact} onChange={(e) => set("contact", e.target.value)} autoComplete="tel" />
          </Field></div>
          <div className="md:col-span-2"><Field label={t("Alamat rumah", "Home address")} hint={t("Digunakan sebagai lokasi penjemputan sampel utama Anda.", "Used as your main sample pickup location.")}>
            <textarea rows={3} className={`${inputCls} resize-none ${err(!profile.address.trim())}`} placeholder="Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190" value={profile.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />
          </Field></div>
        </div>
        {touched && !valid && <p className="mt-4 text-sm font-semibold text-bad">{t("Mohon lengkapi semua kolom untuk melanjutkan.", "Please complete all fields to continue.")}</p>}
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Button type="submit" className="!min-h-14 !px-8">{t("Lanjutkan", "Continue")} <ArrowRight size={18} /></Button>
          <button type="button" className="text-sm font-bold text-brand-700 hover:underline" onClick={() => { setPassword("ceksehat123"); setProfile({ name: "Sari Wulandari", email: "sari.wulandari@example.com", age: "34", gender: "Female", contact: "0812 3456 7890", address: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190", avatar: "" }); }}>{t("Isi dengan data contoh", "Fill in sample data")}</button>
        </div>
      </form>
      <aside className="h-fit rounded-3xl bg-brand-900 p-8 text-white lg:sticky lg:top-28">
        <span className="grid size-12 place-items-center rounded-2xl bg-white/10"><Info size={22} /></span>
        <h2 className="mt-5 font-display text-2xl font-semibold leading-tight">{t("Mengapa usia dan jenis kelamin penting", "Why age and sex matter")}</h2>
        <p className="mt-3 leading-relaxed text-brand-100">{t("Keduanya penting untuk menghitung ", "Both are needed to calculate your ")}<strong className="text-white">{t("rentang referensi normal", "normal reference ranges")}</strong>{t(" Anda. Angka yang sama bisa sehat bagi satu orang dan menjadi peringatan bagi orang lain.", ". The same number can be healthy for one person and a warning sign for another.")}</p>
        <table className="mt-6 w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-brand-200"><tr><th className="pb-2 font-bold">{t("Penanda", "Marker")}</th><th className="pb-2 font-bold">{t("Perempuan", "Female")}</th><th className="pb-2 font-bold">{t("Laki-laki", "Male")}</th></tr></thead>
          <tbody className="divide-y divide-white/10">{rows.map(([a, b, c]) => <tr key={a}><td className="py-2.5 font-bold">{a}</td><td className="py-2.5 text-brand-100">{b}</td><td className="py-2.5 text-brand-100">{c}</td></tr>)}</tbody>
        </table>
        <p className="mt-5 text-xs text-brand-200">{t("Usia juga memengaruhi rentang untuk penanda glukosa, kolesterol, dan ginjal.", "Age also affects the ranges for glucose, cholesterol, and kidney markers.")}</p>
      </aside>
    </div>
  );
}

export function HomeScreen({ profile, go, cartCount, booking, entries }: { entries: HistoryEntry[]; profile: Profile; go: (p: Page) => void; cartCount: number; booking?: { date: string; slot: string } }) {
  const t = useT();
  const { members } = usePeople();
  const [adding, setAdding] = useState(false);
  const hasBooking = !!(booking?.date && booking.slot);
  const fp = hasBooking ? fastingPlan(booking!.slot, 10) : null;
  const first = profile.name.split(" ")[0] || t("Anda", "there");
  const journey: { label: string; sub: string; page: Page }[] = [
    { label: t(stages[0], "Understand"), sub: t("Cek Kesehatan Cerdas", "Smart Health Check"), page: "quiz" },
    { label: t(stages[1], "Plan"), sub: cartCount ? t(`${cartCount} tes dalam pemesanan Anda`, `${cartCount} ${cartCount === 1 ? "test" : "tests"} in your booking`) : t("Pilih lab & tes Anda", "Choose your lab & tests"), page: "labs" },
    { label: t(stages[2], "Coordinate"), sub: t("Tanggal & penjemputan", "Date & pickup"), page: "checkout" },
    { label: t(stages[3], "Monitor"), sub: t("Pantau sampel Anda", "Track your sample"), page: "tracking" },
    { label: t(stages[4], "Follow up"), sub: t("Hasil & linimasa", "Results & timeline"), page: "timeline" },
  ];
  const latest = entries[0]; const lm = metrics[latest.metric];
  return (
    <div className="rise py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-mute">{t("Rabu, 14 Oktober 2026", "Wednesday, 14 October 2026")}</p>
          <Title className="mt-1">{t(`Halo, ${first}.`, `Hello, ${first}.`)}</Title>
          <p className="mt-2 text-lg text-mute">{t(`Rentang referensi disesuaikan untuk ${profile.gender === "Female" ? "perempuan" : profile.gender === "Male" ? "laki-laki" : "orang dewasa"} berusia ${profile.age} tahun.`, `Reference ranges are tailored for a ${profile.age}-year-old ${profile.gender === "Female" ? "woman" : profile.gender === "Male" ? "man" : "adult"}.`)}</p>
        </div>
        <Button onClick={() => go("labs")}>{t("Pesan tes", "Book tests")} <ArrowRight size={18} /></Button>
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-6">
          <button onClick={() => go("quiz")} className="group relative w-full overflow-hidden rounded-3xl bg-brand-700 p-9 text-left text-white">
            <div className="pointer-events-none absolute -right-14 -top-14 size-64 rounded-full bg-brand-500/50" />
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider"><Sparkles size={13} /> {t("2 menit", "2 minutes")}</span>
            <h2 className="relative mt-5 max-w-md font-display text-4xl font-semibold leading-tight">{t("Belum yakin tes apa yang Anda butuhkan?", "Not sure which tests you need?")}</h2>
            <p className="relative mt-3 max-w-md text-brand-100">{t("Jawab 7 pertanyaan singkat dan dapatkan saran tes yang dipersonalisasi.", "Answer 7 short questions and get personalised test suggestions.")}</p>
            <span className="relative mt-7 inline-flex items-center gap-2 font-bold">{t("Mulai Cek Kesehatan Cerdas", "Start the Smart Health Check")} <ArrowRight size={17} className="transition group-hover:translate-x-1" /></span>
          </button>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="flex gap-4 border-warn-solid/40 bg-warn-bg">
              <CalendarClock className="mt-0.5 shrink-0 text-warn" />
              <div><p className="font-bold text-warn">{fp ? t(`Mulai berpuasa pukul ${fp.start}${fp.prev ? " pada malam sebelumnya" : ""}`, `Start fasting at ${fp.start}${fp.prev ? " the evening before" : ""}`) : t("Malam ini: mulai berpuasa pukul 21.00", "Tonight: start fasting at 9:00 pm")}</p><p className="mt-1 text-sm text-warn/90">{hasBooking ? t(`Sampel Anda dijemput pada ${fmtDate(booking!.date, { day: "numeric", month: "short" })}, ${booking!.slot}.`, `Your sample is picked up on ${fmtDate(booking!.date, { day: "numeric", month: "short" })}, ${booking!.slot}.`) : t("Sampel Anda dijemput besok pukul 06.00–07.00.", "Your sample is picked up tomorrow at 06:00–07:00.")}</p></div>
            </Card>
            <button onClick={() => go("timeline")} className="min-w-0 overflow-hidden rounded-3xl border border-line bg-white p-5 text-left transition hover:border-brand-200">
              <p className="text-xs font-bold uppercase tracking-wider text-mute">{t("Hasil terbaru", "Latest result")} · {fmtDate(latest.date, { day: "numeric", month: "short" })}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
                <div className="min-w-0">
                  <p className="whitespace-nowrap font-display text-4xl font-semibold leading-none">{latest.value} <span className="text-sm font-semibold text-mute">{lm.unit}</span></p>
                  <p className="mt-1 text-sm text-mute">{t(lm.name)}</p>
                </div>
                <TierBadge tier={tierOf(lm, latest.value)} size="lg" />
              </div>
            </button>
          </div>
        </div>
        <Card className="p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">{t("Mau untuk keluarga?", "Testing for family?")}</h2>
              <p className="mt-1 text-mute">{t("Tambahkan anggota keluarga ke akun ini. Setiap orang punya data dan linimasa sendiri.", "Add family members to this account. Each person gets their own data and timeline.")}</p>
            </div>
            {!adding && <Button variant="secondary" onClick={() => setAdding(true)}><Plus size={17} /> {t("Tambah orang", "Add person")}</Button>}
          </div>
          {members.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {members.map((m) => <li key={m.id} className="flex items-center gap-2 rounded-full border border-line bg-paper py-1.5 pl-1.5 pr-4 text-sm font-bold"><Avatar name={m.name} size="sm" />{m.name}<span className="font-semibold text-mute">· {m.age} {t("th", "yrs")}</span></li>)}
            </ul>
          )}
          {adding && <div className="mt-5"><AddMemberForm onDone={() => setAdding(false)} /></div>}
        </Card>
        <Card className="p-7">
          <h2 className="font-display text-2xl font-semibold">{t("Perjalanan kesehatan Anda", "Your health journey")}</h2>
          <ol className="mt-4 space-y-2">
            {journey.map((j, i) => (
              <li key={j.label}>
                <button onClick={() => go(j.page)} className="flex w-full items-center gap-4 rounded-2xl border border-line p-3.5 text-left transition hover:border-brand-200 hover:bg-brand-50/60">
                  <span className="grid size-9 place-items-center rounded-full bg-brand-100 text-sm font-extrabold text-brand-700">{i + 1}</span>
                  <span className="flex-1"><span className="block font-bold">{j.label}</span><span className="block text-[13px] text-mute">{j.sub}</span></span>
                  <ArrowRight size={16} className="text-brand-600" />
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-mute"><ShieldCheck size={14} /> {t("Lab mitra terakreditasi KAN (ISO 15189)", "KAN-accredited partner labs (ISO 15189)")}</p>
        </Card>
      </div>
    </div>
  );
}

export function scoreAnswers(answers: Answers) {
  const total: Record<TestKey, number> = { glucose: 0, anemia: 0, cholesterol: 0, kidney: 0, urine: 0 };
  const why: Record<TestKey, { w: number; label: string }> = Object.fromEntries(tests.map((t) => [t.key, { w: 0, label: "" }])) as never;
  questions.forEach((q) => (answers[q.id] ?? []).forEach((oi) => {
    const o = q.options[oi];
    (Object.entries(o.score) as [TestKey, number][]).forEach(([k, w]) => {
      total[k] += w;
      if (w > why[k].w) why[k] = { w, label: o.label };
    });
  }));
  return tests.map((t) => ({ key: t.key, score: total[t.key], why: why[t.key].label })).sort((a, b) => b.score - a.score);
}

export function Quiz({ answers, setAnswers, go }: { answers: Answers; setAnswers: (a: Answers) => void; go: (p: Page) => void }) {
  const t = useT();
  const [i, setI] = useState(0);
  const q = questions[i];
  const sel = answers[q.id] ?? [];
  const pick = (oi: number) => {
    if (!q.multi) return setAnswers({ ...answers, [q.id]: [oi] });
    const lastNone = q.options.length - 1;
    let next = sel.includes(oi) ? sel.filter((x) => x !== oi) : [...sel, oi];
    if (oi === lastNone) next = sel.includes(oi) ? [] : [oi];
    else next = next.filter((x) => x !== lastNone);
    setAnswers({ ...answers, [q.id]: next });
  };
  const next = () => (i === questions.length - 1 ? go("quizResult") : setI(i + 1));
  return (
    <div className="grid gap-10 py-12 lg:grid-cols-[1fr_300px] lg:py-14">
      <div>
        <div className="flex items-center justify-between text-xs font-bold text-mute">
          <span className="uppercase tracking-wider text-brand-700">{t(q.stage)}</span>
          <span>{t(`Pertanyaan ${i + 1} dari ${questions.length}`, `Question ${i + 1} of ${questions.length}`)}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100"><div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${((i + 1) / questions.length) * 100}%` }} /></div>
        <div key={q.id} className="rise">
          <Title className="mt-9">{t(q.title)}</Title>
          <p className="mt-3 text-lg text-mute">{t(q.subtitle)}</p>
          <div className="mt-8 grid gap-3 md:grid-cols-2" role={q.multi ? "group" : "radiogroup"}>
            {q.options.map((o, oi) => {
              const on = sel.includes(oi);
              return (
                <button key={o.label} role={q.multi ? "checkbox" : "radio"} aria-checked={on} onClick={() => pick(oi)}
                  className={`flex min-h-[84px] w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${on ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:border-brand-200"}`}>
                  <span className="flex-1"><span className="block text-[17px] font-bold leading-snug">{t(o.label)}</span>{o.hint && <span className="mt-0.5 block text-[13px] text-mute">{t(o.hint)}</span>}</span>
                  <Check2 on={on} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          {i > 0 && <Button variant="secondary" onClick={() => setI(i - 1)}>{t("Kembali", "Back")}</Button>}
          <Button className="min-w-56" disabled={!sel.length} onClick={next}>{i === questions.length - 1 ? t("Lihat saran untuk saya", "See my suggestions") : t("Lanjutkan", "Continue")} <ArrowRight size={18} /></Button>
        </div>
      </div>
      <aside className="hidden h-fit rounded-3xl border border-line bg-white p-6 lg:sticky lg:top-28 lg:block">
        <p className="text-xs font-extrabold uppercase tracking-wider text-mute">{t("Kuesioner Anda", "Your questionnaire")}</p>
        <ol className="mt-4 space-y-1">
          {questions.map((x, n) => {
            const done = (answers[x.id] ?? []).length > 0;
            return (
              <li key={x.id}>
                <button onClick={() => setI(n)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${n === i ? "bg-brand-100 text-brand-800" : "text-mute hover:bg-brand-50"}`}>
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${done ? "bg-brand-600 text-white" : "bg-line text-mute"}`}>{done ? <Check size={13} strokeWidth={3.5} /> : n + 1}</span>
                  <span className="truncate">{t(x.stage)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}

export function QuizResult({ answers, cart, setCart, go }: { answers: Answers; cart: TestKey[]; setCart: (c: TestKey[]) => void; go: (p: Page) => void }) {
  const t = useT();
  const ranked = useMemo(() => scoreAnswers(answers), [answers]);
  const recs = ranked.filter((r) => r.score > 0).slice(0, 3);
  const list = recs.length ? recs : ranked.slice(0, 2).map((r) => ({ ...r, why: t("Bagian dari pemeriksaan rutin", "Part of a routine check-up") }));
  const sum = list.reduce((s, r) => s + testByKey[r.key].price, 0);
  const pct = (s: number) => Math.min(97, 52 + s * 7);
  const names = list.map((r) => t(testByKey[r.key].tested)).join(" + ");
  const addAll = () => { setCart(Array.from(new Set([...cart, ...list.map((r) => r.key)]))); go("labs"); };
  return (
    <div className="rise grid gap-10 py-12 lg:grid-cols-[1fr_400px] lg:py-14">
      <div>
        <span className="grid size-12 place-items-center rounded-2xl bg-ok-bg text-ok"><Check size={24} strokeWidth={3} /></span>
        <Title className="mt-5">{t("Paket yang disarankan untuk Anda", "Your suggested package")}</Title>
        <p className="mt-3 max-w-xl text-lg text-mute">{t("Berdasarkan jawaban Anda, tes-tes ini memberikan gambaran yang paling berguna.", "Based on your answers, these tests give you the most useful picture.")}</p>
        <h2 className="mt-9 text-sm font-extrabold uppercase tracking-wider text-mute">{t("Mengapa tes ini", "Why these tests")}</h2>
        <div className="mt-4 space-y-4">
          {list.map((r) => {
            const tk = testByKey[r.key]; const Icon = tk.icon;
            return (
              <Card key={r.key} className="flex gap-5 p-6">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon size={26} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold leading-tight">{t(tk.tested)} <span className="font-medium text-mute">· {tk.id}</span></p>
                  <p className="mt-1 text-mute">{t(reasons[r.key])}</p>
                  <p className="mt-2 text-sm font-semibold text-brand-700">{t("Karena Anda memilih: ", "Because you chose: ")}{t(r.why)}</p>
                  <div className="mt-3 flex max-w-sm items-center gap-3"><div className="h-2 flex-1 rounded-full bg-brand-100"><div className="h-full rounded-full bg-brand-600" style={{ width: `${pct(r.score)}%` }} /></div><span className="text-sm font-bold">{t(`${pct(r.score)}% cocok`, `${pct(r.score)}% match`)}</span></div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <aside className="h-fit lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-3xl bg-brand-900 p-7 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-200">{t("Paket Cek Sehat Personal", "Personal Cek Sehat Package")}</p>
          <p className="mt-3 font-display text-3xl font-semibold leading-tight">{names}</p>
          <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-5">
            <div><p className="text-xs text-brand-200">{t("Harga paket (diskon 10%)", "Package price (10% off)")}</p><p className="font-display text-4xl font-semibold">{rp(sum * 0.9)}</p></div>
            <p className="pb-1 text-sm text-brand-200 line-through">{rp(sum)}</p>
          </div>
          <Button className="mt-6 w-full bg-white !text-brand-800 hover:!bg-brand-50 !shadow-none" onClick={addAll}>{t("Tambahkan paket ke pemesanan", "Add package to booking")} <ArrowRight size={18} /></Button>
          <button className="mt-2 w-full py-2 text-sm font-bold text-brand-100 hover:text-white" onClick={() => go("labs")}>{t("Lihat semua tes", "View all tests")}</button>
        </div>
        <p className="mt-4 text-center text-xs text-mute">{t("Ini adalah saran skrining, bukan diagnosis.", "This is screening guidance, not a diagnosis.")}</p>
      </aside>
    </div>
  );
}
