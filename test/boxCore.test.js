const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
    PRESETS,
    generateBox,
    getStringWidth,
    parseLines,
} = require("../boxCore");

describe("boxCore", () => {
    describe("getStringWidth", () => {
        it("calculates ASCII width correctly", () => {
            assert.equal(getStringWidth("Hello, world!"), 13);
            assert.equal(getStringWidth(""), 0);
            assert.equal(getStringWidth("   "), 3);
        });

        it("calculates wide East Asian characters correctly (2 columns)", () => {
            assert.equal(getStringWidth("你好"), 4);
            assert.equal(getStringWidth("テスト"), 6);
        });

        it("calculates emoji column width correctly (2 columns)", () => {
            assert.equal(getStringWidth("🚀"), 2);
            assert.equal(getStringWidth("✅"), 2);
            assert.equal(getStringWidth("Alert ⚠️"), 8);
        });

        it("ignores ANSI escape codes", () => {
            assert.equal(getStringWidth("\x1B[31mRed\x1B[0m"), 3);
        });
    });

    describe("generateBox presets & basics", () => {
        it("generates Default style box", () => {
            const box = generateBox("Hello World", { length: 30, indentation: 0 });
            const lines = box.split("\n");
            assert.equal(lines.length, 3);
            assert.match(lines[0], /^┌─+┐$/);
            assert.match(lines[1], /^│ Hello World\s+│$/);
            assert.match(lines[2], /^└─+┘$/);
            lines.forEach((line) => {
                assert.equal(getStringWidth(line), 30);
            });
        });

        it("generates Double style box", () => {
            const box = generateBox("Double Test", { style: "Double", length: 40, indentation: 2 });
            const lines = box.split("\n");
            assert.match(lines[0], /^\s\s╔═+╗$/);
            assert.match(lines[1], /^\s\s║ Double Test\s+║$/);
            assert.match(lines[2], /^\s\s╚═+╝$/);
            lines.forEach((line) => {
                assert.equal(getStringWidth(line), 40);
            });
        });

        it("generates Hash style box", () => {
            const box = generateBox("Hash Test", { style: "Hash", length: 30, indentation: 0 });
            const lines = box.split("\n");
            assert.match(lines[0], /^#+$/);
            assert.match(lines[1], /^# Hash Test\s+#$/);
            assert.match(lines[2], /^#+$/);
            lines.forEach((line) => {
                assert.equal(getStringWidth(line), 30);
            });
        });

        it("generates Equals style box", () => {
            const box = generateBox("Equals Test", { style: "Equals", length: 30, indentation: 0 });
            const lines = box.split("\n");
            assert.match(lines[0], /^=+$/);
            assert.match(lines[1], /^\| Equals Test\s+\|$/);
            assert.match(lines[2], /^=+$/);
            lines.forEach((line) => {
                assert.equal(getStringWidth(line), 30);
            });
        });
    });

    describe("tags and headers", () => {
        it("embeds a tag inside the top border", () => {
            const box = generateBox("Task 1", { tag: "TODO", length: 40, indentation: 0 });
            const lines = box.split("\n");
            assert.match(lines[0], /^┌── \[TODO\] ─+┐$/);
            assert.equal(getStringWidth(lines[0]), 40);
        });

        it("handles custom tags properly", () => {
            const box = generateBox("Important Note", { tag: "NOTE", length: 40, indentation: 0 });
            const lines = box.split("\n");
            assert.match(lines[0], /^┌── \[NOTE\] ─+┐$/);
            assert.equal(getStringWidth(lines[0]), 40);
        });
    });

    describe("dividers & regression fixes", () => {
        it("renders a divider with the EXACT same visual width as top and bottom borders", () => {
            const box = generateBox("Header\n--\nContent", { length: 35, indentation: 2 });
            const lines = box.split("\n");
            assert.equal(lines.length, 5);
            assert.match(lines[0], /^  ┌─+┐$/);
            assert.match(lines[1], /^  │ Header\s+│$/);
            assert.match(lines[2], /^  ├─+┤$/);
            assert.match(lines[3], /^  │ Content\s+│$/);
            assert.match(lines[4], /^  └─+┘$/);

            // All lines must have identical width of 35
            lines.forEach((line, idx) => {
                assert.equal(getStringWidth(line), 35, `Line ${idx} width mismatch`);
            });
        });

        it("does NOT falsely convert Hash style lines starting with # into dividers", () => {
            const box = generateBox("Title\n#include <stdio.h>\n#define FOO 1", {
                style: "Hash",
                length: 40,
                indentation: 0,
            });
            const lines = box.split("\n");
            assert.equal(lines.length, 5);
            assert.match(lines[1], /^# Title\s+#$/);
            assert.match(lines[2], /^# #include <stdio.h>\s+#$/);
            assert.match(lines[3], /^# #define FOO 1\s+#$/);
        });

        it("does NOT falsely convert Equals style lines starting with = into dividers", () => {
            const box = generateBox("Title\n= assignment\n== comparison", {
                style: "Equals",
                length: 40,
                indentation: 0,
            });
            const lines = box.split("\n");
            assert.equal(lines.length, 5);
            assert.match(lines[1], /^\| Title\s+\|$/);
            assert.match(lines[2], /^\| = assignment\s+\|$/);
            assert.match(lines[3], /^\| == comparison\s+\|$/);
        });
    });

    describe("word wrapping & edge cases", () => {
        it("does NOT prematurely wrap lines when length equals max content width", () => {
            // length: 40, indent: 0 -> maxContentWidth = 40 - 4 = 36
            const text = "A".repeat(20) + " " + "B".repeat(15); // length 36
            const box = generateBox(text, { length: 40, indentation: 0 });
            const lines = box.split("\n");
            assert.equal(lines.length, 3); // top border, 1 content line, bottom border
            assert.match(lines[1], new RegExp(`^│ ${text} │$`));
        });

        it("wraps long lines across multiple lines at spaces", () => {
            const text = "The quick brown fox jumps over the lazy dog";
            const box = generateBox(text, { length: 25, indentation: 0 });
            const lines = box.split("\n");
            assert.ok(lines.length > 3);
            lines.forEach((line, idx) => {
                assert.equal(getStringWidth(line), 25, `Line ${idx} width mismatch`);
            });
        });

        it("safely wraps unbroken long URLs without infinite loop or crash", () => {
            const url = "https://example.com/very/long/unbroken/path/that/exceeds/the/width/of/the/box";
            const box = generateBox(url, { length: 25, indentation: 0 });
            const lines = box.split("\n");
            assert.ok(lines.length > 3);
            lines.forEach((line, idx) => {
                assert.equal(getStringWidth(line), 25, `Line ${idx} width mismatch`);
            });
        });

        it("handles very small length without throwing RangeError", () => {
            assert.doesNotThrow(() => {
                const box = generateBox("Hello", { length: 4, indentation: 0 });
                assert.ok(box.length > 0);
            });
            assert.doesNotThrow(() => {
                const box = generateBox("Hello", { length: 0, indentation: 0 });
                assert.ok(box.length > 0);
            });
        });

        it("handles empty and null inputs safely", () => {
            assert.doesNotThrow(() => {
                const boxEmpty = generateBox("", { length: 30, indentation: 0 });
                assert.equal(boxEmpty.split("\n").length, 3);
            });
            assert.doesNotThrow(() => {
                const boxNull = generateBox(null, { length: 30, indentation: 0 });
                assert.equal(boxNull.split("\n").length, 3);
            });
        });
    });

    describe("unicode and emoji visual alignment", () => {
        it("aligns boxes containing wide characters and emojis", () => {
            const input = "Status: Online ✅\nTarget: 🚀 Mars\nLocation: 日本東京\nStandard line";
            const box = generateBox(input, { length: 35, indentation: 2 });
            const lines = box.split("\n");
            lines.forEach((line, idx) => {
                assert.equal(getStringWidth(line), 35, `Line ${idx} width mismatch for "${line}"`);
            });
        });
    });

    describe("line ending preservation", () => {
        it("supports CRLF line endings when requested or detected", () => {
            const boxCRLF = generateBox("Line 1\r\nLine 2", { length: 30 });
            assert.ok(boxCRLF.includes("\r\n"));

            const boxLF = generateBox("Line 1\nLine 2", { length: 30 });
            assert.ok(!boxLF.includes("\r\n"));
        });
    });
});

