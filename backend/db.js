const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./backend/users.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) =>{
    if (err){
        console.error('Error opening database:', err);
    } else {
        console.error('Connected to SQLite database');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS users(username,password,theme,list)`, (err) => {
    if (err) console.error(err.message);
});

module.exports = db;