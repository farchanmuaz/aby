"use client";

import React from "react";
import { Icon } from "./Icon";
import type { Kamus } from "@/lib/types";
import { arText } from "@/lib/utils";

interface KamusListItemProps {
  entry: Kamus;
  q: string;
  open: boolean;
  onToggle: () => void;
  tashkeel: boolean;
}

export function KamusListItem({ entry: e, q, open, onToggle, tashkeel }: KamusListItemProps) {
  function hl(t: string | null | undefined): React.ReactNode {
    const text = arText(t ?? "", tashkeel);
    if (!q || !text) return text;
    const i = text.indexOf(q);
    if (i < 0) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark style={{ background: "color-mix(in oklab,var(--blue-pop) 25%,transparent)", color: "inherit", borderRadius: 2, padding: "0 2px" }}>
          {text.slice(i, i + q.length)}
        </mark>
        {text.slice(i + q.length)}
      </>
    );
  }

  return (
    <div style={{
      background: "#fff", border: "1px solid",
      borderColor: open ? "var(--blue-pop)" : "var(--cool-gray)",
      borderRadius: "var(--r-card-sm)", overflow: "hidden",
      transition: "border-color .14s, box-shadow .14s",
      boxShadow: open ? "0 0 0 4px color-mix(in oklab,var(--blue-pop) 10%,transparent)" : "none",
    }}>
      <button onClick={onToggle} style={{
        display: "grid", gridTemplateColumns: "160px 1fr 24px", gap: 18, alignItems: "center",
        padding: "14px 20px", width: "100%", textAlign: "right",
        background: open ? "color-mix(in oklab,var(--blue-pop) 4%,#fff)" : "#fff",
      }}>
        <div className="ar-display" style={{ fontSize: 22, color: open ? "var(--blue-pop)" : "var(--ink-black)" }}>
          {hl(e.kalimah)}
        </div>
        <div className="ar" style={{
          fontSize: 14, color: "var(--graphite)", lineHeight: 1.65,
          overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
          WebkitLineClamp: open ? 99 : 2, WebkitBoxOrient: "vertical",
        }}>
          {hl(e.sharh)}
        </div>
        <span style={{ color: open ? "var(--blue-pop)" : "var(--light-steel)", transform: open ? "rotate(-90deg)" : "rotate(0)", transition: "transform .15s" }}>
          <Icon name="chevL" size={16} />
        </span>
      </button>

      {open && (
        <div style={{
          padding: "18px 20px 22px", borderTop: "1px solid var(--cool-gray)",
          display: "grid", gridTemplateColumns: e.has_img ? "180px 1fr" : "1fr", gap: 24,
          animation: "fadeIn .18s ease",
        }}>
          {e.has_img && e.img_url && (
            <img src={e.img_url} alt={e.kalimah}
              style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "var(--r-image)", display: "block" }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <KamusField label="المُرادف" value={e.muradif} sign="≈" />
            <KamusField label="الضِّدّ" value={e.didh} sign="≠" />
            <KamusField label="الجمع" value={e.jam} />
            <KamusField label="المفرد" value={e.mufrad} />
            {e.tashrif && (
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>التّصريف</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", background: "var(--cloud-white)", borderRadius: "var(--r-xs)", overflow: "hidden" }}>
                  {([["ماضٍ", e.tashrif.madhi], ["مضارع", e.tashrif.mudhari], ["مصدر", e.tashrif.masdar]] as [string, string][]).map(([lbl, val]) => (
                    <div key={lbl} style={{ padding: 10, textAlign: "center", borderLeft: "1px solid var(--cool-gray)" }}>
                      <div className="eyebrow" style={{ fontSize: 10 }}>{lbl}</div>
                      <div className="ar-display" style={{ fontSize: 18, marginTop: 3 }}>{val || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {e.mithal && (
              <div className="ar" style={{
                fontSize: 15, lineHeight: 1.85, color: "var(--absolute-zero)",
                background: "color-mix(in oklab,var(--blue-pop) 5%,transparent)",
                borderRight: "3px solid var(--blue-pop)", padding: "10px 14px",
                borderRadius: "0 var(--r-xs) var(--r-xs) 0",
              }}>
                <span className="fast" style={{ color: "var(--blue-pop)", fontSize: 13, marginLeft: 8 }}>مثال</span>
                {arText(e.mithal, tashkeel)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KamusField({ label, value, sign }: { label: string; value: string | null | undefined; sign?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 14, alignItems: "baseline", paddingBottom: 10, borderBottom: "1px solid var(--cool-gray)" }}>
      <div className="eyebrow" style={{ fontSize: 10 }}>{label}</div>
      <div className="ar-display" style={{ fontSize: 18, color: "var(--ink-black)" }}>
        {sign && <span style={{ color: "var(--blue-pop)", marginLeft: 6, fontFamily: "var(--font-aspekta)" }}>{sign}</span>}
        {value}
      </div>
    </div>
  );
}
