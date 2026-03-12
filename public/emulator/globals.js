// Stubs for GameBoy-Online globals that are normally provided by gui.js/terminal.js
// These are loaded as classic scripts so they become true window globals.

function cout(message, level) {
  if (level >= 2) {
    console.error("[GB] " + message);
  }
}

function findValue(key) {
  try {
    return localStorage.getItem(key) !== null
      ? JSON.parse(localStorage.getItem(key))
      : null;
  } catch (e) {
    return null;
  }
}

function setValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage full or unavailable
  }
}

function deleteValue(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // Ignore
  }
}

// Base64 helpers used by save/load SRAM
function arrayToBase64(data) {
  var binStr = "";
  for (var i = 0; i < data.length; i++) {
    binStr += String.fromCharCode(data[i] & 0xFF);
  }
  return btoa(binStr);
}

function base64ToArray(str) {
  var binStr = atob(str);
  var arr = [];
  for (var i = 0; i < binStr.length; i++) {
    arr.push(binStr.charCodeAt(i) & 0xFF);
  }
  return arr;
}
