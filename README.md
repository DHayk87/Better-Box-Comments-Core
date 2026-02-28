# Better Box Comments CLI

A standalone CLI tool to generate beautiful ASCII box comments with "Better Comments" style tagging.

## Installation

Install globally via NPM:

```bash
npm install -g better-box-comments-cli
```

## Usage

```bash
# Basic usage
box-comment "Hello World"

# With style and tag
box-comment "Important Message" --style Double --tag ALERT

# Pipe from other commands
echo "Pipeline result" | box-comment --style Hash --tag INFO
```

## Options

- `--style <name>`: Border style (Default, Hash, Equals, Double)
- `--tag <text>`: Add a tag to the top border (e.g., TODO, ALERT)
- `--length <number>`: Total box width (default: 80)
- `--indent <number>`: Left indentation (default: 2)
- `--file <path>`: Read text from a file instead of arguments/stdin
- `--help`: Show help menu
