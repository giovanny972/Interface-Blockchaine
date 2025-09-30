// Global polyfills pour Next.js et CosmJS
import { Buffer } from 'buffer';
import process from 'process/browser';

if (typeof global === 'undefined') {
  global = globalThis;
}

// Polyfill pour Buffer en environnement browser
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// Polyfill pour process en environnement browser
if (typeof window !== 'undefined' && !window.process) {
  window.process = process;
}