# Vigenère Cipher

Enciphers and deciphers text using a polyalphabetic substitution controlled by a repeating keyword.

## Usage

```js
import { encipher, decipher } from './src/index.js';

encipher('ATTACKATDAWN', 'LEMON'); // 'LXFOPVEFRNHR'
decipher('LXFOPVEFRNHR', 'LEMON'); // 'ATTACKATDAWN'
```

## Why this exists

A small, dependency-free implementation of the classical Vigenère tableau. The trade-off is simplicity over configurability: the cipher only transforms the 26 ASCII letters A–Z (case-insensitively), and every other character passes through untouched. There are no options for custom alphabets or key auto-keying.

## Edge cases

- **Non-letters pass through and do not advance the key.** `encipher('A B', 'K')` yields `'B C'`, not `'B B'`. The space is copied verbatim and does not consume a key letter.
- **Case is preserved per letter.** `encipher('Attack', 'LEMON')` yields `'Lxfopv'`.
- **The key is normalised to uppercase A–Z only.** Digits, spaces, and punctuation in the key are silently dropped: `'K E Y'` and `'KEY'` are equivalent.
- **An empty key (after normalisation) throws.** `encipher('HELLO', '123')` raises an error, because there is no key material to use.

## Exports

- `encipher(text, key)` — returns the ciphertext.
- `decipher(text, key)` — returns the plaintext.
- `normalizeKey(key)` — returns the key with non-letters removed and the remainder uppercased.
