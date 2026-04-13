# car - coding agent resume

Jump back into your Claude Code or Codex sessions with one command.

```
$ car

? Which tool do you want to resume?
❯ Claude Code
  Codex
```

- **Claude Code** - fuzzy-search your session history, then copy the resume command to your clipboard
- **Codex** - hand off directly to `codex resume --all`

## Install

```bash
git clone https://github.com/cdemurjian/car
cd car
npm install
npm install -g .
```

After installing, run:

```bash
car
```

## Requirements

- Node.js 18+
- [fzf](https://github.com/junegunn/fzf), for the Claude Code picker
- A clipboard utility on Linux; macOS uses `pbcopy`
- Claude Code, Codex, or both

### Installing fzf

| Platform | Command |
|----------|---------|
| macOS | `brew install fzf` |
| Debian / Ubuntu / Mint | `sudo apt install fzf` |
| Fedora / RHEL / CentOS | `sudo dnf install fzf` |
| Arch / Manjaro | `sudo pacman -S fzf` |
| openSUSE | `sudo zypper install fzf` |
| Any distro | `git clone --depth 1 https://github.com/junegunn/fzf.git ~/.fzf && ~/.fzf/install` |

### Installing a clipboard utility (Linux)

`car` tries these in order and uses the first one it finds:

| Display server | Package | Install |
|----------------|---------|---------|
| X11 | `xclip` | `sudo apt install xclip` / `sudo dnf install xclip` |
| X11 | `xsel` | `sudo apt install xsel` / `sudo dnf install xsel` |
| Wayland | `wl-clipboard` | `sudo apt install wl-clipboard` / `sudo dnf install wl-clipboard` |

## Usage

Run `car`, pick a tool, and follow the prompt.

For Claude Code, `car` reads `~/.claude/projects`, opens an `fzf` picker, and prints a shell-safe resume command like:

```bash
cd '/path/to/project' && claude --resume 'session-id'
```

It also copies that command to your clipboard when a clipboard utility is available. If no display or clipboard utility is available, it prints the command so you can run it manually.

The Claude Code picker shows sessions sorted by most recently active. Sessions whose project folder can no longer be found are marked with `⚠` and sorted to the bottom. They are still selectable, but the path may be stale.

For Codex, `car` runs:

```bash
codex resume --all
```

## Why can't it cd for me?

A subprocess cannot change the working directory of your parent shell. `car` prints the full command and copies it to your clipboard so you can paste and run it.

## Contributing

After cloning and running `npm install`, use `node src/index.js` to run directly without a global install.

Run tests with:

```bash
npm test
```

## License

MIT. See [LICENSE](LICENSE).
