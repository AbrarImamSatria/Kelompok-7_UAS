const HomeService = require('../src/home');
const db = require('../database/db');
// Mock the database module before requiring it
jest.mock('../database/db', () => ({
    query: jest.fn()
}));

describe('HomeService', () => {
    let homeService;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        homeService = new HomeService();
    });

    describe('getTopContent', () => {
        it('should return top films, TV shows, and all content', async () => {
            // Mock data
            const mockTopFilms = [
                { id: 1, nama_film: 'Film 1', kategori: 'Film' },
                { id: 2, nama_film: 'Film 2', kategori: 'Film' }
            ];
            const mockTopTvShows = [
                { id: 3, nama_film: 'TV Show 1', kategori: 'Acara TV' },
                { id: 4, nama_film: 'TV Show 2', kategori: 'Acara TV' }
            ];
            const mockAllContent = [...mockTopFilms, ...mockTopTvShows];

            // Setup mock implementation
            db.query.mockImplementation((query, callback) => {
                if (query.includes('kategori = "Film"')) {
                    callback(null, mockTopFilms);
                } else if (query.includes('kategori = "Acara TV"')) {
                    callback(null, mockTopTvShows);
                } else {
                    callback(null, mockAllContent);
                }
            });

            const result = await homeService.getTopContent();

            expect(result.topFilms).toEqual(mockTopFilms);
            expect(result.topTvShows).toEqual(mockTopTvShows);
            expect(result.allContent).toEqual(mockAllContent);
            expect(db.query).toHaveBeenCalledTimes(3);
        });

        it('should handle database errors', async () => {
            db.query.mockImplementation((query, callback) => {
                callback(new Error('Database error'), null);
            });

            await expect(homeService.getTopContent()).rejects.toThrow('Failed to fetch content');
        });
    });

    describe('getContentById', () => {
        it('should return content and related content by ID', async () => {
            const mockContent = { id: 1, nama_film: 'Test Film' };
            const mockRelatedContent = [
                { id: 2, nama_film: 'Related Film 1' },
                { id: 3, nama_film: 'Related Film 2' }
            ];

            db.query.mockImplementation((query, params, callback) => {
                if (query.includes('WHERE id = ?')) {
                    callback(null, [mockContent]);
                } else {
                    callback(null, mockRelatedContent);
                }
            });

            const result = await homeService.getContentById(1);

            expect(result.mainContent).toEqual(mockContent);
            expect(result.relatedContent).toEqual(mockRelatedContent);
            expect(db.query).toHaveBeenCalledTimes(2);
        });

        it('should handle non-existent content', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(null, []);
            });

            await expect(homeService.getContentById(999)).rejects.toThrow('Content not found');
        });

        it('should handle database errors when fetching content', async () => {
            db.query.mockImplementation((query, params, callback) => {
                callback(new Error('Database error'), null);
            });

            await expect(homeService.getContentById(1)).rejects.toThrow('Failed to fetch content');
        });
    });
});