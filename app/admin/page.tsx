"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";
import type { Jilid, Unit, Materi, Kamus, Activity, DialogLine } from "@/lib/types";
import { toAD, stripAr, truncate, newId } from "@/lib/utils";

// ─── types ───────────────────────────────────────────────────────────────────

type View = "dashboard" | "jilids" | "units" | "materi" | "kamus";
type ModalState =
  | { kind: "picker" }
  | { kind: "jilid"; mode: "add" | "edit"; item?: Jilid }
  | { kind: "unit"; mode: "add" | "edit"; item?: Unit }
  | { kind: "materi"; mode: "add" | "edit"; item?: Materi }
  | { kind: "kamus"; mode: "add" | "edit"; item?: Kamus }
  | { kind: "csv" }
  | { kind: "confirm"; label: string; onConfirm: () => void }
  | null;

// ─── main page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <AppShell isAdmin>
      {() => <AdminContent />}
    </AppShell>
  );
}

function AdminContent() {
  const [jilids, setJilids] = useState<Jilid[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [kamus, setKamus] = useState<Kamus[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [kamusImgOnly, setKamusImgOnly] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all data
  useEffect(() => {
    Promise.all([
      supabase.from("jilids").select("*").order("id"),
      supabase.from("units").select("*").order("jilid_id").order("num"),
      supabase.from("materi").select("*").order("jilid_id").order("unit_num").order("sort_order"),
      supabase.from("kamus").select("*").order("jilid_id").order("unit_num"),
      supabase.from("activity").select("*").order("created_at", { ascending: false }).limit(30),
    ]).then(([j, u, m, k, a]) => {
      if (j.data) setJilids(j.data);
      if (u.data) setUnits(u.data);
      if (m.data) setMateri(m.data);
      if (k.data) setKamus(k.data);
      if (a.data) setActivity(a.data);
    });
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const logActivity = useCallback(async (type: Activity["type"], what: string, color: string) => {
    const { data } = await supabase.from("activity").insert({ type, what, color }).select().single();
    if (data) setActivity(prev => [data, ...prev].slice(0, 30));
  }, []);

  // ── CRUD: Jilids ──────────────────────────────────────────────────────────

  const saveJilid = async (data: Partial<Jilid>, original?: Jilid) => {
    if (original) {
      await supabase.from("jilids").update(data).eq("id", original.id);
      setJilids(prev => prev.map(j => j.id === original.id ? { ...j, ...data } : j));
      logActivity("edit", `تعديل جزء: ${data.name}`, "#d97757");
    } else {
      const item = { ...data, id: data.id || newId("jilid") } as Jilid;
      await supabase.from("jilids").insert(item);
      setJilids(prev => [...prev, item]);
      logActivity("add", `جزء جديد: ${data.name}`, "#15803d");
    }
    flash(original ? "تمّ التّعديل" : "تمّت الإضافة");
    setModal(null);
  };

  const removeJilid = async (id: string) => {
    const j = jilids.find(x => x.id === id);
    await supabase.from("jilids").delete().eq("id", id);
    setJilids(prev => prev.filter(x => x.id !== id));
    setUnits(prev => prev.filter(x => x.jilid_id !== id));
    setMateri(prev => prev.filter(x => x.jilid_id !== id));
    setKamus(prev => prev.filter(x => x.jilid_id !== id));
    logActivity("delete", `حذف جزء: ${j?.name || id}`, "#dc2626");
    flash("تمّ الحذف");
  };

  // ── CRUD: Units ───────────────────────────────────────────────────────────

  const saveUnit = async (data: Partial<Unit>, original?: Unit) => {
    if (original) {
      await supabase.from("units").update(data).eq("id", original.id);
      setUnits(prev => prev.map(u => u.id === original.id ? { ...u, ...data } : u));
      logActivity("edit", `تعديل دَرس: ${data.title}`, "#d97757");
    } else {
      const item = { ...data, id: newId("unit") } as Unit;
      await supabase.from("units").insert(item);
      setUnits(prev => [...prev, item]);
      logActivity("add", `دَرس جديد: ${data.title}`, "#15803d");
    }
    flash(original ? "تمّ التّعديل" : "تمّت الإضافة");
    setModal(null);
  };

  const removeUnit = async (id: string) => {
    const u = units.find(x => x.id === id);
    await supabase.from("units").delete().eq("id", id);
    setUnits(prev => prev.filter(x => x.id !== id));
    setMateri(prev => prev.filter(x => !(x.jilid_id === u?.jilid_id && x.unit_num === u?.num)));
    setKamus(prev => prev.filter(x => !(x.jilid_id === u?.jilid_id && x.unit_num === u?.num)));
    logActivity("delete", `حذف دَرس: ${u?.title || id}`, "#dc2626");
    flash("تمّ الحذف");
  };

  // ── CRUD: Materi ──────────────────────────────────────────────────────────

  const saveMateri = async (data: Partial<Materi>, original?: Materi) => {
    if (original) {
      await supabase.from("materi").update(data).eq("id", original.id);
      setMateri(prev => prev.map(m => m.id === original.id ? { ...m, ...data } : m));
      logActivity("edit", `تعديل فقرة: ${data.type === "dialog" ? data.title || "حوار" : (data.text || "").slice(0, 40)}`, "#d97757");
    } else {
      const item = { ...data, id: newId("m") } as Materi;
      await supabase.from("materi").insert(item);
      setMateri(prev => [...prev, item]);
      logActivity("add", `فقرة جديدة: ${data.type}`, "#15803d");
    }
    flash(original ? "تمّ التّعديل" : "تمّت الإضافة");
    setModal(null);
  };

  const removeMateri = async (id: string) => {
    await supabase.from("materi").delete().eq("id", id);
    setMateri(prev => prev.filter(x => x.id !== id));
    logActivity("delete", "حذف فقرة", "#dc2626");
    flash("تمّ الحذف");
  };

  // ── CRUD: Kamus ───────────────────────────────────────────────────────────

  const saveKamus = async (data: Partial<Kamus>, original?: Kamus) => {
    if (original) {
      await supabase.from("kamus").update(data).eq("id", original.id);
      setKamus(prev => prev.map(k => k.id === original.id ? { ...k, ...data } : k));
      logActivity("edit", `تعديل كلمة: ${data.kalimah}`, "#d97757");
    } else {
      const item = { id: newId("k"), ...data } as Kamus;
      await supabase.from("kamus").insert(item);
      setKamus(prev => [...prev, item]);
      logActivity("add", `كلمة جديدة: ${data.kalimah}`, "#15803d");
    }
    flash(original ? "تمّ التّعديل" : "تمّت الإضافة");
    setModal(null);
  };

  const removeKamus = async (id: string) => {
    const k = kamus.find(x => x.id === id);
    await supabase.from("kamus").delete().eq("id", id);
    setKamus(prev => prev.filter(x => x.id !== id));
    logActivity("delete", `حذف كلمة: ${k?.kalimah || id}`, "#dc2626");
    flash("تمّ الحذف");
  };

  // ── CSV import ────────────────────────────────────────────────────────────

  const importKamusCsv = async (rows: Record<string, string>[], jilidId: string, unitNum: number) => {
    const fresh = rows.map(r => ({
      id: newId("k"), jilid_id: jilidId, unit_num: unitNum,
      kalimah: r.kalimah, sharh: r.sharh,
      jam: r.jam || null, mufrad: r.mufrad || null,
      muradif: r.muradif || null, didh: r.didh || null,
      mithal: r.mithal || null, tashrif: null, has_img: false,
    } as Kamus));
    await supabase.from("kamus").insert(fresh);
    setKamus(prev => [...prev, ...fresh]);
    logActivity("add", `استيراد ${fresh.length} كلمة من CSV`, "#15803d");
    flash(`تمّ استيراد ${toAD(fresh.length)} كلمة`);
    setModal(null);
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    jilids: jilids.length,
    units: units.length,
    materi: materi.length,
    kamus: kamus.length,
    jilidsDone: jilids.filter(j => !j.locked).length,
    jilidsPrep: jilids.filter(j => j.locked).length,
    unitsPublished: units.filter(u => u.status === "done" || u.status === "current").length,
    unitsDraft: units.filter(u => u.status === "todo").length,
    mDialog: materi.filter(m => m.type === "dialog").length,
    mPara: materi.filter(m => m.type === "paragraph").length,
    mNote: materi.filter(m => m.type === "note").length,
  }), [jilids, units, materi, kamus]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="container" style={{ padding: "40px 28px 80px", animation: "fadeIn .25s ease" }}>
      {view === "dashboard" && (
        <AdminDashboard
          stats={stats} activity={activity}
          openPicker={() => setModal({ kind: "picker" })}
          openAdd={(kind) => setModal({ kind, mode: "add" } as ModalState)}
          goManage={(v) => setView(v)}
          goKamusImgs={() => { setKamusImgOnly(true); setView("kamus"); }}
          openCsv={() => setModal({ kind: "csv" })}
        />
      )}
      {view === "jilids" && (
        <JilidListView jilids={jilids} units={units}
          back={() => setView("dashboard")}
          add={() => setModal({ kind: "jilid", mode: "add" })}
          edit={(item) => setModal({ kind: "jilid", mode: "edit", item })}
          remove={(item) => setModal({ kind: "confirm", label: `حذف الجزء «${item.name}»؟ سيُحذف كل ما يتبعه.`, onConfirm: () => removeJilid(item.id) })}
        />
      )}
      {view === "units" && (
        <UnitListView units={units} jilids={jilids}
          back={() => setView("dashboard")}
          add={() => setModal({ kind: "unit", mode: "add" })}
          edit={(item) => setModal({ kind: "unit", mode: "edit", item })}
          remove={(item) => setModal({ kind: "confirm", label: `حذف الدّرس «${item.title}»؟`, onConfirm: () => removeUnit(item.id) })}
        />
      )}
      {view === "materi" && (
        <MateriListView materi={materi} units={units} jilids={jilids}
          back={() => setView("dashboard")}
          add={() => setModal({ kind: "materi", mode: "add" })}
          edit={(item) => setModal({ kind: "materi", mode: "edit", item })}
          remove={(item) => setModal({ kind: "confirm", label: "حذف هذه الفقرة؟", onConfirm: () => removeMateri(item.id) })}
        />
      )}
      {view === "kamus" && (
        <KamusListView kamus={kamus} units={units} jilids={jilids}
          back={() => { setKamusImgOnly(false); setView("dashboard"); }}
          add={() => setModal({ kind: "kamus", mode: "add" })}
          edit={(item) => setModal({ kind: "kamus", mode: "edit", item })}
          remove={(item) => setModal({ kind: "confirm", label: `حذف الكلمة «${item.kalimah}»؟`, onConfirm: () => removeKamus(item.id) })}
          openCsv={() => setModal({ kind: "csv" })}
          imgOnly={kamusImgOnly}
        />
      )}

      {/* Modals */}
      {modal?.kind === "picker"  && <PickerModal onClose={() => setModal(null)} onPick={(k) => setModal({ kind: k, mode: "add" } as ModalState)} />}
      {modal?.kind === "jilid"   && <JilidFormModal item={modal.item} onClose={() => setModal(null)} onSave={saveJilid} />}
      {modal?.kind === "unit"    && <UnitFormModal item={modal.item} jilids={jilids} onClose={() => setModal(null)} onSave={saveUnit} />}
      {modal?.kind === "materi"  && <MateriFormModal item={modal.item} jilids={jilids} units={units} onClose={() => setModal(null)} onSave={saveMateri} />}
      {modal?.kind === "kamus"   && <KamusFormModal item={modal.item} jilids={jilids} units={units} onClose={() => setModal(null)} onSave={saveKamus} />}
      {modal?.kind === "csv"     && <CsvImportModal jilids={jilids} units={units} onClose={() => setModal(null)} onImport={importKamusCsv} />}
      {modal?.kind === "confirm" && <ConfirmModal label={modal.label} onClose={() => setModal(null)} onConfirm={() => { modal.onConfirm(); setModal(null); }} />}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 220,
          background: "var(--absolute-zero)", color: "var(--canvas-white)",
          padding: "12px 18px", borderRadius: 999, boxShadow: "rgba(0,0,0,.22) 0 8px 24px",
          fontFamily: "var(--font-ar)", fontSize: 14, animation: "slideUp .18s ease",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon name="check" size={14} /> {toast}
        </div>
      )}
    </main>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function AdminDashboard({ stats, activity, openPicker, openAdd, goManage, goKamusImgs, openCsv }: {
  stats: ReturnType<typeof import("react")["useState"] extends never ? never : any>;
  activity: Activity[];
  openPicker: () => void; openAdd: (k: string) => void;
  goManage: (v: View) => void; goKamusImgs: () => void; openCsv: () => void;
}) {
  const cards = [
    { key: "jilids", view: "jilids" as View, addKind: "jilid", label: "الأجزاء", icon: "book" as const, value: stats.jilids, hint: `${toAD(stats.jilidsDone)} متاح · ${toAD(stats.jilidsPrep)} قيد الإعداد`, accent: "var(--absolute-zero)" },
    { key: "units",  view: "units"  as View, addKind: "unit",  label: "الدّروس", icon: "list" as const,  value: stats.units,  hint: `${toAD(stats.unitsPublished)} منشور · ${toAD(stats.unitsDraft)} مسوّدة`, accent: "var(--blue-pop)" },
    { key: "materi", view: "materi" as View, addKind: "materi",label: "الفقرات", icon: "file" as const,  value: stats.materi, hint: `${toAD(stats.mDialog)} حوار · ${toAD(stats.mPara)} فقرة · ${toAD(stats.mNote)} ملاحظة`, accent: "var(--absolute-zero)" },
    { key: "kamus",  view: "kamus"  as View, addKind: "kamus", label: "المعجم",  icon: "image" as const, value: stats.kamus,  hint: `${toAD(stats.kamus)} كلمة محفوظة`, accent: "var(--blue-pop)" },
  ];
  return (
    <>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="fast" style={{ color: "var(--graphite)", fontSize: 18 }}>مرحباً، admin</div>
          <h1 className="ar-display" style={{ fontSize: "clamp(36px,5vw,52px)", margin: "4px 0 0", color: "var(--ink-black)" }}>لوحة التّحكُّم</h1>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openPicker}><Icon name="plus" size={14} /> إضافة جديد</button>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 36 }}>
        {cards.map(c => (
          <div key={c.key} onClick={() => goManage(c.view)}
            style={{ background: "#fff", borderRadius: "var(--r-card-sm)", border: "1px solid var(--cool-gray)", padding: "24px 26px", display: "flex", flexDirection: "column", gap: 6, cursor: "pointer", transition: "transform .14s, border-color .14s, box-shadow .14s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--silver-mist)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-subtle)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.borderColor = "var(--cool-gray)"; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--graphite)" }}>
              <span className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name={c.icon} size={13} /> {c.label}
              </span>
              <button className="btn btn-quiet btn-icon" style={{ width: 28, height: 28, color: c.accent }}
                onClick={(e) => { e.stopPropagation(); openAdd(c.addKind); }}>
                <Icon name="plus" size={14} />
              </button>
            </div>
            <div style={{ fontFamily: "var(--font-ar)", fontSize: 48, fontWeight: 700, lineHeight: 1, color: c.accent, letterSpacing: "-2px", margin: "4px 0 2px" }}>
              {toAD(c.value)}
            </div>
            <div className="ar" style={{ fontSize: 13, color: "var(--graphite)" }}>{c.hint}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--cool-gray)" }}>
              <span style={{ fontFamily: "var(--font-fasthand)", fontSize: 15, color: "var(--blue-pop)" }}>إدارة</span>
              <Icon name="arrowL" size={14} style={{ color: "var(--blue-pop)" }} />
            </div>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }}>
        <div style={{ background: "#fff", borderRadius: "var(--r-card-sm)", border: "1px solid var(--cool-gray)", padding: "24px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 className="ar-display" style={{ fontSize: 20, margin: 0, color: "var(--ink-black)" }}>آخر التّعديلات</h2>
            <span className="ar" style={{ fontSize: 12, color: "var(--graphite)" }}>{toAD(activity.length)} عمليّة</span>
          </div>
          {activity.length === 0 ? (
            <div className="ar" style={{ padding: "24px 0", textAlign: "center", color: "var(--graphite)" }}>لا توجد تعديلات بعد.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", maxHeight: 380, overflowY: "auto" }}>
              {activity.map((a, i) => (
                <div key={a.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "center", padding: "12px 0", borderTop: i ? "1px solid var(--cool-gray)" : "0" }}>
                  <span style={{ width: 34, height: 34, borderRadius: "50%", background: `color-mix(in oklab,${a.color} 14%,transparent)`, color: a.color, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700 }}>
                    {a.type === "edit" ? "✎" : a.type === "add" ? "+" : a.type === "delete" ? "×" : <Icon name="image" size={15} />}
                  </span>
                  <div>
                    <div className="ar" style={{ fontSize: 15, color: "var(--ink-black)" }}>{a.what}</div>
                    <div style={{ fontSize: 12, color: "var(--graphite)", marginTop: 2 }}>{a.who}</div>
                  </div>
                  <span className="ar" style={{ fontSize: 13, color: "var(--graphite)" }}>
                    {new Date(a.created_at).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: "var(--r-card-sm)", border: "1px solid var(--cool-gray)", padding: "24px 26px" }}>
            <h2 className="ar-display" style={{ fontSize: 20, margin: "0 0 12px", color: "var(--ink-black)" }}>إجراءات سريعة</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn btn-ghost" style={{ justifyContent: "flex-start" }} onClick={() => openAdd("unit")}><Icon name="plus" size={14} /> إضافة دَرس جديد</button>
              <button className="btn btn-ghost" style={{ justifyContent: "flex-start" }} onClick={() => openAdd("kamus")}><Icon name="plus" size={14} /> إضافة كلمة إلى المعجم</button>
              <button className="btn btn-ghost" style={{ justifyContent: "flex-start" }} onClick={() => openAdd("materi")}><Icon name="plus" size={14} /> إضافة فقرة / حوار</button>
              <button className="btn btn-ghost" style={{ justifyContent: "flex-start" }} onClick={goKamusImgs}><Icon name="image" size={14} /> إدارة كلمات بالصّور</button>
              <button className="btn btn-ghost" style={{ justifyContent: "flex-start" }} onClick={openCsv}><Icon name="file" size={14} /> استيراد معجم من CSV</button>
            </div>
          </div>
          <div style={{ background: "var(--absolute-zero)", color: "var(--canvas-white)", borderRadius: "var(--r-card-sm)", padding: "24px 26px" }}>
            <div className="fast" style={{ color: "var(--blue-pop)", fontSize: 16, transform: "rotate(-1deg)", display: "inline-block" }}>tip</div>
            <h3 className="ar-display" style={{ fontSize: 18, margin: "4px 0 6px" }}>التّعديلات محفوظة في Supabase</h3>
            <p className="ar" style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(250,250,250,.7)", margin: 0 }}>
              كلّ ما تضيفه أو تعدّله يُحفظ مباشرةً في قاعدة البيانات ويظهر فوراً للقرّاء.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── List views ───────────────────────────────────────────────────────────────

function ListHead({ title, count, back, addLabel, onAdd, extraActions }: { title: string; count: number; back: () => void; addLabel: string; onAdd: () => void; extraActions?: React.ReactNode }) {
  return (
    <header style={{ marginBottom: 24 }}>
      <button className="btn btn-quiet btn-sm" onClick={back} style={{ marginBottom: 12 }}>
        <Icon name="arrowR" size={14} /> العودة للوحة التّحكُّم
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="ar-display" style={{ fontSize: 36, margin: 0, color: "var(--ink-black)" }}>{title}</h1>
          <div className="ar" style={{ fontSize: 14, color: "var(--graphite)", marginTop: 6 }}>{toAD(count)} عنصر</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {extraActions}
          <button className="btn btn-primary btn-sm" onClick={onAdd}><Icon name="plus" size={14} /> {addLabel}</button>
        </div>
      </div>
    </header>
  );
}

const fldStyle: React.CSSProperties = {
  width: "100%", background: "#fff", border: "1px solid var(--cool-gray)",
  borderRadius: 12, padding: "10px 14px", fontSize: 15, color: "var(--ink-black)",
  fontFamily: "var(--font-ar)", direction: "rtl", textAlign: "right",
  lineHeight: 1.4, outline: "none", transition: "border-color .12s, box-shadow .12s",
};

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button className="btn btn-quiet btn-sm" onClick={onEdit} style={{ padding: "6px 10px" }}><Icon name="cog" size={13} /> تعديل</button>
      <button className="btn btn-quiet btn-sm" onClick={onDelete} style={{ padding: "6px 10px", color: "var(--danger)" }}><Icon name="x" size={13} /></button>
    </div>
  );
}

function EmptyState({ label, onAdd, addLabel }: { label: string; onAdd?: () => void; addLabel?: string }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center", gridColumn: "1 / -1" }}>
      <div className="ar" style={{ color: "var(--graphite)", fontSize: 15, marginBottom: 14 }}>{label}</div>
      {onAdd && <button className="btn btn-ghost btn-sm" onClick={onAdd}><Icon name="plus" size={14} /> {addLabel}</button>}
    </div>
  );
}

function JilidListView({ jilids, units, back, add, edit, remove }: { jilids: Jilid[]; units: Unit[]; back: () => void; add: () => void; edit: (j: Jilid) => void; remove: (j: Jilid) => void }) {
  const [q, setQ] = useState("");
  const filtered = jilids.filter(j => !q || j.name.includes(q) || (j.level || "").includes(q));
  return (
    <div>
      <ListHead title="الأجزاء" count={filtered.length} back={back} addLabel="إضافة جزء" onAdd={add} />
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 400 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث…" style={{ ...fldStyle, paddingRight: 38 }} />
        <Icon name="search" size={16} style={{ position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)", color: "var(--graphite)" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map(j => {
          const uCount = units.filter(u => u.jilid_id === j.id).length;
          return (
            <div key={j.id} style={{ background: "#fff", border: "1px solid var(--cool-gray)", borderRadius: "var(--r-card-sm)", padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <div className="ar-display" style={{ fontSize: 22, color: "var(--ink-black)" }}>{j.name}</div>
                  <div className="ar" style={{ fontSize: 13, color: "var(--graphite)", marginTop: 4 }}>{j.level} · {toAD(uCount)} دَرس</div>
                </div>
                <span style={{ width: 32, height: 44, borderRadius: 6, background: j.accent || "var(--absolute-zero)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--cool-gray)" }}>
                <span className="ar" style={{ fontSize: 12, color: j.locked ? "var(--warn)" : "var(--success)" }}>
                  {j.locked ? "● قيد الإعداد" : "● متاح"}
                </span>
                <RowActions onEdit={() => edit(j)} onDelete={() => remove(j)} />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <EmptyState label="لا توجد أجزاء." onAdd={add} addLabel="إضافة الجزء الأوّل" />}
      </div>
    </div>
  );
}

function UnitListView({ units, jilids, back, add, edit, remove }: { units: Unit[]; jilids: Jilid[]; back: () => void; add: () => void; edit: (u: Unit) => void; remove: (u: Unit) => void }) {
  const [q, setQ] = useState("");
  const [jilidFilter, setJilidFilter] = useState("all");
  const filtered = units.filter(u => {
    if (jilidFilter !== "all" && u.jilid_id !== jilidFilter) return false;
    if (q && !stripAr(u.title).includes(stripAr(q)) && !stripAr(u.sub || "").includes(stripAr(q))) return false;
    return true;
  }).sort((a, b) => a.jilid_id.localeCompare(b.jilid_id) || a.num - b.num);

  return (
    <div>
      <ListHead title="الدّروس" count={filtered.length} back={back} addLabel="إضافة دَرس" onAdd={add} />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث…" style={{ ...fldStyle, paddingRight: 38 }} />
          <Icon name="search" size={16} style={{ position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)", color: "var(--graphite)" }} />
        </div>
        <select value={jilidFilter} onChange={e => setJilidFilter(e.target.value)} style={{ ...fldStyle, width: "auto", minWidth: 160 }}>
          <option value="all">كلّ الأجزاء</option>
          {jilids.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--cool-gray)", borderRadius: "var(--r-card-sm)", overflow: "hidden" }}>
        {filtered.map((u, i) => {
          const j = jilids.find(x => x.id === u.jilid_id);
          return (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 16, alignItems: "center", padding: "14px 20px", borderTop: i ? "1px solid var(--cool-gray)" : "0" }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: "var(--cloud-white)", display: "grid", placeItems: "center", fontFamily: "var(--font-ar)", fontWeight: 700, fontSize: 18, color: "var(--ink-black)" }}>
                {toAD(u.num)}
              </span>
              <div>
                <div className="ar-display" style={{ fontSize: 17, color: "var(--ink-black)" }}>{u.title}</div>
                <div className="ar" style={{ fontSize: 12, color: "var(--graphite)", marginTop: 2 }}>{j?.name || "—"} · {u.sub || "—"}</div>
              </div>
              <span className="tag" style={{ background: u.status === "done" ? "color-mix(in oklab,var(--success) 14%,transparent)" : u.status === "current" ? "color-mix(in oklab,var(--blue-pop) 14%,transparent)" : "var(--cloud-white)", color: u.status === "done" ? "var(--success)" : u.status === "current" ? "var(--blue-pop)" : "var(--graphite)", borderColor: "transparent" }}>
                {u.status === "done" ? "مكتمل" : u.status === "current" ? "جارٍ" : "مسوّدة"}
              </span>
              <RowActions onEdit={() => edit(u)} onDelete={() => remove(u)} />
            </div>
          );
        })}
        {filtered.length === 0 && <EmptyState label="لا دروس بعد." onAdd={add} addLabel="إضافة دَرس" />}
      </div>
    </div>
  );
}

function MateriListView({ materi, units, jilids, back, add, edit, remove }: { materi: Materi[]; units: Unit[]; jilids: Jilid[]; back: () => void; add: () => void; edit: (m: Materi) => void; remove: (m: Materi) => void }) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const typeLabel: Record<string, string> = { heading: "عنوان", paragraph: "فقرة", dialog: "حوار", note: "ملاحظة", image: "صورة" };
  const filtered = materi.filter(m => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    const t = (m.text || "") + " " + (m.title || "") + " " + (m.lines || []).map(l => l.text).join(" ");
    if (q && !stripAr(t).includes(stripAr(q))) return false;
    return true;
  });
  return (
    <div>
      <ListHead title="الفقرات والحوارات" count={filtered.length} back={back} addLabel="إضافة فقرة" onAdd={add} />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث…" style={{ ...fldStyle, paddingRight: 38 }} />
          <Icon name="search" size={16} style={{ position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)", color: "var(--graphite)" }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...fldStyle, width: "auto", minWidth: 140 }}>
          <option value="all">كلّ الأنواع</option>
          {Object.entries(typeLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--cool-gray)", borderRadius: "var(--r-card-sm)", overflow: "hidden" }}>
        {filtered.map((m, i) => {
          const u = units.find(x => x.jilid_id === m.jilid_id && x.num === m.unit_num);
          const j = jilids.find(x => x.id === m.jilid_id);
          const preview = m.type === "dialog" ? (m.title || m.lines?.[0]?.text || "") : m.type === "image" ? (m.caption || "صورة") : (m.text || "");
          return (
            <div key={m.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "flex-start", padding: "14px 20px", borderTop: i ? "1px solid var(--cool-gray)" : "0" }}>
              <span className="tag tag-outline" style={{ fontFamily: "var(--font-ar)", alignSelf: "flex-start", marginTop: 2 }}>{typeLabel[m.type] || m.type}</span>
              <div>
                <div className="ar" style={{ fontSize: 15, color: "var(--ink-black)", fontFamily: "var(--font-ar)", lineHeight: 1.6 }}>{truncate(preview, 120)}</div>
                <div className="ar" style={{ fontSize: 12, color: "var(--graphite)", marginTop: 4 }}>{j?.name || "—"} · الدّرس {toAD(m.unit_num)} {u ? `— ${u.title}` : ""}</div>
              </div>
              <RowActions onEdit={() => edit(m)} onDelete={() => remove(m)} />
            </div>
          );
        })}
        {filtered.length === 0 && <EmptyState label="لا فقرات بعد." onAdd={add} addLabel="إضافة فقرة" />}
      </div>
    </div>
  );
}

function KamusListView({ kamus, units, jilids, back, add, edit, remove, openCsv, imgOnly: initImgOnly }: { kamus: Kamus[]; units: Unit[]; jilids: Jilid[]; back: () => void; add: () => void; edit: (k: Kamus) => void; remove: (k: Kamus) => void; openCsv: () => void; imgOnly?: boolean }) {
  const [q, setQ] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [imgOnly, setImgOnly] = useState(!!initImgOnly);
  const filtered = kamus.filter(k => {
    if (imgOnly && !k.has_img) return false;
    if (unitFilter !== "all") {
      const [jid, un] = unitFilter.split("::");
      if (k.jilid_id !== jid || String(k.unit_num) !== un) return false;
    }
    if (q && !stripAr(k.kalimah).includes(stripAr(q)) && !stripAr(k.sharh || "").includes(stripAr(q))) return false;
    return true;
  });
  const unitOptions = units.map(u => ({ val: `${u.jilid_id}::${u.num}`, label: `${jilids.find(j => j.id === u.jilid_id)?.name || ""} · ${u.title}` }));
  return (
    <div>
      <ListHead title="المعجم" count={filtered.length} back={back} addLabel="إضافة كلمة" onAdd={add} extraActions={<button className="btn btn-ghost btn-sm" onClick={openCsv}><Icon name="file" size={14} /> استيراد CSV</button>} />
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="بحث…" style={{ ...fldStyle, paddingRight: 38 }} />
          <Icon name="search" size={16} style={{ position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)", color: "var(--graphite)" }} />
        </div>
        <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)} style={{ ...fldStyle, width: "auto", minWidth: 200 }}>
          <option value="all">كلّ الدّروس</option>
          {unitOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
        <button className={`btn btn-sm ${imgOnly ? "btn-primary" : "btn-ghost"}`} onClick={() => setImgOnly(v => !v)}>
          <Icon name="image" size={13} /> بالصّور فقط
        </button>
      </div>
      <div style={{ background: "#fff", border: "1px solid var(--cool-gray)", borderRadius: "var(--r-card-sm)", overflow: "hidden" }}>
        {filtered.map((k, i) => {
          const u = units.find(x => x.jilid_id === k.jilid_id && x.num === k.unit_num);
          return (
            <div key={k.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 16, alignItems: "center", padding: "12px 20px", borderTop: i ? "1px solid var(--cool-gray)" : "0" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: k.has_img ? "color-mix(in oklab,var(--blue-pop) 12%,transparent)" : "var(--cloud-white)", display: "grid", placeItems: "center", color: k.has_img ? "var(--blue-pop)" : "var(--graphite)" }}>
                {k.has_img ? <Icon name="image" size={18} /> : <span className="ar" style={{ fontFamily: "var(--font-ar)", fontSize: 13 }}>—</span>}
              </div>
              <div>
                <div className="ar-display" style={{ fontSize: 20, color: "var(--ink-black)" }}>{k.kalimah}</div>
                <div className="ar" style={{ fontSize: 13, color: "var(--graphite)", marginTop: 2 }}>{truncate(k.sharh, 88)}</div>
              </div>
              <span className="ar" style={{ fontSize: 12, color: "var(--graphite)", whiteSpace: "nowrap" }}>{u ? `الدّرس ${toAD(u.num)}` : "—"}</span>
              <RowActions onEdit={() => edit(k)} onDelete={() => remove(k)} />
            </div>
          );
        })}
        {filtered.length === 0 && <EmptyState label="لا كلمات بعد." onAdd={add} addLabel="إضافة كلمة" />}
      </div>
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

function AdminModal({ title, subtitle, onClose, children, width = 560, footer }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; width?: number; footer?: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(8,8,8,.42)", backdropFilter: "blur(4px)", zIndex: 210, display: "grid", placeItems: "center", padding: 20, animation: "fadeIn .12s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: `min(${width}px, 100%)`, maxHeight: "90vh", display: "flex", flexDirection: "column", background: "#fff", borderRadius: "var(--r-card-sm)", boxShadow: "rgba(0,0,0,.24) 0 24px 60px", overflow: "hidden", animation: "popIn .14s ease" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "18px 22px 14px", borderBottom: "1px solid var(--cool-gray)", flexShrink: 0 }}>
          <div>
            {subtitle && <div className="eyebrow" style={{ fontSize: 10, marginBottom: 4 }}>{subtitle}</div>}
            <h3 className="ar-display" style={{ margin: 0, fontSize: 20, color: "var(--ink-black)" }}>{title}</h3>
          </div>
          <button className="btn btn-quiet btn-icon" onClick={onClose}><Icon name="x" size={14} /></button>
        </header>
        <div style={{ padding: "18px 22px 4px", overflowY: "auto", flex: 1 }}>{children}</div>
        {footer && <footer style={{ padding: "14px 22px 18px", borderTop: "1px solid var(--cool-gray)", display: "flex", justifyContent: "flex-end", gap: 8, flexShrink: 0 }}>{footer}</footer>}
      </div>
    </div>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function AField({ label, hint, required, children, full }: { label: string; hint?: string; required?: boolean; children: React.ReactNode; full?: boolean }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, gridColumn: full ? "1 / -1" : "auto" }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: "var(--absolute-zero)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span>{label}{required && <span style={{ color: "var(--warn)", marginRight: 4 }}>*</span>}</span>
        {hint && <span style={{ fontSize: 11, color: "var(--graphite)", fontWeight: 400 }}>{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function FGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "0 18px" }}>{children}</div>;
}

function TInput({ value, onChange, placeholder, latin }: { value: string; onChange: (v: string) => void; placeholder?: string; latin?: boolean }) {
  return <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ ...fldStyle, ...(latin ? { fontFamily: "var(--font-aspekta)", direction: "ltr", textAlign: "left" } : {}) }} />;
}

function TArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ ...fldStyle, resize: "vertical", minHeight: 64, lineHeight: 1.7 }} />;
}

function NInput({ value, onChange, min, max }: { value: number | string; onChange: (v: number | string) => void; min?: number; max?: number }) {
  return <input type="number" value={value ?? ""} onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))} min={min} max={max} style={{ ...fldStyle, fontFamily: "var(--font-aspekta)", direction: "ltr", textAlign: "left" }} />;
}

function SInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return <select value={value || ""} onChange={e => onChange(e.target.value)} style={{ ...fldStyle, appearance: "none" }}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}

function Seg({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--cloud-white)", borderRadius: 999, padding: 3, gap: 2 }}>
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`btn btn-sm ${value === o.value ? "btn-primary" : "btn-quiet"}`}
          style={{ padding: "6px 14px", borderRadius: 999 }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Form modals ──────────────────────────────────────────────────────────────

function PickerModal({ onClose, onPick }: { onClose: () => void; onPick: (k: string) => void }) {
  const opts = [
    { kind: "jilid",  icon: "book"  as const, label: "جزء",   sub: "أضف جزءاً جديداً للسّلسلة" },
    { kind: "unit",   icon: "list"  as const, label: "دَرس",  sub: "أضف درساً داخل جزء" },
    { kind: "materi", icon: "file"  as const, label: "فقرة",  sub: "فقرة، حوار، ملاحظة، أو صورة" },
    { kind: "kamus",  icon: "image" as const, label: "كلمة",  sub: "مدخل جديد في المعجم" },
  ];
  return (
    <AdminModal title="ماذا تريد أن تضيف؟" subtitle="اختر نوع المحتوى" onClose={onClose} width={520}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingBottom: 18 }}>
        {opts.map(o => (
          <button key={o.kind} onClick={() => onPick(o.kind)} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, padding: "18px 18px", border: "1px solid var(--cool-gray)", borderRadius: 14, background: "#fff", textAlign: "right", cursor: "pointer", transition: "border-color .14s, transform .14s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--absolute-zero)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--cool-gray)"; (e.currentTarget as HTMLElement).style.transform = ""; }}>
            <Icon name={o.icon} size={20} style={{ color: "var(--absolute-zero)" }} />
            <span className="ar-display" style={{ fontSize: 18, color: "var(--ink-black)" }}>{o.label}</span>
            <span className="ar" style={{ fontSize: 12, color: "var(--graphite)" }}>{o.sub}</span>
          </button>
        ))}
      </div>
    </AdminModal>
  );
}

