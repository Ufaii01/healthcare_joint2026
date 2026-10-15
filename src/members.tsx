import { createContext, useContext, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { useT } from "./i18n";
import { Button, Field, TextInput } from "./ui";

export type Member = { id: string; name: string; age: string; gender: "Female" | "Male" | "" };

type People = { mainName: string; members: Member[]; add: (m: Omit<Member, "id">) => void; remove: (id: string) => void };
const Ctx = createContext<People>({ mainName: "", members: [], add: () => {}, remove: () => {} });

export function PeopleProvider({ value, children }: { value: People; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePeople() {
  const p = useContext(Ctx);
  const t = useT();
  const nameOf = (id?: string) => {
    if (!id || id === "main") return p.mainName.split(" ")[0] || t("Saya", "Me");
    return p.members.find((m) => m.id === id)?.name ?? t("Dihapus", "Deleted");
  };
  return { ...p, nameOf };
}

export function AddMemberForm({ onDone }: { onDone: () => void }) {
  const t = useT();
  const { add } = usePeople();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Member["gender"]>("");
  const valid = name.trim() && age && gender;
  const submit = () => { if (!valid) return; add({ name: name.trim(), age, gender }); onDone(); };
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("Nama", "Name")}><TextInput value={name} maxLength={30} onChange={(e) => setName(e.target.value)} placeholder={t("mis. Ibu Sari", "e.g. Mom")} /></Field>
        <Field label={t("Usia", "Age")}><TextInput inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))} /></Field>
      </div>
      <span className="mb-1.5 mt-4 block text-[13px] font-bold">{t("Jenis kelamin", "Gender")}</span>
      <div className="grid grid-cols-2 gap-2">
        {(["Female", "Male"] as const).map((g) => (
          <button type="button" key={g} onClick={() => setGender(g)} aria-pressed={gender === g}
            className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 text-sm font-bold ${gender === g ? "border-brand-600 bg-brand-50 text-brand-800" : "border-line text-mute"}`}>
            {gender === g && <Check size={15} strokeWidth={3} />}{g === "Female" ? t("Perempuan", "Female") : t("Laki-laki", "Male")}
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <Button onClick={submit} disabled={!valid}>{t("Simpan orang", "Save person")}</Button>
        <Button variant="ghost" onClick={onDone}>{t("Batal", "Cancel")}</Button>
      </div>
    </div>
  );
}
