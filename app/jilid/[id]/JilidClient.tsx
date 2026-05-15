"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import type { Jilid, Unit } from "@/lib/types";
import { arText, toAD } from "@/lib/utils";
import type { Tweaks } from "@/components/TweaksPanel";

interface Props { jilid: Jilid; units: Unit[]; allJilids: Jilid[] }

export function JilidClient({ jilid, units }: Props) {
  return (
    <AppShell>
      {(tweaks) => <JilidView jilid={jilid} units={units} tweaks={tweaks} />}
    </AppShell>
  );
}

function JilidView({ jilid, units, tweaks }: { jilid: Jilid; units: Unit[]; tweaks: Tweaks }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const totalWords = units.reduce((a, u) => a + u.words, 0);

  return (
    <main className="container" style={{ padding: "40px 28px 80px", animation: "fadeIn .25s ease" }}>
      {/* Crumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--graphite)", fontSize: 13, marginBottom: 20 }}>
        <Link href="/" className="btn btn-quiet btn-sm" style={{ padding: "4px 10px" }}>
          <Icon name="home" size={14} /> الرّئيسيّة
        </Link>
        <Icon name="chevL" size={14} />
        <span className="ar" style={{ color: "var(--ink-black)", fontWeight: 500 }}>{arText(jilid.name, tweaks.tashkeel)}</span>
      </div>

      {/* Header */}
      <header style={{
        display: "grid", gridTemplateColumns: "180px 1fr auto", gap: 32, alignItems: "center",
        marginBottom: 40, paddingBottom: 32, borderBottom: "1px solid var(--cool-gray)",
      }}>
        <div style={{
          aspectRatio: "3/4",
          background: `linear-gradient(165deg, ${jilid.accent} 0%, ${jilid.accent}cc 100%)`,
          borderRadius: "var(--r-image)", padding: 18,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          color: "#fafafa", boxShadow: "var(--shadow-image)",
        }}>
          <span style={{ fontFamily: "var(--font-ar)", fontSize: 12, opacity: .7 }}>الجزء</span>
          <div style={{ fontFamily: "var(--font-ar)", fontSize: 62, fontWeight: 700, lineHeight: 1, letterSpacing: "-2px" }}>
            {toAD(jilid.id.split("-")[1])}
          </div>
          <span className="ar" style={{ fontSize: 11, opacity: .7 }}>{jilid.level}</span>
        </div>
        <div>
          <div className="eyebrow">{jilid.level}</div>
          <h1 className="ar-display" style={{ fontSize: 48, margin: "6px 0 8px", color: "var(--ink-black)" }}>
            {arText(jilid.name, tweaks.tashkeel)}
          </h1>
          <p style={{ color: "var(--graphite)", maxWidth: 520, fontSize: 15, lineHeight: 1.6 }} className="ar">
            ثمانيةُ دروسٍ تتدرّج من السّلام والتّعارُف إلى السّفر والمحادثات اليوميّة.
          </p>
          <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }} className="ar">
            <span className="tag tag-outline">{toAD(units.length)} دروس</span>
            <span className="tag tag-outline">{toAD(totalWords)} كلمة في المعجم</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
          {jilid.resume_unit && (
            <Link href={`/unit/${jilid.id}/${jilid.resume_unit}`} className="btn btn-primary btn-lg">
              <Icon name="star" size={14} /> تابع الدّرس {toAD(jilid.resume_unit)}
            </Link>
          )}
          <Link href={`/kamus`} className="btn btn-ghost btn-sm">
            <Icon name="book" size={14} /> معجم الجزء
          </Link>
        </div>
      </header>

      {/* View toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="ar-display" style={{ fontSize: 24, margin: 0, color: "var(--ink-black)" }}>الدّروس</h2>
        <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--cloud-white)", borderRadius: "var(--r-button)" }}>
          <button className={`btn btn-sm ${view === "grid" ? "btn-primary" : "btn-quiet"}`} onClick={() => setView("grid")}>
            <Icon name="image" size={13} />
          </button>
          <button className={`btn btn-sm ${view === "list" ? "btn-primary" : "btn-quiet"}`} onClick={() => setView("list")}>
            <Icon name="list" size={13} />
          </button>
        </div>
      </div>

      {/* Units */}
      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {units.map(u => <UnitCard key={u.num} jilid={jilid} unit={u} tweaks={tweaks} />)}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "var(--r-card-sm)", border: "1px solid var(--cool-gray)", overflow: "hidden" }}>
          {units.map((u, i) => <UnitRow key={u.num} jilid={jilid} unit={u} tweaks={tweaks} last={i === units.length - 1} />)}
        </div>
      )}
    </main>
  );
}

