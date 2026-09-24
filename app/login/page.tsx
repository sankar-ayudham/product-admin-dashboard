"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated, login, saveSession } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/products");
    }
  }, [router]);

  async function submit(e: FormEvent) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const data = await login(username.trim(), password);

      saveSession(data);

      router.replace(params.get("next") || "/products");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid login details"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-7 shadow-sm">
        <h1 className="text-2xl font-bold">
          Sign in
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Product Admin Dashboard
        </p>

        <form
          onSubmit={submit}
          className="mt-7 space-y-4"
        >
          <label className="block text-sm font-medium">
            Username

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              autoComplete="username"
            />
          </label>

          <label className="block text-sm font-medium">
            Password

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              autoComplete="current-password"
            />
          </label>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading...
          </p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}