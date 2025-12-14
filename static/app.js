const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Enigma rotors + reflector
const rotor1 = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
const rotor2 = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
const rotor3 = "BDFHJLCPRTXVZNYEIWGAKMUSQO";
const reflector = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

function $(id) {
  return document.getElementById(id);
}

function setStatus(msg, good = true) {
  const s = $("status");
  if (!s) return;
  s.innerText = msg;
  s.style.opacity = "1";
}

function applyPlugboard(letter, plugboardPairs) {
  for (let pair of plugboardPairs) {
    if (pair.includes(letter)) {
      return pair.replace(letter, "");
    }
  }
  return letter;
}

function rotate(offset, letter) {
  return alphabet[(alphabet.indexOf(letter) + offset + 26) % 26];
}

function rotorEncrypt(rotor, offset, letter) {
  const stepped = rotate(offset, letter);
  const encoded = rotor[alphabet.indexOf(stepped)];
  return rotate(-offset, encoded);
}

function parsePlugboard(input) {
  return (input || "")
    .toUpperCase()
    .trim()
    .split(/\s+/)
    .filter(p => p.length === 2 && p[0] !== p[1]);
}

function validPlugboardPairs(pairs) {
  const used = new Set();
  for (let p of pairs) {
    const a = p[0], b = p[1];
    if (used.has(a) || used.has(b)) return false;
    used.add(a); used.add(b);
  }
  return true;
}

function writeOutput(text) {
  const out = $("output");
  if (!out) return;

  // works for both <div id="output"> and <textarea id="output">
  if ("value" in out) out.value = text;
  else out.innerText = text;
}

function getMessage() {
  const inp = $("inputText");
  return inp ? (inp.value || "") : "";
}

function processMessage() {
  // read keys (your design inputs)
  let key1 = parseInt($("k1")?.value || "0");
  let key2 = parseInt($("k2")?.value || "0");
  let key3 = parseInt($("k3")?.value || "0");

  key1 = (key1 + 26) % 26;
  key2 = (key2 + 26) % 26;
  key3 = (key3 + 26) % 26;

  const message = getMessage().toUpperCase();
  const plugInput = $("plugboard") ? $("plugboard").value : "";
  const plugboardPairs = parsePlugboard(plugInput);

  if (!validPlugboardPairs(plugboardPairs)) {
    setStatus("❌ Plugboard error: repeated letter in pairs.", false);
    return;
  }

  let result = "";

  for (let char of message) {
    if (!alphabet.includes(char)) {
      result += char;
      continue;
    }

    // Plugboard in
    let c = applyPlugboard(char, plugboardPairs);

    // Forward rotors (right -> left)
    c = rotorEncrypt(rotor3, key3, c);
    c = rotorEncrypt(rotor2, key2, c);
    c = rotorEncrypt(rotor1, key1, c);

    // Reflector
    c = reflector[alphabet.indexOf(c)];

    // Backward rotors (left -> right) (reverse lookup)
    c = rotate(-key1, alphabet[rotor1.indexOf(rotate(key1, c))]);
    c = rotate(-key2, alphabet[rotor2.indexOf(rotate(key2, c))]);
    c = rotate(-key3, alphabet[rotor3.indexOf(rotate(key3, c))]);

    // Plugboard out
    c = applyPlugboard(c, plugboardPairs);

    result += c;

    // stepping
    key3 = (key3 + 1) % 26;
    if (key3 === 0) key2 = (key2 + 1) % 26;
    if (key2 === 0) key1 = (key1 + 1) % 26;
  }

  writeOutput(result);
  setStatus("✅ Done");
}
