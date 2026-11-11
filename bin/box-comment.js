#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const clipboardy = require("clipboardy");
const { generateBox, PRESETS } = require("../boxCore");
const pkg = require("../package.json");

function showHelp() {
    console.log(`
Better Box Comments CLI (v${pkg.version})
Usage: box-comment [options] [text]

Arguments:
  [text]                  Text to enclose in the box comment

Options:
  -s, --style <name>      Border style: Default, Hash, Equals, Double, Custom (default: Default)
  -t, --tag <text>        Add a tag to the top border (e.g., TODO, ALERT, INFO, NOTE)
  -l, --length <number>   Total box width (default: 80)
  -i, --indent <number>   Left indentation spaces (default: 2)
  -C, --comment <prefix>  Prepend comment syntax to every line (e.g., "//", "#", "--")
  -f, --file <path>       Read text from a file instead of arguments/stdin
  -c, --copy              Force copy the result to clipboard
  --no-copy               Do not copy the result to clipboard
  -v, --version           Show version number
  -h, --help              Show this help menu

Custom Character Options (used when --style Custom is set):
  --tl <char>             Top-left corner
  --tm <char>             Top-middle border
  --tr <char>             Top-right corner
  --l <char>              Left side border
  --r <char>              Right side border
  --bl <char>             Bottom-left corner
  --bm <char>             Bottom-middle border
  --br <char>             Bottom-right corner
  --dl <char>             Divider-left junction
  --dm <char>             Divider-middle line
  --dr <char>             Divider-right junction

Examples:
  box-comment "Hello World"
  box-comment "Fix this later" -s Double -t TODO
  box-comment "Important Header" -C "//" -l 60
  cat notes.txt | box-comment -s Hash -t ALERT
`);
}

async function run() {
    const args = process.argv.slice(2);

    if (args.includes("--help") || args.includes("-h")) {
        showHelp();
        return;
    }

    if (args.includes("--version") || args.includes("-v")) {
        console.log(`v${pkg.version}`);
        return;
    }

    if (args.length === 0 && process.stdin.isTTY) {
        showHelp();
        return;
    }

    const options = {
        style: "Default",
        tag: null,
        length: 80,
        indentation: 2,
        comment: null,
        copy: null, // null = auto (copy only if interactive TTY)
    };

    const customChars = {};
    let textParts = [];
    let filePath = null;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === "-s" || arg === "--style") {
            options.style = args[++i];
        } else if (arg === "-t" || arg === "--tag") {
            options.tag = args[++i];
        } else if (arg === "-l" || arg === "--length") {
            const parsed = parseInt(args[++i], 10);
            if (!isNaN(parsed) && parsed > 0) options.length = parsed;
        } else if (arg === "-i" || arg === "--indent") {
            const parsed = parseInt(args[++i], 10);
            if (!isNaN(parsed) && parsed >= 0) options.indentation = parsed;
        } else if (arg === "-C" || arg === "--comment") {
            options.comment = args[++i];
        } else if (arg === "-f" || arg === "--file") {
            filePath = args[++i];
        } else if (arg === "-c" || arg === "--copy") {
            options.copy = true;
        } else if (arg === "--no-copy") {
            options.copy = false;
        } else if (arg === "--tl") {
            customChars.tl = args[++i];
        } else if (arg === "--tm") {
            customChars.tm = args[++i];
        } else if (arg === "--tr") {
            customChars.tr = args[++i];
        } else if (arg === "--l") {
            customChars.l = args[++i];
        } else if (arg === "--r") {
            customChars.r = args[++i];
        } else if (arg === "--bl") {
            customChars.bl = args[++i];
        } else if (arg === "--bm") {
            customChars.bm = args[++i];
        } else if (arg === "--br") {
            customChars.br = args[++i];
        } else if (arg === "--dl") {
            customChars.dl = args[++i];
        } else if (arg === "--dm") {
            customChars.dm = args[++i];
        } else if (arg === "--dr") {
            customChars.dr = args[++i];
        } else if (!arg.startsWith("-")) {
            textParts.push(arg);
        }
    }

    if (Object.keys(customChars).length > 0) {
        options.style = "Custom";
        Object.assign(options, customChars);
    }

    let text = textParts.join(" ");

    if (filePath) {
        try {
            text = fs.readFileSync(path.resolve(filePath), "utf8");
        } catch (err) {
            console.error(`Error reading file: ${err.message}`);
            process.exit(1);
        }
    }

    if (!text && !filePath && !process.stdin.isTTY) {
        text = await new Promise((resolve) => {
            let data = "";
            process.stdin.setEncoding("utf8");
            process.stdin.on("data", (chunk) => (data += chunk));
            process.stdin.on("end", () => resolve(data.trim()));
            process.stdin.on("error", () => resolve(""));
        });
    }

    if (!text && textParts.length === 0 && !filePath) {
        showHelp();
        return;
    }

    let result = generateBox(text, options);

    if (options.comment) {
        const prefix = options.comment.endsWith(" ") ? options.comment : `${options.comment} `;
        result = result
            .split(/\r?\n/)
            .map((line) => prefix + line)
            .join("\n");
    }

    console.log(result);

    // Auto copy: enabled in interactive TTY unless explicitly disabled
    const shouldCopy =
        options.copy === true || (options.copy === null && process.stdout.isTTY);

    if (shouldCopy) {
        try {
            clipboardy.writeSync(result);
            if (process.stdout.isTTY) {
                console.log("\n(Copied to clipboard!)");
            }
        } catch (err) {
            // Silently ignore clipboard errors in headless/pipe environments
            if (process.stdout.isTTY) {
                console.error(`Warning: Could not copy to clipboard: ${err.message}`);
            }
        }
    }
}

run();
