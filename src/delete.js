const express = require('express');
const db = require('../database/db');
const router = express.Router();

router.delete('/:id', (req, res) => {
    db.query('DELETE FROM film WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Film not found');
        res.status(204).send();
    });
});

module.exports = router;