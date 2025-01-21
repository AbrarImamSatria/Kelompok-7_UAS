const request = require('supertest');
const express = require('express');
const db = require('../database/db'); // Koneksi database asli
const filmRoutes = require('../routes/filmRoutes');

const app = express();
app.use(express.json());
app.use('/film', filmRoutes);

describe('DELETE /film/:id (real database with specific ID)', () => {
    const existingFilmId = 24; // ID film yang ingin diuji
    const nonExistentFilmId = 999999; // ID yang tidak ada di database

    test('should delete film with ID 24 successfully', async () => {
        const response = await request(app).delete(`/film/${existingFilmId}`);
        expect(response.status).toBe(204);

        // Pastikan film dihapus dari database
        const [results] = await db.promise().query('SELECT * FROM film WHERE id = ?', [existingFilmId]);
        expect(results.length).toBe(0); // Film harus sudah terhapus
    });

    test('should return 404 when film not found', async () => {
        const response = await request(app).delete(`/film/${nonExistentFilmId}`);
        expect(response.status).toBe(404);
        expect(response.text).toBe('Film not found');
    });
});
