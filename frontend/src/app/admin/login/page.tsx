
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AdminLoginPage() {
  const router = useRouter();

  // Always start with empty fields.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Login failed. Check your credentials.",
        );
      }

      if (!data.access_token) {
        throw new Error("The server did not return an access token.");
      }

      sessionStorage.setItem("adminToken", data.access_token);

      router.push("/admin/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-emerald-700"
        >
          ← Back to homepage
        </Link>

        <div className="mt-8">
          <p className="font-semibold uppercase tracking-widest text-emerald-700">
            LankaExplore
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Admin Login
          </h1>

          <p className="mt-3 leading-6 text-slate-600">
            Sign in to manage Sri Lanka&apos;s destinations.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
          autoComplete="off"
        >
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Username
            </label>

            <input
              id="username"
              name="login_username"
              type="text"
              autoComplete="off"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoCapitalize="none"
              spellCheck={false}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter admin username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              name="login_password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Restricted access for the authorized administrator.
        </p>
      </div>
    </main>
  );
}
