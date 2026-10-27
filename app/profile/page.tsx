"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  UserRound,
  Mail,
  ShieldCheck,
  Camera,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";

const API = "https://tunebox-apk-p2st.vercel.app/api";

type Profile = {
  id: number;
  username: string;
  email: string;
  role: string;
  profile_image?: string | null;
  created_at?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
  loadProfile();
}, []);
    
async function loadProfile() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch(`${API}/users/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error(
        `Backend mengirim respons bukan JSON (HTTP ${response.status}).`
      );
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${
          result.message || "Gagal mengambil profil"
        }`
      );
    }

    if (!result.data) {
      throw new Error("Respons backend tidak memiliki data profil.");
    }

    setProfile(result.data);
    setError("");
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    setError(
      err instanceof Error ? err.message : "Gagal mengambil profil."
    );
  } finally {
    setLoading(false);
  }
}

  async function uploadPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Foto harus berformat JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran foto maksimal 2 MB.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/users/profile-image`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Upload foto gagal");
      }

      setProfile((old) =>
        old ? { ...old, profile_image: result.profile_image } : old,
      );
      setMessage("Foto profil berhasil diperbarui!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#101010] text-white">
        <LoaderCircle className="animate-spin" /> Memuat profil...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#101010] p-5 text-white md:p-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-zinc-400 hover:text-white"
      >
        <ArrowLeft size={18} /> Kembali ke Home
      </Link>

      <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#191919]">
        <div className="bg-gradient-to-r from-violet-700 to-purple-950 p-8 md:p-12">
          <p className="text-sm font-bold tracking-widest text-violet-200">
            TUNEBOX ACCOUNT
          </p>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">Profil Saya</h1>
          <p className="mt-2 text-zinc-200">
            Kelola informasi akun musik kamu.
          </p>
        </div>

        <div className="p-6 md:p-10">
          {error && (
            <p className="mb-5 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </p>
          )}
          {message && (
            <p className="mb-5 rounded-xl bg-green-500/10 p-4 text-sm text-green-300">
              {message}
            </p>
          )}

          {profile ? (
            <>
              <div className="flex flex-col items-center gap-5 border-b border-white/10 pb-8 sm:flex-row">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-violet-700 text-white">
                  {profile.profile_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.profile_image}
                      alt="Foto profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={48} />
                  )}
                </div>

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{profile.username}</h2>
                  <p className="mt-1 text-zinc-400">{profile.email}</p>
                  <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#c5f467] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#d6ff86]">
                    <Camera size={17} />
                    {uploading ? "Mengunggah..." : "Ganti Foto"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={uploadPhoto}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-xs text-zinc-500">
                    JPG, PNG, WEBP · Maksimal 2 MB
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                  <UserRound className="text-violet-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Username</p>
                    <p className="mt-1 font-semibold">{profile.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                  <Mail className="text-violet-400" />
                  <div>
                    <p className="text-xs text-zinc-500">Email</p>
                    <p className="mt-1 font-semibold">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                  <ShieldCheck className="text-[#c5f467]" />
                  <div>
                    <p className="text-xs text-zinc-500">Role akun</p>
                    <p className="mt-1 font-semibold capitalize">
                      {profile.role}
                    </p>
                  </div>
                </div>
              </div>

              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-bold hover:bg-violet-500"
                >
                  <ShieldCheck size={19} /> Buka Admin Dashboard
                </Link>
              )}
            </>
          ) : (
            <p className="text-zinc-400">Data profil tidak tersedia. {error}</p>
          )}
        </div>
      </section>
    </main>
  );
}
