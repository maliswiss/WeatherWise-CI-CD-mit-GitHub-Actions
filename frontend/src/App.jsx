import { useState } from 'react';
import { celsiusToFahrenheit, formatTemperature } from './utils/temperature.js';

// WeatherWise · CI/CD-Demo-Frontend
export default function App() {
  const [celsius, setCelsius] = useState(20);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '500px' }}>
      <h1>WeatherWise-WEATHER 🌤️</h1>
      <p>CI/CD-Demo · Container-Image aus GHCR ausgeliefert.</p>

      <label>
        Temperatur (°C):{' '}
        <input
          type="number"
          value={celsius}
          onChange={(e) => setCelsius(Number(e.target.value))}
        />
      </label>

      <p>{formatTemperature(celsius, 'C')}</p>
      <p>{formatTemperature(celsiusToFahrenheit(celsius), 'F')}</p>
    </main>
  );
}
