const PRESETS = {
    Default: {
        tl: "┌",
        tm: "─",
        tr: "┐",
        l: "│",
        r: "│",
        bl: "└",
        bm: "─",
        br: "┘",
        dl: "├",
        dm: "─",
        dr: "┤",
    },
    Hash: {
        tl: "#",
        tm: "#",
        tr: "#",
        l: "#",
        r: "#",
        bl: "#",
        bm: "#",
        br: "#",
        dl: "#",
        dm: "#",
        dr: "#",
    },
    Equals: {
        tl: "=",
        tm: "=",
        tr: "=",
        l: "|",
        r: "|",
        bl: "=",
        bm: "=",
        br: "=",
        dl: "=",
        dm: "=",
        dr: "=",
    },
    Double: {
        tl: "╔",
        tm: "═",
        tr: "╗",
        l: "║",
        r: "║",
        bl: "╚",
        bm: "═",
        br: "╝",
        dl: "╠",
        dm: "═",
        dr: "╣",
    },
};

/**
 * Calculates visual display column width of a string in monospace terminals/editors,
 * properly accounting for ANSI escapes, wide East Asian characters, and emojis.
 */
function getStringWidth(str) {
    if (!str) return 0;
    const cleanStr = str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
    let width = 0;
    for (const char of cleanStr) {
        const code = char.codePointAt(0);
        // Zero-width control characters, combining marks, variation selectors
        if (
            (code >= 0x00 && code <= 0x1f) ||
            (code >= 0x7f && code <= 0x9f) ||
            (code >= 0x0300 && code <= 0x036f) ||
            (code >= 0xfe00 && code <= 0xfe0f) ||
            (code >= 0x200b && code <= 0x200f) ||
            (code >= 0xe0100 && code <= 0xe01ef)
        ) {
            continue;
        }
        // Wide East Asian characters and emojis
        if (
            (code >= 0x1100 && code <= 0x115f) ||
            (code >= 0x2329 && code <= 0x232a) ||
            (code >= 0x2e80 && code <= 0x303e) ||
            (code >= 0x3040 && code <= 0x3247) ||
            (code >= 0x3250 && code <= 0x4dbf) ||
            (code >= 0x4e00 && code <= 0xa4cf) ||
            (code >= 0xac00 && code <= 0xd7a3) ||
            (code >= 0xf900 && code <= 0xfaff) ||
            (code >= 0xfe10 && code <= 0xfe19) ||
            (code >= 0xfe30 && code <= 0xfe6b) ||
            (code >= 0xff01 && code <= 0xff60) ||
            (code >= 0xffe0 && code <= 0xffe6) ||
            (code >= 0x1f300 && code <= 0x1f64f) ||
            (code >= 0x1f680 && code <= 0x1f6ff) ||
            (code >= 0x1f900 && code <= 0x1f9ff) ||
            (code >= 0x2600 && code <= 0x26ff) ||
            (code >= 0x2700 && code <= 0x27bf)
        ) {
            width += 2;
        } else {
            width += 1;
        }
    }
    return width;
}

/**
 * Wraps a single line of text so that its visual width does not exceed maxContentWidth.
 */
function wrapLine(value, maxContentWidth) {
    if (getStringWidth(value) <= maxContentWidth) {
        return [value];
    }
    const lines = [];
    while (value.length > 0) {
        if (getStringWidth(value) <= maxContentWidth) {
            lines.push(value);
            break;
        }

        let currentWidth = 0;
        let lastSpaceIndex = -1;
        let charIndex = 0;

        for (const char of value) {
            const charWidth = getStringWidth(char);
            if (currentWidth + charWidth > maxContentWidth) {
                break;
            }
            currentWidth += charWidth;
            charIndex += char.length; // Handles surrogate pairs correctly
            if (char === " ") {
                lastSpaceIndex = charIndex - 1;
            }
        }

        let splitIndex = lastSpaceIndex > 0 ? lastSpaceIndex : charIndex;
        if (splitIndex <= 0) {
            // Guarantee forward progress to prevent infinite loops
            const firstChar = value[Symbol.iterator]().next().value;
            splitIndex = firstChar ? firstChar.length : 1;
        }

        lines.push(value.substring(0, splitIndex).trimEnd());
        value = value.substring(splitIndex).trimStart();
    }
    return lines;
}

