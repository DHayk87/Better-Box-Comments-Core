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

function parseLines(text, maxLineLength, settings) {
    let rawLines = text.replace(/\t/g, "  ").split(/\r?\n/);
    let masterArray = [];

    const len = maxLineLength - 2 - (settings.l || "").length - (settings.r || "").length;

    for (let i = 0; i < rawLines.length; i++) {
        let value = rawLines[i];
        let lines = [];

        if (value.length >= len) {
            while (value.length) {
                let indexOf = value.substring(0, len).lastIndexOf(" ");
                if (indexOf === -1 || indexOf === 0) {
                    indexOf = len;
                }
                lines.push(value.substring(0, indexOf));
                value = value.substring(indexOf).trim();
            }
        } else {
            lines = [value];
        }
        masterArray = masterArray.concat(lines);
    }

    masterArray.forEach((line, index) => {
        if (line.trim() === "--") {
            masterArray[index] = (settings.dm || "─").repeat(maxLineLength - 4);
        } else {
            const padding = Math.max(0, maxLineLength - line.length - 4);
            masterArray[index] = line + " ".repeat(padding);
        }
    });

    return masterArray;
}

function generateBox(text, options = {}) {
    const style = options.style || "Default";
    const indentAmount = options.indentation !== undefined ? options.indentation : 2;
    const totalLength = options.length || 80;
    const tag = options.tag || null;

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

    const indent = " ".repeat(indentAmount);
    const lineLength = totalLength - indentAmount;
    const lines = parseLines(text, lineLength, chars);

    let replacementText = lines
        .map((line) => {
            if (line.startsWith(chars.dm)) {
                return indent + chars.dl + line + chars.dr;
            }
            return indent + chars.l + " " + line + " " + chars.r;
        })
        .join("\n");

    let topBorder = chars.tm.repeat(lineLength - 2);
    if (tag) {
        const tagStr = ` [${tag}] `;
        if (topBorder.length > tagStr.length + 4) {
            topBorder =
                chars.tm.repeat(2) +
                tagStr +
                chars.tm.repeat(topBorder.length - tagStr.length - 2);
        }
    }

    const boxText = [
        indent + chars.tl + topBorder + chars.tr,
        replacementText,
        indent + chars.bl + chars.bm.repeat(lineLength - 2) + chars.br,
    ].join("\n");

    return boxText;
}

module.exports = {
    PRESETS,
    generateBox,
};
