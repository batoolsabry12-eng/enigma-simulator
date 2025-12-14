/*************************************************
 * Enigma Simulator (Clean Version)
 * - No plugboard
 * - No random keys
 * - Rotor stepping = state transitions
 *************************************************/

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Rotor wirings
const rotor1 = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
const rotor2 = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
const rotor3 = "BDFHJLCPRTXVZNYEIWGAKMUSQO";
const reflector = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

function $(id) {
  return document.getElementById(id);
}

/* Rotate letter by offset */
function rotate(offset, letter) {
  return alphabet[(alphabet.indexOf(letter) + offset + 26) % 26];
}

/* Forward rotor pass */
function rotorForward(rotor, offset, letter) {
  const stepped = rotate(offset, letter);
  const encoded = rotor[alphabet.indexOf(stepped)];
  return rotate(-offset, encoded);
}

/* Backward rotor pass */
function rotorBackward(rotor, offset, letter) {
  const stepped = rotate(offset, letter);
  const index = rotor.indexOf(stepped);
  return rotate(-offset, alphabet[index]);
}

/* Update visible rotor letters (cute + meaningful) */
function updateRotorWindow(k1, k2, k3) {
  if ($("rw1")) $("rw1").innerText = alphabet[k1];
  if ($("rw2")) $("rw2").innerText = alphabet[k2];
  if ($("rw3")) $("rw3").innerText = alphabet[k3];
}

/* Main encrypt/decrypt function */
function processMessage() {
  let k1 = parseInt($("k1").value || "0") % 26;
  let k2 = parseInt($("k2").value || "0") % 26;
  let k3 = parseInt($("k3").value || "0") % 26;

  const message = $("inputText").value.toUpperCase();
  let output = "";

  for (const char of message) {
    if (!alphabet.includes(char)) {
      output += char;
      continue;
    }

    let c = char;

    // Forward
    c = rotorForward(rotor3, k3, c);
    c = rotorForward(rotor2, k2, c);
    c = rotorForward(rotor1, k1, c);

    // Reflect
    c = reflector[alphabet.indexOf(c)];

    // Backward
    c = rotorBackward(rotor1, k1, c);
    c = rotorBackward(rotor2, k2, c);
    c = rotorBackward(rotor3, k3, c);

    output += c;

    // Rotor stepping (state transition)
    k3 = (k3 + 1) % 26;
    if (k3 === 0) k2 = (k2 + 1) % 26;
    if (k2 === 0) k1 = (k1 + 1) % 26;

    updateRotorWindow(k1, k2, k3);
  }

  $("output").value = output;
  updateRotorWindow(k1, k2, k3);
}

/* Utilities */
function swapText() {
  const temp = $("inputText").value;
  $("inputText").value = $("output").value;
  $("output").value = temp;
}

function clearAll() {
  $("inputText").value = "";
  $("output").value = "";
}

function copyOutput() {
  $("output").select();
  document.execCommand("copy");
}

/* Expose functions to HTML */
window.processMessage = processMessage;
window.swapText = swapText;
window.clearAll = clearAll;
window.copyOutput = copyOutput;

/* Init rotor window on load */
window.onload = () => {
  updateRotorWindow(
    parseInt($("k1").value || "0"),
    parseInt($("k2").value || "0"),
    parseInt($("k3").value || "0")
  );
};
