import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Bell, Plus, Trash2, UsersRound, Camera, Check, Globe2, KeyRound, LockKeyhole, LogOut, MonitorSmartphone, Save, ShieldCheck, UserRound } from "lucide-react";
import type { Profile } from "./screens1";
import { useLang, useT } from "./i18n";
import { AddMemberForm, usePeople } from "./members";
import { Avatar, Button, Card, Eyebrow, Field, inputCls, TextInput, Title } from "./ui";

export type Preferences = {
  language: "English" | "Bahasa Indonesia";
  bookingUpdates: boolean;
  resultAlerts: boolean;
  healthTips: boolean;
  twoFactor: boolean;
};

type ProfileTab = "details" | "preferences" | "security" | "family";

function SettingToggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-brand-600" : "bg-slate-300"}`}
    >
      <span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

export function ProfileScreen({
  profile,
  setProfile,
  preferences,
  setPreferences,
  changePassword,
  onLogout,
}: {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  onLogout: () => void;
}) {
  const t = useT();
  const { members, remove } = usePeople();
  const [addingMember, setAddingMember] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { lang, setLang } = useLang();
  const [tab, setTab] = useState<ProfileTab>("details");
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState<"" | "photo" | "incomplete">("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<"" | "short" | "mismatch" | "wrong" | "ok">("");
  const fileInput = useRef<HTMLInputElement>(null);

  const setDraftField = (key: keyof Profile, value: string) => {
    setDraft({ ...draft, [key]: value } as Profile);
    setSaved(false);
  };

  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setProfileError("photo");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraftField("avatar", String(reader.result));
      setProfileError("");
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email);
    if (!draft.name.trim() || !validEmail || !draft.age || !draft.contact.trim() || !draft.address.trim()) {
      setProfileError("incomplete");
      return;
    }
    setProfile({ ...draft, name: draft.name.trim(), email: draft.email.trim() });
    setProfileError("");
    setSaved(true);
  };

  const submitPassword = (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage("");
    if (currentPassword.length < 6 || newPassword.length < 8) {
      setPasswordMessage("short");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("mismatch");
      return;
    }
    if (!changePassword(currentPassword, newPassword)) {
      setPasswordMessage("wrong");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("ok");
  };

  const tabs: { id: ProfileTab; label: string; icon: typeof UserRound }[] = [
    { id: "details", label: t("Informasi profil", "Profile information"), icon: UserRound },
    { id: "preferences", label: t("Pengaturan akun", "Account settings"), icon: Bell },
    { id: "family", label: t("Anggota keluarga", "Family members"), icon: UsersRound },
    { id: "security", label: t("Keamanan", "Security"), icon: ShieldCheck },
  ];
  const profileErrors = {
    photo: t("Pilih gambar JPG atau PNG dengan ukuran di bawah 2 MB.", "Choose a JPG or PNG image under 2 MB."),
    incomplete: t("Lengkapi semua data profil dengan alamat email yang valid.", "Complete all profile details with a valid email address."),
  };
  const passwordMessages = {
    short: t("Masukkan kata sandi Anda saat ini dan kata sandi baru minimal 8 karakter.", "Enter your current password and a new password of at least 8 characters."),
    mismatch: t("Kata sandi baru tidak cocok.", "The new passwords do not match."),
    wrong: t("Kata sandi Anda saat ini tidak benar.", "Your current password is incorrect."),
    ok: t("Kata sandi berhasil diperbarui.", "Password updated successfully."),
  };

  return (
    <div className="rise py-12">
      <section className="overflow-hidden rounded-3xl bg-brand-900 p-7 text-white md:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar name={profile.name} src={profile.avatar} size="lg" />
          <div className="min-w-0 flex-1">
            <Eyebrow>{t("Akun saya", "My account")}</Eyebrow>
            <h1 className="mt-2 truncate font-display text-3xl font-semibold md:text-4xl">{profile.name}</h1>
            <p className="mt-1 truncate text-brand-100">{profile.email}</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-brand-100">
            <span className="flex items-center gap-2 text-white"><ShieldCheck size={17} /> {t("Profil terlindungi", "Protected profile")}</span>
            <span className="mt-1 block text-xs">{t("Akun demo · sudah masuk", "Demo account · signed in")}</span>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit lg:sticky lg:top-28">
          <Card className="p-3">
            <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label={t("Pengaturan profil", "Profile settings")}>
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition lg:w-full ${tab === id ? "bg-brand-100 text-brand-800" : "text-mute hover:bg-brand-50 hover:text-ink"}`}
                >
                  <Icon size={18} /> {label}
                </button>
              ))}
            </nav>
          </Card>
          <Button variant="danger" className="mt-4 w-full" onClick={onLogout}><LogOut size={17} /> {t("Keluar", "Sign out")}</Button>
        </aside>

        {tab === "details" && (
          <Card className="p-6 md:p-8">
            <Eyebrow>{t("Data pribadi", "Personal data")}</Eyebrow>
            <Title className="mt-2 !text-3xl">{t("Informasi profil", "Profile information")}</Title>
            <p className="mt-2 text-mute">{t("Perbarui identitas dan kontak Anda agar pemesanan laboratorium tetap akurat.", "Keep your identity and contact details up to date so your lab bookings stay accurate.")}</p>

            <form className="mt-8" onSubmit={saveProfile}>
              <div className="flex flex-col gap-5 rounded-2xl bg-brand-50 p-5 sm:flex-row sm:items-center">
                <Avatar name={draft.name} src={draft.avatar} size="lg" />
                <div className="flex-1">
                  <p className="font-bold">{t("Foto profil", "Profile photo")}</p>
                  <p className="mt-1 text-sm text-mute">{t("JPG atau PNG, maksimal 2 MB.", "JPG or PNG, up to 2 MB.")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => fileInput.current?.click()}><Camera size={16} /> {t("Ganti foto", "Change photo")}</Button>
                    {draft.avatar && <Button variant="ghost" onClick={() => setDraftField("avatar", "")}>{t("Hapus", "Remove")}</Button>}
                  </div>
                  <input ref={fileInput} type="file" accept="image/png,image/jpeg" className="hidden" onChange={choosePhoto} />
                </div>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <Field label={t("Nama lengkap", "Full name")}>
                  <TextInput autoComplete="name" value={draft.name} onChange={(event) => setDraftField("name", event.target.value)} />
                </Field>
                <Field label={t("Alamat email", "Email address")} hint={t("Email ini juga digunakan untuk masuk ke akun Anda.", "This email is also used to sign in to your account.")}>
                  <TextInput type="email" autoComplete="email" value={draft.email} onChange={(event) => setDraftField("email", event.target.value)} />
                </Field>
                <Field label={t("Usia", "Age")}>
                  <TextInput inputMode="numeric" value={draft.age} onChange={(event) => setDraftField("age", event.target.value.replace(/\D/g, "").slice(0, 3))} />
                </Field>
                <div>
                  <span className="mb-1.5 block text-[13px] font-bold">{t("Jenis kelamin", "Gender")}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(["Female", "Male"] as const).map((gender) => (
                      <button
                        type="button"
                        key={gender === "Female" ? t("Perempuan", "Female") : t("Laki-laki", "Male")}
                        onClick={() => setDraftField("gender", gender)}
                        className={`min-h-[52px] rounded-2xl border text-sm font-bold transition ${draft.gender === gender ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white hover:border-brand-200"}`}
                      >
                        {gender === "Female" ? t("Perempuan", "Female") : t("Laki-laki", "Male")}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Field label={t("Telepon / WhatsApp", "Phone / WhatsApp")}>
                    <TextInput type="tel" autoComplete="tel" value={draft.contact} onChange={(event) => setDraftField("contact", event.target.value)} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label={t("Alamat rumah", "Home address")}>
                    <textarea rows={3} className={`${inputCls} resize-none`} autoComplete="street-address" value={draft.address} onChange={(event) => setDraftField("address", event.target.value)} />
                  </Field>
                </div>
              </div>

              {profileError && <p className="mt-4 text-sm font-semibold text-bad">{profileErrors[profileError]}</p>}
              {saved && <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-ok"><Check size={16} /> {t("Profil berhasil disimpan dan diperbarui di seluruh Cek Sehat.", "Profile saved and updated across Cek Sehat.")}</p>}
              <div className="mt-7 flex flex-wrap gap-3">
                <Button type="submit"><Save size={17} /> {t("Simpan perubahan", "Save changes")}</Button>
                <Button variant="secondary" onClick={() => { setDraft(profile); setProfileError(""); setSaved(false); }}>{t("Batalkan perubahan", "Discard changes")}</Button>
              </div>
            </form>
          </Card>
        )}

        {tab === "family" && (
          <Card className="p-6 md:p-8">
            <Eyebrow>{t("Satu akun, banyak orang", "One account, many people")}</Eyebrow>
            <Title className="mt-2 !text-3xl">{t("Anggota keluarga", "Family members")}</Title>
            <p className="mt-2 text-mute">{t("Kelola orang lain yang tesnya Anda pesan. Menghapus seseorang akan menghapus semua grafik dan hasilnya.", "Manage other people whose tests you order. Deleting a person removes all of their charts and results.")}</p>
            <ul className="mt-7 space-y-3">
              {members.length === 0 && <li className="rounded-2xl bg-paper p-5 text-center text-mute">{t("Belum ada anggota keluarga.", "No family members yet.")}</li>}
              {members.map((m) => (
                <li key={m.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} />
                    <div className="min-w-0 flex-1"><p className="truncate font-bold">{m.name}</p><p className="text-sm text-mute">{m.age} {t("th", "yrs")} · {m.gender === "Male" ? t("Laki-laki", "Male") : t("Perempuan", "Female")}</p></div>
                    <Button variant="ghost" onClick={() => setDeleting(m.id)}><Trash2 size={16} /> {t("Hapus", "Delete")}</Button>
                  </div>
                  {deleting === m.id && (
                    <div role="alert" className="mt-4 rounded-xl bg-bad-bg p-4">
                      <p className="text-sm font-bold text-bad">{t(`Hapus ${m.name}? Semua grafik dan hasilnya akan hilang. Nama di linimasa dan pesanan akan tampil sebagai “Dihapus”.`, `Delete ${m.name}? All of their charts and results will be removed. Their name in the timeline and orders will show as “Deleted”.`)}</p>
                      <div className="mt-3 flex gap-2">
                        <Button variant="danger" onClick={() => { remove(m.id); setDeleting(null); }}>{t("Ya, hapus", "Yes, delete")}</Button>
                        <Button variant="ghost" onClick={() => setDeleting(null)}>{t("Batal", "Cancel")}</Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              {addingMember ? <AddMemberForm onDone={() => setAddingMember(false)} /> : <Button variant="secondary" onClick={() => setAddingMember(true)}><Plus size={17} /> {t("Tambah orang", "Add person")}</Button>}
            </div>
          </Card>
        )}

        {tab === "preferences" && (
          <Card className="p-6 md:p-8">
            <Eyebrow>{t("Preferensi", "Preferences")}</Eyebrow>
            <Title className="mt-2 !text-3xl">{t("Pengaturan akun", "Account settings")}</Title>
            <p className="mt-2 text-mute">{t("Pilih cara Cek Sehat berkomunikasi dengan Anda. Perubahan tersimpan otomatis.", "Choose how Cek Sehat communicates with you. Changes are saved automatically.")}</p>

            <div className="mt-8 divide-y divide-line">
              <div className="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:items-center">
                <span className="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Globe2 size={20} /></span>
                <div className="flex-1"><p className="font-bold">{t("Bahasa", "Language")}</p><p className="text-sm text-mute">{t("Ubah bahasa aplikasi seketika, termasuk navigasi dan penjelasan hasil.", "Switch the app language instantly, including navigation and result explanations.")}</p></div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={lang === "id" ? "font-bold text-ink" : "text-mute"}>Bahasa Indonesia</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={lang === "en"}
                    aria-label={t("Gunakan bahasa Inggris", "Use English")}
                    onClick={() => setLang(lang === "en" ? "id" : "en")}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${lang === "en" ? "bg-brand-600" : "bg-slate-300"}`}
                  >
                    <span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${lang === "en" ? "left-6" : "left-1"}`} />
                  </button>
                  <span className={lang === "en" ? "font-bold text-ink" : "text-mute"}>English</span>
                </div>
              </div>
              {[
                ["bookingUpdates", t("Info pemesanan", "Booking updates"), t("Pengingat penjemputan dan perubahan status pesanan.", "Pickup reminders and order status changes.")],
                ["resultAlerts", t("Notifikasi hasil", "Result alerts"), t("Dapatkan pemberitahuan segera setelah hasil lab Anda siap.", "Get notified as soon as your lab results are ready.")],
                ["healthTips", t("Tips kesehatan", "Health tips"), t("Panduan berkala sesuai perjalanan pemeriksaan Anda.", "Regular guidance tailored to your testing journey.")],
              ].map(([key, label, description]) => (
                <div key={key} className="flex items-center gap-4 py-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Bell size={20} /></span>
                  <div className="flex-1"><p className="font-bold">{label}</p><p className="text-sm text-mute">{description}</p></div>
                  <SettingToggle
                    label={label}
                    on={preferences[key as keyof Pick<Preferences, "bookingUpdates" | "resultAlerts" | "healthTips">] as boolean}
                    onChange={() => setPreferences({ ...preferences, [key]: !preferences[key as keyof Preferences] })}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "security" && (
          <div className="space-y-6">
            <Card className="p-6 md:p-8">
              <Eyebrow>{t("Kredensial masuk", "Sign-in credentials")}</Eyebrow>
              <Title className="mt-2 !text-3xl">{t("Ubah kata sandi", "Change password")}</Title>
              <p className="mt-2 text-mute">{t("Gunakan minimal 8 karakter untuk kata sandi baru Anda.", "Use at least 8 characters for your new password.")}</p>
              <form className="mt-7 space-y-5" onSubmit={submitPassword}>
                <Field label={t("Kata sandi saat ini", "Current password")}>
                  <TextInput type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                </Field>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label={t("Kata sandi baru", "New password")}>
                    <TextInput type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                  </Field>
                  <Field label={t("Konfirmasi kata sandi baru", "Confirm new password")}>
                    <TextInput type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                  </Field>
                </div>
                {passwordMessage && <p className={`text-sm font-semibold ${passwordMessage === "ok" ? "text-ok" : "text-bad"}`}>{passwordMessages[passwordMessage]}</p>}
                <Button type="submit"><KeyRound size={17} /> {t("Perbarui kata sandi", "Update password")}</Button>
              </form>
            </Card>

            <Card className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700"><LockKeyhole size={20} /></span>
                <div className="flex-1">
                  <p className="font-bold">{t("Verifikasi dua langkah", "Two-step verification")}</p>
                  <p className="mt-1 text-sm text-mute">{t("Tambahkan langkah konfirmasi ekstra saat masuk dari perangkat baru.", "Add an extra confirmation step when signing in from a new device.")}</p>
                </div>
                <SettingToggle label={t("Verifikasi dua langkah", "Two-step verification")} on={preferences.twoFactor} onChange={() => setPreferences({ ...preferences, twoFactor: !preferences.twoFactor })} />
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <p className="font-bold">{t("Sesi aktif", "Active sessions")}</p>
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-brand-50 p-4">
                <MonitorSmartphone className="text-brand-700" size={22} />
                <div className="flex-1"><p className="text-sm font-bold">{t("Browser saat ini", "Current browser")}</p><p className="text-xs text-mute">{t("Jakarta, Indonesia · Aktif sekarang", "Jakarta, Indonesia · Active now")}</p></div>
                <span className="rounded-full bg-ok-bg px-3 py-1 text-xs font-bold text-ok">{t("Saat ini", "Current")}</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
