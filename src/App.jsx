import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

/* ─── SUPABASE — loaded via CDN script tag ───────────────────────────────── */
const SUPA_URL = "https://sbulznkfsyzpdoesotds.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNidWx6bmtmc3l6cGRvZXNvdGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDM1NDAsImV4cCI6MjA4OTkxOTU0MH0.7KCt2oGATmPklUHubQHKNVPhstHz5-FiM7szI9YlYdw";

// Lazy-init supabase client after CDN loads
let _supabase = null;
function getClient() {
  if (_supabase) return _supabase;
  if (window.supabase?.createClient) {
    _supabase = window.supabase.createClient(SUPA_URL, SUPA_KEY);
    return _supabase;
  }
  return null;
}

function loadSupabaseScript() {
  return new Promise((resolve, reject) => {
    if (window.supabase?.createClient) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* ─── FONTS & PALETTE ────────────────────────────────────────────────────── */
const FONT = `'IBM Plex Mono', 'Courier New', monospace`;

const C = {
  bg:       "#050608",
  panel:    "#09090d",
  border:   "#14161e",
  border2:  "#1c1f2e",
  dim:      "#23263a",
  muted:    "#3a3f5a",
  subtle:   "#4e5470",
  text:     "#8a90b0",
  bright:   "#c8ccdf",
  white:    "#e8eaf2",
  amber:    "#d97706",
  amberLt:  "#f59e0b",
  amberDim: "#92400e",
  green:    "#16a34a",
  greenLt:  "#22c55e",
  greenDim: "#14532d",
  red:      "#dc2626",
  redLt:    "#f87171",
  redDim:   "#7f1d1d",
  blue:     "#2563eb",
  blueLt:   "#60a5fa",
};

/* ─── ICONS ──────────────────────────────────────────────────────────────── */
const I = {
  Menu:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Grid:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  List:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  BarChartI:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Zap:        () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Plus:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X:          () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  TrendUp:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  ArrowRight: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Filter:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Info:       () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Check:      () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Warning:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Google:     () => <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  LogOut:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  User:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Trash:      () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
};

/* ─── CONSTANTS ──────────────────────────────────────────────────────────── */
const CATEGORIES = {
  expense: ["Food & Dining", "Rent", "Transport", "Entertainment", "Shopping", "Health", "Utilities", "Travel"],
  income:  ["Salary", "Freelance", "Investment", "Bonus", "Other"],
};
const CAT_CODES = {
  "Food & Dining": "FD", Rent: "RE", Transport: "TR", Entertainment: "EN",
  Shopping: "SH", Health: "HL", Utilities: "UT", Travel: "TV",
  Salary: "SL", Freelance: "FL", Investment: "IV", Bonus: "BN", Other: "OT",
};
const CAT_COLORS = ["#d97706","#2563eb","#9333ea","#0891b2","#16a34a","#dc2626","#ea580c","#0d9488"];
const BUDGETS = { Rent: 25000, "Food & Dining": 14000, Shopping: 8000, Transport: 5000, Health: 4000, Entertainment: 4000, Utilities: 3000 };

/* ─── FORMATTERS ─────────────────────────────────────────────────────────── */
const fmtINR  = n => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const fmtK    = n => n >= 100000 ? `${(n/100000).toFixed(2)}L` : n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(Math.round(n));
const fmtDate = iso => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
const fmtMon  = iso => new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ─── SHARED STYLES ──────────────────────────────────────────────────────── */
const skelStyle = { background: C.dim, borderRadius: "2px", animation: "pulse 1.5s ease-in-out infinite" };

/* ─── TOOLTIP ────────────────────────────────────────────────────────────── */
const BloomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0d0f17", border: `1px solid ${C.border2}`, padding: "8px 12px", fontFamily: FONT, zIndex: 999 }}>
      <div style={{ fontSize: "9px", color: C.muted, letterSpacing: "0.1em", marginBottom: "6px" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "16px", marginBottom: "2px" }}>
          <span style={{ fontSize: "9px", color: C.subtle }}>{p.name?.toUpperCase()}</span>
          <span style={{ fontSize: "10px", fontWeight: 700, color: p.color }}>{`₹${fmtK(p.value)}`}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── PRIMITIVES ─────────────────────────────────────────────────────────── */
const Tag = ({ children, color = C.amber }) => (
  <span style={{ fontFamily: FONT, fontSize: "9px", letterSpacing: "0.1em", color, border: `1px solid ${color}30`, padding: "1px 6px", borderRadius: "2px", whiteSpace: "nowrap" }}>
    {children}
  </span>
);

const Pill = ({ children, active, onClick, color = C.amber }) => (
  <button onClick={onClick} style={{
    fontFamily: FONT, fontSize: "9px", letterSpacing: "0.08em", padding: "3px 10px",
    border: `1px solid ${active ? color : C.border2}`,
    background: active ? `${color}18` : "transparent",
    color: active ? color : C.muted,
    cursor: "pointer", borderRadius: "2px", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
  }}>{children}</button>
);

const PanelHeader = ({ title, sub, tag, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: "8px", flexWrap: "wrap" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", color: C.bright }}>{title}</span>
      {sub && <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{sub}</span>}
      {tag && <Tag>{tag}</Tag>}
    </div>
    {right && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>{right}</div>}
  </div>
);

/* ─── STAT CARD ──────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, trend, loading }) {
  return (
    <div style={{ padding: "14px 16px", borderRight: `1px solid ${C.border}`, flex: "1 1 140px", minWidth: 0 }}>
      <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.12em", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      {loading
        ? <div style={{ ...skelStyle, height: "22px", width: "80px" }} />
        : <div style={{ fontFamily: FONT, fontSize: "clamp(14px, 2.5vw, 22px)", fontWeight: 700, color: C.white, letterSpacing: "-0.02em", lineHeight: 1, wordBreak: "break-all" }}>{value}</div>
      }
      {sub && !loading && <div style={{ fontFamily: FONT, fontSize: "9px", color: C.subtle, marginTop: "5px", letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
      {trend !== undefined && !loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "5px", color: trend >= 0 ? C.greenLt : C.redLt }}>
          {trend >= 0 ? <I.TrendUp /> : <I.TrendDown />}
          <span style={{ fontFamily: FONT, fontSize: "9px" }}>{Math.abs(trend).toFixed(1)}% MOM</span>
        </div>
      )}
    </div>
  );
}

/* ─── ADD MODAL ──────────────────────────────────────────────────────────── */
function AddModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ type: "expense", amount: "", category: "Food & Dining", note: "", date: todayISO() });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fix: validate category when type changes
  const setType = (type) => setForm(f => ({ ...f, type, category: CATEGORIES[type][0] }));

  const submit = async () => {
    const amt = Number(form.amount);
    if (!amt || amt <= 0) { setError("INVALID AMOUNT — ENTER A POSITIVE NUMBER"); return; }
    if (!form.date) { setError("DATE IS REQUIRED"); return; }
    setSaving(true);
    setError("");
    try {
      await onAdd({ ...form, amount: amt, date: new Date(form.date).toISOString() });
      onClose();
    } catch (e) {
      setError(e.message || "FAILED TO SAVE — TRY AGAIN");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    fontFamily: FONT, fontSize: "11px", color: C.white,
    background: C.bg, border: `1px solid ${C.border2}`,
    padding: "9px 12px", width: "100%", boxSizing: "border-box",
    outline: "none", letterSpacing: "0.03em", borderRadius: "2px",
  };
  const labelStyle = { fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.15em", display: "block", marginBottom: "5px" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={onClose}>
      <div style={{ background: C.panel, border: `1px solid ${C.border2}`, width: "100%", maxWidth: "420px", fontFamily: FONT, borderRadius: "2px", animation: "modalIn 0.18s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", color: C.amberLt }}>NEW TRANSACTION</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", display: "flex", padding: "2px" }}><I.X /></button>
        </div>

        <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Type toggle */}
          <div>
            <label style={labelStyle}>TYPE</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
              {["expense", "income"].map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  fontFamily: FONT, fontSize: "10px", letterSpacing: "0.1em", padding: "9px",
                  border: `1px solid ${C.border2}`,
                  background: form.type === t ? (t === "income" ? `${C.green}22` : `${C.red}22`) : C.bg,
                  color: form.type === t ? (t === "income" ? C.greenLt : C.redLt) : C.muted,
                  cursor: "pointer", textTransform: "uppercase", fontWeight: form.type === t ? 700 : 400,
                  transition: "all 0.15s",
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label style={labelStyle}>AMOUNT (INR)</label>
            <input
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0.00" type="number" min="1"
              style={{ ...inputStyle, fontSize: "18px", color: form.type === "income" ? C.greenLt : C.redLt }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>CATEGORY</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
              {CATEGORIES[form.type].map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label style={labelStyle}>DATE</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
          </div>

          {/* Note */}
          <div>
            <label style={labelStyle}>NOTE (OPTIONAL)</label>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Short description..." style={inputStyle} />
          </div>

          {error && (
            <div style={{ fontFamily: FONT, fontSize: "9px", color: C.redLt, letterSpacing: "0.1em", background: `${C.red}11`, border: `1px solid ${C.redDim}`, padding: "8px 10px", borderRadius: "2px" }}>
              ⚠ {error}
            </div>
          )}

          <button onClick={submit} disabled={saving} style={{
            fontFamily: FONT, fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", padding: "11px",
            background: form.type === "income" ? `${C.green}33` : `${C.red}33`,
            color: form.type === "income" ? C.greenLt : C.redLt,
            border: `1px solid ${form.type === "income" ? C.green : C.red}`,
            cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
            textTransform: "uppercase", transition: "opacity 0.15s", borderRadius: "2px",
          }}>
            {saving ? "SAVING..." : `ADD ${form.type.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── AUTH SCREEN ────────────────────────────────────────────────────────── */
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    loadSupabaseScript().then(() => setSdkReady(true)).catch(() => setError("FAILED TO LOAD AUTH SDK"));
  }, []);

  const handleEmail = async () => {
    if (!sdkReady) { setError("AUTH SDK STILL LOADING, PLEASE WAIT"); return; }
    if (!email || !password) { setError("EMAIL AND PASSWORD ARE REQUIRED"); return; }
    if (password.length < 6) { setError("PASSWORD MUST BE AT LEAST 6 CHARACTERS"); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      let result;
      if (mode === "signup") {
        result = await getClient().auth.signUp({ email, password });
        if (result.error) throw result.error;
        if (result.data?.user && !result.data.session) {
          setSuccess("CHECK YOUR EMAIL TO CONFIRM YOUR ACCOUNT");
          setLoading(false); return;
        }
      } else {
        result = await getClient().auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
      }
      onAuth(result.data.user);
    } catch (e) {
      setError(e.message?.toUpperCase() || "AUTH FAILED — TRY AGAIN");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!sdkReady) { setError("AUTH SDK STILL LOADING, PLEASE WAIT"); return; }
    setLoading(true); setError("");
    try {
      const { error } = await getClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://shaikhshahnawaz13.github.io/spendora/",
          queryParams: { access_type: "offline", prompt: "consent" },
          skipBrowserRedirect: false,
        },
      });
      if (error) throw error;
    } catch (e) {
      setError((e.message || "GOOGLE SIGN-IN FAILED").toUpperCase());
      setLoading(false);
    }
  };

  const inp = {
    fontFamily: FONT, fontSize: "12px", color: C.white,
    background: C.bg, border: `1px solid ${C.border2}`,
    padding: "10px 12px", width: "100%", boxSizing: "border-box",
    outline: "none", letterSpacing: "0.03em", borderRadius: "2px",
    transition: "border-color 0.15s",
  };
  const lbl = { fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.15em", display: "block", marginBottom: "5px" };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: FONT }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{opacity:.4}50%{opacity:.7} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        input:focus { border-color: ${C.amberDim} !important; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
        select option { background: #09090d; color: #c8ccdf; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; }
        @keyframes modalIn { from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)} }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: "380px", animation: "fadeUp 0.4s ease" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", justifyContent: "center" }}>
          <div style={{ width: "28px", height: "28px", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "2px" }}>
            <span style={{ color: C.bg, fontWeight: 900, fontSize: "15px" }}>S</span>
          </div>
          <span style={{ fontSize: "18px", fontWeight: 700, color: C.amberLt, letterSpacing: "0.15em" }}>SPENDORA</span>
        </div>

        <div style={{ background: C.panel, border: `1px solid ${C.border2}`, borderRadius: "3px", overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={{
                fontFamily: FONT, fontSize: "9px", letterSpacing: "0.15em", padding: "12px",
                background: mode === m ? `${C.amber}14` : "transparent",
                color: mode === m ? C.amberLt : C.muted,
                border: "none", borderBottom: `2px solid ${mode === m ? C.amber : "transparent"}`,
                cursor: "pointer", textTransform: "uppercase", fontWeight: mode === m ? 700 : 400,
                transition: "all 0.15s",
              }}>{m === "login" ? "SIGN IN" : "CREATE ACCOUNT"}</button>
            ))}
          </div>

          <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Google */}
            <button onClick={handleGoogle} disabled={loading} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              fontFamily: FONT, fontSize: "10px", letterSpacing: "0.1em", padding: "10px",
              background: C.bg, border: `1px solid ${C.border2}`, color: C.bright,
              cursor: loading ? "not-allowed" : "pointer", borderRadius: "2px",
              transition: "border-color 0.15s", opacity: loading ? 0.6 : 1,
            }}>
              <I.Google /> CONTINUE WITH GOOGLE
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: 1, height: "1px", background: C.border }} />
              <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.12em" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: C.border }} />
            </div>

            <div>
              <label style={lbl}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inp} onKeyDown={e => e.key === "Enter" && handleEmail()} />
            </div>
            <div>
              <label style={lbl}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} onKeyDown={e => e.key === "Enter" && handleEmail()} />
            </div>

            {error && (
              <div style={{ fontFamily: FONT, fontSize: "9px", color: C.redLt, background: `${C.red}11`, border: `1px solid ${C.redDim}`, padding: "8px 10px", borderRadius: "2px", letterSpacing: "0.06em" }}>
                ⚠ {error}
              </div>
            )}
            {success && (
              <div style={{ fontFamily: FONT, fontSize: "9px", color: C.greenLt, background: `${C.green}11`, border: `1px solid ${C.greenDim}`, padding: "8px 10px", borderRadius: "2px", letterSpacing: "0.06em" }}>
                ✓ {success}
              </div>
            )}

            <button onClick={handleEmail} disabled={loading} style={{
              fontFamily: FONT, fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", padding: "11px",
              background: `${C.amber}22`, color: C.amberLt,
              border: `1px solid ${C.amber}`, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1, textTransform: "uppercase",
              borderRadius: "2px", transition: "opacity 0.15s",
            }}>
              {loading ? "PROCESSING..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.08em" }}>
            YOUR DATA IS ENCRYPTED AND STORED SECURELY IN SUPABASE
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── MOBILE NAV ─────────────────────────────────────────────────────────── */
function MobileNav({ view, setView, open, setOpen }) {
  const navItems = [
    { id: "OVERVIEW",  icon: <I.Grid />,     label: "Overview"  },
    { id: "POSITIONS", icon: <I.List />,     label: "History"   },
    { id: "ANALYTICS", icon: <I.BarChartI />,label: "Analytics" },
    { id: "SIGNALS",   icon: <I.Zap />,      label: "Signals"   },
  ];

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(0,0,0,0.85)" }} onClick={() => setOpen(false)}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "260px", height: "100%", background: C.panel, borderRight: `1px solid ${C.border2}`, display: "flex", flexDirection: "column", animation: "slideIn 0.2s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "22px", height: "22px", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: C.bg, fontWeight: 900, fontSize: "12px" }}>S</span>
            </div>
            <span style={{ fontFamily: FONT, fontSize: "13px", fontWeight: 700, color: C.amberLt, letterSpacing: "0.1em" }}>SPENDORA</span>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", display: "flex" }}><I.Close /></button>
        </div>
        <div style={{ flex: 1, padding: "12px 0" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => { setView(n.id); setOpen(false); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 20px", background: view === n.id ? `${C.amber}12` : "transparent",
              border: "none", borderLeft: `3px solid ${view === n.id ? C.amber : "transparent"}`,
              color: view === n.id ? C.amberLt : C.text, cursor: "pointer",
              fontFamily: FONT, fontSize: "11px", letterSpacing: "0.1em", fontWeight: view === n.id ? 700 : 400,
              textAlign: "left", transition: "all 0.15s",
            }}>
              {n.icon} {n.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── TICKER ─────────────────────────────────────────────────────────────── */
function Ticker({ transactions, isMobile }) {
  const now = new Date();
  const items = useMemo(() => {
    if (!transactions.length) return [];
    const mo = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const inc = mo.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = mo.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const bal = transactions.reduce((s, t) => s + (t.type === "income" ? t.amount : -t.amount), 0);
    const sr = inc ? ((inc - exp) / inc * 100).toFixed(1) : "0.0";
    return [
      { l: "NET BALANCE",  v: `₹${fmtK(bal)}`,   c: C.greenLt },
      { l: "MTH INCOME",   v: `₹${fmtK(inc)}`,   c: C.greenLt },
      { l: "MTH EXPENSES", v: `₹${fmtK(exp)}`,   c: C.redLt   },
      { l: "SAVINGS RATE", v: `${sr}%`,           c: C.amberLt },
      { l: "TOTAL TXN",    v: `${transactions.length}`, c: C.bright },
    ];
  }, [transactions]);

  const show = isMobile ? items.slice(0, 3) : items;

  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, background: C.panel, display: "flex", overflow: "hidden", flexShrink: 0, flexWrap: isMobile ? "wrap" : "nowrap" }}>
      {show.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: isMobile ? "6px 12px" : "5px 16px", borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
          <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.1em" }}>{item.l}</span>
          <span style={{ fontFamily: FONT, fontSize: isMobile ? "10px" : "11px", fontWeight: 700, color: item.c }}>{item.v}</span>
        </div>
      ))}
      {!isMobile && (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", padding: "5px 16px", borderLeft: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.greenLt, boxShadow: `0 0 6px ${C.greenLt}` }} />
          <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.1em" }}>LIVE</span>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────────────────── */
export default function Spendora() {
  const [user, setUser]               = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState("OVERVIEW");
  const [showModal, setShowModal]     = useState(false);
  const [filterType, setFilterType]   = useState("ALL");
  const [filterCat, setFilterCat]     = useState("ALL");
  const [clock, setClock]             = useState(() => new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [dbError, setDbError]         = useState("");
  const clockRef = useRef(null);

  /* ── RESPONSIVE ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── AUTH LISTENER — load Supabase CDN then init ── */
  useEffect(() => {
    let sub;
    loadSupabaseScript().then(() => {
      const sb = getClient();
      if (!sb) { setAuthLoading(false); return; }

      // Handle OAuth callback — exchange code for session
      sb.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      });

      const { data } = sb.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setUser(session?.user ?? null);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
        setAuthLoading(false);
      });
      sub = data.subscription;
    }).catch(() => setAuthLoading(false));
    return () => sub?.unsubscribe();
  }, []);

  /* ── CLOCK — separate ref-based update to avoid re-rendering all charts ── */
  useEffect(() => {
    clockRef.current = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(clockRef.current);
  }, []);

  /* ── FETCH TRANSACTIONS ── */
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setDbError("");

    const load = async () => {
      const { data, error } = await getClient()
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        // Table might not exist yet — show setup message
        if (error.code === "42P01") {
          setDbError("TABLE_MISSING");
        } else {
          setDbError(error.message);
        }
        setLoading(false);
        return;
      }
      setTransactions(data || []);
      setLoading(false);
    };

    load();

    /* Realtime subscription */
    const sb2 = getClient();
    const channel = sb2
      .channel("transactions-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        payload => {
          if (payload.eventType === "INSERT") setTransactions(p => [payload.new, ...p]);
          if (payload.eventType === "DELETE") setTransactions(p => p.filter(t => t.id !== payload.old.id));
          if (payload.eventType === "UPDATE") setTransactions(p => p.map(t => t.id === payload.new.id ? payload.new : t));
        }
      ).subscribe();

    return () => sb2.removeChannel(channel);
  }, [user]);

  /* ── ADD TRANSACTION ── */
  const handleAdd = useCallback(async (formData) => {
    const { data, error } = await getClient()
      .from("transactions")
      .insert([{ ...formData, user_id: user.id }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    // Optimistic update (realtime will also fire, dedup by id is safe)
    setTransactions(p => [data, ...p]);
  }, [user]);

  /* ── DELETE TRANSACTION ── */
  const handleDelete = useCallback(async (id) => {
    const { error } = await getClient().from('transactions').delete().eq('id', id).eq('user_id', user.id);
    if (!error) setTransactions(p => p.filter(t => t.id !== id));
  }, [user]);

  /* ── SIGN OUT ── */
  const signOut = async () => {
    await getClient().auth.signOut();
    setTransactions([]);
    setUser(null);
  };

  /* ── AGGREGATIONS ── */
  const now = useMemo(() => new Date(), [clock.toDateString()]); // update daily

  const { balance, income, expense, thisInc, thisExp, incTrend, expTrend, savingsRate } = useMemo(() => {
    const sum = (arr, type) => arr.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
    const thisMo = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const lastMo = transactions.filter(t => { const d = new Date(t.date); const l = new Date(now.getFullYear(), now.getMonth() - 1, 1); return d.getMonth() === l.getMonth() && d.getFullYear() === l.getFullYear(); });
    const income  = sum(transactions, "income"),  expense  = sum(transactions, "expense");
    const thisInc = sum(thisMo, "income"),         thisExp  = sum(thisMo, "expense");
    const lastInc = sum(lastMo, "income"),         lastExp  = sum(lastMo, "expense");
    return {
      balance: income - expense, income, expense, thisInc, thisExp,
      incTrend: lastInc ? (thisInc - lastInc) / lastInc * 100 : null,
      expTrend: lastExp ? (thisExp - lastExp) / lastExp * 100 : null,
      savingsRate: thisInc ? (thisInc - thisExp) / thisInc * 100 : 0,
    };
  }, [transactions, now]);

  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const k = fmtMon(t.date);
      if (!map[k]) map[k] = { month: k, income: 0, expense: 0 };
      map[k][t.type] += t.amount;
    });
    return Object.values(map).map(m => ({ ...m, savings: m.income - m.expense })).slice(-6);
  }, [transactions]);

  const catData = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value), pct: total ? (value / total * 100).toFixed(1) : 0, code: CAT_CODES[name] || "OT" })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const insights = useMemo(() => {
    if (monthlyData.length < 2) return [{ icon: <I.Info />, color: C.amberLt, text: "ADD MORE TRANSACTIONS ACROSS MULTIPLE MONTHS TO SEE FINANCIAL SIGNALS AND PATTERNS." }];
    const last = monthlyData[monthlyData.length - 1];
    const prev = monthlyData[monthlyData.length - 2];
    const out = [];
    const expChg = prev.expense ? (last.expense - prev.expense) / prev.expense * 100 : 0;
    const incChg = prev.income ? (last.income - prev.income) / prev.income * 100 : 0;
    const sr = last.income ? (last.savings / last.income * 100) : 0;
    if (expChg > 10) out.push({ icon: <I.Warning />, color: C.amberLt, text: `EXPENSE ACCELERATION: ${expChg.toFixed(1)}% increase this month vs prior period (₹${fmtK(last.expense - prev.expense)} delta).` });
    else out.push({ icon: <I.TrendDown />, color: C.greenLt, text: `EXPENSE COMPRESSION: ${Math.abs(expChg).toFixed(1)}% reduction in outflows. Cost discipline improving.` });
    if (sr > 30) out.push({ icon: <I.Check />, color: C.greenLt, text: `STRONG SAVINGS: ${sr.toFixed(1)}% savings rate exceeds 30% threshold. Surplus: ₹${fmtK(last.savings)}.` });
    else if (sr > 0) out.push({ icon: <I.Info />, color: C.amberLt, text: `MODERATE SAVINGS: ${sr.toFixed(1)}% rate (₹${fmtK(last.savings)}). Optimize discretionary spend to breach 30%.` });
    else out.push({ icon: <I.Warning />, color: C.redLt, text: `DEFICIT ALERT: Outflows exceed inflows by ₹${fmtK(Math.abs(last.savings))}. Immediate review recommended.` });
    if (incChg > 5) out.push({ icon: <I.TrendUp />, color: C.greenLt, text: `INCOME GROWTH: ${incChg.toFixed(1)}% uplift month-over-month. Trajectory is positive.` });
    const topCat = catData[0];
    if (topCat) out.push({ icon: <I.BarChartI />, color: C.amberLt, text: `CONCENTRATION: ${topCat.name.toUpperCase()} = ${topCat.pct}% of total expense (₹${fmtK(topCat.value)}).` });
    return out.slice(0, 5);
  }, [monthlyData, catData]);

  const filteredTxns = useMemo(() => transactions.filter(t => {
    if (filterType !== "ALL" && t.type !== filterType.toLowerCase()) return false;
    if (filterCat !== "ALL" && t.category !== filterCat) return false;
    return true;
  }), [transactions, filterType, filterCat]);

  const allCats = useMemo(() => ["ALL", ...Array.from(new Set(transactions.map(t => t.category)))], [transactions]);

  /* ── STYLE HELPERS ── */
  const S = {
    panel: () => ({ background: C.panel, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }),
    skel:  { ...skelStyle },
  };

  const navItems = [
    { id: "OVERVIEW",  icon: <I.Grid />,      label: "OVERVIEW"  },
    { id: "POSITIONS", icon: <I.List />,      label: "HISTORY"   },
    { id: "ANALYTICS", icon: <I.BarChartI />, label: "ANALYTICS" },
    { id: "SIGNALS",   icon: <I.Zap />,       label: "SIGNALS"   },
  ];

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0]?.toUpperCase() || "USER";

  /* ── LOADING ── */
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } @keyframes pulse{0%,100%{opacity:.4}50%{opacity:.7}}`}</style>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "32px", height: "32px", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", borderRadius: "2px", animation: "pulse 1.5s infinite" }}>
            <span style={{ color: C.bg, fontWeight: 900, fontSize: "18px" }}>S</span>
          </div>
          <span style={{ fontSize: "10px", color: C.muted, letterSpacing: "0.2em" }}>INITIALIZING...</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen onAuth={setUser} />;

  /* ── DB SETUP PROMPT ── */
  if (dbError === "TABLE_MISSING") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: FONT }}>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <div style={{ maxWidth: "560px", width: "100%" }}>
          <div style={{ background: C.panel, border: `1px solid ${C.border2}`, borderRadius: "3px", padding: "24px" }}>
            <div style={{ color: C.amberLt, fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", marginBottom: "16px" }}>⚠ DATABASE SETUP REQUIRED</div>
            <div style={{ color: C.text, fontSize: "10px", lineHeight: 1.8, marginBottom: "20px", letterSpacing: "0.04em" }}>
              The <span style={{ color: C.amberLt }}>`transactions`</span> table doesn't exist yet. Run this SQL in your Supabase SQL Editor:
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border2}`, borderRadius: "2px", padding: "16px", fontSize: "9px", color: C.bright, lineHeight: 1.9, letterSpacing: "0.03em", overflowX: "auto" }}>
              <div style={{ color: C.muted, marginBottom: "8px" }}>-- Run in Supabase → SQL Editor</div>
              {`create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('income','expense')) not null,
  amount numeric(12,2) not null,
  category text not null,
  note text,
  date timestamptz not null,
  created_at timestamptz default now()
);

alter table transactions enable row level security;

create policy "Users own data" on transactions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`}
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <button onClick={() => window.location.reload()} style={{ fontFamily: FONT, fontSize: "9px", letterSpacing: "0.12em", padding: "9px 16px", background: `${C.green}22`, color: C.greenLt, border: `1px solid ${C.green}`, cursor: "pointer", borderRadius: "2px" }}>
                ↺ RELOAD AFTER RUNNING SQL
              </button>
              <button onClick={signOut} style={{ fontFamily: FONT, fontSize: "9px", letterSpacing: "0.12em", padding: "9px 16px", background: "transparent", color: C.muted, border: `1px solid ${C.border2}`, cursor: "pointer", borderRadius: "2px" }}>
                SIGN OUT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── MAIN RENDER ── */
  return (
    <div style={{ background: C.bg, height: isMobile ? "auto" : "100vh", minHeight: "100vh", display: "flex", flexDirection: "column", color: C.white, fontFamily: FONT, overflow: isMobile ? "auto" : "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:.4}50%{opacity:.7} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)} }
        @keyframes slideIn { from{transform:translateX(-100%)}to{transform:translateX(0)} }
        input[type=date]::-webkit-calendar-picker-indicator { filter:invert(0.4); }
        select option { background:#09090d; color:#c8ccdf; }
        input:focus, select:focus { border-color:${C.amberDim} !important; outline:none; }
        button:focus-visible { outline: 1px solid ${C.amber}; outline-offset: 2px; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* ── TOP BAR ── */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "stretch", flexShrink: 0, height: "40px" }}>
        {/* Mobile menu button */}
        {isMobile && (
          <button onClick={() => setSidebarOpen(true)} style={{ padding: "0 14px", background: "none", border: "none", borderRight: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center" }}>
            <I.Menu />
          </button>
        )}

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 16px", borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ width: "18px", height: "18px", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: C.bg, fontWeight: 900, fontSize: "11px" }}>S</span>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 700, color: C.amberLt, letterSpacing: "0.1em" }}>SPENDORA</span>
          {!isMobile && <span style={{ fontSize: "9px", color: C.muted, letterSpacing: "0.06em" }}>TERMINAL</span>}
        </div>

        {/* Desktop nav */}
        {!isMobile && navItems.map(n => (
          <button key={n.id} onClick={() => setView(n.id)} style={{
            fontFamily: FONT, fontSize: "9px", letterSpacing: "0.12em", padding: "0 14px",
            border: "none", borderRight: `1px solid ${C.border}`,
            background: view === n.id ? `${C.amber}14` : "transparent",
            color: view === n.id ? C.amberLt : C.muted,
            cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", height: "100%",
            borderBottom: view === n.id ? `2px solid ${C.amber}` : "2px solid transparent",
            transition: "all 0.15s", flexShrink: 0,
          }}>
            {n.icon} {n.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Clock — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", padding: "0 14px", borderLeft: `1px solid ${C.border}`, gap: "12px", flexShrink: 0 }}>
            <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>
              {clock.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
            </span>
            <span style={{ fontFamily: FONT, fontSize: "10px", color: C.amberLt, fontWeight: 700 }}>
              {clock.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </span>
          </div>
        )}

        {/* User + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 12px", borderLeft: `1px solid ${C.border}`, flexShrink: 0 }}>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <I.User />
              <span style={{ fontFamily: FONT, fontSize: "9px", color: C.subtle, letterSpacing: "0.06em", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</span>
            </div>
          )}
          <button onClick={signOut} title="Sign Out" style={{ background: "none", border: `1px solid ${C.border2}`, color: C.muted, cursor: "pointer", padding: "4px 6px", borderRadius: "2px", display: "flex", alignItems: "center", gap: "4px", fontFamily: FONT, fontSize: "9px", letterSpacing: "0.08em", transition: "all 0.15s" }}>
            <I.LogOut /> {!isMobile && "OUT"}
          </button>
        </div>

        {/* Add button */}
        <button onClick={() => setShowModal(true)} style={{
          fontFamily: FONT, fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", padding: "0 14px",
          border: "none", borderLeft: `1px solid ${C.border}`,
          background: `${C.amber}18`, color: C.amberLt, cursor: "pointer",
          display: "flex", alignItems: "center", gap: "6px", height: "100%", flexShrink: 0,
          transition: "background 0.15s",
        }}>
          <I.Plus /> {!isMobile ? "NEW ENTRY" : "ADD"}
        </button>
      </div>

      {/* ── TICKER ── */}
      <Ticker transactions={transactions} isMobile={isMobile} />

      {/* ── CONTENT ── */}
      <div style={{ flex: 1, overflow: isMobile ? "visible" : "hidden", display: "flex", flexDirection: "column" }}>

        {/* ── OVERVIEW ── */}
        {view === "OVERVIEW" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: isMobile ? "visible" : "hidden" }}>
            {/* Stat row */}
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0, flexWrap: "wrap" }}>
              <StatCard label="NET POSITION (ALL TIME)" value={loading ? "—" : `₹${fmtK(balance)}`} sub={loading ? "" : `INC ₹${fmtK(income)}  OUT ₹${fmtK(expense)}`} loading={loading} />
              <StatCard label="MONTHLY INCOME" value={loading ? "—" : `₹${fmtK(thisInc)}`} trend={incTrend} loading={loading} />
              <StatCard label="MONTHLY EXPENSES" value={loading ? "—" : `₹${fmtK(thisExp)}`} sub={catData[0] ? `${catData[0].name.toUpperCase()} LEADS` : undefined} trend={expTrend} loading={loading} />
              <StatCard label="SAVINGS RATE" value={loading ? "—" : `${savingsRate.toFixed(1)}%`} sub={savingsRate > 30 ? "ABOVE THRESHOLD" : savingsRate > 0 ? "BELOW OPTIMAL" : "DEFICIT"} loading={loading} />
            </div>

            {/* Charts grid — responsive */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", minHeight: isMobile ? "auto" : 0, borderBottom: `1px solid ${C.border}`, overflow: isMobile ? "visible" : "hidden" }}>
              {/* Area chart */}
              <div style={{ ...S.panel(), borderTop: "none", borderLeft: "none", borderBottom: isMobile ? `1px solid ${C.border}` : "none", height: isMobile ? "220px" : "auto" }}>
                <PanelHeader title="CASHFLOW / 6M" tag="INCOME vs EXPENSE" />
                <div style={{ flex: 1, padding: "12px 6px 6px 0", minHeight: 0 }}>
                  {loading
                    ? <div style={{ ...S.skel, height: "100%", margin: "0 12px" }} />
                    : <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData} margin={{ top: 4, right: 12, bottom: 0, left: 4 }}>
                          <defs>
                            <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={C.green} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={C.red} stopOpacity={0.25} />
                              <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                          <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 9, fontFamily: FONT }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: FONT }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={40} />
                          <Tooltip content={<BloomTooltip />} />
                          <Area type="monotone" dataKey="income" name="income" stroke={C.greenLt} strokeWidth={1.5} fill="url(#gI)" dot={false} />
                          <Area type="monotone" dataKey="expense" name="expense" stroke={C.redLt} strokeWidth={1.5} fill="url(#gE)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                  }
                </div>
              </div>

              {/* Category breakdown */}
              <div style={{ ...S.panel(), borderTop: "none", borderRight: "none", borderBottom: "none", height: isMobile ? "280px" : "auto" }}>
                <PanelHeader title="EXPENSE BREAKDOWN" tag="BY CATEGORY" />
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
                  {loading
                    ? Array(5).fill(0).map((_, i) => <div key={i} style={{ ...S.skel, height: "28px", margin: "4px 14px" }} />)
                    : catData.length === 0
                      ? <div style={{ padding: "20px 16px", fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.1em" }}>NO EXPENSE DATA YET</div>
                      : catData.map((c, i) => (
                        <div key={c.name} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", borderBottom: `1px solid ${C.border}`, animation: "fadeIn 0.25s ease" }}>
                          <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, width: "20px", flexShrink: 0 }}>{c.code}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontFamily: FONT, fontSize: "9px", color: C.bright, letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name.toUpperCase()}</span>
                              <span style={{ fontFamily: FONT, fontSize: "9px", color: C.amberLt, fontWeight: 700, flexShrink: 0, marginLeft: "6px" }}>₹{fmtK(c.value)}</span>
                            </div>
                            <div style={{ height: "2px", background: C.dim }}>
                              <div style={{ height: "2px", width: `${c.pct}%`, background: CAT_COLORS[i % CAT_COLORS.length], transition: "width 0.6s ease" }} />
                            </div>
                          </div>
                          <span style={{ fontFamily: FONT, fontSize: "9px", color: C.subtle, width: "28px", textAlign: "right", flexShrink: 0 }}>{c.pct}%</span>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", height: isMobile ? "auto" : "220px", flexShrink: isMobile ? 0 : 1, overflow: isMobile ? "visible" : "hidden" }}>
              {/* Savings bar */}
              <div style={{ ...S.panel(), borderTop: "none", borderLeft: "none", borderBottom: isMobile ? `1px solid ${C.border}` : "none", height: isMobile ? "200px" : "auto" }}>
                <PanelHeader title="MONTHLY SAVINGS" tag="6M HISTORY" />
                <div style={{ flex: 1, padding: "10px 6px 6px 0", minHeight: 0 }}>
                  {loading
                    ? <div style={{ ...S.skel, height: "100%", margin: "0 12px" }} />
                    : <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 4, right: 12, bottom: 0, left: 4 }} barSize={isMobile ? 14 : 18}>
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 9, fontFamily: FONT }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: FONT }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={40} />
                          <Tooltip content={<BloomTooltip />} />
                          <Bar dataKey="savings" name="savings" radius={[1, 1, 0, 0]}>
                            {monthlyData.map((m, i) => <Cell key={i} fill={m.savings >= 0 ? C.green : C.red} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                  }
                </div>
              </div>

              {/* Recent transactions */}
              <div style={{ ...S.panel(), borderTop: "none", borderRight: "none", borderBottom: "none", height: isMobile ? "240px" : "auto" }}>
                <PanelHeader title="RECENT TRANSACTIONS" sub={`${transactions.length} TOTAL`} right={
                  <button onClick={() => setView("POSITIONS")} style={{ fontFamily: FONT, fontSize: "9px", color: C.amberLt, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", letterSpacing: "0.08em" }}>
                    VIEW ALL <I.ArrowRight />
                  </button>
                } />
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {loading
                    ? Array(4).fill(0).map((_, i) => <div key={i} style={{ ...S.skel, height: "32px", margin: "4px 12px" }} />)
                    : transactions.length === 0
                      ? <div style={{ padding: "20px 16px", fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.1em" }}>NO TRANSACTIONS YET — CLICK "ADD" TO START</div>
                      : transactions.slice(0, 8).map((t, i) => (
                        <div key={t.id} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 70px" : "70px 1fr 80px", alignItems: "center", gap: "8px", padding: "7px 14px", borderBottom: `1px solid ${C.border}`, animation: `fadeIn 0.25s ease ${Math.min(i, 8) * 0.03}s both` }}>
                          {!isMobile && <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{fmtDate(t.date)}</span>}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontFamily: FONT, fontSize: "10px", color: C.bright, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.category.toUpperCase()}</div>
                            {t.note && <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.note}</div>}
                          </div>
                          <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: t.type === "income" ? C.greenLt : C.redLt, textAlign: "right", whiteSpace: "nowrap" }}>
                            {t.type === "income" ? "+" : "−"}₹{fmtK(t.amount)}
                          </span>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── POSITIONS ── */}
        {view === "POSITIONS" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: isMobile ? "visible" : "hidden" }}>
            {/* Filter bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: C.muted }}>
                <I.Filter />
                <span style={{ fontFamily: FONT, fontSize: "9px", letterSpacing: "0.1em" }}>FILTER:</span>
              </div>
              {["ALL", "INCOME", "EXPENSE"].map(t => (
                <Pill key={t} active={filterType === t} onClick={() => setFilterType(t)}>{t}</Pill>
              ))}
              <div style={{ width: "1px", height: "16px", background: C.border, flexShrink: 0 }} />
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ fontFamily: FONT, fontSize: "9px", letterSpacing: "0.08em", background: C.bg, border: `1px solid ${C.border2}`, color: C.bright, padding: "4px 10px", outline: "none", borderRadius: "2px", flexShrink: 0 }}>
                {allCats.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
              <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, marginLeft: "auto" }}>{filteredTxns.length} RECORDS</span>
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: isMobile ? "visible" : "auto" }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 80px 32px" : "90px 1fr 110px 70px 50px 32px", padding: "6px 14px", borderBottom: `1px solid ${C.border2}`, position: "sticky", top: 0, background: C.panel, zIndex: 2 }}>
                {(isMobile ? ["CATEGORY / NOTE", "AMOUNT", ""] : ["DATE", "CATEGORY / NOTE", "AMOUNT", "TYPE", "CODE", ""]).map(h => (
                  <span key={h} style={{ fontFamily: FONT, fontSize: "9px", letterSpacing: "0.1em", color: C.muted }}>{h}</span>
                ))}
              </div>

              {loading
                ? Array(8).fill(0).map((_, i) => <div key={i} style={{ ...S.skel, height: "36px", margin: "3px 12px" }} />)
                : filteredTxns.length === 0
                  ? <div style={{ fontFamily: FONT, fontSize: "10px", color: C.muted, textAlign: "center", padding: "40px", letterSpacing: "0.1em" }}>NO RECORDS MATCH FILTER CRITERIA</div>
                  : filteredTxns.map((t, i) => (
                    <div key={t.id} style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr 80px 32px" : "90px 1fr 110px 70px 50px 32px",
                      padding: "8px 14px", borderBottom: `1px solid ${C.border}`,
                      animation: `fadeIn 0.2s ease ${Math.min(i, 12) * 0.015}s both`,
                      alignItems: "center",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = C.dim}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {!isMobile && <span style={{ fontFamily: FONT, fontSize: "9px", color: C.subtle }}>{fmtDate(t.date)}</span>}
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontFamily: FONT, fontSize: "10px", color: C.bright, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.category.toUpperCase()}</span>
                        {t.note && <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{t.note}</span>}
                      </div>
                      <span style={{ fontFamily: FONT, fontSize: "10px", fontWeight: 700, color: t.type === "income" ? C.greenLt : C.redLt, whiteSpace: "nowrap" }}>
                        {t.type === "income" ? "+" : "−"}₹{fmtINR(t.amount)}
                      </span>
                      {!isMobile && <span style={{ fontFamily: FONT, fontSize: "9px", color: t.type === "income" ? C.green : C.red, letterSpacing: "0.08em" }}>{t.type.toUpperCase()}</span>}
                      {!isMobile && <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>{CAT_CODES[t.category] || "OT"}</span>}
                      <button onClick={() => handleDelete(t.id)} title="Delete" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", display: "flex", padding: "2px", borderRadius: "2px", transition: "color 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.color = C.redLt}
                        onMouseLeave={e => e.currentTarget.style.color = C.muted}
                      >
                        <I.Trash />
                      </button>
                    </div>
                  ))
              }
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {view === "ANALYTICS" && (
          <div style={{ flex: 1, overflow: isMobile ? "auto" : "hidden", display: isMobile ? "flex" : "grid", flexDirection: isMobile ? "column" : undefined, gridTemplateColumns: isMobile ? undefined : "1fr 1fr", gridTemplateRows: isMobile ? undefined : "1fr 1fr" }}>
            {/* Income vs Expense grouped bar */}
            <div style={{ ...S.panel(), borderTop: "none", borderLeft: "none", borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`, height: isMobile ? "220px" : "auto" }}>
              <PanelHeader title="INCOME vs EXPENSE" tag="MONTHLY" />
              <div style={{ flex: 1, padding: "12px 6px 6px 0", minHeight: 0 }}>
                {loading ? <div style={{ ...S.skel, height: "100%", margin: "0 12px" }} /> :
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 4, right: 12, bottom: 0, left: 4 }} barSize={10} barGap={3}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 9, fontFamily: FONT }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: FONT }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={40} />
                      <Tooltip content={<BloomTooltip />} />
                      <Bar dataKey="income" name="income" fill={C.green} radius={[1, 1, 0, 0]} />
                      <Bar dataKey="expense" name="expense" fill={C.red} radius={[1, 1, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                }
              </div>
            </div>

            {/* Category horizontal bar */}
            <div style={{ ...S.panel(), borderTop: "none", borderRight: "none", borderBottom: `1px solid ${C.border}`, height: isMobile ? "220px" : "auto" }}>
              <PanelHeader title="EXPENSE CATEGORIES" tag="ALL TIME" />
              <div style={{ flex: 1, padding: "12px 12px 6px 0", minHeight: 0 }}>
                {loading ? <div style={{ ...S.skel, height: "100%", margin: "0 12px" }} /> :
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 16 }} barSize={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                      <XAxis type="number" tick={{ fill: C.muted, fontSize: 9, fontFamily: FONT }} axisLine={false} tickLine={false} tickFormatter={fmtK} />
                      <YAxis type="category" dataKey="code" tick={{ fill: C.subtle, fontSize: 9, fontFamily: FONT }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip content={<BloomTooltip />} />
                      <Bar dataKey="value" name="amount" radius={[0, 1, 1, 0]}>
                        {catData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                }
              </div>
            </div>

            {/* Savings line */}
            <div style={{ ...S.panel(), borderTop: "none", borderLeft: "none", borderBottom: isMobile ? `1px solid ${C.border}` : "none", borderRight: `1px solid ${C.border}`, height: isMobile ? "220px" : "auto" }}>
              <PanelHeader title="SAVINGS TRAJECTORY" tag="6M ROLLING" />
              <div style={{ flex: 1, padding: "12px 6px 6px 0", minHeight: 0 }}>
                {loading ? <div style={{ ...S.skel, height: "100%", margin: "0 12px" }} /> :
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData} margin={{ top: 4, right: 12, bottom: 0, left: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                      <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 9, fontFamily: FONT }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 9, fontFamily: FONT }} axisLine={false} tickLine={false} tickFormatter={fmtK} width={40} />
                      <Tooltip content={<BloomTooltip />} />
                      <Line type="monotone" dataKey="savings" name="savings" stroke={C.amberLt} strokeWidth={1.5} dot={{ fill: C.amberLt, r: 3 }} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                }
              </div>
            </div>

            {/* Budget utilization */}
            <div style={{ ...S.panel(), borderTop: "none", borderRight: "none", borderBottom: "none", height: isMobile ? "280px" : "auto" }}>
              <PanelHeader title="BUDGET UTILIZATION" tag="THIS MONTH" />
              <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                {Object.entries(BUDGETS).map(([cat, budget]) => {
                  const spent = transactions.filter(t => {
                    const d = new Date(t.date);
                    return t.type === "expense" && t.category === cat && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).reduce((s, t) => s + t.amount, 0);
                  const pct = Math.min(spent / budget * 100, 100);
                  const barColor = pct > 90 ? C.red : pct > 70 ? C.amber : C.green;
                  return (
                    <div key={cat} style={{ padding: "8px 16px", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", gap: "8px" }}>
                        <span style={{ fontFamily: FONT, fontSize: "9px", color: C.bright, letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.toUpperCase()}</span>
                        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                          <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted }}>₹{fmtK(spent)} / ₹{fmtK(budget)}</span>
                          <span style={{ fontFamily: FONT, fontSize: "9px", fontWeight: 700, color: barColor }}>{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div style={{ height: "2px", background: C.dim, borderRadius: "1px" }}>
                        <div style={{ height: "2px", width: `${pct}%`, background: barColor, transition: "width 0.6s ease", borderRadius: "1px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── SIGNALS ── */}
        {view === "SIGNALS" && (
          <div style={{ flex: 1, display: isMobile ? "flex" : "grid", flexDirection: isMobile ? "column" : undefined, gridTemplateColumns: isMobile ? undefined : "1fr 1fr", overflow: isMobile ? "auto" : "hidden" }}>
            {/* Insight signals */}
            <div style={{ ...S.panel(), borderTop: "none", borderLeft: "none", borderBottom: isMobile ? `1px solid ${C.border}` : "none", borderRight: `1px solid ${C.border}` }}>
              <PanelHeader title="FINANCIAL SIGNALS" tag={`${insights.length} ACTIVE`} />
              <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
                {loading
                  ? Array(4).fill(0).map((_, i) => <div key={i} style={{ ...S.skel, height: "60px", margin: "6px 14px" }} />)
                  : insights.map((ins, i) => (
                    <div key={i} style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, animation: `fadeIn 0.25s ease ${i * 0.06}s both` }}>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ color: ins.color, flexShrink: 0, marginTop: "1px" }}>{ins.icon}</div>
                        <div>
                          <div style={{ fontFamily: FONT, fontSize: "10px", color: C.bright, letterSpacing: "0.04em", lineHeight: 1.7 }}>{ins.text}</div>
                          <div style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, marginTop: "4px", letterSpacing: "0.08em" }}>
                            SIGNAL {String(i + 1).padStart(2, "0")} · {new Date().toLocaleDateString("en-IN", { month: "short", year: "2-digit" }).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Monthly summary table */}
            <div style={{ ...S.panel(), borderTop: "none", borderRight: "none", borderBottom: "none" }}>
              <PanelHeader title="PERIOD SUMMARY" tag="MONTHLY BREAKDOWN" />
              <div style={{ flex: 1, overflowY: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "60px 1fr 1fr 1fr" : "72px 1fr 1fr 1fr", padding: "7px 16px", borderBottom: `1px solid ${C.border2}`, position: "sticky", top: 0, background: C.panel }}>
                  {["PERIOD", "INCOME", "EXPENSE", "SAVINGS"].map(h => (
                    <span key={h} style={{ fontFamily: FONT, fontSize: "9px", letterSpacing: "0.1em", color: C.muted }}>{h}</span>
                  ))}
                </div>
                {loading
                  ? Array(5).fill(0).map((_, i) => <div key={i} style={{ ...S.skel, height: "32px", margin: "3px 12px" }} />)
                  : monthlyData.length === 0
                    ? <div style={{ padding: "20px 16px", fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.1em" }}>NO DATA YET</div>
                    : [...monthlyData].reverse().map((m, i) => {
                      const sr = m.income ? (m.savings / m.income * 100) : 0;
                      return (
                        <div key={m.month} style={{ display: "grid", gridTemplateColumns: isMobile ? "60px 1fr 1fr 1fr" : "72px 1fr 1fr 1fr", padding: "9px 16px", borderBottom: `1px solid ${C.border}`, animation: `fadeIn 0.2s ease ${i * 0.04}s both` }}>
                          <span style={{ fontFamily: FONT, fontSize: "10px", color: C.amberLt, fontWeight: 700 }}>{m.month.toUpperCase()}</span>
                          <span style={{ fontFamily: FONT, fontSize: "10px", color: C.greenLt }}>₹{fmtK(m.income)}</span>
                          <span style={{ fontFamily: FONT, fontSize: "10px", color: C.redLt }}>₹{fmtK(m.expense)}</span>
                          <div>
                            <span style={{ fontFamily: FONT, fontSize: "10px", color: m.savings >= 0 ? C.greenLt : C.redLt, fontWeight: 700 }}>
                              {m.savings >= 0 ? "+" : ""}₹{fmtK(m.savings)}
                            </span>
                            <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, marginLeft: "5px" }}>({sr.toFixed(0)}%)</span>
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── STATUS BAR ── */}
      {!isMobile && (
        <div style={{ height: "22px", background: C.panel, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 14px", gap: "20px", flexShrink: 0, overflow: "hidden" }}>
          {[
            ["USER", userName],
            ["DB", "SUPABASE · CONNECTED"],
            ["ROWS", String(transactions.length)],
            ["VIEW", view],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              <span style={{ fontFamily: FONT, fontSize: "9px", color: C.muted, letterSpacing: "0.1em" }}>{k}:</span>
              <span style={{ fontFamily: FONT, fontSize: "9px", color: C.subtle, letterSpacing: "0.06em" }}>{v}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.greenLt }} />
            <span style={{ fontFamily: FONT, fontSize: "9px", color: C.greenLt, letterSpacing: "0.1em" }}>ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      )}

      {/* ── MOBILE NAV DRAWER ── */}
      <MobileNav view={view} setView={setView} open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* ── ADD MODAL ── */}
      {showModal && <AddModal onAdd={handleAdd} onClose={() => setShowModal(false)} />}
    </div>
  );
}
