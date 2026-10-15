import { useEffect, useMemo, useState } from "react";
import { history, labs, type HistoryEntry, type TestKey } from "./data";
import { PeopleProvider, type Member } from "./members";
import { FlowHeader, SiteFooter, SiteHeader, type Page } from "./ui";
import { HomeScreen, Login, Quiz, QuizResult, Register, Welcome, type Answers, type Profile } from "./screens1";
import { Catalog, Checkout, Labs, type Booking, type Order, type Qty, unitsOf, orderResults } from "./screens2";
import { Result, Timeline, Tracking, type ResultSel } from "./screens3";
import { ProfileScreen, type Preferences } from "./profile";

const backTo: Partial<Record<Page, Page>> = { login: "welcome", register: "welcome", profile: "home", quiz: "home", quizResult: "quiz", labs: "home", catalog: "labs", checkout: "catalog", tracking: "home", result: "tracking", timeline: "home" };

export default function App() {
  const [page, setPage] = useState<Page>("welcome");
  const [isRegistered, setIsRegistered] = useState(false);
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", age: "", gender: "", contact: "", address: "", avatar: "" });
  const [preferences, setPreferences] = useState<Preferences>({ language: "Bahasa Indonesia", bookingUpdates: true, resultAlerts: true, healthTips: false, twoFactor: false });
  const [accountPassword, setAccountPassword] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [cart, setCart] = useState<TestKey[]>([]);
  const [qty, setQty] = useState<Qty>({});
  const [labId, setLabId] = useState("mitra");
  const [booking, setBooking] = useState<Booking>({ date: "", slot: "", address: "", notes: "" });
  const [orders, setOrders] = useState<Order[]>(() => {
    try { const raw = JSON.parse(localStorage.getItem("cekSehat.orders") ?? "[]"); return Array.isArray(raw) ? raw.map((o: Order) => (o.v === 2 ? o : { ...o, v: 2, step: [0, 3, 3, 4, 5][o.step] ?? 0 })) : []; } catch { return []; }
  });
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  useEffect(() => { try { localStorage.setItem("cekSehat.orders", JSON.stringify(orders)); } catch { /* storage unavailable */ } }, [orders]);
  const [sel, setSel] = useState<ResultSel>({ metric: "glucose", value: 112, date: "2026-10-13", lab: "Lab Mitra Sehat", demo: true });

  const go = (p: Page) => {
    if (!isRegistered && p !== "welcome" && p !== "register" && p !== "login") p = "login";
    if (p === "checkout" && !booking.address) setBooking((b) => ({ ...b, address: profile.address }));
    if (p === "checkout" && !cart.length) p = "catalog";
    if (p === "tracking") setSelectedOrder(null);
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  const confirmOrder = (o: Order) => {
    setOrders((prev) => [o, ...prev]);
    setCart([]);
    setQty({});
    setBooking({ date: "", slot: "", address: "", notes: "" });
    setSelectedOrder(o.id);
    setPage("tracking");
    window.scrollTo({ top: 0 });
  };

  const [members, setMembers] = useState<Member[]>(() => {
    try { const raw = JSON.parse(localStorage.getItem("cekSehat.members") ?? "[]"); return Array.isArray(raw) ? raw : []; } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("cekSehat.members", JSON.stringify(members)); } catch { /* storage unavailable */ } }, [members]);
  const people = {
    mainName: profile.name, members,
    add: (m: Omit<Member, "id">) => setMembers((prev) => [...prev, { ...m, id: `m${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}` }]),
    remove: (id: string) => setMembers((prev) => prev.filter((m) => m.id !== id)),
  };
  const entries: HistoryEntry[] = useMemo(() => [...orderResults(orders, new Set(members.map((m) => m.id))), ...history].sort((x, y) => y.date.localeCompare(x.date)), [orders, members]);

  const showEntry = (e: HistoryEntry) => {
    setSel({ metric: e.metric, value: e.value, date: e.date, lab: e.lab, demo: e.id === history[0].id, owner: e.owner, id: e.id });
    setPage("result");
    window.scrollTo({ top: 0 });
  };

  const openResult = (o: Order, k: TestKey, i: number) => {
    const e = entries.find((x) => x.id === `${o.id}-${k}-${i}`);
    if (e) showEntry(e);
    else go("timeline");
  };

  const chooseLab = (id: string) => {
    const lab = labs.find((l) => l.id === id);
    setLabId(id);
    if (lab) setCart((c) => c.filter((k) => lab.tests.includes(k)));
    go("catalog");
  };

  const completeRegistration = (password: string) => {
    setAccountPassword(password);
    setIsRegistered(true);
    setPage("home");
    window.scrollTo({ top: 0 });
  };

  const completeLogin = (email: string, password: string) => {
    const accountEmail = profile.email || "sari.wulandari@example.com";
    if (email.toLowerCase() !== accountEmail.toLowerCase() || (accountPassword && password !== accountPassword)) return false;
    if (!profile.name) {
      setProfile({ name: "Sari Wulandari", email, age: "34", gender: "Female", contact: "0812 3456 7890", address: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190", avatar: "" });
    }
    if (!accountPassword) setAccountPassword(password);
    setIsRegistered(true);
    setPage("home");
    window.scrollTo({ top: 0 });
    return true;
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    if (accountPassword && currentPassword !== accountPassword) return false;
    setAccountPassword(newPassword);
    return true;
  };

  const logout = () => {
    setIsRegistered(false);
    setAnswers({});
    setCart([]);
    setQty({});
    setBooking({ date: "", slot: "", address: "", notes: "" });
    setPage("login");
    window.scrollTo({ top: 0 });
  };

  return (
    <PeopleProvider value={people}>
    <div className="min-h-screen bg-paper print:bg-white">
      <SiteHeader page={page} go={go} cartCount={unitsOf(cart, qty)} name={profile.name} avatar={profile.avatar} isRegistered={isRegistered} />
      {page !== "welcome" && page !== "home" && <FlowHeader page={page} onBack={() => (page === "tracking" && selectedOrder ? setSelectedOrder(null) : go(backTo[page] ?? "home"))} />}
      <main className={page === "welcome" ? "" : "mx-auto w-full max-w-6xl px-6 lg:px-10"}>
        {page === "welcome" && <Welcome go={go} />}
        {page === "login" && <Login go={go} onLogin={completeLogin} initialEmail={profile.email} />}
        {page === "register" && <Register profile={profile} setProfile={setProfile} onContinue={completeRegistration} />}
        {page === "home" && <HomeScreen entries={entries.filter((e) => (e.owner ?? "main") === "main")} profile={profile} go={go} cartCount={unitsOf(cart, qty)} booking={(() => { const o = orders.find((x) => x.step < 3); return o ? { date: o.date, slot: o.slot } : booking; })()} />}
        {page === "profile" && <ProfileScreen profile={profile} setProfile={setProfile} preferences={preferences} setPreferences={setPreferences} changePassword={changePassword} onLogout={logout} />}
        {page === "quiz" && <Quiz answers={answers} setAnswers={setAnswers} go={go} />}
        {page === "quizResult" && <QuizResult answers={answers} cart={cart} setCart={setCart} go={go} />}
        {page === "catalog" && <Catalog cart={cart} setCart={setCart} qty={qty} setQty={setQty} labId={labId} go={go} />}
        {page === "labs" && <Labs cart={cart} labId={labId} setLabId={chooseLab} go={go} />}
        {page === "checkout" && <Checkout cart={cart} qty={qty} labId={labId} booking={booking} setBooking={setBooking} profile={profile} onConfirm={confirmOrder} />}
        {page === "tracking" && <Tracking orders={orders} selectedId={selectedOrder} setSelectedId={setSelectedOrder} advance={(id) => setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, step: Math.min(5, o.step + 1) } : o)))} openResult={openResult} go={go} />}
        {page === "result" && <Result sel={sel} setSel={setSel} profile={(() => { const m = members.find((x) => x.id === sel.owner); return m ? { ...profile, name: m.name, age: m.age, gender: m.gender } : profile; })()} go={go} onRetest={(k) => { setLabId((labs.find((l) => l.tests.includes(k)) ?? labs[0]).id); setCart([k]); setQty({}); go("catalog"); }} />}
        {page === "timeline" && <Timeline entries={entries} openResult={showEntry} />}
      </main>
      <SiteFooter />
    </div>
    </PeopleProvider>
  );
}
