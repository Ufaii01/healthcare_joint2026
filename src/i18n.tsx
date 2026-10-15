import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { dataEn } from "./dataEn";

export type Lang = "id" | "en";

let current: Lang = (() => { try { return localStorage.getItem("cekSehat.lang") === "en" ? "en" : "id"; } catch { return "id"; } })();

export const locale = () => (current === "en" ? "en-GB" : "id-ID");

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: current, setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(current);
  current = lang;
  const setLang = useCallback((l: Lang) => { current = l; setLangState(l); }, []);
  useEffect(() => { try { localStorage.setItem("cekSehat.lang", lang); } catch { /* storage unavailable */ } document.documentElement.lang = lang; }, [lang]);
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

// t("Teks Indonesia", "English text") for inline copy; t("Teks dari data.ts") looks up dataEn.
export function useT() {
  const { lang } = useContext(Ctx);
  return useCallback((id: string, en?: string) => (lang === "id" ? id : en ?? dataEn[id] ?? id), [lang]);
}
