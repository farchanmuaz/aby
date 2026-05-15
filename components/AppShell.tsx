"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "./TopNav";
import { TweaksPanel, TWEAK_DEFAULTS, type Tweaks } from "./TweaksPanel";
import { GlobalSearch } from "./GlobalSearch";

interface AppShellProps {
  isAdmin?: boolean;
  children: (tweaks: Tweaks) => ReactNode;
}

export function AppShell({ isAdmin = false, children }: AppShellProps) {
  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS);
  const [showTweaks, setShowTweaks] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  // Load tweaks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aby-tweaks");
      if (saved) setTweaks(t => ({ ...t, ...JSON.parse(saved) }));
    } catch (_) {}
  }, []);

  // Persist tweaks
  useEffect(() => {
    try { localStorage.setItem("aby-tweaks", JSON.stringify(tweaks)); } catch (_) {}
  }, [tweaks]);

  // Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(s => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const setTweak = useCallback(<K extends keyof Tweaks>(key: K, value: Tweaks[K]) => {
    setTweaks(t => ({ ...t, [key]: value }));
  }, []);

  return (
    <>
      <TopNav
        tashkeel={tweaks.tashkeel}
        onToggleTashkeel={() => setTweak("tashkeel", !tweaks.tashkeel)}
        onOpenSearch={() => setShowSearch(true)}
        onOpenTweaks={() => setShowTweaks(true)}
        isAdmin={isAdmin}
      />
      {children(tweaks)}
      {showTweaks && <TweaksPanel tweaks={tweaks} setTweak={setTweak} onClose={() => setShowTweaks(false)} />}
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} tashkeel={tweaks.tashkeel} />}
    </>
  );
}
