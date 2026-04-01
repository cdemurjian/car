# car — coding agent resume

Jump back into your Claude Code or Codex sessions with one command.

```
$ car

? Which tool do you want to resume?
❯ Claude Code
  Codex
```

- **Claude Code** → fuzzy-search your session history, copy the resume command to clipboard
- **Codex** → hands off directly to `codex resume --all`

## Install

```bash
npm install -g car
# or run without installing
npx car
```

## Requirements

- Node.js 18+
- [fzf](https://github.com/junegunn/fzf) for the Claude Code picker
- A clipboard utility (Linux only — macOS uses `pbcopy` built-in)
- Claude Code and/or Codex installed

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

Just run `car`. Pick your tool. Done.

The Claude Code picker shows your sessions sorted by most recently active. Sessions whose project folder can no longer be found are marked with `⚠` and sorted to the bottom — they're still selectable but the path may be stale.

## Why can't it cd for me?

A subprocess can't change the working directory of your parent shell — that's a Unix fundamental. `car` prints the full command and copies it to your clipboard. Paste and run.

## Contributing

```bash
git clone https://github.com/cdemurjian/car
cd car
npm install
node src/index.js
```

## License

MIT