/**
 * Parses raw text into structured items ({ type: 'text', content } or { type: 'divider' }).
 */
function parseLines(text, maxContentWidth, settings) {
    const rawLines = (text !== undefined && text !== null ? String(text) : "")
        .replace(/\t/g, "  ")
        .split(/\r?\n/);
    const parsedItems = [];

    for (let i = 0; i < rawLines.length; i++) {
        const rawLine = rawLines[i];
        if (rawLine.trim() === "--") {
            parsedItems.push({ type: "divider" });
            continue;
        }

        const wrapped = wrapLine(rawLine, maxContentWidth);
        for (const line of wrapped) {
            parsedItems.push({ type: "text", content: line });
        }
    }

    return parsedItems;
}

/**
 * Generates an ASCII box around the given text.
 */
function generateBox(text, options = {}) {
    const style = options.style || "Default";
    const indentAmount =
        Number.isInteger(options.indentation) && options.indentation >= 0
            ? options.indentation
            : 2;
    const requestedLength =
        Number.isInteger(options.length) && options.length > 0
            ? options.length
            : 80;
    const tag = options.tag ? String(options.tag).trim() : null;
    const eol =
        options.eol ||
        (typeof text === "string" && text.includes("\r\n") ? "\r\n" : "\n");

    let chars = {};
    if (style !== "Custom" && PRESETS[style]) {
        chars = PRESETS[style];
    } else {
        chars = {
            tl: options.tl || "┌",
            tm: options.tm || "─",
            tr: options.tr || "┐",
            l: options.l || "│",
            r: options.r || "│",
            bl: options.bl || "└",
            bm: options.bm || "─",
            br: options.br || "┘",
            dl: options.dl || "├",
            dm: options.dm || "─",
            dr: options.dr || "┤",
        };
    }

    const leftBorderWidth = getStringWidth(chars.l || "│");
    const rightBorderWidth = getStringWidth(chars.r || "│");
    const minContentWidth = 1;
    const minRequiredLength =
        indentAmount + leftBorderWidth + rightBorderWidth + 2 + minContentWidth;

    const totalLength = Math.max(requestedLength, minRequiredLength);
    const lineLength = totalLength - indentAmount;
    const maxContentWidth = Math.max(
        1,
        lineLength - leftBorderWidth - rightBorderWidth - 2,
    );

    const items = parseLines(text, maxContentWidth, chars);
    const indent = " ".repeat(indentAmount);

    const topInnerWidth = Math.max(
        0,
        lineLength -
            getStringWidth(chars.tl || "") -
            getStringWidth(chars.tr || ""),
    );
    const bottomInnerWidth = Math.max(
        0,
        lineLength -
            getStringWidth(chars.bl || "") -
            getStringWidth(chars.br || ""),
    );
    const dividerInnerWidth = Math.max(
        0,
        lineLength -
            getStringWidth(chars.dl || "") -
            getStringWidth(chars.dr || ""),
    );

    let topBorderInner = (chars.tm || "─").repeat(topInnerWidth);
    if (tag) {
        const tagStr = ` [${tag}] `;
        const tagVisualWidth = getStringWidth(tagStr);
        if (topInnerWidth >= tagVisualWidth + 4) {
            topBorderInner =
                (chars.tm || "─").repeat(2) +
                tagStr +
                (chars.tm || "─").repeat(topInnerWidth - tagVisualWidth - 2);
        }
    }

    const topBorder =
        indent + (chars.tl || "") + topBorderInner + (chars.tr || "");
    const bottomBorder =
        indent +
        (chars.bl || "") +
        (chars.bm || "─").repeat(bottomInnerWidth) +
        (chars.br || "");
    const dividerLine =
        indent +
        (chars.dl || "") +
        (chars.dm || "─").repeat(dividerInnerWidth) +
        (chars.dr || "");

    const bodyLines = items.map((item) => {
        if (item.type === "divider") {
            return dividerLine;
        }
        const visualWidth = getStringWidth(item.content);
        const padding = Math.max(0, maxContentWidth - visualWidth);
        return (
            indent +
            (chars.l || "") +
            " " +
            item.content +
            " ".repeat(padding) +
            " " +
            (chars.r || "")
        );
    });

    return [topBorder, ...bodyLines, bottomBorder].join(eol);
}

module.exports = {
    PRESETS,
    generateBox,
    getStringWidth,
    parseLines,
};
