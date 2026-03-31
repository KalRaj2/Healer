const express = require('express');
const fs = require('fs');

const { healLocator } = require('./healing/healer');
const { analyzeFailure } = require('./analyzer/analyzer');
const db = require('./db/db');
const { createPR } = require('./github/pr');
const { generateToken, verifyToken } = require('./auth/auth');

const app = express();

app.use(express.static('public'));
app.use(express.json());

/* =========================
   🔐 AUTH (SaaS Ready)
========================= */
app.post('/login', (req, res) => {
    const { username } = req.body;

    // simple login (can expand later)
    const token = generateToken({ username });

    res.json({ token });
});

/* =========================
   🚀 RUN TESTS (PROTECTED)
========================= */
app.get('/run-test', verifyToken, (req, res) => {

    // Load test cases
    const tests = JSON.parse(fs.readFileSync('./tests/test.json'));

    // Simulated DOM
    const dom = `
        <div>
            <button id="loginBtn" class="btn primary" data-testid="login-button">Login</button>
            <button id="signupBtn" class="btn secondary">Sign Up</button>
            <input id="usernameField" class="input" />
        </div>
    `;

    let results = [];
    let prSuggestions = [];

    tests.forEach((test, index) => {

        // ✅ PASS
        if (dom.includes(test.locator)) {

            results.push({
                test: index + 1,
                status: "PASS"
            });

        } else {

            const oldLocator = test.locator;

            // 🔥 Advanced healer
            const healResult = healLocator(test.locator, dom);

            if (healResult) {

                const newLocator = healResult.locator;
                const confidence = healResult.confidence;

                // Update test
                test.locator = newLocator;

                // Save history in DB
                db.run(
                    `INSERT INTO healing_history 
                    (testNumber, oldLocator, newLocator, confidence)
                    VALUES (?, ?, ?, ?)`,
                    [index + 1, oldLocator, newLocator, confidence]
                );

                results.push({
                    test: index + 1,
                    status: "HEALED",
                    old: oldLocator,
                    new: newLocator,
                    confidence: confidence + "%"
                });

                prSuggestions.push(`
Test ${index + 1}
Old Locator: ${oldLocator}
New Locator: ${newLocator}
Confidence: ${confidence}%
`);

            } else {

                // ❌ FAIL
                const reason = analyzeFailure(test.locator, dom);

                results.push({
                    test: index + 1,
                    status: "FAIL",
                    reason: reason
                });
            }
        }
    });

    // Save updated tests
    fs.writeFileSync('./tests/test.json', JSON.stringify(tests, null, 2));

    // Create PR if healing happened
    if (prSuggestions.length > 0) {
        const content = prSuggestions.join('\n----------------\n');

        // Save locally
        fs.writeFileSync('./healing/pr.txt', content);

        // 🔗 Send to GitHub
        createPR(content)
            .then(() => console.log("✅ PR Created"))
            .catch(err => console.log("❌ PR Error:", err.message));
    }

    res.json(results);
});

/* =========================
   📊 VIEW HISTORY (OPTIONAL API)
========================= */
app.get('/history', verifyToken, (req, res) => {

    db.all("SELECT * FROM healing_history ORDER BY timestamp DESC", [], (err, rows) => {
        if (err) {
            return res.json({ error: err.message });
        }
        res.json(rows);
    });
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});