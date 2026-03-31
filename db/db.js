const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/history.db');

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS healing_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            testNumber INTEGER,
            oldLocator TEXT,
            newLocator TEXT,
            confidence TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;