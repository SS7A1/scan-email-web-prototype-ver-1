import React, { useState } from "react";

const API = import.meta.env?.VITE_API_BASE || "http://localhost:3000";

async function fetchJSON(url, options = {}, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${t || "No details"}`);
    }
    return await res.json();
  } finally { clearTimeout(to); }
}

function Badge({ verdict, level }) {
  const color = verdict === "danger" ? "#b91c1c" : verdict === "suspicious" ? "#b45309" : "#166534";
  const bg    = verdict === "danger" ? "#fee2e2" : verdict === "suspicious" ? "#fef3c7" : "#dcfce7";
  return (
    <span style={{ padding:"6px 10px", borderRadius:999, background:bg, color, fontWeight:700, fontSize:14 }}>
      {level}
    </span>
  );
}
function RiskBar({ score }) {
  const pct = Math.round((score ?? 0) * 100);
  const color = score >= 0.7 ? "#ef4444" : score >= 0.35 ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ marginTop:10 }}>
      <div style={{ fontSize:12, opacity:0.75, marginBottom:6 }}>ระดับความเสี่ยง: {pct}%</div>
      <div style={{ height:10, background:"#e5e7eb", borderRadius:8 }}>
        <div style={{ width:`${pct}%`, height:"100%", borderRadius:8, background:color, transition:"width .25s" }} />
      </div>
    </div>
  );
}
function Card({ data }) {
  const { verdict, level, score, issues = [], advice = [], target, kind, filename, size } = data;
  const border =
    verdict === "danger" ? "1px solid #fecaca" : verdict === "suspicious" ? "1px solid #fde68a" : "1px solid #bbf7d0";
  return (
    <div style={{ marginTop:18, padding:18, borderRadius:16, border, background:"#fff", boxShadow:"0 10px 30px rgba(0,0,0,.06)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
        <h3 style={{ margin:0 }}>{kind === "url" ? "ผลสแกน URL" : "ผลสแกนไฟล์"}</h3>
        <Badge verdict={verdict} level={level} />
      </div>
      <div style={{ color:"#475569", fontSize:13, marginBottom:4 }}>
        {kind === "url" ? (target) : (<>{filename} {size ? `• ${(size/1024).toFixed(1)} KB` : ""}</>)}
      </div>
      <RiskBar score={score} />
      {issues.length ? (
        <>
          <h4 style={{ margin:"14px 0 8px" }}>จุดที่ควรระวัง</h4>
          <ul style={{ marginTop:0 }}>{issues.map((it, i) => <li key={i}>{it}</li>)}</ul>
        </>
      ) : <p style={{ marginTop:12, color:"#16a34a" }}>ยังไม่พบสัญญาณอันตรายชัดเจน</p>}
      {advice.length > 0 && (
        <>
          <h4 style={{ margin:"12px 0 8px" }}>คำแนะนำ</h4>
          <ul style={{ marginTop:0 }}>{advice.map((it, i) => <li key={i}>{it}</li>)}</ul>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function onScanUrl(e) {
    e.preventDefault();
    const url = new FormData(e.currentTarget).get("url")?.trim();
    if (!url) return;
    setBusy(true); setData(null); setErr("");
    try {
      const json = await fetchJSON(`${API}/api/scan/url`, {
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ url })
      });
      setData(json);
    } catch (ex) {
      setErr(ex.message);
    } finally { setBusy(false); }
  }

  async function onScanFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true); setData(null); setErr("");
    try {
      const form = new FormData();
      form.append("file", f);
      const json = await fetchJSON(`${API}/api/scan/file`, { method:"POST", body: form });
      setData(json);
    } catch (ex) {
      setErr(ex.message);
    } finally { setBusy(false); e.target.value = ""; }
  }

  return (
    <main style={{ fontFamily:"system-ui, sans-serif", padding:28, maxWidth:980, margin:"0 auto" }}>
      <h1 style={{ fontSize:48, marginBottom:8 }}>Email Scanner (Local)</h1>
      <p style={{ marginTop:0, color:"#334155" }}>อัปโหลดไฟล์แนบอีเมล หรือกรอก URL เพื่อตรวจสอบความเสี่ยง</p>

      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <input type="file" onChange={onScanFile} disabled={busy} />
        <form onSubmit={onScanUrl} style={{ display:"flex", gap:8, flex:1, minWidth:360 }}>
          <input name="url" placeholder="เช่น youtube.com หรือ https://example.com" style={{ flex:1, padding:10, borderRadius:8, border:"1px solid #cbd5e1" }} disabled={busy} />
          <button type="submit" disabled={busy} style={{ padding:"10px 14px", borderRadius:8, border:"1px solid #cbd5e1", background:"#111827", color:"#fff" }}>
            {busy ? "กำลังสแกน..." : "Scan URL"}
          </button>
        </form>
      </div>

      {err && <div style={{ marginTop:16, padding:12, borderRadius:12, background:"#fee2e2", color:"#991b1b" }}>เกิดข้อผิดพลาด: {err}</div>}
      {data && <Card data={data} />}
    </main>
  );
}
