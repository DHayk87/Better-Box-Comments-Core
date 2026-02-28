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

| Flag             | Description                                          | Default   |
| :--------------- | :--------------------------------------------------- | :-------- |
| `--style <name>` | Border style (`Default`, `Hash`, `Equals`, `Double`) | `Default` |
| `--tag <text>`   | Add a label to the top border (e.g. `TODO`, `ALERT`) | —         |
| `--length <n>`   | Total box width in characters                        | `80`      |
| `--indent <n>`   | Left side indentation spaces                         | `2`       |
| `--no-copy`      | Disable automatic copying to clipboard               | —         |
| `--help`         | Show the help menu                                   | —         |

---

## ✨ Features

- **Automatic Clipboard Copy**: By default, the generated box is automatically copied to your clipboard. This makes it incredibly easy to use in editors like WebStorm—just run the tool and press **Paste**.
- **Shared Core**: Uses the same high-quality ASCII engine as the VS Code extension.
- **Piping Support**: Works perfectly with Unix pipes (e.g., `echo "Log" | box-comment`).

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
