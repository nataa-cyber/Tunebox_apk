"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Music2, Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "https://tunebox-apk-p2st.vercel.app/api"
).replace(/\/+$/, "");

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || `Login gagal (HTTP ${response.status})`,
        );
      }

      if (!result?.token || !result?.user) {
        throw new Error("Respons login tidak berisi token atau data user.");
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Backend tidak bisa dihubungi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#101010] px-5 py-10 text-white">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={18} />
          Kembali ke Home
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600">
            <Music2 size={32} />
          </div>

          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="mt-2 text-zinc-400">Login ke akun TuneBox kamu</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5 rounded-3xl border border-white/10 bg-[#191919] p-7"
        >
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Email</label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101010] px-4">
              <Mail size={18} className="text-zinc-500" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-transparent py-3.5 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Password</label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101010] px-4">
              <Lock size={18} className="text-zinc-500" />

              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-transparent py-3.5 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#c5f467] py-3.5 font-bold text-black transition hover:bg-[#d6ff86] disabled:opacity-50"
          >
            {loading ? "Sedang login..." : "Login"}
          </button>

          <p className="text-center text-sm text-zinc-400">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#c5f467] hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
