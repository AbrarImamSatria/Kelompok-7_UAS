const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Create a new film
router.post('/films', (req, res) => {
    const { name, img_url } = req.body;
    if (!name || !img_url) {
        return res.status(400).json({ error: 'Name and img_url are required' });
    }
    const query = 'INSERT INTO films (name, img_url) VALUES (?, ?)';
    db.query(query, [name, img_url])
        .then(() => res.status(201).json({ message: 'Film added successfully' }))
        .catch(() => res.status(500).json({ error: 'Error adding film' }));
});

// Read all films
router.get('/films', (req, res) => {
    const query = 'SELECT * FROM films';
    db.query(query)
        .then((films) => res.status(200).json(films))
        .catch(() => res.status(500).json({ error: 'Error fetching films' }));
});

// Update a film
router.put('/films/:id', (req, res) => {
    const { id } = req.params;
    const { name, img_url } = req.body;
    if (!name || !img_url) {
        return res.status(400).json({ error: 'Name and img_url are required' });
    }
    const query = 'UPDATE films SET name = ?, img_url = ? WHERE id = ?';
    db.query(query, [name, img_url, id])
        .then(() => res.status(200).json({ message: 'Film updated successfully' }))
        .catch(() => res.status(500).json({ error: 'Error updating film' }));
});

// Delete a film
router.delete('/films/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM films WHERE id = ?';
    db.query(query, [id])
        .then(() => res.status(200).json({ message: 'Film deleted successfully' }))
        .catch(() => res.status(500).json({ error: 'Error deleting film' }));
});

module.exports = router;
