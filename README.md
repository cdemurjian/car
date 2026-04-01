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
  - macOS: `brew install fzf`
  - Linux: `sudo apt install fzf`
- Claude Code and/or Codex installed

## Usage

Just run `car`. Pick your tool. Done.

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
