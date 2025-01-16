const request = require('supertest');
const express = require('express');
const indexRouter = require('../src/index');
const db = require('../database/db');

const app = express();
app.set('view engine', 'ejs');
app.use('/', indexRouter);

jest.mock('../database/db', () => ({
    query: jest.fn(),
}));

describe('GET /', () => {
    it('should render the homepage with top films and top TV shows', (done) => {
        const mockTopFilms = [
            { id: 1, nama_film: 'Film A', img_url: 'url1' },
            { id: 2, nama_film: 'Film B', img_url: 'url2' },
        ];
        const mockTopTvShows = [
            { id: 3, nama_film: 'TV Show A', img_url: 'url3' },
            { id: 4, nama_film: 'TV Show B', img_url: 'url4' },
        ];
        const mockFilms = [
            { id: 5, nama_film: 'Film C', img_url: 'url5' },
            { id: 6, nama_film: 'Film D', img_url: 'url6' },
        ];

        db.query.mockImplementation((query) => {
            if (query.includes('films WHERE category = "top"')) {
                return Promise.resolve(mockTopFilms);
            } else if (query.includes('tv_shows WHERE category = "top"')) {
                return Promise.resolve(mockTopTvShows);
            } else if (query.includes('SELECT * FROM films')) {
                return Promise.resolve(mockFilms);
            } else {
                return Promise.reject('Query not recognized');
            }
        });

        request(app)
            .get('/')
            .expect(200)
            .expect((res) => {
                expect(res.text).toContain('10 Film Teratas di Indonesia Hari Ini');
                expect(res.text).toContain('10 Acara TV Teratas di Indonesia Hari Ini');
                expect(res.text).toContain('Film C');
                expect(res.text).toContain('TV Show A');
            })
            .end(done);
    });

    it('should return 500 if there is an error fetching data', (done) => {
        db.query.mockImplementation(() => Promise.reject(new Error('Database error')));

        request(app)
            .get('/')
            .expect(500, done);
    });
});

