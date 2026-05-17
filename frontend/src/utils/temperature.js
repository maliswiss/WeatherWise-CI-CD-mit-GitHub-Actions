// Temperatur-Hilfsfunktionen für WeatherWise
// Werden durch Vitest in der Test-Stage der CI/CD-Pipeline überprüft.

export function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

export function formatTemperature(value, unit) {
  if (unit !== 'C' && unit !== 'F') {
    throw new Error('Einheit muss "C" oder "F" sein');
  }
  return `${value.toFixed(1)} °${unit}`;
}
