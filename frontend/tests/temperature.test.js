import { describe, it, expect } from 'vitest';
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatTemperature
} from '../src/utils/temperature.js';

describe('celsiusToFahrenheit', () => {
  it('wandelt 0 °C in 32 °F um', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it('wandelt 100 °C in 212 °F um', () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it('arbeitet auch mit negativen Werten', () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });
});

describe('fahrenheitToCelsius', () => {
  it('wandelt 32 °F in 0 °C um', () => {
    expect(fahrenheitToCelsius(32)).toBe(0);
  });

  it('wandelt 212 °F in 100 °C um', () => {
    expect(fahrenheitToCelsius(212)).toBe(100);
  });
});

describe('formatTemperature', () => {
  it('formatiert mit einer Nachkommastelle', () => {
    expect(formatTemperature(20.456, 'C')).toBe('20.5 °C');
  });

  it('wirft Fehler bei ungültiger Einheit', () => {
    expect(() => formatTemperature(20, 'K')).toThrow();
  });
});
