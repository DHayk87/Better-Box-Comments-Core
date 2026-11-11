# Changelog

All notable changes to "better-box-comments-cli" will be documented in this file.

## [1.1.0]

### Added
- **Version Flag**: Added `--version` and `-v` flags.
- **Short Flags**: Added short aliases for all common options: `-s` (style), `-t` (tag), `-l` (length), `-i` (indent), `-f` (file), `-c` (copy), `-h` (help), `-v` (version).
- **Comment Prefix Option**: Added `-C, --comment <prefix>` (e.g., `-C "//"` or `-C "#"`) to prepend comment markers directly to every line of output.
- **Custom Border Characters via CLI**: Supported passing custom characters directly via `--tl`, `--tm`, `--tr`, `--l`, `--r`, `--bl`, `--bm`, `--br`, `--dl`, `--dm`, `--dr`.
- **Automated Test Suite**: Added 29 unit and integration tests using Node's native test runner (`npm test`).
- **CI/CD Automation**: Added GitHub Actions workflows for multi-OS, multi-Node automated testing and npm publishing.

### Fixed
- **Non-TTY Stdin Hang**: Fixed bug where running the CLI in subshells or non-interactive environments without input caused it to hang indefinitely waiting for stdin.
- **Crash Prevention on Small Lengths**: Fixed infinite loop and `RangeError` heap crashes when small box lengths were provided.
- **Divider Width Alignment**: Corrected inner divider width calculation so internal dividers (`--`) match outer borders.
- **False Divider Triggers**: Fixed bug where normal code lines starting with `#` or `=` (e.g., `#include`) were mistreated as dividers.
- **Unicode & Emoji Alignment**: Implemented visual display column calculation ensuring wide CJK characters and emojis align borders.
- **Context-Aware Clipboard Logic**: Automatically suppresses clipboard copying and logs when output is piped or redirected.
- **Package Test Script**: Fixed broken `npm test` script in `package.json`.

## [1.0.1] - 2026-03-01

- Initial release of Better Box Comments CLI with Default, Hash, Equals, and Double presets.

