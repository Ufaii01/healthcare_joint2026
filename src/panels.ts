import type { Metric, Tier } from "./data";

export type Flag = "n" | "h" | "l";
export type Row = { id: string; en: string; unit?: string; ref: string; vals: [string, string, string]; flags?: [Flag, Flag, Flag]; main?: boolean };
export type Panel = { title: [string, string]; groups: { title?: [string, string]; rows: Row[] }[] };

const N: [Flag, Flag, Flag] = ["n", "n", "n"];
const r = (id: string, en: string, ref: string, vals: [string, string, string], flags: [Flag, Flag, Flag] = N, unit?: string, main?: boolean): Row => ({ id, en, ref, vals, flags, unit, main });

export const panels: Record<Metric["key"], Panel> = {
  glucose: { title: ["Rincian pemeriksaan gula darah", "Blood sugar breakdown"], groups: [{ rows: [
    r("Glukosa puasa", "Fasting glucose", "< 100", ["", "", ""], N, "mg/dL", true),
    r("Glukosa 2 jam setelah makan", "2-hour post-meal glucose", "< 140", ["118", "162", "238"], ["n", "h", "h"], "mg/dL"),
    r("HbA1c", "HbA1c", "< 5,7", ["5,2", "6,0", "7,6"], ["n", "h", "h"], "%"),
  ] }] },
  cholesterol: { title: ["Rincian profil lipid", "Lipid profile breakdown"], groups: [{ rows: [
    r("Kolesterol total", "Total cholesterol", "< 200", ["", "", ""], N, "mg/dL", true),
    r("LDL (kolesterol jahat)", "LDL (bad cholesterol)", "< 100", ["96", "138", "172"], ["n", "h", "h"], "mg/dL"),
    r("HDL (kolesterol baik)", "HDL (good cholesterol)", "> 40", ["54", "44", "36"], ["n", "n", "l"], "mg/dL"),
    r("Trigliserida", "Triglycerides", "< 150", ["112", "186", "290"], ["n", "h", "h"], "mg/dL"),
  ] }] },
  hemoglobin: { title: ["Rincian darah lengkap", "Complete blood count breakdown"], groups: [{ rows: [
    r("Hemoglobin", "Hemoglobin", "P 12,0–15,5 · L 13,0–17,0", ["", "", ""], N, "g/dL", true),
    r("Hematokrit", "Hematocrit", "36–48", ["41", "34", "27"], ["n", "l", "l"], "%"),
    r("Eritrosit", "Red blood cells", "4,0–5,5", ["4,7", "3,9", "3,2"], ["n", "l", "l"], "juta/µL"),
    r("MCV", "MCV", "80–100", ["89", "76", "70"], ["n", "l", "l"], "fL"),
    r("Leukosit", "White blood cells", "4.000–11.000", ["6.800", "7.200", "7.900"], N, "/µL"),
    r("Trombosit", "Platelets", "150.000–450.000", ["265.000", "280.000", "310.000"], N, "/µL"),
  ] }] },
  kidney: { title: ["Rincian fungsi ginjal", "Kidney function breakdown"], groups: [{ rows: [
    r("Kreatinin", "Creatinine", "P 0,6–1,1 · L 0,7–1,3", ["", "", ""], N, "mg/dL", true),
    r("Ureum", "Urea", "15–40", ["28", "46", "78"], ["n", "h", "h"], "mg/dL"),
    r("BUN", "BUN", "7–20", ["13", "21", "36"], ["n", "h", "h"], "mg/dL"),
    r("eGFR", "eGFR", "> 90", ["102", "74", "38"], ["n", "l", "l"], "mL/mnt/1,73 m²"),
    r("Asam urat", "Uric acid", "P 2,4–5,7 · L 3,4–7,0", ["4,8", "6,1", "8,2"], ["n", "h", "h"], "mg/dL"),
  ] }] },
  urine: { title: ["Hasil urinalisis lengkap", "Full urinalysis"], groups: [
    { title: ["Pemeriksaan fisik", "Physical"], rows: [
      r("Warna", "Colour", "Kuning muda–kuning", ["Kuning muda", "Kuning", "Kuning tua"]),
      r("Kejernihan", "Clarity", "Jernih", ["Jernih", "Jernih", "Agak keruh"], ["n", "n", "h"]),
    ] },
    { title: ["Kimia urin (carik celup)", "Chemical (dipstick)"], rows: [
      r("Berat jenis", "Specific gravity", "1,005–1,030", ["1,015", "1,022", "1,028"]),
      r("pH", "pH", "4,6–8,0", ["6,0", "6,0", "5,5"]),
      r("Protein", "Protein", "< 15", ["", "", ""], N, "mg/dL", true),
      r("Glukosa", "Glucose", "Negatif", ["Negatif", "Negatif", "+1"], ["n", "n", "h"]),
      r("Keton", "Ketones", "Negatif", ["Negatif", "Negatif", "Negatif"]),
      r("Darah", "Blood", "Negatif", ["Negatif", "Negatif", "+1"], ["n", "n", "h"]),
      r("Leukosit esterase", "Leukocyte esterase", "Negatif", ["Negatif", "Negatif", "+2"], ["n", "n", "h"]),
      r("Nitrit", "Nitrite", "Negatif", ["Negatif", "Negatif", "Positif"], ["n", "n", "h"]),
      r("Bilirubin", "Bilirubin", "Negatif", ["Negatif", "Negatif", "Negatif"]),
      r("Urobilinogen", "Urobilinogen", "0,2–1,0", ["0,4", "0,6", "0,8"], N, "mg/dL"),
    ] },
    { title: ["Mikroskopis sedimen", "Microscopic sediment"], rows: [
      r("Eritrosit", "Red blood cells", "0–2", ["0–1", "1–2", "5–8"], ["n", "n", "h"], "/LPB"),
      r("Leukosit", "White blood cells", "0–5", ["1–2", "3–5", "10–15"], ["n", "n", "h"], "/LPB"),
      r("Sel epitel", "Epithelial cells", "Sedikit", ["Sedikit", "Sedikit", "Sedang"], ["n", "n", "h"]),
      r("Silinder", "Casts", "Negatif", ["Negatif", "Negatif", "Hialin +"], ["n", "n", "h"]),
      r("Kristal", "Crystals", "Negatif", ["Negatif", "Negatif", "Negatif"]),
      r("Bakteri", "Bacteria", "Negatif", ["Negatif", "Negatif", "Positif"], ["n", "n", "h"]),
    ] },
  ] },
};

export const tierIdx = (t: Tier) => (t === "green" ? 0 : t === "amber" ? 1 : 2);

export const hashOf = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
export const parseNum = (s: string) => (/^-?[\d.]+(,\d+)?$/.test(s) ? Number(s.replace(/\./g, "").replace(",", ".")) : NaN);
export const decOf = (s: string) => (s.includes(",") ? s.split(",")[1].length : 0);
export const isNumericRow = (row: Row) => row.main || row.vals.every((v) => !Number.isNaN(parseNum(v)));

export function rowValue(row: Row, tier: Tier, id: string) {
  const ti = tierIdx(tier);
  const dec = Math.max(...row.vals.map(decOf));
  const jit = 1 + ((hashOf(id + row.en) % 9) - 4) / 100;
  const num = Math.max(0, Number((parseNum(row.vals[ti]) * jit).toFixed(dec)));
  return { num, dec, flag: row.flags![ti] };
}
