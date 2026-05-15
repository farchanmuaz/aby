"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { supabase } from "@/lib/supabase";
import type { Kamus, Unit, Jilid } from "@/lib/types";
import { arText, stripHarakat } from "@/lib/utils";

interface GlobalSearchProps {
  onClose: () => void;
  tashkeel: boolean;
}

export function GlobalSearch({ onClose, tashkeel }: GlobalSearchProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [kamus, setKamus] = useState<Kamus[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [jilids, setJilids] = useState<Jilid[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("kamus").select("*"),
      supabase.from("units").select("*"),
      supabase.from("jilids").select("*"),
    ]).then(([k, u, j]) => {
      if (k.data) setKamus(k.data);
      if (u.data) setUnits(u.data);
      if (j.data) setJilids(j.data);
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const results = useMemo(() => {
    const Q = q.trim();
    if (!Q) return { kamus: [], units: [], jilids: [] };
    const stripped = stripHarakat(Q);
    const matchesText = (t: string | null | undefined) =>
      t && (stripHarakat(t).includes(stripped) || t.includes(Q));

    return {
      jilids: jilids.filter(j => matchesText(j.name) || matchesText(j.level)).slice(0, 3),
      units: units.filter(u => matchesText(u.title) || matchesText(u.sub)).slice(0, 4),
      kamus: kamus.filter(k => matchesText(k.kalimah) || matchesText(k.sharh)).slice(0, 6),
    };
  }, [q, kamus, units, jilids]);

  const total = results.jilids.length + results.units.length + results.kamus.length;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(8,8,8,.42)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "80px 20px",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560,
          background: "#fff", borderRadius: "var(--r-card-sm)",
          boxShadow: "var(--shadow-subtle-2)",
          animation: "popIn .15s ease", overflow: "hidden",
        }}
      >
        <div style={{ position: "relative" }}>
          <Icon name="search" size={18} style={{
            position: "absolute", right: 16, top: "50%",
            transform: "translateY(-50%)", color: "var(--light-steel)",
          }} />
          <input
            autoFocus
            className="input"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="ابحث في الدّروس والمعجم…"
            style={{ borderRadius: 0, border: 0, borderBottom: "1px solid var(--cool-gray)", paddingRight: 48, fontSize: 17 }}
          />
        </div>

        {q && (
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {total === 0 && (
              <div className="ar" style={{ padding: "32px 20px", textAlign: "center", color: "var(--graphite)" }}>
                لا توجد نتائج.
              </div>
            )}

            {results.jilids.length > 0 && (
              <section>
                <div className="eyebrow" style={{ padding: "10px 16px 4px" }}>الأجزاء</div>
                {results.jilids.map(j => (
                  <button key={j.id} className="btn btn-quiet" style={{ width: "100%", justifyContent: "flex-start", borderRadius: 0, padding: "10px 16px", gap: 12 }}
                    onClick={() => { router.push(`/jilid/${j.id}`); onClose(); }}>
                    <Icon name="book" size={15} />
                    <span className="ar" style={{ fontWeight: 600 }}>{arText(j.name, tashkeel)}</span>
                    <span style={{ opacity: .5, fontSize: 13 }}>{j.level}</span>
                  </button>
                ))}
              </section>
            )}

            {results.units.length > 0 && (
              <section>
                <div className="eyebrow" style={{ padding: "10px 16px 4px" }}>الدّروس</div>
                {results.units.map(u => (
                  <button key={u.id} className="btn btn-quiet" style={{ width: "100%", justifyContent: "flex-start", borderRadius: 0, padding: "10px 16px", gap: 12 }}
                    onClick={() => { router.push(`/unit/${u.jilid_id}/${u.num}`); onClose(); }}>
                    <Icon name="file" size={15} />
                    <span className="ar" style={{ fontWeight: 600 }}>{arText(u.title, tashkeel)}</span>
                  </button>
                ))}
              </section>
            )}

            {results.kamus.length > 0 && (
              <section>
                <div className="eyebrow" style={{ padding: "10px 16px 4px" }}>المعجم</div>
                {results.kamus.map(k => (
                  <button key={k.id} className="btn btn-quiet" style={{ width: "100%", justifyContent: "flex-start", borderRadius: 0, padding: "10px 16px", gap: 12 }}
                    onClick={() => { router.push(`/kamus`); onClose(); }}>
                    <span className="ar-display" style={{ fontSize: 17 }}>{arText(k.kalimah, tashkeel)}</span>
                    <span className="ar" style={{ fontSize: 13, color: "var(--graphite)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {arText(k.sharh, tashkeel)}
                    </span>
                  </button>
                ))}
              </section>
            )}
          </div>
        )}

        {!q && (
          <div className="ar" style={{ padding: "24px 20px", textAlign: "center", color: "var(--graphite)", fontSize: 14 }}>
            ابدأ الكتابة للبحث في الدّروس والمعجم
          </div>
        )}
      </div>
    </div>
  );
}
