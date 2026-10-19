
import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

@Injectable()
export class WeatherService {
  async getCurrentWeather(
    latitude: number,
    longitude: number,
  ) {
    const url = new URL(
      'https://api.open-meteo.com/v1/forecast',
    );

    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    );
    url.searchParams.set('timezone', 'auto');

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Weather provider request failed');
      }

      const data = await response.json();
      const current = data.current;

      if (!current) {
        throw new Error('Current weather data is missing');
      }

      return {
        temperature: current.temperature_2m,
        temperatureUnit: '°C',
        condition: this.getCondition(current.weather_code),
        humidity: current.relative_humidity_2m,
        humidityUnit: '%',
        windSpeed: current.wind_speed_10m,
        windSpeedUnit: 'km/h',
        observedAt: current.time,
      };
    } catch {
      throw new ServiceUnavailableException(
        'Current weather is temporarily unavailable',
      );
    }
  }

  private getCondition(code: number): string {
    if (code === 0) return 'Clear sky';
    if ([1, 2].includes(code)) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if ([45, 48].includes(code)) return 'Fog';
    if ([51, 53, 55].includes(code)) return 'Drizzle';
    if ([56, 57].includes(code)) return 'Freezing drizzle';
    if ([61, 63, 65].includes(code)) return 'Rain';
    if ([66, 67].includes(code)) return 'Freezing rain';
    if ([71, 73, 75, 77].includes(code)) return 'Snow';
    if ([80, 81, 82].includes(code)) return 'Rain showers';
    if ([85, 86].includes(code)) return 'Snow showers';
    if (code === 95) return 'Thunderstorm';
    if ([96, 99].includes(code)) return 'Thunderstorm with hail';

    return 'Unknown conditions';
  }
}
