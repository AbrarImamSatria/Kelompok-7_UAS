// tests/delete.test.js
const request = require('supertest');
const express = require('express');
const db = require('../database/db'); // Ubah path ke database yang benar

const app = express();
const router = express.Router();

// Define delete endpoint
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM film WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Film not found');
        res.status(204).send();
    });
});

app.use('/', router);

// Mock the database
jest.mock('../database/db', () => ({
    query: jest.fn()
}));

describe('DELETE /film/:id endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should delete film successfully', async () => {
        db.query.mockImplementation((sql, params, callback) => {
            callback(null, { affectedRows: 1 });
        });

        await request(app)
            .delete('/13')
            .expect(204);

        expect(db.query).toHaveBeenCalledWith(
            'DELETE FROM film WHERE id = ?',
            ['13'],
            expect.any(Function)
        );
    });

    test('should return 404 when film not found', async () => {
        db.query.mockImplementation((sql, params, callback) => {
            callback(null, { affectedRows: 0 });
        });

        const response = await request(app)
            .delete('/999')
            .expect(404);

        expect(response.text).toBe('Film not found');
    });

    test('should return 500 on database error', async () => {
        db.query.mockImplementation((sql, params, callback) => {
            callback(new Error('Database error'), null);
        });

        const response = await request(app)
            .delete('/13')
            .expect(500);

        expect(response.text).toBe('Internal Server Error');
    });
});