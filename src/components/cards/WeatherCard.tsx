import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind } from 'lucide-react';

interface WeatherCardProps {
  config: Record<string, string | number | boolean | string[]>;
}

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  forecast?: Array<{ day: string; temp: number; icon: string }>;
}

function getWeatherIcon(code: string) {
  const iconMap: Record<string, typeof Sun> = {
    '01d': Sun,
    '01n': Sun,
    '02d': Cloud,
    '02n': Cloud,
    '03d': Cloud,
    '03n': Cloud,
    '04d': Cloud,
    '04n': Cloud,
    '09d': CloudDrizzle,
    '09n': CloudDrizzle,
    '10d': CloudRain,
    '10n': CloudRain,
    '11d': CloudLightning,
    '11n': CloudLightning,
    '13d': CloudSnow,
    '13n': CloudSnow,
    '50d': Wind,
    '50n': Wind,
  };
  return iconMap[code] || Cloud;
}

export function WeatherCard({ config }: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const city = (config.city as string) || 'Beijing';

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Using Open-Meteo API (free, no key required)
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error('City not found');
        }

        const { latitude, longitude } = geoData.results[0];
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=6`
        );
        const weatherData = await weatherRes.json();

        const current = weatherData.current_weather;
        const daily = weatherData.daily;

        // Map WMO weather codes to simple icons
        const codeMap: Record<number, string> = {
          0: '01d', 1: '01d', 2: '02d', 3: '04d',
          45: '50d', 48: '50d',
          51: '09d', 53: '09d', 55: '09d',
          61: '10d', 63: '10d', 65: '10d',
          71: '13d', 73: '13d', 75: '13d',
          80: '09d', 81: '09d', 82: '09d',
          95: '11d', 96: '11d', 99: '11d',
        };

        const iconCode = codeMap[current.weathercode] || '01d';
        const descMap: Record<number, string> = {
          0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
          45: 'Foggy', 48: 'Rime fog',
          51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
          61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
          71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
          80: 'Rain showers', 81: 'Showers', 82: 'Violent showers',
          95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Severe thunderstorm',
        };

        const forecast = daily.time.slice(1, 6).map((date: string, i: number) => {
          const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
          const code = codeMap[daily.weathercode[i + 1]] || '01d';
          return {
            day: dayName,
            temp: Math.round(daily.temperature_2m_max[i + 1]),
            icon: code,
          };
        });

        setWeather({
          temperature: Math.round(current.temperature),
          description: descMap[current.weathercode] || 'Unknown',
          icon: iconCode,
          forecast,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // Update every 10 min
    return () => clearInterval(interval);
  }, [city]);

  if (loading) {
    return <div className="py-8 text-center text-ink-tertiary text-caption">Loading weather...</div>;
  }

  if (error) {
    return <div className="py-8 text-center text-ink-tertiary text-caption">Configure to see weather</div>;
  }

  if (!weather) return null;

  const WeatherIcon = getWeatherIcon(weather.icon);

  return (
    <div className="py-4">
      <div className="flex items-center justify-center gap-4 mb-6">
        <WeatherIcon size={48} className="text-ink" />
        <div>
          <div className="text-[32px] font-semibold text-ink">{weather.temperature}°C</div>
          <div className="text-caption text-ink-secondary">{weather.description}</div>
        </div>
      </div>

      {weather.forecast && (
        <div className="flex justify-between gap-2">
          {weather.forecast.map((day, i) => {
            const Icon = getWeatherIcon(day.icon);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-caption text-ink-tertiary">{day.day}</span>
                <Icon size={16} className="text-ink-secondary" />
                <span className="text-caption text-ink">{day.temp}°</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
