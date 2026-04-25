const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const DB_FILE = './database.json';

app.use(cors());
app.use(express.json()); // This allows the server to read the "Compose" data

// Load existing data or start empty
let mailboxes = fs.existsSync(DB_FILE) 
    ? JSON.parse(fs.readFileSync(DB_FILE)) 
    : {};

function saveDB() {
    fs.writeFileSync(DB_FILE, JSON.stringify(mailboxes, null, 2));
}

// 1. Get Inbox (Existing)
app.get('/inbox', (req, res) => {
    const email = req.query.user;
    if (!email) return res.json([]);
    
    if (!mailboxes[email]) {
        mailboxes[email] = [
            { from: "System", subject: "Welcome to bmail", body: `Your account ${email} is ready.` }
        ];
        saveDB();
    }
    res.json(mailboxes[email]);
});

// 2. Official Send Route (New!)
app.post('/send', (req, res) => {
    const { from, to, subject, body } = req.body;

    if (!to || !from) return res.status(400).json({ error: "Missing fields" });

    // If the recipient doesn't have an inbox yet, make one
    if (!mailboxes[to]) {
        mailboxes[to] = [];
    }

    // Add the email to their list
    mailboxes[to].push({
        from: from,
        subject: subject || "(No Subject)",
        body: body || "",
        date: new Date().toLocaleString()
    });

    saveDB();
    console.log(`Message delivered: ${from} -> ${to}`);
    res.json({ success: true });
});

// 3. Fake Send Route (Keeping your old testing route)
app.get('/send-fake', (req, res) => {
    const { to, from, msg } = req.query;
    if (mailboxes[to]) {
        mailboxes[to].push({ from, subject: "New Message", body: msg });
        saveDB();
        res.send("Email delivered!");
    } else {
        res.status(404).send("User not found");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`📧 bmail Engine Active on Port ${PORT}`);
});