// Fix for "exports is not defined" error in browser
if (typeof global === 'undefined') {
  var global = globalThis;
}

if (typeof exports === 'undefined') {
  var exports = {};
}

if (typeof module === 'undefined') {
  var module = { exports: {} };
}

// Fix for "require is not defined" error
if (typeof require === 'undefined') {
  var require = function(id) {
    console.warn(`require('${id}') appelé dans le contexte browser - ignoré`);
    return {};
  };
}

// Polyfill for Node.js globals in browser
if (typeof window !== 'undefined') {
  window.global = window;
  window.exports = window.exports || {};
  window.module = window.module || { exports: {} };
  
  // Ensure require is available globally
  if (typeof window.require === 'undefined') {
    window.require = require;
  }
}