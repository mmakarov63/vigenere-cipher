import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encipher, decipher, normalizeKey } from '../src/index.js';

test('encipher shifts each uppercase letter by the repeating key', () => {
  // Classic textbook example: ATTACKATDAWN with key LEMON.
  assert.equal(encipher('ATTACKATDAWN', 'LEMON'), 'LXFOPVEFRNHR');
});

test('decipher is the inverse of encipher for uppercase text', () => {
  const original = 'ATTACKATDAWN';
  const key = 'LEMON';
  assert.equal(decipher(encipher(original, key), key), original);
});

test('lowercase letters are transformed and their case is preserved', () => {
  assert.equal(encipher('attack', 'LEMON'), 'lxfopv');
});

test('mixed-case text preserves the case of each letter', () => {
  assert.equal(encipher('Attack', 'LEMON'), 'Lxfopv');
  assert.equal(decipher('Lxfopv', 'LEMON'), 'Attack');
});

test('non-letter characters pass through and do not advance the key', () => {
  // The space and exclamation mark are untouched and do not consume key
  // material, so the second word is enciphered as if it immediately followed
  // the first.
  assert.equal(encipher('HELLO, WORLD!', 'KEY'), 'RIJVS, UYVJN!');
});

test('round-trip preserves punctuation, digits, and whitespace', () => {
  const text = 'Meet me at 3pm!  ';
  const key = 'secret';
  assert.equal(decipher(encipher(text, key), key), text);
});

test('key is normalized to uppercase letters only', () => {
  // Lowercase key, spaces, and digits in the key are all ignored.
  assert.equal(encipher('HELLO', 'key'), encipher('HELLO', 'KEY'));
  assert.equal(encipher('HELLO', 'K E Y'), encipher('HELLO', 'KEY'));
  assert.equal(encipher('HELLO', 'K3E5Y'), encipher('HELLO', 'KEY'));
});

test('normalizeKey returns the uppercase letters of its input', () => {
  assert.equal(normalizeKey('k E y!'), 'KEY');
  assert.equal(normalizeKey(''), '');
});

test('a key that contains no letters throws on encipher', () => {
  assert.throws(() => encipher('HELLO', '123'), /at least one letter/);
  assert.throws(() => encipher('HELLO', ''), /at least one letter/);
});

test('a key that contains no letters throws on decipher', () => {
  assert.throws(() => decipher('HELLO', '123'), /at least one letter/);
});

test('non-string text throws a TypeError', () => {
  assert.throws(() => encipher(42, 'KEY'), TypeError);
  assert.throws(() => decipher(null, 'KEY'), TypeError);
});

test('non-string key throws a TypeError', () => {
  assert.throws(() => encipher('HELLO', 42), TypeError);
});

test('a single-letter key reduces to a Caesar shift', () => {
  // Key 'B' shifts every letter by 1, i.e. a Caesar cipher with shift 1.
  assert.equal(encipher('ABC', 'B'), 'BCD');
  assert.equal(decipher('BCD', 'B'), 'ABC');
});

test('a key longer than the text still works', () => {
  assert.equal(encipher('HI', 'VERYLONGKEY'), 'CM');
  assert.equal(decipher('CM', 'VERYLONGKEY'), 'HI');
});
