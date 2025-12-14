/*************************************************
 * Enigma Simulator (Plugboard Removed)
 * - 3 rotors + reflector + stepping
 * - Encrypt = Decrypt (same keys)
 * - Cute extras: Rotor Window + Random Keys
 *************************************************/

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Enigma I rotors (fixed wiring)
const rotor1 = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
const rotor2 = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
const rotor3 = "BDFHJLCPRTXVZNYEIWGAKMUSQO";
const reflector = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

// Small helper to get elements
function $(id) {
  return document.getElementById(id);
}

/** Rotate a letter by offset (0..25). Wraps around A..Z */
function rotate(offset, letter) {
  return alphabet[(alphabet.indexOf(letter) + offset + 26) % 26];
}

/** Forward pass through rotor with an offset */
function rotorForward(rotor, offset, letter) {
  const stepped = rotate(offset, letter);
  const encoded = rotor[alphabet.indexOf(stepped)];
  return rotate(-offset, encoded);
}

/** Backward pass through rotor (reverse lookup) with an offset */
function rotorBackward(rotor, offset, letter) {
  const stepped = rotate(offset, letter);
  const idx = rotor.indexOf(stepped);          // reverse mapping
  const decoded = alphabet[idx];
  return rotate(-offset, decoded);
}

/** Update rotor window letters (optional UI element) */
function updateRotorWindow(k1, k2, k3) {
  // These ids only exist if you added the rotor window in HTML.
  if ($("rw1")) $("rw1").innerText = alphabet[(k1 + 26) % 26];
  if ($("rw2")) $("rw2").innerText = alphabet[(k2 + 26) % 26];
  if ($("rw3")) $("rw3").innerText = alphabet[(k3 + 26) % 26];
}

/** Main function: encrypt/decrypt message */
function processMessage() {
  // Read keys (0..25)
  let key1 = parseInt($("k1")?.value || "0", 10);
  let key2 = parseInt($("k2")?.value || "0", 10);
  let key3 = parseInt($("k3")?.value || "0", 10);

  // Normalize keys
  key1 = (key1 + 26) % 26;
  key2 = (key2 + 26) % 26;
  key3 = (key3 + 26) % 26;

  // Read message
  const message = ($("inputText")?.value || "").toUpperCase();

  let result = "";

  for (const ch of message) {
    // Keep spaces/symbols as-is
    if (!alphabet.includes(ch)) {
      result += ch;
      continue;
    }

    let c = ch;

    // Forward rotors (Right -> Left)
    c = rotorForward(rotor3, key3, c);
    c = rotorForward(rotor2, key2, c);
    c = rotorForward(rotor1, key1, c);

    // Reflector
    c = reflector[alphabet.indexOf(c)];

    // Backward rotors (Left -> Right)
    c = rotorBackward(rotor1, key1, c);
    c = rotorBackward(rotor2, key2, c);
    c = rotorBackward(rotor3, key3, c);

    result += c;

    // Stepping (Right rotor steps every letter)
    key3 = (key3 + 1) % 26;
    if (key3 === 0) key2 = (key2 + 1) % 26;
    if (key2 === 0) key1 = (key1 + 1) % 26;

    // Live update rotor window (if you added it)
    updateRotorWindow(key1, key2, key3);
  }

  // Write output
  if ($("output")) {
    // Works if output is a <textarea id="output">
    $("output").value = result;
  }

  // Final window update
  updateRotorWindow(key1, key2, key3);

  // Optional status message
  if ($("status")) $("status").innerText = "✅ Done";
}

/** Swap input/output (useful for decrypt demo) */
function swapText() {
  const msg = $("inputText");
  const out = $("output");
  if (!msg || !out) return;

  const temp = msg.value;
  msg.value = out.value;
  out.value = temp;

  if ($("status")) $("status").innerText = "🔁 Swapped";
}

/** Clear both boxes */
function clearAll() {
  if ($("inputText")) $("inputText").value = "";
  if ($("output")) $("output").value = "";
  if ($("status")) $("status").innerText = "";
}

/** Copy output to clipboard */
function copyOutput() {
  const out = $("output");
  if (!out) return;

  out.select();
  out.setSelectionRange(0, 999999);
  document.execCommand("copy");

  if ($("status")) $("status").innerText = "📋 Copied!";
}

/** Cute extra: Randomize keys */
function randomizeKeys() {
  const r = () => Math.floor(Math.random() * 26);

  if ($("k1")) $("k1").value = r();
  if ($("k2")) $("k2").value = r();
  if ($("k3")) $("k3").value = r();

  updateRotorWindow(
    parseInt($("k1").value, 10),
    parseInt($("k2").value, 10),
    parseInt($("k3").value, 10)
  );

  if ($("status")) $("status").innerText = "🎲 Keys randomized";
}

/* Expose functions to onclick buttons (IMPORTANT) */
window.processMessage = processMessage;
window.swapText = swapText;
window.clearAll = clearAll;
window.copyOutput = copyOutput;
window.randomizeKeys = randomizeKeys;

/* Initialize rotor window on load (if present) */
window.addEventListener("DOMContentLoaded", () => {
  const k1 = parseInt($("k1")?.value || "0", 10);
  const k2 = parseInt($("k2")?.value || "0", 10);
  const k3 = parseInt($("k3")?.value || "0", 10);
  updateRotorWindow(k1, k2, k3);
});
