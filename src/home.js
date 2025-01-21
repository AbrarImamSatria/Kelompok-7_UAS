const db = require('../database/db');

class HomeService {
    async getTopContent() {
        const queries = [
            'SELECT * FROM film WHERE kategori = "Film" ORDER BY id DESC LIMIT 10',
            'SELECT * FROM film WHERE kategori = "Acara TV" ORDER BY id DESC LIMIT 10',
            'SELECT * FROM film ORDER BY id DESC'
        ];

        try {
            const results = await Promise.all(queries.map(query => {
                return new Promise((resolve, reject) => {
                    db.query(query, (err, results) => {
                        if (err) reject(err);
                        resolve(results);
                    });
                });
            }));

            return {
                topFilms: results[0],
                topTvShows: results[1],
                allContent: results[2]
            };
        } catch (error) {
            throw new Error('Failed to fetch content: ' + error.message);
        }
    }

    async getContentById(id) {
        try {
            const content = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM film WHERE id = ?', [id], (err, results) => {
                    if (err) reject(err);
                    resolve(results[0]);
                });
            });

            if (!content) {
                throw new Error('Content not found');
            }

            const relatedContent = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM film WHERE id != ?', [id], (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            return {
                mainContent: content,
                relatedContent: relatedContent
            };
        } catch (error) {
            throw new Error('Failed to fetch content: ' + error.message);
        }
    }
}

module.exports = HomeService;