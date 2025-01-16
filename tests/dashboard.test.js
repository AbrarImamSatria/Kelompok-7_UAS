const request = require('supertest');
const express = require('express');
const dashboardRouter = require('../src/dashboard');
const db = require('../database/db');

const app = express();
app.use(express.json());
app.use('/', dashboardRouter);

// Mocking the database
jest.mock('../database/db', () => ({
    query: jest.fn(),
}));

describe('CRUD operations for films', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Read all films
    it('should fetch all films', (done) => {
        const mockFilms = [
            { id: 1, name: 'Film A', img_url: 'url1' },
            { id: 2, name: 'Film B', img_url: 'url2' },
        ];
        db.query.mockImplementation(() => Promise.resolve(mockFilms));

        request(app)
            .get('/films')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body).toEqual(mockFilms);
            })
            .end(done);
    });

    // Create a new film
    it('should create a new film', (done) => {
        const newFilm = { name: 'Film C', img_url: 'url3' };
        db.query.mockImplementation(() => Promise.resolve());

        request(app)
            .post('/films')
            .send(newFilm)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.message).toBe('Film added successfully');
            })
            .end(done);
    });

    // Update a film
    it('should update an existing film', (done) => {
        const updatedFilm = { name: 'Updated Film', img_url: 'updated_url' };
        db.query.mockImplementation(() => Promise.resolve());

        request(app)
            .put('/films/1')
            .send(updatedFilm)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.message).toBe('Film updated successfully');
            })
            .end(done);
    });

    // Delete a film
    it('should delete a film', (done) => {
        db.query.mockImplementation(() => Promise.resolve());

        request(app)
            .delete('/films/1')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.message).toBe('Film deleted successfully');
            })
            .end(done);
    });

    // Error handling for each operation
    it('should return 400 for missing name or img_url on creation', (done) => {
        request(app)
            .post('/films')
            .send({ name: 'Film C' }) // Missing img_url
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.error).toBe('Name and img_url are required');
            })
            .end(done);
    });

    it('should return 500 if there is an error fetching films', (done) => {
        db.query.mockImplementation(() => Promise.reject(new Error('Database error')));

        request(app)
            .get('/films')
            .expect(500)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.error).toBe('Error fetching films');
            })
            .end(done);
    });
});
