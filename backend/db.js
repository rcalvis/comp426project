const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./users.db', (err) =>{
    if (err){
        console.error('Error opening database:', err);
    } else {
        console.error('Connected to SQLite database');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS users (
    username TEXT UNIQUE,
    password TEXT,
    theme TEXT,
    list TEXT NOT NULL DEFAULT '[]'
    )`);

module.exports = db;