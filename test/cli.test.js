const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const CLI_PATH = path.resolve(__dirname, "../bin/box-comment.js");

function runCli(args = [], input = null) {
    return new Promise((resolve, reject) => {
        const child = execFile(
            process.execPath,
            [CLI_PATH, ...args],
            { encoding: "utf8", timeout: 4000 },
            (error, stdout, stderr) => {
                resolve({ code: error ? error.code : 0, stdout, stderr });
            },
        );

        if (input !== null) {
            child.stdin.write(input);
        }
        child.stdin.end();
    });
}

describe("CLI Integration Tests", () => {
    it("prints version with --version and -v", async () => {
        const resLong = await runCli(["--version"]);
        assert.equal(resLong.code, 0);
        assert.match(resLong.stdout, /^v\d+\.\d+\.\d+/);

        const resShort = await runCli(["-v"]);
        assert.equal(resShort.code, 0);
        assert.match(resShort.stdout, /^v\d+\.\d+\.\d+/);
    });

    it("prints help menu with --help and -h", async () => {
        const res = await runCli(["--help"]);
        assert.equal(res.code, 0);
        assert.match(res.stdout, /Better Box Comments CLI/);
        assert.match(res.stdout, /Usage: box-comment/);
    });

    it("does not hang when called without arguments in non-TTY", async () => {
        const res = await runCli([]);
        assert.equal(res.code, 0);
        assert.match(res.stdout, /Usage: box-comment/);
    });

    it("generates a standard box with positional text", async () => {
        const res = await runCli(["Hello CLI", "--no-copy", "-l", "30", "-i", "0"]);
        assert.equal(res.code, 0);
        assert.match(res.stdout, /┌─+┐/);
        assert.match(res.stdout, /│ Hello CLI\s+│/);
        assert.match(res.stdout, /└─+┘/);
    });

    it("supports short flags: -s (style), -t (tag), -l (length), -i (indent)", async () => {
        const res = await runCli([
            "Important Notice",
            "-s", "Double",
            "-t", "ALERT",
            "-l", "45",
            "-i", "2",
            "--no-copy",
        ]);
        assert.equal(res.code, 0);
        assert.match(res.stdout, /^\s\s╔══ \[ALERT\] ═+╗/m);
        assert.match(res.stdout, /^\s\s║ Important Notice\s+║/m);
        assert.match(res.stdout, /^\s\s╚═+╝/m);
    });

    it("supports -C / --comment to prepend comment prefixes", async () => {
        const res = await runCli([
            "Comment Test",
            "-C", "//",
            "-l", "35",
            "-i", "0",
            "--no-copy",
        ]);
        assert.equal(res.code, 0);
        const lines = res.stdout.trim().split("\n");
        assert.ok(lines.every((line) => line.startsWith("// ")));
        assert.match(lines[0], /^\/\/ ┌─+┐$/);
        assert.match(lines[1], /^\/\/ │ Comment Test\s+│$/);
        assert.match(lines[2], /^\/\/ └─+┘$/);
    });

    it("supports custom border characters", async () => {
        const res = await runCli([
            "Custom Chars",
            "--tl", "+",
            "--tr", "+",
            "--bl", "+",
            "--br", "+",
            "--l", "|",
            "--r", "|",
            "--tm", "-",
            "--bm", "-",
            "-l", "30",
            "-i", "0",
            "--no-copy",
        ]);
        assert.equal(res.code, 0);
        assert.match(res.stdout, /^\+-+\+$/m);
        assert.match(res.stdout, /^\| Custom Chars\s+\|$/m);
    });

    it("reads input from stdin when piped", async () => {
        const res = await runCli(["-s", "Hash", "-l", "35", "-i", "0", "--no-copy"], "Piped Content");
        assert.equal(res.code, 0);
        assert.match(res.stdout, /^#+$/m);
        assert.match(res.stdout, /^# Piped Content\s+#$/m);
    });

    it("reads input from --file / -f", async () => {
        const tempFile = path.resolve(__dirname, "temp-test-file.txt");
        fs.writeFileSync(tempFile, "File Content Line 1\n--\nFile Content Line 2", "utf8");
        try {
            const res = await runCli(["-f", tempFile, "-l", "40", "-i", "0", "--no-copy"]);
            assert.equal(res.code, 0);
            assert.match(res.stdout, /│ File Content Line 1\s+│/);
            assert.match(res.stdout, /├─+┤/);
            assert.match(res.stdout, /│ File Content Line 2\s+│/);
        } finally {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }
    });
});
