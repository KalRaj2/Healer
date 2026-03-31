// db/db.js
const fs = require('fs');
const dbFile = './db/history.json';

// Ensure history.json exists
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify([]));

function saveHistory(step, locator, status) {
    const history = JSON.parse(fs.readFileSync(dbFile));
    history.push({ step, locator, status, timestamp: new Date().toISOString() });
    fs.writeFileSync(dbFile, JSON.stringify(history, null, 2));
}

function getHistory() {
    return JSON.parse(fs.readFileSync(dbFile));
}

module.exports = { saveHistory, getHistory };