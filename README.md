# 📦 Better Box Comments CLI

A standalone CLI tool to generate beautiful ASCII box comments with "Better Comments" style tagging. Perfect for headers, TODOs, and organizing your source code visually.

---

## 🚀 Installation

Install globally via NPM:

```bash
npm install -g better-box-comments-cli
```

---

## 🛠 Usage

### Basic Usage

```bash
box-comment "Hello World"
```

### With Style and Tag

```bash
box-comment "This is a critical alert" --style Double --tag ALERT
```

### Examples

**Style: Default**

```text
  ┌─ TODO ──────────────────────────────────────────────────────────────────┐
  │ Hello World                                                             │
  └─────────────────────────────────────────────────────────────────────────┘
```

**Style: Double**

```text
  ╔═ ALERT ═════════════════════════════════════════════════════════════════╗
  ║ This is a critical alert                                                ║
  ╚═════════════════════════════════════════════════════════════════════════╝
```

---

## ⚙️ Options

| Flag | Short | Description | Default |
| :--- | :--- | :--- | :--- |
| `--style <name>` | `-s` | Border style (`Default`, `Hash`, `Equals`, `Double`, `Custom`) | `Default` |
| `--tag <text>` | `-t` | Add a label to the top border (e.g. `TODO`, `ALERT`, `INFO`, `NOTE`) | — |
| `--length <n>` | `-l` | Total box width in characters | `80` |
| `--indent <n>` | `-i` | Left side indentation spaces | `2` |
| `--comment <pfx>` | `-C` | Prepend comment prefix to every line (e.g. `"//"`, `"#"`, `"--"`) | — |
| `--file <path>` | `-f` | Read input text from a file instead of arguments or stdin | — |
| `--copy` | `-c` | Explicitly copy result to clipboard | Auto |
| `--no-copy` | — | Disable copying result to clipboard | — |
| `--version` | `-v` | Show version number | — |
| `--help` | `-h` | Show help menu | — |

### Custom Border Characters (with `--style Custom`)
You can override individual border characters using:
`--tl`, `--tm`, `--tr` (top), `--l`, `--r` (sides), `--bl`, `--bm`, `--br` (bottom), `--dl`, `--dm`, `--dr` (dividers).

---

## ✨ Features

- **Comment Syntax Generation**: Use `-C "//"` or `-C "#"` to generate ready-to-paste comment blocks directly from your terminal.
- **Smart Clipboard Copy**: Automatically copies in interactive terminals, while staying quiet and non-intrusive when piped or redirected.
- **Shared Robust Core**: Unicode & emoji visual width alignment, divider support (`--`), and crash-proof word wrapping.
- **Piping & File Support**: Works seamlessly with Unix pipes (`cat notes.txt | box-comment -s Hash`) and file reading (`-f notes.txt`).

---

## 💻 IDE Integration (WebStorm / IntelliJ)

You can integrate this tool directly into your IDE to wrap selected text with a shortcut:

1. Open **Settings** > **Tools** > **External Tools**.
2. Click **+** (Add).
3. Configure as follows:
    - **Name**: `Better Box Comment`
    - **Program**: `box-comment.cmd` (Windows) or `box-comment` (macOS/Linux)
    - **Arguments**: `--style Default "$Selection$"`
    - **Working directory**: `$ProjectFileDir$`
4. Go to **Keymap** and search for `Better Box Comment`.
5. Assign a shortcut (e.g., `Ctrl + Alt + B`).

**Pro Tip**: Because the tool automatically copies to your clipboard, you can run the shortcut and immediately hit **Ctrl+V** to replace your selection!

---

## 📄 License

This project is licensed under the MIT License. Created by [DHayk](https://github.com/DHayk87).

## 🤝 Contributing

Bug reports and pull requests are welcome on GitHub at [DHayk87/Better-Box-Comments-Core](https://github.com/DHayk87/Better-Box-Comments-Core).