function UnitCard({ jilid, unit, tweaks }: { jilid: Jilid; unit: Unit; tweaks: Tweaks }) {
  const isCurrent = unit.status === "current";
  const isDone = unit.status === "done";
  return (
    <Link href={`/unit/${jilid.id}/${unit.num}`} style={{ textDecoration: "none" }}>
      <div style={{
        textAlign: "right", display: "flex", flexDirection: "column", gap: 8, padding: 22,
        background: isCurrent ? "var(--absolute-zero)" : "#fff",
        color: isCurrent ? "var(--canvas-white)" : "var(--ink-black)",
        border: isCurrent ? "0" : "1px solid var(--cool-gray)",
        borderRadius: "var(--r-card-sm)", cursor: "pointer",
        gridColumn: isCurrent ? "span 2" : "auto",
        transition: "transform .15s, box-shadow .15s",
        boxShadow: isCurrent ? "var(--shadow-subtle-2)" : "none",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {isDone && <span className="tag" style={{ background: "#ecfdf5", color: "var(--success)", borderColor: "#a7f3d0" }}><Icon name="check" size={11} /> مكتمل</span>}
          {isCurrent && <span className="tag tag-accent"><Icon name="star" size={11} /> قيد القراءة · {toAD(Math.round(unit.progress * 100))}٪</span>}
          {unit.status === "todo" && <span className="tag tag-outline">قادم</span>}
          <span style={{ fontFamily: "var(--font-ar)", fontSize: 14, opacity: .6 }}>الدّرس {toAD(unit.num)}</span>
        </div>
        <div className="ar-display" style={{ fontSize: isCurrent ? 28 : 22, marginTop: 6 }}>
          {arText(unit.title, tweaks.tashkeel)}
        </div>
        <div className="ar" style={{ fontSize: 14, color: isCurrent ? "rgba(250,250,250,.65)" : "var(--graphite)", lineHeight: 1.6 }}>
          {arText(unit.sub ?? "", tweaks.tashkeel)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontSize: 12, color: isCurrent ? "rgba(250,250,250,.6)" : "var(--graphite)", fontFamily: "var(--font-ar)" }}>
            {toAD(unit.words)} كلمة جديدة
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-fasthand)", fontSize: 15 }}>
            ادخل <Icon name="arrowL" size={14} />
          </span>
        </div>
        {isCurrent && (
          <div className="bar accent" style={{ marginTop: 8, background: "rgba(250,250,250,.15)" }}>
            <span style={{ width: `${unit.progress * 100}%`, background: "var(--blue-pop)" }} />
          </div>
        )}
      </div>
    </Link>
  );
}

function UnitRow({ jilid, unit, tweaks, last }: { jilid: Jilid; unit: Unit; tweaks: Tweaks; last: boolean }) {
  const isCurrent = unit.status === "current";
  return (
    <Link href={`/unit/${jilid.id}/${unit.num}`} style={{ textDecoration: "none" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "56px 1fr auto", gap: 18, alignItems: "center",
        padding: "18px 24px", textAlign: "right",
        borderBottom: last ? "0" : "1px solid var(--cool-gray)",
        background: isCurrent ? "var(--cloud-white)" : "#fff",
      }}>
        <span style={{ fontFamily: "var(--font-ar)", fontSize: 28, fontWeight: 700, color: isCurrent ? "var(--blue-pop)" : "var(--light-steel)", textAlign: "center" }}>
          {toAD(unit.num)}
        </span>
        <span>
          <span className="ar-display" style={{ fontSize: 18, color: "var(--ink-black)", display: "block" }}>{arText(unit.title, tweaks.tashkeel)}</span>
          <span className="ar" style={{ fontSize: 13, color: "var(--graphite)" }}>{unit.sub}</span>
        </span>
        <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {unit.status === "done" && <Icon name="check" size={16} stroke={2} />}
          {isCurrent && <span className="tag tag-accent">★ {toAD(Math.round(unit.progress * 100))}٪</span>}
          <Icon name="chevL" size={16} />
        </span>
      </div>
    </Link>
  );
}
