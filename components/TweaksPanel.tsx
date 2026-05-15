"use client";

import { Icon } from "./Icon";

export interface Tweaks {
  tashkeel: boolean;
  fontSize: number;
  bookmark: boolean;
  doodle: boolean;
  accent: string;
}

export const TWEAK_DEFAULTS: Tweaks = {
  tashkeel: true,
  fontSize: 18,
  bookmark: true,
  doodle: false,
  accent: "#0bA5EC",
};

interface TweaksPanelProps {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void;
  onClose: () => void;
}

export function TweaksPanel({ tweaks, setTweak, onClose }: TweaksPanelProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(8,8,8,.32)", backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 300, background: "#fff",
          boxShadow: "var(--shadow-subtle-2)",
          display: "flex", flexDirection: "column",
          animation: "slideUp .18s ease",
        }}
      >
        <header style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 20px", borderBottom: "1px solid var(--cool-gray)",
        }}>
          <h3 className="ar-display" style={{ margin: 0, fontSize: 18 }}>إعدادات القراءة</h3>
          <button className="btn btn-quiet btn-icon" onClick={onClose}><Icon name="x" size={14} /></button>
        </header>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20, flex: 1, overflowY: "auto" }}>
          {/* Tashkeel */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="ar" style={{ fontSize: 15 }}>التّشكيل</span>
            <div
              className={`switch ${tweaks.tashkeel ? "on" : ""}`}
              onClick={() => setTweak("tashkeel", !tweaks.tashkeel)}
              role="switch" aria-checked={tweaks.tashkeel}
            />
          </div>

          {/* Font size */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="ar" style={{ fontSize: 15 }}>حجم الخطّ</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setTweak("fontSize", Math.max(14, tweaks.fontSize - 2))}>−</button>
              <span style={{ fontFamily: "var(--font-ar)", fontSize: 15, minWidth: 28, textAlign: "center" }}>{tweaks.fontSize}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setTweak("fontSize", Math.min(28, tweaks.fontSize + 2))}>+</button>
            </div>
          </div>

          {/* Bookmark banner */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="ar" style={{ fontSize: 15 }}>بطاقة الاستكمال</span>
            <div
              className={`switch ${tweaks.bookmark ? "on" : ""}`}
              onClick={() => setTweak("bookmark", !tweaks.bookmark)}
              role="switch" aria-checked={tweaks.bookmark}
            />
          </div>

          {/* Doodle squiggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="ar" style={{ fontSize: 15 }}>خطّ الزّخرفة</span>
            <div
              className={`switch ${tweaks.doodle ? "on" : ""}`}
              onClick={() => setTweak("doodle", !tweaks.doodle)}
              role="switch" aria-checked={tweaks.doodle}
            />
          </div>

          {/* Accent */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="ar" style={{ fontSize: 15 }}>لون التّأكيد</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["#0bA5EC", "#292929", "#7c3aed", "#15803d", "#d97757"].map(c => (
                <button
                  key={c}
                  onClick={() => setTweak("accent", c)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: c, border: tweaks.accent === c ? "3px solid var(--ink-black)" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
