const express = require('express');
const router = express.Router();
const db = require('../database/db');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get all films
router.get('/', (req, res) => {
    db.query('SELECT * FROM film', (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(results);
    });
});

// Add new film
router.post('/', upload.single('image'), (req, res) => {
    const { nama_film, deskripsi, url_yt, kategori } = req.body; // Ambil kategori dari body
    const img_url = req.file ? `/uploads/${req.file.filename}` : null;

    db.query(
        'INSERT INTO film (nama_film, deskripsi, url_yt, img_url, kategori) VALUES (?, ?, ?, ?, ?)', // Tambahkan kategori ke query
        [nama_film, deskripsi, url_yt, img_url, kategori],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            res.status(201).json({
                id: results.insertId,
                nama_film,
                deskripsi,
                url_yt,
                img_url,
                kategori // Sertakan kategori dalam respons
            });
        }
    );
});

// Update film
router.put('/:id', upload.single('image'), (req, res) => {
    const { nama_film, deskripsi, url_yt, kategori } = req.body; // Ambil kategori dari body
    const id = req.params.id;
    
    if (req.file) {
        // If new image is uploaded
        const img_url = `/uploads/${req.file.filename}`;
        db.query(
            'UPDATE film SET nama_film = ?, deskripsi = ?, url_yt = ?, img_url = ?, kategori = ? WHERE id = ?', // Tambahkan kategori ke query
            [nama_film, deskripsi, url_yt, img_url, kategori, id],
            handleUpdateResponse(res)
        );
    } else {
        // If no new image
        db.query(
            'UPDATE film SET nama_film = ?, deskripsi = ?, url_yt = ?, kategori = ? WHERE id = ?', // Tambahkan kategori ke query
            [nama_film, deskripsi, url_yt, kategori, id],
            handleUpdateResponse(res)
        );
    }
});

function handleUpdateResponse(res) {
    return (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Film not found');
        res.json({ message: 'Film updated successfully' });
    };
}

// Delete film
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM film WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Film not found');
        res.status(204).send();
    });
});

module.exports = router;
