"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  Search,
  Disc3,
  ListMusic,
  UserRound,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
  Music2,
} from "lucide-react";

type User = {
  username?: string;
  email?: string;
  role?: string;
};

const links = [
  { name: "Home", href: "/", icon: House },
  { name: "Cari Musik", href: "/search", icon: Search },
  { name: "Album", href: "/albums", icon: Disc3 },
  { name: "Playlist", href: "/playlist", icon: ListMusic },
  { name: "Profil", href: "/profile", icon: UserRound },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    function loadUser() {
      try {
        const savedUser = localStorage.getItem("user");
        setUser(savedUser ? JSON.parse(savedUser) : null);
      } catch {
        setUser(null);
      }
    }

    loadUser();
    window.addEventListener("storage", loadUser);

    return () => window.removeEventListener("storage", loadUser);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#151515] p-5 text-white md:flex">
      <Link
        href="/"
        className="mb-10 flex items-center gap-3 text-2xl font-black"
      >
        <span className="rounded-xl bg-violet-600 p-2">
          <Music2 size={25} />
        </span>
        TuneBox<span className="text-[#c5f467]">.</span>
      </Link>

      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
        Menu Utama
      </p>

      <nav className="space-y-2">
        {links.map(({ name, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
              pathname === href
                ? "bg-violet-600 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={20} />
            <span>{name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
          Akun
        </p>

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-[#c5f467] hover:bg-white/5"
          >
            <ShieldCheck size={20} />
            Admin Dashboard
          </Link>
        )}

        {!user ? (
          <>
            <Link
              href="/login"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <LogIn size={20} />
              Login
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              <LogIn size={20} />
              Register
            </Link>
          </>
        ) : (
          <>
            <div className="mb-3 rounded-xl bg-white/5 p-3">
              <p className="truncate font-semibold">
                {user.username || "Pengguna TuneBox"}
              </p>
              <p className="truncate text-xs text-zinc-400">
                {user.email || ""}
              </p>
              <p className="mt-1 text-xs capitalize text-[#c5f467]">
                {user.role || "user"}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={20} />
              Logout
            </button>
          </>
        )}
      </div>

      <div className="mt-auto rounded-2xl bg-gradient-to-br from-violet-700/40 to-[#c5f467]/10 p-4">
        <Music2 size={24} className="mb-3 text-[#c5f467]" />
        <p className="font-bold">Your music, your vibe.</p>
        <p className="mt-1 text-xs text-zinc-400">
          Dengerin lagu favorit kapan aja.
        </p>
      </div>
    </aside>
  );
}
