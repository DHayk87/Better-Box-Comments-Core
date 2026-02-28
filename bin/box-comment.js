#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const clipboardy = require("clipboardy");
const { generateBox } = require("../boxCore");

function showHelp() {
    console.log(`
Better Box Comments CLI
Usage: box-comment [options] [text]

Options:
  --style <name>      Border style: Default, Hash, Equals, Double (default: Default)
  --tag <text>        Add a tag to the top border (e.g., TODO, ALERT)
  --length <number>   Total box width (default: 80)
  --indent <number>   Left indentation (default: 2)
  --file <path>       Read text from a file instead of arguments/stdin
  --no-copy           Do not copy the result to the clipboard
  --help              Show this help menu

Examples:
  box-comment "Hello World" --style Hash --tag TODO
  echo "Important Info" | box-comment --style Double
`);
}

async function run() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
        showHelp();
        return;
    }

    const options = {
        style: "Default",
        tag: null,
        length: 80,
        indentation: 2,
        copy: true,
    };

    let textParts = [];
    let filePath = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--style") options.style = args[++i];
        else if (args[i] === "--tag") options.tag = args[++i];
        else if (args[i] === "--length") options.length = parseInt(args[++i], 10);
        else if (args[i] === "--indent") options.indentation = parseInt(args[++i], 10);
        else if (args[i] === "--file" || args[i] === "-f") filePath = args[++i];
        else if (args[i] === "--no-copy") options.copy = false;
        else if (!args[i].startsWith("--")) textParts.push(args[i]);
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

    if (!text && !process.stdin.isTTY) {
        // Read from stdin
        text = await new Promise((resolve) => {
            let data = "";
            process.stdin.setEncoding("utf8");
            process.stdin.on("data", (chunk) => (data += chunk));
            process.stdin.on("end", () => resolve(data.trim()));
        });
    }

    if (!text) {
        if (textParts.length === 0) {
            showHelp();
            return;
        }
    }

    const result = generateBox(text, options);
    console.log(result);

    if (options.copy) {
        try {
            clipboardy.writeSync(result);
            // Only log if in a TTY to avoid messing up pipes
            if (process.stdout.isTTY) {
                console.log("\n(Copied to clipboard!)");
            }
        } catch (err) {
            console.error(`Warning: Could not copy to clipboard: ${err.message}`);
        }
    }
}

run();
