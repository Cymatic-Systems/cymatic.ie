const target = document.getElementById("manta-tagline");
const cursor = document.getElementById("manta-tagline-cursor");
const options = [
    "EFFORTLESS ASSET MANAGEMENT",
    "UNPARALLELED SECURITY",
    "SEAMLESS COLLABORATION",
    "UNLEASH YOUR CREATIVITY",
    "STREAMLINE YOUR WORKFLOW",
    "SIMPLIFY, SECURE, SCALE",
    "BOOST YOUR PRODUCTIVITY",
    "STREAMLINE YOUR ASSETS",
    "SECURITY MEETS EFFICIENCY"
]
const textWidth = 17;
const typeDelayMs = 50;
const changeIntervalMs = 5000;
const animateCursorIntervalMs = 750;

let idx = Math.floor(Math.random() * options.length);
let lines = [];
let currentLine = 0;
let currentIndex = 0;

function wrapWords(text, maxLineLength) {
    return text.split(" ").reduce((lines, word) => {
        if (lines.length == 0) {
            return [word];
        } else {
            let i = lines.length - 1;
            let curlen = lines[i].length;
            if ((curlen + word.length + 1) < maxLineLength) {
                lines[i] = lines[i] + " " + word;
            } else {
                lines.push(word);
            }
            return lines;
        }
    }, []);
}

function changeText() {
    idx = (idx + 1) % options.length;
    lines = wrapWords(options[idx], textWidth);
    currentLine = 0;
    currentIndex = 0;

    setTimeout(removeChar, typeDelayMs);
}

function removeChar() {
    if (target.textContent.length <= 0) {
        setTimeout(typeChar, typeDelayMs);
    } else {
        if (target.innerHTML.endsWith("<br />")) {
            target.innerHTML = target.innerHTML.substring(0, target.innerHTML.length - 6);
        } else {
            target.innerHTML = target.innerHTML.substring(0, target.innerHTML.length - 1);
        }
        setTimeout(removeChar, typeDelayMs);
    }
}

function typeChar() {
    if (lines.length <= currentLine) {
        setTimeout(changeText, changeIntervalMs);
        return;
    }

    let nextChar = lines[currentLine][currentIndex];
    if (nextChar === undefined) {
        if (lines.length > (currentLine + 1)) {
            target.innerHTML = target.innerHTML + "<br />";
        }
        currentLine++;
        currentIndex = 0;
    } else if (nextChar !== undefined) {
        target.innerHTML = target.innerHTML + nextChar;
        currentIndex++;
    }
    setTimeout(typeChar, typeDelayMs);
}

function animateCursor() {
    cursor.textContent = cursor.textContent == "_" ? " " : "_";
}

target.textContent = "";
changeText();
setInterval(animateCursor, animateCursorIntervalMs);
