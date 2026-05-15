const AD: Record<string, string> = {"0":"٠","1":"١","2":"٢","3":"٣","4":"٤","5":"٥","6":"٦","7":"٧","8":"٨","9":"٩"};

export const toAD = (s: string | number | null | undefined) =>
  String(s ?? "").replace(/[0-9]/g, d => AD[d] || d);

export const truncate = (s: string | null | undefined, n: number) =>
  !s ? "" : s.length > n ? s.slice(0, n) + "…" : s;

export const stripHarakat = (s: string) =>
  (s || "").replace(/[ً-ْٰـ]/g, "");

export const arText = (s: string | null | undefined, tashkeel: boolean) =>
  tashkeel ? (s ?? "") : stripHarakat(s ?? "");

export const stripAr = (s: string | null | undefined) =>
  String(s || "")
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[،.؟!,;:»«()\[\]‌\-‏?]/g, "")
    .trim();

export const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
