import React from "react";

type IconName =
  | "search" | "chevL" | "chevR" | "chevU" | "chevD"
  | "plus" | "x" | "book" | "list" | "file" | "image"
  | "star" | "bolt" | "cog" | "arrowL" | "arrowR"
  | "home" | "check" | "lock" | "eye" | "aa";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 18, stroke = 1.6, style }: IconProps) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: stroke, strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const, style,
  };

  const paths: Record<IconName, React.ReactNode> = {
    search:  <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    chevL:   <path d="m15 18-6-6 6-6"/>,
    chevR:   <path d="m9 18 6-6-6-6"/>,
    chevU:   <path d="m18 15-6-6-6 6"/>,
    chevD:   <path d="m6 9 6 6 6-6"/>,
    plus:    <path d="M12 5v14M5 12h14"/>,
    x:       <path d="M18 6 6 18M6 6l12 12"/>,
    book:    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z"/>,
    list:    <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r=".7" fill="currentColor"/><circle cx="3.5" cy="12" r=".7" fill="currentColor"/><circle cx="3.5" cy="18" r=".7" fill="currentColor"/></>,
    file:    <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    image:   <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    star:    <path d="M12 2 14.85 8.78 22 9.62l-5.5 4.66L18 22l-6-3.27L6 22l1.5-7.72L2 9.62l7.15-.84z"/>,
    bolt:    <path d="M13 2 4 14h7l-1 8 9-12h-7z"/>,
    cog:     <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .67.39 1.28 1 1.51A2 2 0 0 1 21 13h-.09A1.65 1.65 0 0 0 19.4 15z"/></>,
    arrowL:  <><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></>,
    arrowR:  <><path d="m12 5 7 7-7 7"/><path d="M5 12h14"/></>,
    home:    <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    check:   <polyline points="20 6 9 17 4 12"/>,
    lock:    <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    eye:     <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    aa:      <><path d="M5 19 9 5l4 14M6.5 14h5"/><path d="m14 19 3-10 3 10M15 16h4"/></>,
  };

  return <svg {...p}>{paths[name]}</svg>;
}
