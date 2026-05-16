"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { KamusListItem } from "@/components/KamusListItem";
import { KamusPopup } from "@/components/KamusPopup";
import type { Jilid, Unit, Materi, Kamus } from "@/lib/types";
import { arText, toAD, stripAr } from "@/lib/utils";
import type { Tweaks } from "@/components/TweaksPanel";
import { supabase } from "@/lib/supabase";

interface Props { jilidId: string; num: number }

export function UnitClient({ jilidId, num }: Props) {
  const [jilid, setJilid] = useState<Jilid | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [kamus, setKamus] = useState<Kamus[]>([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from("jilids").select("*").eq("id", jilidId).single(),
      supabase.from("units").select("*").eq("jilid_id", jilidId).eq("num", num).single(),
      supabase.from("materi").select("*").eq("jilid_id", jilidId).eq("unit_num", num).order("sort_order"),
      supabase.from("kamus").select("*").eq("jilid_id", jilidId).eq("unit_num", num),
    ]).then(([{ data: j }, { data: u }, { data: m }, { data: k }]) => {
      if (!j || !u) { setMissing(true); return; }
      setJilid(j as Jilid);
      setUnit(u as Unit);
      setMateri((m ?? []) as Materi[]);
      setKamus((k ?? []) as Kamus[]);
    });
  }, [jilidId, num]);

  if (missing) return <div style={{ padding: 60, textAlign: "center" }} className="ar">الدّرس غير موجود</div>;

  return (
    <AppShell>
      {(tweaks) => jilid && unit
        ? <UnitView jilid={jilid} unit={unit} materi={materi} kamus={kamus} tweaks={tweaks} />
        : <div style={{ padding: 80, textAlign: "center", color: "var(--graphite)" }} className="ar">جارٍ التّحميل…</div>
      }
    </AppShell>
  );
}

