const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Update film details
router.put('/editfilm/:id', (req, res) => {
    const { id } = req.params;
    const { name, img_url } = req.body;

    if (!name || !img_url) {
        return res.status(400).json({ error: 'Name and img_url are required' });
    }

    const query = 'UPDATE films SET name = ?, img_url = ? WHERE id = ?';
    db.query(query, [name, img_url, id])
        .then((result) => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Film not found' });
            }
            res.status(200).json({ message: 'Film updated successfully' });
        })
        .catch(() => res.status(500).json({ error: 'Error updating film' }));
});

module.exports = router;