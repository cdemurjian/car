import { readdirSync, readFileSync, statSync, existsSync, createReadStream } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { createInterface } from 'readline';
import { spawnSync } from 'child_process';
import chalk from 'chalk';
import { copyToClipboard } from './clipboard.js';
import { relativeTime, truncate, padEnd } from './utils.js';

const PROJECTS_DIR = join(homedir(), '.claude', 'projects');
const DIVIDER = '━'.repeat(42);

// ── Session parsing ──────────────────────────────────────────────────────────

function readSessionsIndex(projectDir) {
  const indexPath = join(projectDir, 'sessions-index.json');
  if (!existsSync(indexPath)) return null;
  try {
    return JSON.parse(readFileSync(indexPath, 'utf8'));
  } catch {
    return null;
  }
}

function lastJsonlMessage(jsonlPath) {
  // Read the JSONL file and return the last user/assistant turn
  try {
    const content = readFileSync(jsonlPath, 'utf8');
    const lines = content.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lines[i]);
        if (obj.type === 'user' || obj.type === 'assistant') {
          const msg = obj.message ?? {};
          let text = '';
          if (typeof msg.content === 'string') {
            text = msg.content;
          } else if (Array.isArray(msg.content)) {
            const block = msg.content.find(b => b.type === 'text');
            text = block?.text ?? '';
          }
          return { role: obj.type, text };
        }
      } catch { /* skip bad line */ }
    }
  } catch { /* file unreadable */ }
  return null;
}

function buildSessions() {
  if (!existsSync(PROJECTS_DIR)) return [];

  const sessions = [];
  const projectDirs = readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => join(PROJECTS_DIR, e.name));

  for (const projectDir of projectDirs) {
    const index = readSessionsIndex(projectDir);
    const projectPath = index?.originalPath ?? null;
    const indexedIds = new Set((index?.entries ?? []).map(e => e.sessionId));

    // Sessions from the index (fast path)
    for (const entry of index?.entries ?? []) {
      const last = lastJsonlMessage(entry.fullPath);
      sessions.push({
        sessionId: entry.sessionId,
        projectPath: entry.projectPath ?? projectPath,
        projectName: basename(entry.projectPath ?? projectPath ?? projectDir),
        summary: entry.summary ?? '',
        lastMessage: last?.text ?? entry.firstPrompt ?? '',
        lastRole: last?.role ?? 'user',
        lastModified: entry.modified ? new Date(entry.modified) : null,
        named: false,
        customName: null,
        resumeCommand: buildResumeCommand(entry.projectPath ?? projectPath, entry.sessionId),
      });
    }

    // Orphan .jsonl files not in the index
    let orphans;
    try {
      orphans = readdirSync(projectDir).filter(f => f.endsWith('.jsonl'));
    } catch { continue; }

    for (const file of orphans) {
      const sessionId = file.replace(/\.jsonl$/, '');
      if (indexedIds.has(sessionId)) continue;

      const jsonlPath = join(projectDir, file);
      const last = lastJsonlMessage(jsonlPath);
      if (!last) continue;

      let mtime = null;
      try { mtime = statSync(jsonlPath).mtime; } catch { /* ok */ }

      sessions.push({
        sessionId,
        projectPath,
        projectName: basename(projectPath ?? projectDir),
        summary: '',
        lastMessage: last.text,
        lastRole: last.role,
        lastModified: mtime,
        named: false,
        customName: null,
        resumeCommand: buildResumeCommand(projectPath, sessionId),
      });
    }
  }

  // Sort: most recently modified first
  sessions.sort((a, b) => {
    if (!a.lastModified) return 1;
    if (!b.lastModified) return -1;
    return b.lastModified - a.lastModified;
  });

  return sessions;
}

function buildResumeCommand(projectPath, sessionId) {
  if (projectPath && existsSync(projectPath)) {
    return `cd "${projectPath}" && claude --resume ${sessionId}`;
  }
  return `claude --resume ${sessionId}`;
}

// ── fzf picker ───────────────────────────────────────────────────────────────

function formatLine(session) {
  const time = padEnd(relativeTime(session.lastModified), 12);
  const name = padEnd(
    session.customName ? `★ ${session.customName}` : (session.projectName ?? 'unknown'),
    22
  );
  const preview = truncate(`${session.lastRole}: ${session.lastMessage}`, 80);

  const dimTime = chalk.dim(time);
  const cyanName = chalk.cyan(name);
  const whitePreview = chalk.white(preview);

  // Embed session ID as hidden field after null byte
  const hidden = `\x00${session.sessionId}`;
  return `${dimTime}  ${cyanName}  ${whitePreview}${hidden}`;
}

function pickWithFzf(sessions) {
  const lines = sessions.map(formatLine);
  const input = lines.join('\n');

  const result = spawnSync('fzf', [
    '--ansi',
    '--height=80%',
    '--layout=reverse',
    '--border=rounded',
    '--prompt=  Claude Code › ',
    '--pointer=▶',
    '--header=ENTER resume · ESC cancel · type to filter',
  ], {
    input,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  if (result.status !== 0 || !result.stdout.trim()) return null;

  const selectedLine = result.stdout.trim();
  // Extract session ID from hidden field
  const nullIdx = selectedLine.indexOf('\x00');
  const sessionId = nullIdx !== -1 ? selectedLine.slice(nullIdx + 1) : null;
  if (!sessionId) return null;

  return sessions.find(s => s.sessionId === sessionId) ?? null;
}

// ── Output ───────────────────────────────────────────────────────────────────

function printResult(session) {
  console.log();
  console.log(chalk.bold(DIVIDER));
  console.log(`  ${chalk.bold('Project:')}  ${session.projectName}`);
  console.log(`  ${chalk.bold('Session:')}  ${session.sessionId}`);
  if (session.summary) {
    console.log(`  ${chalk.bold('Summary:')}  ${truncate(session.summary, 70)}`);
  }
  console.log(`  ${chalk.bold('Last:')}     ${session.lastRole}: ${truncate(session.lastMessage, 70)}`);
  console.log(chalk.bold(DIVIDER));
  console.log();
  console.log(`  ${chalk.bold.cyan('$ ' + session.resumeCommand)}`);
  console.log();

  const copied = copyToClipboard(session.resumeCommand);
  if (copied) {
    console.log(`  ${chalk.bold.green('✓ Copied to clipboard.')}`);
  } else {
    console.log(`  ${chalk.yellow('⚠ Could not copy to clipboard (install xclip, xsel, or wl-copy).')}`);
  }
  console.log(chalk.bold(DIVIDER));
  console.log();
}

// ── Entry ────────────────────────────────────────────────────────────────────

export async function runClaudePicker() {
  if (!existsSync(PROJECTS_DIR)) {
    console.log(chalk.yellow('No Claude Code sessions found (~/.claude/projects/ does not exist).'));
    process.exit(0);
  }

  const sessions = buildSessions();

  if (sessions.length === 0) {
    console.log(chalk.yellow('No Claude Code sessions found.'));
    process.exit(0);
  }

  // Check fzf is available
  const fzfCheck = spawnSync('fzf', ['--version'], { encoding: 'utf8' });
  if (fzfCheck.error) {
    console.error(chalk.red('fzf is not installed. Install it with:'));
    console.error('  macOS:  brew install fzf');
    console.error('  Linux:  sudo apt install fzf  (or your distro equivalent)');
    process.exit(1);
  }

  const selected = pickWithFzf(sessions);
  if (!selected) process.exit(0);

  printResult(selected);
}
