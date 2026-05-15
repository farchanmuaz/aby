"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Squiggle } from "@/components/Squiggle";
import type { Jilid } from "@/lib/types";
import { arText, toAD } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function HomeClient() {
  const [jilids, setJilids] = useState<Jilid[]>([]);

  useEffect(() => {
    supabase.from("jilids").select("*").order("id").then(({ data }) => {
      if (data) setJilids(data as Jilid[]);
    });
  }, []);

  return (
    <AppShell>
      {(tweaks) => <HomeView jilids={jilids} tweaks={tweaks} />}
    </AppShell>
  );
}

function HomeView({ jilids, tweaks }: { jilids: Jilid[]; tweaks: import("@/components/TweaksPanel").Tweaks }) {
  const [levelFilter, setLevelFilter] = useState("الكلّ");
  const filtered = useMemo(() => {
    if (levelFilter === "الكلّ") return jilids;
    return jilids.filter(j => j.level === levelFilter);
  }, [levelFilter, jilids]);

  const resume = jilids.find(j => j.resume_unit != null && !j.locked);

  return (
    <main className="container" style={{ padding: "48px 28px 80px", animation: "fadeIn .25s ease" }}>
      {/* Hero */}
      <section style={{ textAlign: "center", marginBottom: 48 }}>
        <div className="fast" style={{ fontSize: 24, color: "var(--blue-pop)", display: "inline-block", transform: "rotate(-1.5deg)" }}>
          study companion
        </div>
        <h1 className="ar-display" style={{ fontSize: "clamp(40px,7vw,72px)", margin: "12px 0 16px", color: "var(--ink-black)", letterSpacing: "-2.2px", lineHeight: 1.05 }}>
          {arText("العربيّة بين يدَيك", tweaks.tashkeel)}
        </h1>
        <p style={{ maxWidth: 540, margin: "0 auto", color: "var(--graphite)", fontSize: 17, lineHeight: 1.55 }}>
          سلسلةُ كتبٍ لتعليم اللُّغة العربيّة لغير النّاطقين بها — اقرأ، راجع المعجم، تدرّب بالبطاقات.
        </p>
        {tweaks.doodle && <Squiggle style={{ margin: "18px auto 0", display: "block" }} />}
      </section>

      {/* Continue banner */}
      {resume && tweaks.bookmark && (
        <section className="card" style={{
          marginBottom: 36, padding: "28px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--absolute-zero)", color: "var(--canvas-white)",
          boxShadow: "none", gap: 24, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flex: "1 1 280px" }}>
            <span style={{
              width: 60, height: 60, borderRadius: 14,
              background: "var(--blue-pop)", display: "grid", placeItems: "center",
              fontFamily: "var(--font-ar)", fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: "-1px",
            }}>★</span>
            <div className="ar">
              <div className="eyebrow" style={{ color: "rgba(250,250,250,.6)" }}>متابعة القراءة</div>
              <div className="ar-display" style={{ fontSize: 24, marginTop: 4 }}>
                {arText(resume.name, tweaks.tashkeel)} · الدّرس {toAD(resume.resume_unit)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8, fontFamily: "var(--font-ar)", fontSize: 14, color: "rgba(250,250,250,.7)" }}>
                <span>{toAD(Math.round((resume.resume_progress ?? 0) * 100))}٪ مكتمل</span>
              </div>
            </div>
          </div>
          <Link href={`/unit/${resume.id}/${resume.resume_unit}`} className="btn btn-accent btn-lg">
            تابع القراءة <Icon name="arrowL" size={16} />
          </Link>
        </section>
      )}

      {/* Library header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="eyebrow">المكتبة</div>
          <h2 className="ar-display" style={{ fontSize: 32, margin: "6px 0 0", color: "var(--ink-black)" }}>اختر الجزء</h2>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["الكلّ", "مبتدئ", "متوسّط", "متقدّم"].map(l => (
            <button key={l}
              className={`btn btn-sm ${levelFilter === l ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setLevelFilter(l)}>
              <span className="ar">{arText(l, tweaks.tashkeel)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shelf grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
        {filtered.map(j => <JilidCard key={j.id} jilid={j} tashkeel={tweaks.tashkeel} />)}
      </div>
    </main>
  );
}

function JilidCard({ jilid, tashkeel }: { jilid: Jilid; tashkeel: boolean }) {
  const locked = jilid.locked;
  const isDark = jilid.accent === "#292929" || jilid.accent === "#222222";
  const onCover = isDark ? "#fafafa" : (locked ? "#999" : "#fff");

  const inner = (
    <div style={{
      textAlign: "right", background: "var(--canvas-white)",
      borderRadius: "var(--r-card)", boxShadow: "var(--shadow-card)",
      padding: 18, display: "flex", flexDirection: "column", gap: 14,
      opacity: locked ? .55 : 1,
      transition: "transform .15s ease, box-shadow .15s ease",
    }}>
      <div style={{
        aspectRatio: "4/5",
        background: locked ? "var(--cool-gray)" : `linear-gradient(165deg, ${jilid.accent} 0%, ${jilid.accent}cc 100%)`,
        borderRadius: "var(--r-image)", padding: 20,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden", color: onCover,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontFamily: "var(--font-ar)", fontSize: 13, opacity: .65 }}>الجزء</span>
          {jilid.resume_unit && <Icon name="star" size={16} />}
          {locked && <Icon name="lock" size={14} />}
        </div>
        <div style={{ fontFamily: "var(--font-ar)", fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: "-3px" }}>
          {toAD(jilid.id.split("-")[1])}
        </div>
        <div className="ar" style={{ fontSize: 12, opacity: .7 }}>{jilid.level}</div>
      </div>
      <div style={{ padding: "0 6px 6px" }}>
        <div className="ar-display" style={{ fontSize: 20, color: "var(--ink-black)" }}>
          {arText(jilid.name, tashkeel)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, color: "var(--graphite)", fontSize: 13 }}>
          <span className="ar">{toAD(jilid.unit_count)} دروس</span>
          {!locked && (
            <>
              <span style={{ width: 3, height: 3, background: "var(--silver-mist)", borderRadius: "50%" }} />
              <span className="ar">{jilid.level}</span>
            </>
          )}
        </div>
        {jilid.resume_progress != null && (
          <div className="bar accent" style={{ marginTop: 10 }}>
            <span style={{ width: `${(jilid.resume_progress ?? 0) * 100}%` }} />
          </div>
        )}
      </div>
    </div>
  );

  if (locked) return <div style={{ cursor: "not-allowed" }}>{inner}</div>;
  return (
    <Link href={`/jilid/${jilid.id}`}
      style={{ textDecoration: "none" }}
      onMouseEnter={e => { (e.currentTarget.firstChild as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget.firstChild as HTMLElement).style.boxShadow = "var(--shadow-subtle-2)"; }}
      onMouseLeave={e => { (e.currentTarget.firstChild as HTMLElement).style.transform = ""; (e.currentTarget.firstChild as HTMLElement).style.boxShadow = "var(--shadow-card)"; }}
    >
      {inner}
    </Link>
  );
}
