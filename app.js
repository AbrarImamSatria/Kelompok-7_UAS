const express = require('express');
const app = express();

const filmRoutes = require('./routes/filmRoutes.js');
require('dotenv').config();
const port = process.env.PORT;
const db = require('./database/db');
const expressLayouts = require('express-ejs-layouts')

const session = require('express-session');
// Mengimpor middleware
const authRoutes = require('./routes/authRoutes');
const { isAuthenticated } = require('./middlewares/middleware.js');

app.use(expressLayouts);
app.use(express.json());
app.use('/uploads', express.static('uploads'));


app.use('/films', filmRoutes);
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Konfigurasi express-session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Gunakan secret key yang aman
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set ke true jika menggunakan HTTPS
}));

app.use('/', authRoutes);

app.get('/', (req, res) => {
    const queries = [
        'SELECT * FROM film WHERE kategori = "Film" ORDER BY id DESC LIMIT 10',
        'SELECT * FROM film WHERE kategori = "Acara TV" ORDER BY id DESC LIMIT 10',
        'SELECT * FROM film ORDER BY id DESC'
    ];

    Promise.all(queries.map(query => {
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    }))
    .then(([topFilms, topTvShows, allFilms]) => {
        res.render('index', {
            layout: 'layouts/main-layout',
            currentPage: 'home',
            showNavbar: true,
            topFilms,
            topTvShows,
            films: allFilms
        });
    })
    .catch(err => {
        res.status(500).send('Internal Server Error');
    });
});


app.get('/dashboard-admin', isAuthenticated, (req, res) => {
    db.query('SELECT * FROM film', (err, films) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.render('dashboard', {
            layout: 'layouts/main-layout',
            films: films,
            currentPage: 'film',
            showNavbar: false
        });
    });
});

app.get('/film/:id', (req, res) => {
    const filmId = req.params.id;
    db.query('SELECT * FROM film WHERE id = ?', [filmId], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.length === 0) return res.status(404).send('Film not found');
        
        const film = results[0]; // Ambil film pertama
        db.query('SELECT * FROM film WHERE id != ?', [filmId], (err, relatedFilms) => {
            if (err) return res.status(500).send('Internal Server Error');
            res.render('film', {
                layout: 'layouts/main-layout',
                film: film, // Kirim data film ke view
                films: relatedFilms, // Kirim film terkait
                currentPage: 'film',
                showNavbar: true
            });
        });
    });
});

app.use(express.static("public"));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

