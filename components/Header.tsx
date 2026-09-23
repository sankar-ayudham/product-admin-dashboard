"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  function logout() {
    clearSession();
    router.replace("/login");
  }
  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Product Admin</h1>
          <p className="text-xs text-slate-500">DummyJSON dashboard</p>
        </div>
        <button onClick={logout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Logout</button>
      </div>
    </header>
  );
}