function ConfirmModal({ label, onClose, onConfirm }: { label: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <AdminModal title="تأكيد الحذف" subtitle="هذا الإجراء لا يمكن التّراجع عنه" onClose={onClose} width={460}
      footer={<><button className="btn btn-ghost btn-sm" onClick={onClose}>إلغاء</button><button className="btn btn-sm" onClick={onConfirm} style={{ background: "var(--danger)", color: "#fff", borderColor: "var(--danger)" }}>تأكيد الحذف</button></>}>
      <p className="ar" style={{ fontSize: 15, lineHeight: 1.7, color: "var(--absolute-zero)", margin: "4px 0 12px" }}>{label}</p>
    </AdminModal>
  );
}

function JilidFormModal({ item, onClose, onSave }: { item?: Jilid; onClose: () => void; onSave: (data: Partial<Jilid>, original?: Jilid) => void }) {
  const [name, setName] = useState(item?.name || "");
  const [level, setLevel] = useState(item?.level || "مبتدئ");
  const [unitCount, setUnitCount] = useState<number | string>(item?.unit_count ?? 8);
  const [accent, setAccent] = useState(item?.accent || "#292929");
  const [locked, setLocked] = useState(!!item?.locked);
  const valid = name.trim().length > 0;
  const submit = () => { if (!valid) return; onSave({ name: name.trim(), level, unit_count: Number(unitCount) || 0, accent, locked }, item); };
  return (
    <AdminModal title={item ? "تعديل جزء" : "جزء جديد"} onClose={onClose} width={560}
      footer={<><button className="btn btn-ghost btn-sm" onClick={onClose}>إلغاء</button><button className="btn btn-primary btn-sm" onClick={submit} disabled={!valid}>{item ? "حفظ" : "إضافة"}</button></>}>
      <FGrid>
        <AField label="اسم الجزء" required hint="مثال: الجزء الأوّل" full><TInput value={name} onChange={setName} placeholder="الجزء …" /></AField>
        <AField label="المستوى"><SInput value={level} onChange={setLevel} options={[{ value: "مبتدئ", label: "مبتدئ" }, { value: "متوسّط", label: "متوسّط" }, { value: "متقدّم", label: "متقدّم" }, { value: "قريباً", label: "قريباً" }]} /></AField>
        <AField label="عدد الدّروس"><NInput value={unitCount} onChange={setUnitCount} min={0} max={20} /></AField>
        <AField label="لون الكعب">
          <div style={{ display: "flex", gap: 8, paddingTop: 6 }}>
            {["#292929", "#0bA5EC", "#d97757", "#15803d", "#7c3aed", "#cccccc"].map(c => (
              <button key={c} type="button" onClick={() => setAccent(c)} style={{ width: 30, height: 30, borderRadius: "50%", background: c, cursor: "pointer", border: accent === c ? "2.5px solid var(--ink-black)" : "1px solid var(--cool-gray)" }} />
            ))}
          </div>
        </AField>
        <AField label="الحالة"><Seg value={locked ? "locked" : "open"} onChange={v => setLocked(v === "locked")} options={[{ value: "open", label: "متاح" }, { value: "locked", label: "قيد الإعداد" }]} /></AField>
      </FGrid>
    </AdminModal>
  );
}

