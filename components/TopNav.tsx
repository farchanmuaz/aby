"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { supabase } from "@/lib/supabase";

interface TopNavProps {
  tashkeel: boolean;
  onToggleTashkeel: () => void;
  onOpenSearch?: () => void;
  onOpenTweaks?: () => void;
  isAdmin?: boolean;
}

export function TopNav({ tashkeel, onToggleTashkeel, onOpenSearch, onOpenTweaks, isAdmin }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const isHome = pathname === "/" || pathname === "/arabiyya/";

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30,
      background: "rgba(250,250,250,.88)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--cool-gray)",
    }}>
      <div className="container" style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 64, gap: 16,
      }}>
        {/* Brand */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 10, textDecoration: "none",
        }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--absolute-zero)", color: "var(--canvas-white)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--font-ar)", fontWeight: 700, fontSize: 17, letterSpacing: "-.02em",
          }}>ب</span>
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span className="ar-display" style={{ fontSize: 16, color: "var(--ink-black)" }}>العربيّة بين يدَيك</span>
            <span style={{ fontSize: 11, color: "var(--graphite)", letterSpacing: "-.01em", marginTop: 1, fontFamily: "var(--font-fasthand)" }}>study companion</span>
          </span>
        </Link>

        {/* Center nav */}
        <nav style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {!isAdmin && (
            <>
              <Link href="/" className={`btn btn-quiet btn-sm${isHome ? " btn-ghost" : ""}`} style={{ fontFamily: "var(--font-ar)" }}>
                الرّئيسيّة
              </Link>
              <Link href="/kamus" className="btn btn-quiet btn-sm" style={{ fontFamily: "var(--font-ar)" }}>
                المعجم
              </Link>
            </>
          )}
        </nav>

        {/* Right cluster */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {onOpenSearch && (
            <button className="btn btn-quiet btn-sm" onClick={onOpenSearch} title="بحث">
              <Icon name="search" size={16} />
              <span style={{ fontFamily: "var(--font-fasthand)", fontSize: 13, opacity: .7 }}>⌘K</span>
            </button>
          )}
          <button
            className={`btn btn-sm ${tashkeel ? "btn-ghost" : "btn-quiet"}`}
            onClick={onToggleTashkeel}
            title="تشكيل"
          >
            <Icon name="aa" size={16} />
            <span style={{ fontFamily: "var(--font-ar)", fontSize: 13 }}>تشكيل</span>
          </button>
          {onOpenTweaks && (
            <button className="btn btn-quiet btn-icon" onClick={onOpenTweaks} title="إعدادات">
              <Icon name="cog" size={16} />
            </button>
          )}
          {isAdmin ? (
            <>
              <Link href="/" className="btn btn-ghost btn-sm">عرض الموقع</Link>
              <button className="btn btn-quiet btn-sm" onClick={handleLogout}>خروج</button>
            </>
          ) : (
            <Link href="/admin" className="btn btn-primary btn-sm">لوحة الإدارة</Link>
          )}
        </div>
      </div>
    </header>
  );
}
