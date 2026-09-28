/**
 * Core Vigenère cipher logic, kept separate from the public entry point
 * so the transform can be unit-tested in isolation from how characters are
 * classified.
 *
 * Design decisions (stated plainly so the tests can be read against them):
 *
 * 1. Only the 26 uppercase ASCII letters A–Z are transformed. Every other
 *    byte passes through untouched. This is the classical Vigenère tableau
 *    and keeps the cipher reversible for arbitrary text.
 *
 * 2. The keyword is normalised to uppercase letters only; non-letters are
 *    silently dropped. An empty keyword after normalisation is a programmer
 *    error and throws, because returning the plaintext unchanged would hide
 *    a bug in the caller.
 *
 * 3. The key index advances ONLY when a letter is transformed. Punctuation,
 *    digits, and whitespace do not consume key material, which is the
 *    behaviour most users expect when they encipher prose.
 */

const UPPERCASE_A = 65; // 'A'.charCodeAt(0)
const ALPHABET_SIZE = 26;

/**
 * Strip every character that is not A–Z (case-insensitive) and uppercase the
 * rest. Used to coerce a user-supplied keyword into the canonical form the
 * tableau operates on.
 *
 * @param {string} keyword
 * @returns {string}
 */
export function normalizeKey(keyword) {
  if (typeof keyword !== 'string') {
    throw new TypeError('keyword must be a string');
  }
  return keyword.toUpperCase().replace(/[^A-Z]/g, '');
}

/**
 * Shared body for encipher and decipher. The only difference is the sign of
 * the shift, captured by `direction` (+1 to encipher, -1 to decipher).
 *
 * @param {string} text  Plaintext or ciphertext. Non-letters pass through.
 * @param {string} key   Pre-normalised key (uppercase A–Z only, non-empty).
 * @param {1 | -1} direction
 * @returns {string}
 */
function transform(text, key, direction) {
  if (typeof text !== 'string') {
    throw new TypeError('text must be a string');
  }
  // We already validated the key is non-empty at the public boundary, so this
  // loop is safe against division by zero.
  let keyIndex = 0;
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const code = text.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      // Uppercase letter.
      const shift = key.charCodeAt(keyIndex % key.length) - UPPERCASE_A;
      // Add ALPHABET_SIZE before mod to guarantee a non-negative result in
      // JS (where % can return negatives for negative operands).
      const shifted =
        (((code - UPPERCASE_A) + direction * shift + ALPHABET_SIZE) %
          ALPHABET_SIZE) +
        UPPERCASE_A;
      out += String.fromCharCode(shifted);
      keyIndex++;
    } else if (code >= 97 && code <= 122) {
      // Lowercase letter: transform as uppercase, then re-lowercase so the
      // case of the source is preserved. This keeps "Hello" and "HELLO"
      // distinguishable after enciphering, which matters for readability of
      // prose.
      const upper = code - 32;
      const shift = key.charCodeAt(keyIndex % key.length) - UPPERCASE_A;
      const shifted =
        (((upper - UPPERCASE_A) + direction * shift + ALPHABET_SIZE) %
          ALPHABET_SIZE) +
        UPPERCASE_A;
      out += String.fromCharCode(shifted + 32);
      keyIndex++;
    } else {
      // Non-letter: pass through untouched, do not advance the key.
      out += ch;
    }
  }
  return out;
}

/**
 * Encipher `text` with `key`. See the module docstring for the rules.
 *
 * @param {string} text
 * @param {string} key
 * @returns {string}
 */
export function encipher(text, key) {
  const normalized = normalizeKey(key);
  if (normalized.length === 0) {
    throw new Error('key must contain at least one letter');
  }
  return transform(text, normalized, 1);
}

/**
 * Decipher `text` with `key`. The inverse of {@link encipher}.
 *
 * @param {string} text
 * @param {string} key
 * @returns {string}
 */
export function decipher(text, key) {
  const normalized = normalizeKey(key);
  if (normalized.length === 0) {
    throw new Error('key must contain at least one letter');
  }
  return transform(text, normalized, -1);
}
