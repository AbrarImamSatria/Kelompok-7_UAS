const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const loginRouter = require('../src/login');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'testsecret', resave: false, saveUninitialized: true }));
app.use('/', loginRouter);

describe('POST /login', () => {
    it('should return 400 if username or password is missing', (done) => {
        request(app)
            .post('/login')
            .send({ username: '', password: '' })
            .expect(400, done);
    });

    it('should return 400 if the user is not found', (done) => {
        const mockDb = jest.spyOn(require('../database/db'), 'query');
        mockDb.mockImplementation((query, values, callback) => {
            callback(null, []);
        });

        request(app)
            .post('/login')
            .send({ username: 'nonexistentuser', password: 'password123' })
            .expect(400, () => {
                mockDb.mockRestore();
                done();
            });
    });

    it('should return 401 if the password is incorrect', (done) => {
        const mockDb = jest.spyOn(require('../database/db'), 'query');
        mockDb.mockImplementation((query, values, callback) => {
            callback(null, [{ id: 1, username: 'testuser', password: 'hashedpassword' }]);
        });

        const mockBcrypt = jest.spyOn(require('bcryptjs'), 'compare');
        mockBcrypt.mockImplementation((password, hash, callback) => {
            callback(null, false);
        });

        request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'wrongpassword' })
            .expect(401, () => {
                mockDb.mockRestore();
                mockBcrypt.mockRestore();
                done();
            });
    });

    it('should redirect to dashboard-admin on successful login', (done) => {
        const mockDb = jest.spyOn(require('../database/db'), 'query');
        mockDb.mockImplementation((query, values, callback) => {
            callback(null, [{ id: 1, username: 'testuser', password: 'hashedpassword' }]);
        });

        const mockBcrypt = jest.spyOn(require('bcryptjs'), 'compare');
        mockBcrypt.mockImplementation((password, hash, callback) => {
            callback(null, true);
        });

        request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'password123' })
            .expect('Location', 'dashboard-admin')
            .expect(302, () => {
                mockDb.mockRestore();
                mockBcrypt.mockRestore();
                done();
            });
    });
});

