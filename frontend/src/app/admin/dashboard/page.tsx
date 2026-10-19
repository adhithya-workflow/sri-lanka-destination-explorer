
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Destination = {
  _id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
};

type DestinationForm = {
  name: string;
  description: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const emptyForm: DestinationForm = {
  name: "",
  description: "",
  latitude: "",
  longitude: "",
  imageUrl: "",
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [form, setForm] = useState<DestinationForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDestinations = useCallback(
    async (token: string) => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/destinations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("adminToken");
          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load destinations. Please try again.");
        }

        const data: Destination[] = await response.json();
        setDestinations(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading destinations.",
        );
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    void loadDestinations(token);
  }, [loadDestinations, router]);

  function handleLogout() {
    sessionStorage.removeItem("adminToken");
    router.replace("/admin/login");
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEditing(destination: Destination) {
    setEditingId(destination._id);

    setForm({
      name: destination.name,
      description: destination.description,
      latitude: String(destination.latitude),
      longitude: String(destination.longitude),
      imageUrl: destination.imageUrl || "",
    });

    setError("");
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (
      form.name.trim() === "" ||
      form.description.trim() === "" ||
      form.latitude.trim() === "" ||
      form.longitude.trim() === ""
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setError("Latitude must be a number between -90 and 90.");
      return;
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError("Longitude must be a number between -180 and 180.");
      return;
    }

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setSaving(true);

      const isEditing = editingId !== null;

      const url = isEditing
        ? `${API_URL}/destinations/${editingId}`
        : `${API_URL}/destinations`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          latitude,
          longitude,
          imageUrl: form.imageUrl.trim(),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("adminToken");
        router.replace("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const serverMessage = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;

        throw new Error(
          typeof serverMessage === "string"
            ? serverMessage
            : "Could not save the destination.",
        );
      }

      resetForm();

      setMessage(
        isEditing
          ? "Destination updated successfully."
          : "Destination added successfully.",
      );

      await loadDestinations(token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(destination: Destination) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${destination.name}?`,
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setError("");
    setMessage("");
    setDeletingId(destination._id);

    try {
      const response = await fetch(
        `${API_URL}/destinations/${destination._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("adminToken");
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Could not delete destination.",
        );
      }

      if (editingId === destination._id) {
        resetForm();
      }

      setMessage(`${destination.name} was deleted.`);
      await loadDestinations(token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <Link href="/" className="text-xl font-bold">
              Lanka<span className="text-emerald-600">Explore</span>
            </Link>

            <p className="mt-1 text-sm text-slate-500">
              Destination administration
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <section>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Add, update, and manage destinations across Sri Lanka.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            {editingId ? "Edit Destination" : "Add New Destination"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Fields marked with * are required. An image URL is optional.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Destination name *
                </label>

                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g. Ella"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label
                  htmlFor="imageUrl"
                  className="mb-2 block text-sm font-medium"
                >
                  Image URL (optional)
                </label>

                <input
                  id="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Description *
              </label>

              <textarea
                id="description"
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe this destination..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="latitude"
                  className="mb-2 block text-sm font-medium"
                >
                  Latitude *
                </label>

                <input
                  id="latitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  required
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                  placeholder="e.g. 6.8667"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label
                  htmlFor="longitude"
                  className="mb-2 block text-sm font-medium"
                >
                  Longitude *
                </label>

                <input
                  id="longitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  required
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                  placeholder="e.g. 81.0469"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
              >
                {message}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Add Destination"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-6 py-3 font-semibold hover:bg-slate-100"
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">Manage Destinations</h2>

            <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium">
              {destinations.length} destinations
            </span>
          </div>

          {loading && (
            <p className="py-6 text-slate-600">Loading destinations...</p>
          )}

          {!loading && error && destinations.length === 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => {
                  const token = sessionStorage.getItem("adminToken");
                  if (token) void loadDestinations(token);
                }}
                className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && destinations.length === 0 && !error && (
            <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
              No destinations found. Use the form above to add one.
            </p>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {destinations.map((destination) => (
              <article
                key={destination._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-bold">{destination.name}</h3>

                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                  {destination.description}
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  Coordinates: {destination.latitude},{" "}
                  {destination.longitude}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(destination)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(destination)}
                    disabled={deletingId === destination._id}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === destination._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>

                  <Link
                    href={`/destinations/${destination._id}`}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    View page →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