function UnitView({ jilid, unit, materi, kamus, tweaks }: { jilid: Jilid; unit: Unit; materi: Materi[]; kamus: Kamus[]; tweaks: Tweaks }) {
  const [tab, setTab] = useState<"materi" | "kamus" | "flashcards">("materi");
  const [popup, setPopup] = useState<{ entry: Kamus; rect: DOMRect } | null>(null);
  const [readerFs, setReaderFs] = useState(tweaks.fontSize);
  const [localTashkeel, setLocalTashkeel] = useState(tweaks.tashkeel);
  const [bookmark, setBookmark] = useState(unit.status === "current");

  const onWord = useCallback((rect: DOMRect, entry: Kamus) => {
    setPopup({ entry, rect });
  }, []);

  return (
    <main className="container-narrow" style={{ padding: "32px 28px 80px", animation: "fadeIn .25s ease" }}>
      {/* Crumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--graphite)", fontSize: 13, marginBottom: 18 }}>
        <Link href="/" className="btn btn-quiet btn-sm" style={{ padding: "4px 10px" }}><Icon name="home" size={14} /></Link>
        <Icon name="chevL" size={14} />
        <Link href={`/jilid/${jilid.id}`} className="btn btn-quiet btn-sm" style={{ padding: "4px 8px" }}>
          <span className="ar">{arText(jilid.name, localTashkeel)}</span>
        </Link>
        <Icon name="chevL" size={14} />
        <span className="ar" style={{ color: "var(--ink-black)", fontWeight: 500 }}>الدّرس {toAD(unit.num)}</span>
      </div>

      {/* Head */}
      <header style={{ textAlign: "center", marginBottom: 32 }}>
        <div className="eyebrow">الدّرس {toAD(unit.num)} · {jilid.name}</div>
        <h1 className="ar-display" style={{ fontSize: "clamp(36px,5vw,56px)", margin: "8px 0 6px", color: "var(--ink-black)" }}>
          {arText(unit.title, localTashkeel)}
        </h1>
        <p className="ar" style={{ color: "var(--graphite)", fontSize: 16 }}>{arText(unit.sub ?? "", localTashkeel)}</p>
      </header>

      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", background: "var(--cloud-white)",
        borderRadius: "var(--r-button)", marginBottom: 24, gap: 10, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="ar" style={{ fontSize: 13, color: "var(--graphite)" }}>التّشكيل</span>
          <div className={`switch ${localTashkeel ? "on" : ""}`}
            onClick={() => setLocalTashkeel(t => !t)}
            role="switch" aria-checked={localTashkeel} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="ar" style={{ fontSize: 13, color: "var(--graphite)" }}>حجم الخطّ</span>
          <button className="btn btn-quiet btn-sm" onClick={() => setReaderFs(Math.max(14, readerFs - 2))}>−</button>
          <span style={{ fontFamily: "var(--font-ar)", fontSize: 13, minWidth: 22, textAlign: "center" }}>{toAD(readerFs)}</span>
          <button className="btn btn-quiet btn-sm" onClick={() => setReaderFs(Math.min(28, readerFs + 2))}>+</button>
        </div>
        <button
          className={`btn btn-sm ${bookmark ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setBookmark(b => !b)}
        >
          <Icon name="star" size={13} stroke={bookmark ? 0 : 1.6} style={bookmark ? { fill: "currentColor" } : {}} />
          {bookmark ? "مُحفوظ" : "حفظ"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--cool-gray)", marginBottom: 24, flexWrap: "wrap" }}>
        {(
          [
            { id: "materi" as const, label: "المحتوى", icon: "file" as const },
            { id: "kamus" as const, label: "المعجم", icon: "book" as const, count: kamus.length },
            { id: "flashcards" as const, label: "البطاقات", icon: "bolt" as const, count: kamus.length },
          ]
        ).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "12px 18px", fontFamily: "var(--font-ar)", fontSize: 16, fontWeight: 600,
            color: tab === t.id ? "var(--ink-black)" : "var(--graphite)",
            borderBottom: tab === t.id ? "2px solid var(--blue-pop)" : "2px solid transparent",
            marginBottom: -1, display: "inline-flex", alignItems: "center", gap: 8,
            cursor: "pointer", transition: "color .12s",
          }}>
            <Icon name={t.icon} size={15} /> {t.label}
            {t.count != null && <span className="tag tag-outline" style={{ fontSize: 11, padding: "2px 8px" }}>{toAD(t.count)}</span>}
          </button>
        ))}
      </div>

      {tab === "materi" && <MateriView blocks={materi} kamus={kamus} tashkeel={localTashkeel} fs={readerFs} onWord={onWord} />}
      {tab === "kamus" && <UnitKamusView entries={kamus} tashkeel={localTashkeel} onSwitchToFlash={() => setTab("flashcards")} />}
      {tab === "flashcards" && <FlashcardView entries={kamus} tashkeel={localTashkeel} onClose={() => setTab("kamus")} />}

      {popup && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setPopup(null)} />
          <KamusPopup entry={popup.entry} rect={popup.rect} onClose={() => setPopup(null)} tashkeel={localTashkeel} />
        </>
      )}
    </main>
  );
}

function MateriView({ blocks, kamus, tashkeel, fs, onWord }: {
  blocks: Materi[]; kamus: Kamus[]; tashkeel: boolean; fs: number;
  onWord: (rect: DOMRect, entry: Kamus) => void;
}) {
  const map = useMemo(() => {
    const m: Record<string, Kamus> = {};
    kamus.forEach(e => { const k = stripAr(e.kalimah); if (k) m[k] = e; });
    return m;
  }, [kamus]);

  const renderText = (text: string | null | undefined) => {
    const out = arText(text ?? "", tashkeel);
    const parts = out.split(/(\s+)/);
    return parts.map((p, i) => {
      if (/^\s+$/.test(p)) return p;
      const entry = map[stripAr(p)];
      if (entry) return (
        <span key={i} className="wl"
          onClick={e => { e.stopPropagation(); onWord(e.currentTarget.getBoundingClientRect(), entry); }}>
          {p}
        </span>
      );
      return <span key={i}>{p}</span>;
    });
  };

  return (
    <article className="ar" style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 24 }}>
      {blocks.map((b, i) => {
        if (b.type === "heading") {
          return <h2 key={i} className="ar-display" style={{ fontSize: 30, textAlign: "center", color: "var(--ink-black)", margin: "8px 0" }}>{renderText(b.text)}</h2>;
        }
        if (b.type === "paragraph") {
          return <p key={i} style={{ fontFamily: "var(--font-ar)", fontSize: fs, lineHeight: 2.1, color: "var(--absolute-zero)", margin: 0, textAlign: "justify" }}>{renderText(b.text)}</p>;
        }
        if (b.type === "image") {
          return (
            <figure key={i} style={{ margin: 0 }}>
              <div className="imgph" style={{ aspectRatio: "16/9", borderRadius: "var(--r-image)" }} />
              {b.caption && (
                <figcaption className="ar" style={{ textAlign: "center", fontSize: 13, color: "var(--graphite)", marginTop: 8, fontFamily: "var(--font-fasthand)" }}>
                  {arText(b.caption, tashkeel)}
                </figcaption>
              )}
            </figure>
          );
        }
        if (b.type === "dialog") {
          return (
            <div key={i} style={{ background: "#fff", borderRadius: "var(--r-card)", padding: "28px 32px", boxShadow: "var(--shadow-card)" }}>
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <div className="fast" style={{ color: "var(--blue-pop)", fontSize: 18 }}>{arText(b.title, tashkeel)}</div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <span style={{ flex: "0 0 28px", height: 1, background: "var(--cool-gray)" }} />
                  <span style={{ width: 5, height: 5, background: "var(--blue-pop)", transform: "rotate(45deg)" }} />
                  <span style={{ flex: "0 0 28px", height: 1, background: "var(--cool-gray)" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {(b.lines ?? []).map((l, j) => (
                  <div key={j} className="dialog-line" style={{
                    display: "grid", gridTemplateColumns: "82px 1fr", gap: 18, alignItems: "baseline",
                    padding: "10px 0", borderBottom: j < (b.lines?.length ?? 0) - 1 ? "1px solid var(--cool-gray)" : "0",
                  }}>
                    <div style={{ fontFamily: "var(--font-ar)", fontSize: 15, fontWeight: 700, color: "var(--blue-pop)", textAlign: "left" }}>
                      {arText(l.speaker, tashkeel)} :
                    </div>
                    <div style={{ fontFamily: "var(--font-ar)", fontSize: fs, lineHeight: 1.95, color: "var(--absolute-zero)" }}>
                      {renderText(l.text)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (b.type === "note") {
          return (
            <div key={i} style={{
              background: "color-mix(in oklab,var(--blue-pop) 6%,transparent)",
              borderRight: "3px solid var(--blue-pop)", padding: "16px 20px",
              borderRadius: "0 var(--r-card-sm) var(--r-card-sm) 0",
              fontFamily: "var(--font-ar)", fontSize: fs - 1, lineHeight: 1.95, color: "var(--absolute-zero)",
            }}>
              <div className="fast" style={{ fontSize: 14, color: "var(--blue-pop)", marginBottom: 4, transform: "rotate(-1deg)", display: "inline-block" }}>ملاحظة</div>
              <div>{renderText(b.text)}</div>
            </div>
          );
        }
        return null;
      })}
    </article>
  );
}

function UnitKamusView({ entries, tashkeel, onSwitchToFlash }: { entries: Kamus[]; tashkeel: boolean; onSwitchToFlash: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!q.trim()) return entries;
    const Q = q.trim();
    return entries.filter(e => [e.kalimah, e.sharh, e.muradif, e.didh, e.mithal].some(v => v && v.includes(Q)));
  }, [entries, q]);

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px" }}>
          <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث في المعجم…" style={{ paddingRight: 38 }} />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--light-steel)" }}>
            <Icon name="search" size={16} />
          </span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onSwitchToFlash}><Icon name="bolt" size={14} /> وضع البطاقات</button>
        <span className="ar" style={{ fontSize: 13, color: "var(--graphite)" }}>{toAD(filtered.length)} من {toAD(entries.length)} كلمة</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(e => (
          <KamusListItem key={e.id} entry={e} q={q} open={open === e.id} onToggle={() => setOpen(open === e.id ? null : e.id)} tashkeel={tashkeel} />
        ))}
        {filtered.length === 0 && (
          <div className="ar" style={{ padding: "48px 24px", textAlign: "center", color: "var(--graphite)" }}>
            لا توجد كلمات تطابق البحث.
          </div>
        )}
      </div>
    </div>
  );
}

function FlashcardView({ entries, tashkeel, onClose }: { entries: Kamus[]; tashkeel: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState({ easy: 0, mid: 0, hard: 0 });

  const e = entries[idx % entries.length];

  const rate = (key: "easy" | "mid" | "hard") => {
    setScores(s => ({ ...s, [key]: s[key] + 1 }));
    setRevealed(false);
    setIdx(i => i + 1);
  };

  if (!e) return null;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18, paddingBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <span className="ar" style={{ fontSize: 13, color: "var(--graphite)" }}>
          {toAD(Math.min(idx + 1, entries.length))} / {toAD(entries.length)}
        </span>
        <div className="bar accent" style={{ flex: 1 }}>
          <span style={{ width: `${Math.min(100, (idx + 1) / entries.length * 100)}%` }} />
        </div>
        <span className="ar" style={{ fontSize: 13, color: "var(--graphite)" }}>
          {toAD(scores.easy)} ✓ · {toAD(scores.mid)} ~ · {toAD(scores.hard)} ✕
        </span>
      </div>

      <div onClick={() => setRevealed(r => !r)} style={{
        background: "#fff", borderRadius: "var(--r-card)",
        boxShadow: "var(--shadow-card)", padding: "32px 32px 36px",
        textAlign: "center", cursor: "pointer", animation: "popIn .2s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--graphite)" }}>
          <span className="fast">{revealed ? "الوجه الخلفي" : "الوجه الأمامي"}</span>
          <span className="ar">صورة → كلمة</span>
        </div>
        {e.has_img ? (
          <div className="imgph has-word" data-word={revealed ? e.kalimah : ""}
            style={{ aspectRatio: "16/9", borderRadius: "var(--r-image)", margin: "16px 0 18px" }} />
        ) : (
          <div style={{
            aspectRatio: "16/9", margin: "16px 0 18px", borderRadius: "var(--r-image)",
            background: "var(--absolute-zero)", color: "var(--canvas-white)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--font-ar)", fontSize: 64, fontWeight: 700, letterSpacing: "-2px",
          }}>{arText(e.kalimah, tashkeel)}</div>
        )}
        {!revealed ? (
          <>
            <div className="ar-display" style={{ fontSize: 42, color: "var(--ink-black)", letterSpacing: "-1.5px", marginBottom: 8 }}>
              {arText(e.kalimah, tashkeel)}
            </div>
            <div className="ar" style={{ fontSize: 14, color: "var(--graphite)" }}>انقُر لكشف المعنى</div>
          </>
        ) : (
          <div style={{ textAlign: "right" }} className="ar">
            <div className="ar-display" style={{ fontSize: 32, color: "var(--ink-black)", marginBottom: 8 }}>
              {arText(e.kalimah, tashkeel)}
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.85, color: "var(--absolute-zero)", margin: "0 0 10px" }}>
              {arText(e.sharh, tashkeel)}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {e.muradif && <span className="tag">≈ {e.muradif}</span>}
              {e.didh && <span className="tag">≠ {e.didh}</span>}
              {e.jam && <span className="tag">ج. {e.jam}</span>}
            </div>
          </div>
        )}
      </div>

      {revealed ? (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn-ghost" style={{ borderColor: "#ef4444", color: "#ef4444" }} onClick={() => rate("hard")}>
            <Icon name="x" size={14} /> صعب
          </button>
          <button className="btn btn-ghost" onClick={() => rate("mid")}>~ متوسّط</button>
          <button className="btn btn-ghost" style={{ borderColor: "var(--success)", color: "var(--success)" }} onClick={() => rate("easy")}>
            <Icon name="check" size={14} /> سهل
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={() => setRevealed(true)}>اكشف المعنى</button>
          <button className="btn btn-ghost" onClick={onClose}>عودة للقائمة</button>
        </div>
      )}
    </div>
  );
}
