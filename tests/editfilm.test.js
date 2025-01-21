const request = require('supertest');
const express = require('express');
const editFilmRouter = require('../src/editfilm');
const db = require('../database/db');

const app = express();
app.use(express.json()); // Untuk menangani request body JSON
app.use('/', editFilmRouter);

jest.mock('../database/db', () => ({
    query: jest.fn(),
}));

describe('PUT /editfilm/:id', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update film details and return 200 status', (done) => {
        const updatedFilm = {
            name: 'Updated Title',
            img_url: 'https://example.com/updated-image.jpg',
        };

        db.query.mockImplementation(() => Promise.resolve({ affectedRows: 1 }));

        request(app)
            .put('/editfilm/1')
            .send(updatedFilm)
            .expect(200)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.message).toBe('Film updated successfully');
            })
            .end((err) => {
                if (err) return done(err);
                done();
            });
    });

    it('should return 400 if name or img_url is missing', (done) => {
        const incompleteFilm = {
            name: 'Updated Title',
        };

        request(app)
            .put('/editfilm/1')
            .send(incompleteFilm)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.error).toBe('Name and img_url are required');
            })
            .end(done);
    });

    it('should return 404 if film is not found', (done) => {
        const updatedFilm = {
            name: 'Updated Title',
            img_url: 'https://example.com/updated-image.jpg',
        };

        db.query.mockImplementation(() => Promise.resolve({ affectedRows: 0 }));

        request(app)
            .put('/editfilm/999') // ID yang tidak ada dalam database
            .send(updatedFilm)
            .expect(404)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.error).toBe('Film not found');
            })
            .end(done);
    });

    it('should return 500 if there is a database error', (done) => {
        const updatedFilm = {
            name: 'Updated Title',
            img_url: 'https://example.com/updated-image.jpg',
        };

        db.query.mockImplementation(() => Promise.reject(new Error('Database error')));

        request(app)
            .put('/editfilm/1')
            .send(updatedFilm)
            .expect(500)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.error).toBe('Error updating film');
            })
            .end(done);
    });
});