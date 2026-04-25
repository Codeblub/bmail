const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // This allows your index.html to talk to this server

// This is your "Database"
// We use the names from your Ez-login system here
let mailboxes = {
    "Codeblub": [
        { from: "System", subject: "Welcome to bmail", body: "Your engine is officially running on Codespaces!" },
        { from: "Ez-login", subject: "Sync Successful", body: "Your account is now linked to your custom mail domain." }
    ],
    "Guest": [
        { from: "System", subject: "Guest Mode", body: "Please log in to see your private messages." }
    ]
};

// Route to get emails for a specific user
app.get('/inbox', (req, res) => {
    const user = req.query.user;
    console.log(`Checking inbox for: ${user}`);
    
    // If the user exists in our "database", send their mail. 
    // Otherwise, send an empty list.
    const userMail = mailboxes[user] || [];
    res.json(userMail);
});

// Route to "Receive" a fake email (for testing)
// Usage: /send-fake?to=Codeblub&from=Friend&msg=Hello!
app.get('/send-fake', (req, res) => {
    const { to, from, msg } = req.query;
    if (mailboxes[to]) {
        mailboxes[to].push({ from, subject: "New Message", body: msg });
        res.send("Email delivered!");
    } else {
        res.status(404).send("User not found");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
    📧 bmail Engine Active
    -----------------------
    Listening on Port: ${PORT}
    Ready to serve Ez-login users
    `);
});