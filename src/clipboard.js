import { spawnSync } from 'child_process';

export function copyToClipboard(text) {
  const input = Buffer.from(text);

  if (process.platform === 'darwin') {
    const r = spawnSync('pbcopy', { input, timeout: 2000 });
    return r.status === 0;
  }

  // No display available (e.g. SSH session) — skip silently
  if (!process.env.WAYLAND_DISPLAY && !process.env.DISPLAY) return null;

  for (const [cmd, ...args] of [
    ['wl-copy'],
    ['xclip', '-selection', 'clipboard'],
    ['xsel', '--clipboard', '--input'],
  ]) {
    const r = spawnSync(cmd, args, { input, timeout: 2000 });
    if (r.status === 0 && !r.error) return true;
  }

  return false;
}
