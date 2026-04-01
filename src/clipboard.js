import { spawnSync } from 'child_process';

export function copyToClipboard(text) {
  const input = Buffer.from(text);

  if (process.platform === 'darwin') {
    const r = spawnSync('pbcopy', { input });
    return r.status === 0;
  }

  for (const [cmd, ...args] of [
    ['xclip', '-selection', 'clipboard'],
    ['xsel', '--clipboard', '--input'],
    ['wl-copy'],
  ]) {
    const r = spawnSync(cmd, args, { input });
    if (r.status === 0 && !r.error) return true;
  }

  return false;
}
