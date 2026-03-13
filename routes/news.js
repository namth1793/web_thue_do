const express = require('express');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const newsPath = path.join(__dirname, '../data/news.json');

function getNews() {
  return JSON.parse(fs.readFileSync(newsPath, 'utf8'));
}
function saveNews(news) {
  fs.writeFileSync(newsPath, JSON.stringify(news, null, 2));
}

// GET /api/news - public
router.get('/', (req, res) => {
  res.json(getNews());
});

// GET /api/news/:id - public
router.get('/:id', (req, res) => {
  const item = getNews().find(n => n.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
  res.json(item);
});

// POST /api/news - protected
router.post('/', verifyToken, (req, res) => {
  const { title, excerpt, content, image } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Thiếu tiêu đề hoặc nội dung' });
  const news = getNews();
  const item = {
    id: Date.now().toString(),
    title,
    excerpt: excerpt || '',
    content,
    image: image || '',
    createdAt: new Date().toISOString().split('T')[0],
  };
  news.unshift(item);
  saveNews(news);
  res.status(201).json(item);
});

// PUT /api/news/:id - protected
router.put('/:id', verifyToken, (req, res) => {
  const news = getNews();
  const index = news.findIndex(n => n.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
  const { title, excerpt, content, image } = req.body;
  news[index] = {
    ...news[index],
    ...(title !== undefined && { title }),
    ...(excerpt !== undefined && { excerpt }),
    ...(content !== undefined && { content }),
    ...(image !== undefined && { image }),
    updatedAt: new Date().toISOString().split('T')[0],
  };
  saveNews(news);
  res.json(news[index]);
});

// DELETE /api/news/:id - protected
router.delete('/:id', verifyToken, (req, res) => {
  const news = getNews();
  const index = news.findIndex(n => n.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
  news.splice(index, 1);
  saveNews(news);
  res.json({ message: 'Đã xóa bài viết' });
});

module.exports = router;
