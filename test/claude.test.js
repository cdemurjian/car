import test from 'node:test';
import assert from 'node:assert/strict';
import { testInternals } from '../src/claude.js';

const { buildResumeCommand, indexEntries, shellQuote } = testInternals;

test('shellQuote safely quotes shell arguments', () => {
  assert.equal(shellQuote('plain'), "'plain'");
  assert.equal(shellQuote("it's here"), "'it'\\''s here'");
  assert.equal(shellQuote('$(touch /tmp/pwned)"`\\'), "'$(touch /tmp/pwned)\"`\\'");
  assert.equal(shellQuote(''), "''");
});

test('buildResumeCommand shell-quotes project path and session id', () => {
  const command = buildResumeCommand('/tmp/a "quoted" project', 'abc; touch /tmp/pwned');

  assert.equal(
    command,
    'cd \'/tmp/a "quoted" project\' && claude --resume \'abc; touch /tmp/pwned\'',
  );
});

test('buildResumeCommand handles sessions without a decoded project path', () => {
  assert.equal(
    buildResumeCommand(null, "session'with-quote"),
    "claude --resume 'session'\\''with-quote'",
  );
});

test('indexEntries tolerates absent or malformed entries', () => {
  assert.deepEqual(indexEntries(null), []);
  assert.deepEqual(indexEntries({ entries: {} }), []);
  assert.deepEqual(indexEntries({ entries: 'bad' }), []);

  const entries = [{ sessionId: 's1' }];
  assert.equal(indexEntries({ entries }), entries);
});
