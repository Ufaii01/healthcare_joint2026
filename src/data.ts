import { locale } from "./i18n";
import { Bean, Droplet, Droplets, HeartPulse, TestTube2, type LucideIcon } from "lucide-react";

export type Tier = "green" | "amber" | "red";
export type TestKey = "glucose" | "anemia" | "cholesterol" | "kidney" | "urine";

export const rp = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`;

export const tierMeta: Record<Tier, { en: string; id: string; text: string; bg: string; border: string; solid: string; hex: string }> = {
  green: { en: "Normal", id: "Normal", text: "text-ok", bg: "bg-ok-bg", border: "border-ok-solid", solid: "bg-ok-solid", hex: "#14a062" },
  amber: { en: "Berpotensi berisiko", id: "Kemungkinan", text: "text-warn", bg: "bg-warn-bg", border: "border-warn-solid", solid: "bg-warn-solid", hex: "#e6a100" },
  red: { en: "Risiko tinggi", id: "Kemungkinan besar", text: "text-bad", bg: "bg-bad-bg", border: "border-bad-solid", solid: "bg-bad-solid", hex: "#d43a31" },
};

export type TestItem = {
  key: TestKey;
  name: string;
  id: string;
  blurb: string;
  measures: string;
  price: number;
  prep: "fasting" | "normal" | "flexible";
  prepText: string;
  fastHours?: number;
  turnaround: string;
  icon: LucideIcon;
  tested: string;
  testName: string;
  prereqs: string[];
};

export const tests: TestItem[] = [
  { key: "glucose", name: "Gula Darah", id: "Gula Darah Puasa", blurb: "Glukosa puasa — tanda awal risiko diabetes.", measures: "Glukosa (mg/dL)", price: 45000, prep: "fasting", prepText: "Puasa 8–10 jam. Hanya boleh air putih.", fastHours: 10, turnaround: "Hari yang sama", icon: Droplets, tested: "Gula darah", testName: "Gula Darah Puasa", prereqs: ["Puasa 8–10 jam sebelum tes", "Boleh minum air putih", "Hindari minuman manis, kopi, dan teh", "Minum obat rutin hanya jika disarankan dokter"] },
  { key: "anemia", name: "Anemia", id: "Hemoglobin & Darah Lengkap", blurb: "Hemoglobin dan indeks sel darah merah untuk mencari penyebab rasa lelah.", measures: "Hemoglobin (g/dL)", price: 65000, prep: "flexible", prepText: "Tidak perlu persiapan khusus.", turnaround: "Hari yang sama", icon: Droplet, tested: "Hemoglobin", testName: "Tes Darah Vena (Hemoglobin & Darah Lengkap)", prereqs: ["Tidak perlu puasa", "Makan dan minum seperti biasa", "Hindari olahraga berat pada pagi hari tes", "Beri tahu petugas jika Anda mengonsumsi suplemen zat besi"] },
  { key: "cholesterol", name: "Kolesterol", id: "Kolesterol / Profil Lipid", blurb: "Total, LDL, HDL, dan trigliserida untuk kesehatan jantung.", measures: "Kolesterol total (mg/dL)", price: 135000, prep: "fasting", prepText: "Puasa 10–12 jam. Hindari makanan berlemak malam sebelumnya.", fastHours: 12, turnaround: "1 hari", icon: HeartPulse, tested: "Kolesterol", testName: "Profil Lipid (Kolesterol Total, LDL, HDL, Trigliserida)", prereqs: ["Puasa 10–12 jam sebelum tes", "Boleh minum air putih", "Jangan makan makanan berlemak atau gorengan malam sebelumnya", "Hindari alkohol selama 24 jam"] },
  { key: "kidney", name: "Ginjal", id: "Ginjal — Ureum & Kreatinin", blurb: "Kreatinin dan ureum menunjukkan seberapa baik ginjal menyaring.", measures: "Kreatinin (mg/dL)", price: 95000, prep: "normal", prepText: "Makan dan minum seperti biasa. Minum 2 gelas air sebelumnya.", turnaround: "1 hari", icon: Bean, tested: "Kreatinin & ureum", testName: "Tes Ureum & Kreatinin", prereqs: ["Tidak perlu puasa", "Minum 2 gelas air sebelumnya", "Hindari makanan daging berat dan suplemen malam sebelumnya", "Hindari olahraga berat selama 24 jam"] },
  { key: "urine", name: "Urin", id: "Urin Lengkap", blurb: "Memeriksa protein, gula, dan penanda infeksi.", measures: "Panel urin", price: 55000, prep: "normal", prepText: "Gunakan urin pertama di pagi hari. Minum air seperti biasa.", turnaround: "Hari yang sama", icon: TestTube2, tested: "Urin", testName: "Urin Lengkap (Urinalisis)", prereqs: ["Tidak perlu puasa", "Gunakan urin pertama di pagi hari", "Minum air seperti biasa", "Gunakan wadah steril yang disediakan dan jangan sentuh bibir wadah"] },
];

export const testByKey = Object.fromEntries(tests.map((t) => [t.key, t])) as Record<TestKey, TestItem>;

// ---------- Questionnaire ----------
export type Option = { label: string; hint?: string; score: Partial<Record<TestKey, number>> };
export type Question = { id: string; stage: string; title: string; subtitle: string; multi?: boolean; options: Option[] };

export const questions: Question[] = [
  { id: "goal", stage: "Tujuan Anda", title: "Apa yang membawa Anda ke sini hari ini?", subtitle: "Pilih yang paling sesuai.", options: [
    { label: "Pemeriksaan umum", hint: "Mengetahui kondisi dasar saya", score: { glucose: 1, anemia: 1, cholesterol: 1, kidney: 1, urine: 1 } },
    { label: "Mencegah diabetes", hint: "Gula darah & gaya hidup", score: { glucose: 3, urine: 1 } },
    { label: "Menjaga jantung saya", hint: "Kolesterol & tekanan darah", score: { cholesterol: 3, kidney: 1 } },
    { label: "Akhir-akhir ini saya mudah lelah", hint: "Kurang tenaga, tampak pucat", score: { anemia: 3, glucose: 1 } },
  ] },
  { id: "family", stage: "Riwayat keluarga", title: "Apakah ada keluarga dekat Anda yang mengalami…", subtitle: "Orang tua atau saudara kandung. Pilih semua yang sesuai.", multi: true, options: [
    { label: "Diabetes", score: { glucose: 3 } },
    { label: "Kolesterol tinggi atau penyakit jantung", score: { cholesterol: 3 } },
    { label: "Penyakit ginjal atau hipertensi", score: { kidney: 3, urine: 1 } },
    { label: "Anemia atau talasemia", score: { anemia: 3 } },
    { label: "Tidak ada yang saya ketahui", score: {} },
  ] },
  { id: "drinks", stage: "Gaya hidup", title: "Berapa gelas minuman manis yang Anda minum sehari?", subtitle: "Teh manis, kopi susu, boba, minuman bersoda.", options: [
    { label: "Jarang atau tidak pernah", score: {} },
    { label: "1–2 gelas sehari", score: { glucose: 1, cholesterol: 1 } },
    { label: "3 gelas atau lebih sehari", score: { glucose: 3, cholesterol: 1, urine: 1 } },
  ] },
  { id: "activity", stage: "Gaya hidup", title: "Seberapa aktif Anda dalam seminggu?", subtitle: "Jawab apa adanya — tidak ada jawaban yang salah.", options: [
    { label: "Lebih banyak duduk", hint: "Kerja di meja, jarang berolahraga", score: { glucose: 2, cholesterol: 2 } },
    { label: "Aktivitas ringan", hint: "Jalan kaki, olahraga 1–2 kali", score: { glucose: 1, cholesterol: 1 } },
    { label: "Sangat aktif", hint: "Olahraga 3 kali atau lebih seminggu", score: {} },
  ] },
  { id: "diet", stage: "Gaya hidup", title: "Mana yang paling menggambarkan Anda?", subtitle: "Kebiasaan makan dan merokok.", options: [
    { label: "Makan seimbang, tidak merokok", score: {} },
    { label: "Sering makan gorengan atau makanan berlemak", hint: "Gorengan, santan, jeroan", score: { cholesterol: 3 } },
    { label: "Saya merokok", score: { cholesterol: 2, kidney: 1 } },
  ] },
  { id: "symptoms", stage: "Gejala", title: "Pernah merasakan salah satu dari ini baru-baru ini?", subtitle: "Dalam 3 bulan terakhir. Pilih semua yang sesuai.", multi: true, options: [
    { label: "Sering haus dan sering buang air kecil", score: { glucose: 3, urine: 2, kidney: 1 } },
    { label: "Lelah, pusing, kulit pucat", score: { anemia: 3 } },
    { label: "Kaki bengkak atau urin berbusa", score: { kidney: 3, urine: 3 } },
    { label: "Dada terasa sesak atau sering sakit kepala", score: { cholesterol: 2, kidney: 1 } },
    { label: "Tidak ada", score: {} },
  ] },
  { id: "water", stage: "Gejala", title: "Berapa banyak air yang Anda minum setiap hari?", subtitle: "Satu gelas kira-kira 250 ml.", options: [
    { label: "Kurang dari 1 liter", hint: "Kurang dari 4 gelas", score: { kidney: 2, urine: 2 } },
    { label: "1–2 liter", hint: "4–8 gelas", score: { urine: 1 } },
    { label: "Lebih dari 2 liter", score: {} },
  ] },
];

export const reasons: Record<TestKey, string> = {
  glucose: "Memeriksa kenaikan gula darah sebelum gejala muncul.",
  anemia: "Menjelaskan penyebab kurang tenaga dan memeriksa masalah zat besi.",
  cholesterol: "Mengukur lemak yang menumpuk di pembuluh darah.",
  kidney: "Menunjukkan seberapa efisien ginjal Anda menyaring limbah.",
  urine: "Pemeriksaan sederhana untuk gula, protein, dan infeksi.",
};

// ---------- Labs ----------
export const labs = [
  { id: "mitra", name: "Lab Mitra Sehat", area: "Kebayoran Baru, Jakarta Selatan", rating: 4.8, reviews: 2140, distance: "2.1 km", mult: 1, tests: ["glucose", "anemia"] as TestKey[], prices: { glucose: 45000, anemia: 65000 } as Partial<Record<TestKey, number>>, result: "Hari yang sama – 24 jam", slots: "Jemput mulai 06:00", tag: "Direkomendasikan", accredited: "KAN ISO 15189" },
  { id: "cendana", name: "Laboratorium Cendana Medika", area: "Cilandak, Jakarta Selatan", rating: 4.9, reviews: 980, distance: "4.6 km", mult: 1, tests: ["anemia", "cholesterol", "glucose"] as TestKey[], prices: { anemia: 72000, cholesterol: 155000, glucose: 52000 } as Partial<Record<TestKey, number>>, result: "Dalam 12 jam", slots: "Jemput mulai 05:30", tag: "Hasil tercepat", accredited: "KAN ISO 15189" },
  { id: "nusantara", name: "Lab Nusantara Diagnostik", area: "Tebet, Jakarta Selatan", rating: 4.6, reviews: 3320, distance: "6.3 km", mult: 1, tests: ["kidney", "urine"] as TestKey[], prices: { kidney: 85000, urine: 50000 } as Partial<Record<TestKey, number>>, result: "24 – 48 jam", slots: "Jemput mulai 07:00", tag: "Paling hemat", accredited: "KAN ISO 15189" },
];

export const labPrice = (labId: string, key: TestKey) => (labs.find((l) => l.id === labId) ?? labs[0]).prices[key] ?? testByKey[key].price;

export function fastingPlan(slot: string, hours: number) {
  const [h, m] = slot.slice(0, 5).split(":").map(Number);
  const mins = h * 60 + m - hours * 60;
  const prev = mins < 0;
  const at = ((mins % 1440) + 1440) % 1440;
  const f = (x: number) => `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
  return { start: f(at), reminder: f((at - 30 + 1440) % 1440), prev };
}

