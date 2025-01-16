const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Route untuk menambah admin
router.post('/admin', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const query = 'INSERT INTO admins (username, password) VALUES (?, ?)';
    db.query(query, [username, password])
        .then(() => {
            res.status(201).json({ message: 'Admin added successfully' });
        })
        .catch((err) => {
            res.status(500).json({ error: 'Error adding admin' });
        });
});

module.exports = router;
