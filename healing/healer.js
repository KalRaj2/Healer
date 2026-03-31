const { JSDOM } = require('jsdom');

// 🔥 Levenshtein Distance
function levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, () => []);

    for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// 🔥 similarity score (0 → 1)
function similarity(a, b) {
    const distance = levenshtein(a, b);
    return 1 - distance / Math.max(a.length, b.length);
}

// 🔥 extract DOM elements
function getElements(domString) {
    const dom = new JSDOM(domString);
    return [...dom.window.document.querySelectorAll('*')];
}

// 🔥 main healing
function healLocator(failedLocator, domString) {

    const elements = getElements(domString);

    let bestMatch = null;
    let bestScore = 0;

    elements.forEach(el => {

        // 🔹 PRIORITY 1: data-testid (industry standard)
        const testId = el.getAttribute('data-testid');
        if (testId) {
            const score = similarity(failedLocator.toLowerCase(), testId.toLowerCase()) * 1.5;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = `[data-testid="${testId}"]`;
            }
        }

        // 🔹 PRIORITY 2: ID
        if (el.id) {
            const score = similarity(
                failedLocator.replace('#', '').toLowerCase(),
                el.id.toLowerCase()
            ) * 1.3;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = `#${el.id}`;
            }
        }

        // 🔹 PRIORITY 3: class
        if (el.className) {
            el.className.split(' ').forEach(cls => {
                const score = similarity(
                    failedLocator.replace('.', '').toLowerCase(),
                    cls.toLowerCase()
                );

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = `.${cls}`;
                }
            });
        }

        // 🔹 PRIORITY 4: text
        const text = el.textContent.trim();
        if (text) {
            const score = similarity(failedLocator.toLowerCase(), text.toLowerCase()) * 0.8;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = `text=${text}`;
            }
        }

    });

    if (bestScore > 0.5) {
        return {
            locator: bestMatch,
            confidence: (bestScore * 100).toFixed(2)
        };
    }

    return null;
}

module.exports = { healLocator };