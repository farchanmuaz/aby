"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--canvas-white)",
        direction: "rtl",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 400 }}>
        <div className="col" style={{ gap: 4, marginBottom: 28 }}>
          <span className="fast" style={{ fontSize: 22, color: "var(--absolute-zero)" }}>
            العربيّة بين يدَيك
          </span>
          <span className="eyebrow">لوحة الإدارة</span>
        </div>

        <form onSubmit={handleSubmit} className="col" style={{ gap: 16 }}>
          <div className="field">
            <label className="field-label" htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="email"
              dir="ltr"
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">كلمة المرور</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              dir="ltr"
            />
          </div>

          {error && (
            <p style={{ color: "var(--danger)", fontSize: 14, margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? "جارٍ الدّخول…" : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