function UnitFormModal({ item, jilids, onClose, onSave }: { item?: Unit; jilids: Jilid[]; onClose: () => void; onSave: (data: Partial<Unit>, original?: Unit) => void }) {
  const [jilidId, setJilidId] = useState(item?.jilid_id || jilids[0]?.id || "");
  const [num, setNum] = useState<number | string>(item?.num ?? 1);
  const [title, setTitle] = useState(item?.title || "");
  const [sub, setSub] = useState(item?.sub || "");
  const [status, setStatus] = useState<"todo" | "current" | "done">(item?.status || "todo");
  const [words, setWords] = useState<number | string>(item?.words ?? 0);
  const valid = title.trim().length > 0 && jilidId;
  const submit = () => { if (!valid) return; onSave({ jilid_id: jilidId, num: Number(num) || 1, title: title.trim(), sub: sub.trim(), status, words: Number(words) || 0 }, item); };
  return (
    <AdminModal title={item ? "تعديل دَرس" : "دَرس جديد"} onClose={onClose} width={620}
      footer={<><button className="btn btn-ghost btn-sm" onClick={onClose}>إلغاء</button><button className="btn btn-primary btn-sm" onClick={submit} disabled={!valid}>{item ? "حفظ" : "إضافة"}</button></>}>
      <FGrid>
        <AField label="الجزء" required full><SInput value={jilidId} onChange={setJilidId} options={jilids.map(j => ({ value: j.id, label: j.name }))} /></AField>
        <AField label="رقم الدّرس" required><NInput value={num} onChange={setNum} min={1} max={50} /></AField>
        <AField label="عدد الكلمات"><NInput value={words} onChange={setWords} min={0} /></AField>
        <AField label="عنوان الدّرس" required full><TInput value={title} onChange={setTitle} placeholder="عنوان الدّرس بالعربيّة" /></AField>
        <AField label="وصف مختصر" full><TInput value={sub} onChange={setSub} placeholder="مثال: البيت وشوارع المدينة" /></AField>
        <AField label="الحالة" full><Seg value={status} onChange={v => setStatus(v as typeof status)} options={[{ value: "todo", label: "لم يبدأ" }, { value: "current", label: "جارٍ" }, { value: "done", label: "مكتمل" }]} /></AField>
      </FGrid>
    </AdminModal>
  );
}

