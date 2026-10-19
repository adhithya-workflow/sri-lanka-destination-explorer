
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Destination = {
  _id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
};

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDestinations() {
      try {
        const response = await fetch(`${API_URL}/destinations`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load destinations.");
        }

        const data: Destination[] = await response.json();

        if (!cancelled) {
          setDestinations(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError(
            "Could not connect to the server. Please check that the backend is running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDestinations();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Lanka<span className="text-emerald-600">Explore</span>
          </Link>

          <Link
            href="/admin/login"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Admin Login
          </Link>
        </div>
      </header>

      <section className="bg-slate-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Discover Sri Lanka
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
            Find your next destination on the island.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Explore remarkable places across Sri Lanka and check local weather
            conditions before planning your visit.
          </p>

          <a
            href="#destinations"
            className="mt-8 inline-block rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600"
          >
            Explore Destinations
          </a>
        </div>
      </section>

      <section
        id="destinations"
        className="mx-auto max-w-7xl px-6 py-14"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Popular Destinations</h2>
          <p className="mt-2 text-slate-600">
            Discover places worth exploring across the island.
          </p>
        </div>

        {loading && (
          <p className="py-10 text-slate-600">
            Loading destinations...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {!loading && !error && destinations.length === 0 && (
          <p className="py-10 text-slate-600">
            No destinations have been added yet.
          </p>
        )}

        {!loading && !error && destinations.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <article
                key={destination._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {destination.imageUrl ? (
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gradient-to-br from-emerald-100 to-sky-100 text-5xl">
                    🌴
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-bold">
                    {destination.name}
                  </h3>

                  <p className="mt-3 line-clamp-3 min-h-18 leading-7 text-slate-600">
                    {destination.description}
                  </p>

                  <p className="mt-3 text-sm text-slate-500">
                    {destination.latitude}, {destination.longitude}
                  </p>

                  <Link
                    href={`/destinations/${destination._id}`}
                    className="mt-5 inline-flex rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-emerald-700"
                  >
                    View Destination →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-500">
        LankaExplore · Discover Sri Lanka, one destination at a time.
      </footer>
    </main>
  );
}