// ---------- Metrics & results ----------
export type Segment = { from: number; to: number; tier: Tier };
export type Metric = {
  key: "glucose" | "cholesterol" | "hemoglobin" | "kidney" | "urine";
  name: string; id: string; unit: string; min: number; max: number; segments: Segment[];
  refText: (g: string) => string; samples: Record<Tier, number>; retest: Record<Tier, string>; decimals: number;
};

export const metrics: Record<Metric["key"], Metric> = {
  glucose: { key: "glucose", name: "Gula darah", id: "Gula darah", unit: "mg/dL", min: 60, max: 180, decimals: 0,
    segments: [{ from: 60, to: 100, tier: "green" }, { from: 100, to: 126, tier: "amber" }, { from: 126, to: 180, tier: "red" }],
    refText: () => "Normal di bawah 100 · Pradiabetes 100–125 · Rentang diabetes 126+", samples: { green: 92, amber: 112, red: 148 },
    retest: { green: "12 bulan lagi", amber: "dalam 3 bulan", red: "setelah kunjungan ke dokter" } },
  cholesterol: { key: "cholesterol", name: "Kolesterol", id: "Kolesterol", unit: "mg/dL", min: 120, max: 300, decimals: 0,
    segments: [{ from: 120, to: 200, tier: "green" }, { from: 200, to: 240, tier: "amber" }, { from: 240, to: 300, tier: "red" }],
    refText: () => "Ideal di bawah 200 · Batas tinggi 200–239 · Tinggi 240+", samples: { green: 176, amber: 215, red: 262 },
    retest: { green: "12 bulan lagi", amber: "dalam 3 bulan", red: "setelah kunjungan ke dokter" } },
  hemoglobin: { key: "hemoglobin", name: "Hemoglobin", id: "Hemoglobin", unit: "g/dL", min: 6, max: 18, decimals: 1,
    segments: [{ from: 6, to: 10, tier: "red" }, { from: 10, to: 12, tier: "amber" }, { from: 12, to: 16, tier: "green" }, { from: 16, to: 18, tier: "amber" }],
    refText: (g) => (g === "Male" ? "Normal untuk pria dewasa: 13,0–17,0 g/dL" : "Normal untuk wanita dewasa: 12,0–15,5 g/dL"), samples: { green: 13.6, amber: 11.2, red: 8.4 },
    retest: { green: "12 bulan lagi", amber: "dalam 6 minggu", red: "segera setelah bertemu dokter" } },
  kidney: { key: "kidney", name: "Kreatinin & ureum", id: "Kreatinin & ureum", unit: "mg/dL", min: 0.4, max: 3, decimals: 2,
    segments: [{ from: 0.4, to: 1.1, tier: "green" }, { from: 1.1, to: 1.5, tier: "amber" }, { from: 1.5, to: 3, tier: "red" }],
    refText: (g) => (g === "Male" ? "Normal untuk pria dewasa: 0,7–1,3 mg/dL" : "Normal untuk wanita dewasa: 0,6–1,1 mg/dL"), samples: { green: 0.82, amber: 1.28, red: 1.9 },
    retest: { green: "12 bulan lagi", amber: "dalam 2 bulan", red: "segera setelah bertemu dokter" } },
  urine: { key: "urine", name: "Urin", id: "Urin", unit: "mg/dL protein", min: 0, max: 100, decimals: 0,
    segments: [{ from: 0, to: 15, tier: "green" }, { from: 15, to: 30, tier: "amber" }, { from: 30, to: 100, tier: "red" }],
    refText: () => "Protein urin normal di bawah 15 mg/dL · Waspada 15–29 · Tinggi 30+", samples: { green: 8, amber: 22, red: 45 },
    retest: { green: "12 bulan lagi", amber: "dalam 1 bulan", red: "segera setelah bertemu dokter" } },
};

