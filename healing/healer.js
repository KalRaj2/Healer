const { JSDOM } = require('jsdom');

function similarity(a, b) {
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) matches++;
    }
    return matches / Math.max(a.length, b.length);
}

function healLocator(failed, domString) {

    const dom = new JSDOM(domString);
    const elements = [...dom.window.document.querySelectorAll('*')];

    let best = null;
    let score = 0;

    elements.forEach(el => {

        if (el.id) {
            let s = similarity(failed.replace('#',''), el.id);
            if (s > score) {
                score = s;
                best = `#${el.id}`;
            }
        }

        if (el.className) {
            el.className.split(' ').forEach(c => {
                let s = similarity(failed.replace('.',''), c);
                if (s > score) {
                    score = s;
                    best = `.${c}`;
                }
            });
        }

        let text = el.textContent.trim();
        if (text) {
            let s = similarity(failed, text);
            if (s > score) {
                score = s;
                best = `text=${text}`;
            }
        }
    });

    if (score > 0.5) {
        return {
            locator: best,
            confidence: (score * 100).toFixed(2)
        };
    }

    return null;
}

module.exports = { healLocator };