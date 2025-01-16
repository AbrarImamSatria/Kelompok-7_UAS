const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const signupRouter = require('../src/signup');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'testsecret', resave: false, saveUninitialized: true }));
app.use('/', signupRouter);

describe('POST /signup', () => {
    it('should return 400 if username or password is missing', (done) => {
        request(app)
            .post('/signup')
            .send({ username: '', password: '' })
            .expect(400, done);
    });

    it('should return 500 if there is an error hashing the password', (done) => {
        const mockBcrypt = jest.spyOn(require('bcryptjs'), 'hash');
        mockBcrypt.mockImplementation((password, salt, callback) => {
            callback(new Error('Hashing error'), null);
        });

        request(app)
            .post('/signup')
            .send({ username: 'testuser', password: 'password123' })
            .expect(500, () => {
                mockBcrypt.mockRestore();
                done();
            });
    });

    it('should redirect to /login on successful signup', (done) => {
        const mockDb = jest.spyOn(require('../database/db'), 'query');
        mockDb.mockImplementation((query, values, callback) => {
            callback(null, { insertId: 1 });
        });

        request(app)
            .post('/signup')
            .send({ username: 'testuser', password: 'password123' })
            .expect('Location', '/login')
            .expect(302, () => {
                mockDb.mockRestore();
                done();
            });
    });
});


