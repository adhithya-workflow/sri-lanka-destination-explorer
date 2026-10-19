
'use client';

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Destination {
  _id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

interface WeatherData {
  destination: string;
  temperature: number;
  temperatureUnit: string;
  condition: string;
  humidity: number;
  humidityUnit: string;
  windSpeed: number;
  windSpeedUnit: string;
  observedAt?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const WEATHER_REFRESH_INTERVAL = 5 * 60 * 1000;

function DestinationDetailContent() {
  const params = useParams();
  const id = params.id as string;

  const [destination, setDestination] =
    useState<Destination | null>(null);

  const [weather, setWeather] =
    useState<WeatherData | null>(null);

  const [loadingDestination, setLoadingDestination] =
    useState(true);

  const [loadingWeather, setLoadingWeather] =
    useState(false);

  const [destinationError, setDestinationError] =
    useState('');

  const [weatherError, setWeatherError] =
    useState('');

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!id) return;

    setLoadingWeather(true);
    setWeatherError('');

    try {
      const response = await fetch(
        `${API_URL}/destinations/${id}/weather`,
        { cache: 'no-store' },
      );

      if (!response.ok) {
        throw new Error(
          `Weather request failed (${response.status}).`,
        );
      }

      const data: WeatherData = await response.json();

      setWeather(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Weather request failed:', error);

      setWeatherError(
        'Weather is temporarily unavailable. Please try again later.',
      );
    } finally {
      setLoadingWeather(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchDestination() {
      setLoadingDestination(true);
      setDestinationError('');

      try {
        const response = await fetch(
          `${API_URL}/destinations/${id}`,
          { cache: 'no-store' },
        );

        if (!response.ok) {
          throw new Error(
            `Destination request failed (${response.status}).`,
          );
        }

        const data: Destination = await response.json();

        if (!cancelled) {
          setDestination(data);
        }
      } catch (error) {
        console.error('Destination request failed:', error);

        if (!cancelled) {
          setDestinationError(
            'Unable to load this destination. Please check your connection and try again.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDestination(false);
        }
      }
    }

    void fetchDestination();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Fetch weather immediately when the detail page opens.
    void fetchWeather();

    // Refresh weather every five minutes while this page is open.
    const intervalId = window.setInterval(() => {
      void fetchWeather();
    }, WEATHER_REFRESH_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [id, fetchWeather]);

  if (loadingDestination) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-600">
          Loading destination...
        </p>
      </main>
    );
  }

  if (destinationError || !destination) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-bold text-gray-900">
            Destination unavailable
          </h1>

          <p className="mb-6 text-gray-600">
            {destinationError ||
              'The requested destination could not be found.'}
          </p>

          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            Back to destinations
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 font-medium text-blue-700 hover:text-blue-900"
        >
          <span aria-hidden="true">←</span>
          Back to destinations
        </Link>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {destination.imageUrl ? (
            <img
              src={destination.imageUrl}
              alt={destination.name}
              className="h-64 w-full object-cover sm:h-80"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 text-7xl sm:h-80">
              🌴
            </div>
          )}

          <div className="p-6 sm:p-8">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              {destination.name}
            </h1>

            <p className="whitespace-pre-line leading-7 text-gray-700">
              {destination.description}
            </p>

            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <h2 className="mb-3 font-semibold text-gray-900">
                Location
              </h2>

              <p className="text-sm text-gray-600">
                Latitude: {destination.latitude}
              </p>

              <p className="text-sm text-gray-600">
                Longitude: {destination.longitude}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Current Weather
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Weather information for {destination.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchWeather()}
              disabled={loadingWeather}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span aria-hidden="true">
                {loadingWeather ? '⏳' : '↻'}
              </span>
              {loadingWeather
                ? 'Updating...'
                : 'Refresh Weather'}
            </button>
          </div>

          {weatherError && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
            >
              <p>{weatherError}</p>

              {weather && (
                <p className="mt-1">
                  Showing the last successfully retrieved weather data.
                </p>
              )}
            </div>
          )}

          {!weather && loadingWeather && (
            <p className="py-6 text-center text-gray-600">
              Retrieving current weather from Open-Meteo...
            </p>
          )}

          {!weather && !loadingWeather && weatherError && (
            <p className="py-4 text-sm text-gray-500">
              Weather details cannot be displayed right now.
              The destination information above is still available.
            </p>
          )}

          {weather && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-blue-50 p-5">
                  <p className="text-sm font-medium text-blue-800">
                    Temperature
                  </p>

                  <p className="mt-2 text-3xl font-bold text-blue-950">
                    {weather.temperature}
                    {weather.temperatureUnit}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-5">
                  <p className="text-sm font-medium text-green-800">
                    Condition
                  </p>

                  <p className="mt-2 text-xl font-bold text-green-950">
                    {weather.condition}
                  </p>
                </div>

                <div className="rounded-xl bg-purple-50 p-5">
                  <p className="text-sm font-medium text-purple-800">
                    Relative Humidity
                  </p>

                  <p className="mt-2 text-3xl font-bold text-purple-950">
                    {weather.humidity}
                    {weather.humidityUnit}
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-5">
                  <p className="text-sm font-medium text-orange-800">
                    Wind Speed
                  </p>

                  <p className="mt-2 text-3xl font-bold text-orange-950">
                    {weather.windSpeed}{' '}
                    <span className="text-lg">
                      {weather.windSpeedUnit}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-500">
                {weather.observedAt && (
                  <p>
                    Weather observation time:{' '}
                    {weather.observedAt}
                  </p>
                )}

                {lastUpdated && (
                  <p className="mt-1">
                    Last successfully retrieved by this page:{' '}
                    {lastUpdated.toLocaleTimeString()}
                  </p>
                )}

                <p className="mt-2">
                  Automatic refresh: every 5 minutes while this
                  page is open.
                </p>

                <p className="mt-1">
                  Weather data provided by Open-Meteo.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default function DestinationDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-slate-600">Loading destination...</p>
        </main>
      }
    >
      <DestinationDetailContent />
    </Suspense>
  );
}
