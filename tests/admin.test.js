const request = require('supertest');
const express = require('express');
const adminRouter = require('../src/admin');
const db = require('../database/db');

const app = express();
app.use(express.json()); // Untuk menangani request body JSON
app.use('/', adminRouter);

jest.mock('../database/db', () => ({
    query: jest.fn(),
}));

describe('POST /admin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add a new admin and return 201 status', (done) => {
        const newAdmin = {
            username: 'admin1',
            password: 'password123',
        };

        db.query.mockImplementation(() => Promise.resolve());

        request(app)
            .post('/admin')
            .send(newAdmin)
            .expect(201)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.message).toBe('Admin added successfully');
            })
            .end((err) => {
                if (err) return done(err);
                done();
            });
    });

    it('should return 400 if username or password is missing', (done) => {
        const incompleteAdmin = {
            username: 'admin1',
        };

        request(app)
            .post('/admin')
            .send(incompleteAdmin)
            .expect(400)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.error).toBe('Username and password are required');
            })
            .end(done);
    });

    it('should return 500 if there is an error in the database', (done) => {
        const newAdmin = {
            username: 'admin1',
            password: 'password123',
        };

        db.query.mockImplementation(() => Promise.reject(new Error('Database error')));

        request(app)
            .post('/admin')
            .send(newAdmin)
            .expect(500)
            .expect('Content-Type', /json/)
            .expect((res) => {
                expect(res.body.error).toBe('Error adding admin');
            })
            .end(done);
    });
});
