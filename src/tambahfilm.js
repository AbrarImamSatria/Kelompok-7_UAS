const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Tambah film
router.post('/tambahfilm', (req, res) => {
    const { name, img_url } = req.body;

    // Validasi input
    if (!name || !img_url) {
        return res.status(400).json({ error: 'Name and img_url are required' });
    }

    // Query untuk menambahkan film ke database
    const query = 'INSERT INTO films (name, img_url) VALUES (?, ?)';
    db.query(query, [name, img_url])
        .then(() => res.status(201).json({ message: 'Film added successfully' }))
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Error adding film' });
        });
});

module.exports = router;