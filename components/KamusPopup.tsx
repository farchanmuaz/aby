"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import type { Kamus } from "@/lib/types";
import { arText } from "@/lib/utils";

interface KamusPopupProps {
  entry: Kamus;
  rect: DOMRect;
  onClose: () => void;
  tashkeel: boolean;
}

export function KamusPopup({ entry, rect, onClose, tashkeel }: KamusPopupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!ref.current || !rect) return;
    const p = ref.current;
    const pw = p.offsetWidth;
    const ph = p.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = rect.bottom + 10;
    let left = rect.left + rect.width / 2 - pw / 2;
    if (left < 12) left = 12;
    if (left + pw > vw - 12) left = vw - pw - 12;
    if (top + ph > vh - 12) top = rect.top - ph - 10;
    if (top < 12) top = 12;
    p.style.top = top + "px";
    p.style.left = left + "px";
  }, [rect, entry]);

  return (
    <div
      ref={ref}
      onClick={e => e.stopPropagation()}
      style={{
        position: "fixed", zIndex: 100, width: 320, maxWidth: "calc(100vw - 24px)",
        background: "#fff", borderRadius: "var(--r-card-sm)",
        boxShadow: "rgba(0,0,0,.18) 0 12px 32px, rgba(0,0,0,.06) 0 2px 8px",
        animation: "popIn .14s ease", overflow: "hidden",
      }}
    >
      {entry.has_img && entry.img_url && (
        <>
          <img src={entry.img_url} alt={entry.kalimah}
            onClick={() => setLightbox(true)}
            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", cursor: "zoom-in" }}
          />
          {lightbox && (
            <div onClick={() => setLightbox(false)} style={{
              position: "fixed", inset: 0, zIndex: 300,
              background: "rgba(8,8,8,.88)", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24, animation: "fadeIn .15s ease",
            }}>
              <img src={entry.img_url} alt={entry.kalimah}
                onClick={ev => ev.stopPropagation()}
                style={{ maxWidth: "min(90vw,720px)", maxHeight: "85vh", objectFit: "contain", borderRadius: 16, boxShadow: "0 32px 80px rgba(0,0,0,.5)" }}
              />
              <button onClick={() => setLightbox(false)} style={{
                position: "fixed", top: 20, right: 20,
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(255,255,255,.15)", color: "#fff",
                display: "grid", placeItems: "center", cursor: "pointer",
              }}>
                <Icon name="x" size={16} />
              </button>
            </div>
          )}
        </>
      )}
      <div style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <span className="ar-display" style={{ fontSize: 24, color: "var(--ink-black)" }}>
            {arText(entry.kalimah, tashkeel)}
          </span>
          <button onClick={onClose} className="btn btn-quiet btn-icon" style={{ width: 28, height: 28 }}>
            <Icon name="x" size={14} />
          </button>
        </div>
        <p className="ar" style={{ fontSize: 14, lineHeight: 1.7, color: "var(--absolute-zero)", margin: "6px 0 10px" }}>
          {arText(entry.sharh, tashkeel)}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontFamily: "var(--font-ar)", fontSize: 12, marginBottom: 10 }}>
          {entry.muradif && <span className="tag"><b style={{ color: "var(--blue-pop)" }}>≈</b> {entry.muradif}</span>}
          {entry.didh && <span className="tag"><b style={{ color: "var(--blue-pop)" }}>≠</b> {entry.didh}</span>}
          {entry.jam && <span className="tag"><b style={{ color: "var(--blue-pop)" }}>ج.</b> {entry.jam}</span>}
        </div>
        {entry.mithal && (
          <div className="ar" style={{
            fontSize: 13, lineHeight: 1.7, color: "var(--graphite)",
            borderRight: "2px solid var(--blue-pop)", paddingRight: 8, marginBottom: 10,
          }}>
            «{arText(entry.mithal, tashkeel)}»
          </div>
        )}
        {entry.tashrif && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, background: "var(--cloud-white)", borderRadius: "var(--r-xs)", overflow: "hidden", marginBottom: 10 }}>
            {([["ماضٍ", entry.tashrif.madhi], ["مضارع", entry.tashrif.mudhari], ["مصدر", entry.tashrif.masdar]] as [string, string][]).map(([lbl, val]) => (
              <div key={lbl} style={{ padding: "8px 6px", textAlign: "center", borderLeft: "1px solid var(--cool-gray)" }}>
                <div className="eyebrow" style={{ fontSize: 9 }}>{lbl}</div>
                <div style={{ fontFamily: "var(--font-ar)", fontWeight: 700, fontSize: 14, color: "var(--ink-black)", marginTop: 2 }}>{val || "—"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
