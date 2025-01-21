const request = require('supertest');
const express = require('express');
const tambahFilmRouter = require('../src/tambahfilm');
const db = require('../database/db');

const app = express();
app.use(express.json());
app.use('/', tambahFilmRouter);

// Mocking database
jest.mock('../database/db', () => ({
    query: jest.fn(),
}));

describe('Tambah Film API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test: Tambah film berhasil
    it('should successfully add a new film', (done) => {
        const newFilm = { name: 'Film A', img_url: 'url1' };

        // Mocking db.query
        db.query.mockImplementation(() => Promise.resolve());

        request(app)
            .post('/tambahfilm')
            .send(newFilm)
            .expect(201)
            .expect((res) => {
                expect(res.body.message).toBe('Film added successfully');
            })
            .end(done);
    });

    // Test: Validasi input (name dan img_url wajib ada)
    it('should return 400 if name or img_url is missing', (done) => {
        const invalidFilm = { name: 'Film A' }; // img_url missing

        request(app)
            .post('/tambahfilm')
            .send(invalidFilm)
            .expect(400)
            .expect((res) => {
                expect(res.body.error).toBe('Name and img_url are required');
            })
            .end(done);
    });

    // Test: Error dari database
    it('should return 500 if database query fails', (done) => {
        const newFilm = { name: 'Film A', img_url: 'url1' };

        // Mocking db.query to simulate error
        db.query.mockImplementation(() => Promise.reject(new Error('Database error')));

        request(app)
            .post('/tambahfilm')
            .send(newFilm)
            .expect(500)
            .expect((res) => {
                expect(res.body.error).toBe('Error adding film');
            })
            .end(done);
    });
});