function MateriFormModal({ item, jilids, units, onClose, onSave }: { item?: Materi; jilids: Jilid[]; units: Unit[]; onClose: () => void; onSave: (data: Partial<Materi>, original?: Materi) => void }) {
  const [jilidId, setJilidId] = useState(item?.jilid_id || jilids[0]?.id || "");
  const [unitNum, setUnitNum] = useState<number>(item?.unit_num ?? 1);
  const [type, setType] = useState<Materi["type"]>(item?.type || "paragraph");
  const [text, setText] = useState(item?.text || "");
  const [title, setTitle] = useState(item?.title || "");
  const [caption, setCaption] = useState(item?.caption || "");
  const [lines, setLines] = useState<DialogLine[]>(item?.lines || [{ speaker: "", text: "" }, { speaker: "", text: "" }]);
  const unitsForJilid = units.filter(u => u.jilid_id === jilidId);
  useEffect(() => { if (!unitsForJilid.find(u => u.num === unitNum) && unitsForJilid[0]) setUnitNum(unitsForJilid[0].num); }, [jilidId]);
  const valid = jilidId && unitNum && (type === "dialog" ? lines.some(l => l.text.trim()) : type === "image" ? caption.trim().length > 0 : text.trim().length > 0);
  const submit = () => {
    if (!valid) return;
    const base = { jilid_id: jilidId, unit_num: unitNum, type };
    if (type === "dialog") onSave({ ...base, title: title.trim(), lines: lines.filter(l => l.text.trim()) }, item);
    else if (type === "image") onSave({ ...base, caption: caption.trim() }, item);
    else onSave({ ...base, text: text.trim() }, item);
  };
  return (
    <AdminModal title={item ? "تعديل فقرة" : "فقرة جديدة"} onClose={onClose} width={680}
      footer={<><button className="btn btn-ghost btn-sm" onClick={onClose}>إلغاء</button><button className="btn btn-primary btn-sm" onClick={submit} disabled={!valid}>{item ? "حفظ" : "إضافة"}</button></>}>
      <FGrid>
        <AField label="الجزء" required><SInput value={jilidId} onChange={setJilidId} options={jilids.map(j => ({ value: j.id, label: j.name }))} /></AField>
        <AField label="الدّرس" required>
          <SInput value={String(unitNum)} onChange={v => setUnitNum(Number(v))} options={unitsForJilid.length ? unitsForJilid.map(u => ({ value: String(u.num), label: `${toAD(u.num)} · ${u.title}` })) : [{ value: "1", label: "—" }]} />
        </AField>
        <AField label="نوع المحتوى" full>
          <Seg value={type} onChange={v => setType(v as Materi["type"])} options={[{ value: "paragraph", label: "فقرة" }, { value: "heading", label: "عنوان" }, { value: "dialog", label: "حوار" }, { value: "note", label: "ملاحظة" }, { value: "image", label: "صورة" }]} />
        </AField>
      </FGrid>
      {type === "dialog" ? (
        <>
          <AField label="عنوان الحوار" hint="اختياري"><TInput value={title} onChange={setTitle} placeholder="مثال: في شارع الجامعة" /></AField>
          <div style={{ margin: "4px 0 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>أسطر الحوار</span>
              <button className="btn btn-quiet btn-sm" onClick={() => setLines(L => [...L, { speaker: "", text: "" }])}><Icon name="plus" size={12} /> سطر</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lines.map((l, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 1fr auto", gap: 8, alignItems: "flex-start" }}>
                  <TInput value={l.speaker} onChange={v => setLines(L => L.map((x, idx) => idx === i ? { ...x, speaker: v } : x))} placeholder="المتحدّث" />
                  <TInput value={l.text} onChange={v => setLines(L => L.map((x, idx) => idx === i ? { ...x, text: v } : x))} placeholder="نصّ السّطر" />
                  <button className="btn btn-quiet btn-icon" onClick={() => setLines(L => L.filter((_, idx) => idx !== i))}><Icon name="x" size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : type === "image" ? (
        <AField label="وصف الصّورة" required><TInput value={caption} onChange={setCaption} placeholder="مثال: حيٌّ صغير قرب الجامعة" /></AField>
      ) : (
        <AField label={type === "note" ? "نصّ الملاحظة" : type === "heading" ? "العنوان" : "نصّ الفقرة"} required>
          <TArea value={text} onChange={setText} rows={type === "heading" ? 2 : 5} placeholder="اكتب هنا…" />
        </AField>
      )}
    </AdminModal>
  );
}

function KamusFormModal({ item, jilids, units, onClose, onSave }: { item?: Kamus; jilids: Jilid[]; units: Unit[]; onClose: () => void; onSave: (data: Partial<Kamus>, original?: Kamus) => void }) {
  const [entryId] = useState(() => item?.id || newId("k"));
  const [jilidId, setJilidId] = useState(item?.jilid_id || jilids[0]?.id || "");
  const [unitNum, setUnitNum] = useState<number>(item?.unit_num ?? 1);
  const [kalimah, setKalimah] = useState(item?.kalimah || "");
  const [sharh, setSharh] = useState(item?.sharh || "");
  const [jam, setJam] = useState(item?.jam || "");
  const [mufrad, setMufrad] = useState(item?.mufrad || "");
  const [muradif, setMuradif] = useState(item?.muradif || "");
  const [didh, setDidh] = useState(item?.didh || "");
  const [mithal, setMithal] = useState(item?.mithal || "");
  const [hasImg, setHasImg] = useState(!!item?.has_img);
  const [withTashrif, setWithTashrif] = useState(!!item?.tashrif);
  const [madhi, setMadhi] = useState(item?.tashrif?.madhi || "");
  const [mudhari, setMudhari] = useState(item?.tashrif?.mudhari || "");
  const [masdar, setMasdar] = useState(item?.tashrif?.masdar || "");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgDrag, setImgDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const unitsForJilid = units.filter(u => u.jilid_id === jilidId);
  useEffect(() => { if (!unitsForJilid.find(u => u.num === unitNum) && unitsForJilid[0]) setUnitNum(unitsForJilid[0].num); }, [jilidId]);

  const handleImgFile = (file: File | null) => {
    if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = e => setImgPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const valid = kalimah.trim().length > 0 && sharh.trim().length > 0;

  const submit = async () => {
    if (!valid) return;
    setUploading(true);
    if (imgFile && hasImg) {
      const ext = imgFile.name.split(".").pop() || "jpg";
      await supabase.storage.from("kamus-images").upload(`${entryId}.${ext}`, imgFile, { upsert: true, contentType: imgFile.type });
    }
    onSave({ id: entryId, jilid_id: jilidId, unit_num: unitNum, kalimah: kalimah.trim(), sharh: sharh.trim(), jam: jam.trim() || null, mufrad: mufrad.trim() || null, muradif: muradif.trim() || null, didh: didh.trim() || null, mithal: mithal.trim() || null, has_img: hasImg, tashrif: withTashrif ? { madhi: madhi.trim(), mudhari: mudhari.trim(), masdar: masdar.trim() } : null }, item);
    setUploading(false);
  };

  return (
    <AdminModal title={item ? "تعديل كلمة" : "كلمة جديدة"} onClose={onClose} width={680}
      footer={<><button className="btn btn-ghost btn-sm" onClick={onClose}>إلغاء</button><button className="btn btn-primary btn-sm" onClick={submit} disabled={!valid || uploading}>{uploading ? "…" : item ? "حفظ" : "إضافة"}</button></>}>
      <FGrid>
        <AField label="الجزء" required><SInput value={jilidId} onChange={setJilidId} options={jilids.map(j => ({ value: j.id, label: j.name }))} /></AField>
        <AField label="الدّرس" required><SInput value={String(unitNum)} onChange={v => setUnitNum(Number(v))} options={unitsForJilid.length ? unitsForJilid.map(u => ({ value: String(u.num), label: `${toAD(u.num)} · ${u.title}` })) : [{ value: "1", label: "—" }]} /></AField>
        <AField label="الكلمة" required><TInput value={kalimah} onChange={setKalimah} placeholder="مَنزِل" /></AField>
        <AField label="الجمع"><TInput value={jam} onChange={setJam} placeholder="منازل" /></AField>
        <AField label="الشّرح" required full><TArea value={sharh} onChange={setSharh} rows={3} placeholder="عرّف الكلمة هنا…" /></AField>
        <AField label="المرادف"><TInput value={muradif} onChange={setMuradif} placeholder="بيت" /></AField>
        <AField label="الضّدّ"><TInput value={didh} onChange={setDidh} placeholder="—" /></AField>
        <AField label="مثال" full><TInput value={mithal} onChange={setMithal} placeholder="منزلُهُ صغيرٌ وجميل." /></AField>
        <AField label="صورة مرفقة"><Seg value={hasImg ? "yes" : "no"} onChange={v => { setHasImg(v === "yes"); if (v === "no") { setImgFile(null); setImgPreview(null); } }} options={[{ value: "no", label: "بدون" }, { value: "yes", label: "مع صورة" }]} /></AField>
        <AField label="تصريف الفعل"><Seg value={withTashrif ? "yes" : "no"} onChange={v => setWithTashrif(v === "yes")} options={[{ value: "no", label: "بدون" }, { value: "yes", label: "فعل" }]} /></AField>
      </FGrid>
      {hasImg && (
        <div style={{ marginTop: 14, marginBottom: 4 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>الصّورة</div>
          <div
            onDragOver={e => { e.preventDefault(); setImgDrag(true); }}
            onDragLeave={() => setImgDrag(false)}
            onDrop={e => { e.preventDefault(); setImgDrag(false); handleImgFile(e.dataTransfer.files[0]); }}
            onClick={() => imgRef.current?.click()}
            style={{
              border: `2px dashed ${imgDrag ? "var(--blue-pop)" : "var(--silver-mist)"}`,
              borderRadius: 12, padding: imgPreview ? 10 : "28px 20px",
              textAlign: "center", cursor: "pointer",
              background: imgDrag ? "color-mix(in oklab,var(--blue-pop) 8%,transparent)" : "var(--cloud-white)",
            }}
          >
            {imgPreview ? (
              <img src={imgPreview} alt="" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, margin: "0 auto", display: "block" }} />
            ) : (
              <>
                <Icon name="image" size={28} style={{ color: "var(--graphite)", marginBottom: 6 }} />
                <div className="ar" style={{ fontSize: 14, color: "var(--absolute-zero)", marginBottom: 2 }}>اسحب صورةً أو اضغط للاختيار</div>
                <div className="ar" style={{ fontSize: 12, color: "var(--graphite)" }}>PNG · JPG · WebP</div>
              </>
            )}
            <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImgFile(e.target.files?.[0] ?? null)} />
          </div>
          {imgPreview && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => { setImgFile(null); setImgPreview(null); }}>
              <Icon name="x" size={12} /> إزالة الصّورة
            </button>
          )}
        </div>
      )}
      {withTashrif && (
        <div style={{ padding: 14, background: "var(--cloud-white)", borderRadius: 12, marginTop: 4, marginBottom: 14 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>تصريف الفعل</div>
          <FGrid cols={3}>
            <AField label="الماضي"><TInput value={madhi} onChange={setMadhi} placeholder="سَكَنَ" /></AField>
            <AField label="المضارع"><TInput value={mudhari} onChange={setMudhari} placeholder="يسكُنُ" /></AField>
            <AField label="المصدر"><TInput value={masdar} onChange={setMasdar} placeholder="السُّكنى" /></AField>
          </FGrid>
        </div>
      )}
    </AdminModal>
  );
}

function ImageUploadModal({ onClose }: { onClose: () => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { setPreview(e.target?.result as string); setName(file.name); };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!inputRef.current?.files?.[0]) return;
    const file = inputRef.current.files[0];
    await supabase.storage.from("kamus-images").upload(`${newId("img")}_${file.name}`, file);
    onClose();
  };

  return (
    <AdminModal title="رفع صورة" subtitle="image upload" onClose={onClose} width={540}
      footer={<><button className="btn btn-ghost btn-sm" onClick={onClose}>إلغاء</button><button className="btn btn-primary btn-sm" disabled={!preview} onClick={handleUpload}>رفع</button></>}>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragOver ? "var(--blue-pop)" : "var(--silver-mist)"}`, borderRadius: 14, padding: preview ? 12 : "40px 20px", textAlign: "center", background: dragOver ? "color-mix(in oklab,var(--blue-pop) 8%,transparent)" : "var(--cloud-white)", cursor: "pointer", marginBottom: 14 }}>
        {preview ? (
          <img src={preview} alt="" style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8, margin: "0 auto" }} />
        ) : (
          <>
            <Icon name="image" size={36} style={{ color: "var(--graphite)", marginBottom: 8 }} />
            <div className="ar" style={{ fontSize: 15, color: "var(--absolute-zero)", marginBottom: 4 }}>اسحب صورةً هنا أو اضغط لاختيار ملف</div>
            <div className="ar" style={{ fontSize: 12, color: "var(--graphite)" }}>PNG · JPG · WebP</div>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
      </div>
      {preview && <AField label="اسم الملفّ"><TInput value={name} onChange={setName} latin /></AField>}
    </AdminModal>
  );
}

function CsvImportModal({ jilids, units, onClose, onImport }: { jilids: Jilid[]; units: Unit[]; onClose: () => void; onImport: (rows: Record<string, string>[], jilidId: string, unitNum: number) => void }) {
  const [jilidId, setJilidId] = useState(jilids[0]?.id || "");
  const [unitNum, setUnitNum] = useState(units.find(u => u.jilid_id === jilids[0]?.id)?.num || 1);
  const [raw, setRaw] = useState("");
  const unitsForJilid = units.filter(u => u.jilid_id === jilidId);
  const sample = `kalimah,sharh,jam,muradif,didh,mithal\nكِتاب,شيءٌ يُقرَأ فيه,كتب,,,أقرأُ الكتاب.\nقَلَم,أداةُ الكتابة,أقلام,,,أكتبُ بالقلم.`;

  const parsed = useMemo(() => {
    if (!raw.trim()) return [];
    const rows = raw.trim().split(/\r?\n/).filter(l => l.trim());
    if (!rows.length) return [];
    const header = rows[0].split(",").map(h => h.trim().toLowerCase());
    return rows.slice(1).map(line => {
      const cols = line.split(",").map(c => c.trim());
      const row: Record<string, string> = {};
      header.forEach((h, i) => { row[h] = cols[i] || ""; });
      return row;
    }).filter(r => r.kalimah && r.sharh);
  }, [raw]);

  return (
    <AdminModal title="استيراد المعجم من CSV" subtitle="bulk import" onClose={onClose} width={680}
      footer={<><button className="btn btn-ghost btn-sm" onClick={onClose}>إلغاء</button><button className="btn btn-primary btn-sm" disabled={parsed.length === 0} onClick={() => onImport(parsed, jilidId, Number(unitNum))}>استيراد {toAD(parsed.length)} كلمة</button></>}>
      <FGrid>
        <AField label="الجزء" required><SInput value={jilidId} onChange={setJilidId} options={jilids.map(j => ({ value: j.id, label: j.name }))} /></AField>
        <AField label="الدّرس" required><SInput value={String(unitNum)} onChange={v => setUnitNum(Number(v))} options={unitsForJilid.length ? unitsForJilid.map(u => ({ value: String(u.num), label: `${toAD(u.num)} · ${u.title}` })) : [{ value: "1", label: "—" }]} /></AField>
      </FGrid>
      <AField label="CSV" hint="kalimah · sharh · jam · muradif · didh · mithal">
        <TArea value={raw} onChange={setRaw} rows={8} placeholder={sample} />
      </AField>
      {!raw.trim() && <button className="btn btn-quiet btn-sm" onClick={() => setRaw(sample)} style={{ marginBottom: 14 }}>استخدم العيّنة</button>}
      {parsed.length > 0 && (
        <div style={{ border: "1px solid var(--cool-gray)", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--cloud-white)", borderBottom: "1px solid var(--cool-gray)" }}>
            <span className="eyebrow">معاينة</span>
            <span className="ar" style={{ fontSize: 13, color: "var(--success)" }}>✓ {toAD(parsed.length)} صفّ صالح</span>
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {parsed.slice(0, 8).map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 14, padding: "10px 14px", borderTop: i ? "1px solid var(--cool-gray)" : "0" }}>
                <span className="ar-display" style={{ fontSize: 16 }}>{r.kalimah}</span>
                <span className="ar" style={{ fontSize: 13, color: "var(--graphite)" }}>{truncate(r.sharh, 80)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminModal>
  );
}
