const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Route untuk menampilkan halaman utama
router.get('/', (req, res) => {
    const topFilmsQuery = 'SELECT * FROM films WHERE category = "top" LIMIT 10';
    const topTvShowsQuery = 'SELECT * FROM tv_shows WHERE category = "top" LIMIT 10';
    const filmsQuery = 'SELECT * FROM films';

    Promise.all([
        db.query(topFilmsQuery),
        db.query(topTvShowsQuery),
        db.query(filmsQuery),
    ]).then(([topFilms, topTvShows, films]) => {
        res.render('index', {
            topFilms: topFilms,
            topTvShows: topTvShows,
            films: films,
        });
    }).catch((err) => {
        res.status(500).send('Error fetching data');
    });
});

module.exports = router;
