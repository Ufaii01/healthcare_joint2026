import { useEffect, useMemo, useState } from "react";
import { history, labs, type HistoryEntry, type TestKey } from "./data";
import { PeopleProvider, type Member } from "./members";
import { FlowHeader, SiteFooter, SiteHeader, type Page } from "./ui";
import { HomeScreen, Login, Quiz, QuizResult, Register, Welcome, type Answers, type Profile } from "./screens1";
import { Catalog, Checkout, Labs, type Booking, type Order, type Qty, unitsOf, orderResults } from "./screens2";
import { Result, Timeline, Tracking, type ResultSel } from "./screens3";
import { ProfileScreen, type Preferences } from "./profile";
import { authApi, ApiError, getToken } from "./api/auth";
import { membersApi } from "./api/members";
import { ordersApi } from "./api/orders";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [sel, setSel] = useState<ResultSel>({ metric: "glucose", value: 112, date: "2026-10-13", lab: "Lab Mitra Sehat", demo: true });

  const go = (p: Page) => {
    if (!isRegistered && p !== "welcome" && p !== "register" && p !== "login") p = "login";
    if (p === "checkout" && !booking.address) setBooking((b) => ({ ...b, address: profile.address }));
    if (p === "checkout" && !cart.length) p = "catalog";
    if (p === "tracking") setSelectedOrder(null);
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  const confirmOrder = async (o: Order) => {
    setOrders((prev) => [o, ...prev]);
    setCart([]);
    setQty({});
    setBooking({ date: "", slot: "", address: "", notes: "" });
    setSelectedOrder(o.id);
    setPage("tracking");
    window.scrollTo({ top: 0 });
    try {
      const saved = await ordersApi.create(o);
      setOrders((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
    } catch {
      setOrders((prev) => prev.filter((x) => x.id !== o.id));
    }
  };

  const advanceOrder = async (id: string) => {
    const current = orders.find((o) => o.id === id);
    const next = Math.min(5, (current?.step ?? 0) + 1);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, step: next } : o)));
    try {
      await ordersApi.advanceStep(id, next);
    } catch {
      if (current) setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, step: current.step } : o)));
    }
  };

  const [members, setMembers] = useState<Member[]>([]);
  const people = {
    mainName: profile.name, members,
    add: async (m: Omit<Member, "id">) => {
      const tempId = `m${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
      setMembers((prev) => [...prev, { ...m, id: tempId }]);
      try {
        const saved = await membersApi.create(m);
        setMembers((prev) => prev.map((x) => (x.id === tempId ? saved : x)));
      } catch {
        setMembers((prev) => prev.filter((x) => x.id !== tempId));
      }
    },
    remove: async (id: string) => {
      const prevMembers = members;
      setMembers((prev) => prev.filter((m) => m.id !== id));
      try {
        await membersApi.remove(id);
      } catch {
        setMembers(prevMembers);
      }
    },
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

  const applyUser = (user: { name: string; email: string; age: string; gender: "Female" | "Male" | ""; contact: string; address: string; avatar: string; language: string; bookingUpdates: boolean; resultAlerts: boolean; healthTips: boolean; twoFactor: boolean }) => {
    setProfile({ name: user.name, email: user.email, age: user.age, gender: user.gender, contact: user.contact, address: user.address, avatar: user.avatar });
    setPreferences({ language: user.language === "English" ? "English" : "Bahasa Indonesia", bookingUpdates: user.bookingUpdates, resultAlerts: user.resultAlerts, healthTips: user.healthTips, twoFactor: user.twoFactor });
  };

  const loadUserData = async () => {
    try {
      const [m, o] = await Promise.all([membersApi.list(), ordersApi.list()]);
      setMembers(m);
      setOrders(o);
    } catch {
      /* leave current state on failure */
    }
  };

  // Restore an existing session on first load if a token is present.
  useEffect(() => {
    if (!getToken()) return;
    (async () => {
      try {
        const user = await authApi.me();
        applyUser(user);
        setIsRegistered(true);
        await loadUserData();
        setPage("home");
      } catch {
        authApi.logout();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeRegistration = async (password: string): Promise<string | null> => {
    try {
      await authApi.register({ name: profile.name.trim(), email: profile.email.trim(), password });
      // Register only creates the account (name/email/password). Persist the
      // rest of the profile captured on the form via the update endpoint.
      const user = await authApi.updateProfile({
        name: profile.name.trim(),
        age: profile.age,
        gender: profile.gender,
        contact: profile.contact.trim(),
        address: profile.address.trim(),
        avatar: profile.avatar,
      });
      applyUser(user);
      setAccountPassword(password);
      setIsRegistered(true);
      await loadUserData();
      setPage("home");
      window.scrollTo({ top: 0 });
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : "Registration failed";
    }
  };

  const completeLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await authApi.login({ email: email.trim(), password });
      applyUser(user);
      setAccountPassword(password);
      setIsRegistered(true);
      await loadUserData();
      setPage("home");
      window.scrollTo({ top: 0 });
      return true;
    } catch {
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setAccountPassword(newPassword);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    authApi.logout();
    setIsRegistered(false);
    setAnswers({});
    setCart([]);
    setQty({});
    setBooking({ date: "", slot: "", address: "", notes: "" });
    setMembers([]);
    setOrders([]);
    setPage("login");
    window.scrollTo({ top: 0 });
  };

  // Persist profile edits to the backend while updating local state.
  const saveProfile = (next: Profile) => {
    setProfile(next);
    authApi
      .updateProfile({ name: next.name, age: next.age, gender: next.gender, contact: next.contact, address: next.address, avatar: next.avatar })
      .catch(() => {/* keep local copy on failure */});
  };

  const savePreferences = (next: Preferences) => {
    setPreferences(next);
    authApi
      .updateProfile({ language: next.language, bookingUpdates: next.bookingUpdates, resultAlerts: next.resultAlerts, healthTips: next.healthTips, twoFactor: next.twoFactor })
      .catch(() => {/* keep local copy on failure */});
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
        {page === "profile" && <ProfileScreen profile={profile} setProfile={saveProfile} preferences={preferences} setPreferences={savePreferences} changePassword={changePassword} onLogout={logout} />}
        {page === "quiz" && <Quiz answers={answers} setAnswers={setAnswers} go={go} />}
        {page === "quizResult" && <QuizResult answers={answers} cart={cart} setCart={setCart} go={go} />}
        {page === "catalog" && <Catalog cart={cart} setCart={setCart} qty={qty} setQty={setQty} labId={labId} go={go} />}
        {page === "labs" && <Labs cart={cart} labId={labId} setLabId={chooseLab} go={go} />}
        {page === "checkout" && <Checkout cart={cart} qty={qty} labId={labId} booking={booking} setBooking={setBooking} profile={profile} onConfirm={confirmOrder} />}
        {page === "tracking" && <Tracking orders={orders} selectedId={selectedOrder} setSelectedId={setSelectedOrder} advance={advanceOrder} openResult={openResult} go={go} />}
        {page === "result" && <Result sel={sel} setSel={setSel} profile={(() => { const m = members.find((x) => x.id === sel.owner); return m ? { ...profile, name: m.name, age: m.age, gender: m.gender } : profile; })()} go={go} onRetest={(k) => { setLabId((labs.find((l) => l.tests.includes(k)) ?? labs[0]).id); setCart([k]); setQty({}); go("catalog"); }} />}
        {page === "timeline" && <Timeline entries={entries} openResult={showEntry} />}
      </main>
      <SiteFooter />
    </div>
    </PeopleProvider>
  );
}