export const tierOf = (m: Pick<Metric, "segments">, v: number): Tier =>
  (m.segments.find((s) => v >= s.from && v < s.to) ?? m.segments[m.segments.length - 1]).tier;

export type HistoryEntry = { id: string; date: string; label: string; metric: Metric["key"]; value: number; lab: string; owner?: string };

export const history: HistoryEntry[] = [
  { id: "h8", date: "2026-10-13", label: "Gula darah", metric: "glucose", value: 112, lab: "Lab Mitra Sehat" },
  { id: "h7", date: "2026-08-14", label: "Kolesterol", metric: "cholesterol", value: 205, lab: "Lab Mitra Sehat" },
  { id: "h6", date: "2026-08-14", label: "Gula darah", metric: "glucose", value: 104, lab: "Lab Mitra Sehat" },
  { id: "h5", date: "2026-06-02", label: "Gula darah", metric: "glucose", value: 109, lab: "Lab Nusantara Diagnostik" },
  { id: "h4", date: "2026-03-22", label: "Kolesterol", metric: "cholesterol", value: 226, lab: "Lab Mitra Sehat" },
  { id: "h3", date: "2026-03-22", label: "Hemoglobin", metric: "hemoglobin", value: 13.8, lab: "Lab Mitra Sehat" },
  { id: "h2", date: "2026-01-18", label: "Gula darah", metric: "glucose", value: 121, lab: "Lab Mitra Sehat" },
  { id: "h1", date: "2025-11-12", label: "Kolesterol", metric: "cholesterol", value: 248, lab: "Lab Mitra Sehat" },
  { id: "h0", date: "2025-11-12", label: "Gula darah", metric: "glucose", value: 131, lab: "Lab Mitra Sehat" },
];

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(iso + "T00:00:00").toLocaleDateString(locale(), opts);
