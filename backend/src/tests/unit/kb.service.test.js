// src/tests/unit/kb.service.test.js
const kbService = require('../../services/kb.service');
const Article = require('../../models/Article');

describe('KB Service', () => {
  beforeEach(async () => {
    // Clear articles before each test
    await Article.deleteMany({});
  },30000);

  describe('getArticles', () => {
    it('should retrieve published articles', async () => {
      const articleData = [
        { title: 'Test Article 1', body: 'Body 1', tags: ['tag1'], status: 'published' },
        { title: 'Test Article 2', body: 'Body 2', tags: ['tag2'], status: 'published' },
        { title: 'Draft Article', body: 'Draft Body', tags: ['draft'], status: 'draft' }, // Should not be returned
      ];
      await Article.insertMany(articleData);

      const articles = await kbService.getArticles({ status: 'published' });
      
      expect(articles).toHaveLength(2);
      expect(articles[0].status).toBe('published');
      expect(articles[1].status).toBe('published');
      expect(articles.some(a => a.title === 'Draft Article')).toBe(false);
    });

    it('should search articles by query', async () => {
      const articleData = [
        { title: 'Payment Update Guide', body: 'How to update payment.', tags: ['billing'], status: 'published' },
        { title: 'Error Troubleshooting', body: 'Fixing 500 errors.', tags: ['tech'], status: 'published' },
        { title: 'Shipping Info', body: 'Delivery details.', tags: ['shipping'], status: 'published' },
      ];
      await Article.insertMany(articleData);

      const articles = await kbService.getArticles('payment');

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Payment Update Guide');
    });

    it('should return empty array for no matching query', async () => {
      const articleData = [
        { title: 'Article A', body: 'Content A', tags: ['a'], status: 'published' },
      ];
      await Article.insertMany(articleData);

      const articles = await kbService.getArticles('nonexistent');

      expect(articles).toHaveLength(0);
    });
  });
});