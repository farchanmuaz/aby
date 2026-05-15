"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { KamusListItem } from "@/components/KamusListItem";
import type { Kamus } from "@/lib/types";
import { arText, toAD } from "@/lib/utils";
import type { Tweaks } from "@/components/TweaksPanel";

interface Props { entries: Kamus[] }

export function KamusClient({ entries }: Props) {
  return (
    <AppShell>
      {(tweaks) => <KamusView entries={entries} tweaks={tweaks} />}
    </AppShell>
  );
}

function KamusView({ entries, tweaks }: { entries: Kamus[]; tweaks: Tweaks }) {
  const [active, setActive] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const unitNums = useMemo(() => {
    const nums = [...new Set(entries.map(e => e.unit_num).filter(Boolean))].sort() as number[];
    return nums;
  }, [entries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (active === "imgs") list = list.filter(e => e.has_img);
    else if (active !== "all") list = list.filter(e => e.unit_num === Number(active));
    if (q.trim()) {
      const Q = q.trim();
      list = list.filter(e => [e.kalimah, e.sharh, e.muradif, e.didh, e.mithal].some(v => v && v.includes(Q)));
    }
    return list;
  }, [entries, active, q]);

  return (
    <main className="container" style={{ padding: "40px 28px 80px", animation: "fadeIn .25s ease" }}>
      {/* Crumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--graphite)", fontSize: 13, marginBottom: 18 }}>
        <Link href="/" className="btn btn-quiet btn-sm" style={{ padding: "4px 10px" }}>
          <Icon name="home" size={14} /> الرّئيسيّة
        </Link>
        <Icon name="chevL" size={14} />
        <span className="ar" style={{ color: "var(--ink-black)", fontWeight: 500 }}>المعجم العامّ</span>
      </div>

      {/* Hero */}
      <header style={{ textAlign: "center", marginBottom: 36 }}>
        <div className="eyebrow">معجم السّلسلة</div>
        <h1 className="ar-display" style={{ fontSize: "clamp(40px,6vw,64px)", margin: "8px 0 8px", color: "var(--ink-black)" }}>
          المعجم العامّ
        </h1>
        <p className="ar" style={{ color: "var(--graphite)", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
          {toAD(entries.length)} كلمة — ابحث أو صفِّ حسب الدّرس أو ادخل وضع البطاقات.
        </p>
      </header>

      {/* Search */}
      <div style={{ maxWidth: 560, margin: "0 auto 24px", position: "relative" }}>
        <input className="input" value={q} onChange={e => setQ(e.target.value)}
          placeholder="ابحث في المعجم…" style={{ paddingRight: 44, fontSize: 16 }} />
        <span style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", color: "var(--light-steel)" }}>
          <Icon name="search" size={18} />
        </span>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, justifyContent: "center" }}>
        <button className={`btn btn-sm ${active === "all" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActive("all")}>
          <span className="ar">الكلّ</span>
          <span style={{ opacity: .55, fontFamily: "var(--font-ar)" }}>{toAD(entries.length)}</span>
        </button>
        {unitNums.map(n => (
          <button key={n} className={`btn btn-sm ${active === String(n) ? "btn-primary" : "btn-ghost"}`} onClick={() => setActive(String(n))}>
            <span className="ar">الدّرس {toAD(n)}</span>
          </button>
        ))}
        <button className={`btn btn-sm ${active === "imgs" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActive("imgs")}>
          <Icon name="image" size={13} />
          <span className="ar">بالصُّور فقط</span>
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(e => (
          <KamusListItem key={e.id} entry={e} q={q} open={open === e.id} onToggle={() => setOpen(open === e.id ? null : e.id)} tashkeel={tweaks.tashkeel} />
        ))}
        {filtered.length === 0 && (
          <div className="ar" style={{ padding: "48px 24px", textAlign: "center", color: "var(--graphite)" }}>
            لا توجد كلمات تطابق البحث.
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", marginTop: 36 }}>
        <Link href="/unit/jilid-1/3" className="btn btn-primary btn-lg">
          <Icon name="bolt" size={15} /> راجع بالبطاقات
        </Link>
      </div>
    </main>
  );
}
