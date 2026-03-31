// server.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // ignore SSL issues locally

const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { healLocator } = require('./healing/healer');
const { analyzeFailure } = require('./analyzer/analyzer');
const { saveHistory, getHistory } = require('./db/db');
const { createPR } = require('./github/github');

const app = express();
const PORT = process.env.PORT || 4050;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Run test
app.get('/run-test', async (req, res) => {
    const testFile = './tests/test.json';
    if (!fs.existsSync(testFile)) return res.status(404).json({ error: "test.json missing" });

    const tests = JSON.parse(fs.readFileSync(testFile));

    // For simplicity, we just take first test
    const test = tests[0];

    // Mock DOM
    const dom = `
    <div>
        <button id="loginBtn" class="btn primary">Login</button>
        <button id="signupBtn" class="btn secondary">Sign Up</button>
        <input id="usernameField" class="input" />
    </div>
    `;

    if (dom.includes(test.locator)) {
        res.json({ status: "PASS" });
        saveHistory(test.step, test.locator, "PASS");
    } else {
        const healed = healLocator(test.locator, dom);

        if (healed) {
            // Update test.json
            test.locator = healed;
            fs.writeFileSync(testFile, JSON.stringify(tests, null, 2));

            // Save history
            saveHistory(test.step, healed, "HEALED");

            // Create GitHub PR
            await createPR(test.locator, healed);

            res.json({
                status: "HEALED & UPDATED",
                newLocator: healed
            });
        } else {
            const reason = analyzeFailure(test.locator, dom);
            saveHistory(test.step, test.locator, "FAIL");
            res.json({ status: "FAIL", reason });
        }
    }
});

// Get history
app.get('/history', (req, res) => {
    const history = getHistory();
    res.json(history);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));