const express = require('express');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const productsPath = path.join(__dirname, '../data/products.json');

function getProducts() {
  return JSON.parse(fs.readFileSync(productsPath, 'utf8'));
}

function saveProducts(products) {
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
}

// GET /api/products - public
router.get('/', (req, res) => {
  const products = getProducts();
  res.json(products);
});

// GET /api/products/:id - public
router.get('/:id', (req, res) => {
  const products = getProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
  res.json(product);
});

// POST /api/products - protected
router.post('/', verifyToken, (req, res) => {
  const { name, price, description, category, condition, image, status } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }

  const products = getProducts();
  const newProduct = {
    id: Date.now().toString(),
    name,
    price: Number(price),
    description: description || '',
    category,
    condition: condition || 'new',
    image: image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop',
    status: status || 'available',
  };

  products.push(newProduct);
  saveProducts(products);

  res.status(201).json(newProduct);
});

// PUT /api/products/:id - protected
router.put('/:id', verifyToken, (req, res) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

  const { name, price, description, category, condition, image, status } = req.body;
  products[index] = {
    ...products[index],
    ...(name && { name }),
    ...(price && { price: Number(price) }),
    ...(description !== undefined && { description }),
    ...(category && { category }),
    ...(condition && { condition }),
    ...(image && { image }),
    ...(status && { status }),
  };

  saveProducts(products);
  res.json(products[index]);
});

// PATCH /api/products/:id/status - protected
router.patch('/:id/status', verifyToken, (req, res) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

  const { status } = req.body;
  if (!['available', 'rented'].includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
  }

  products[index].status = status;
  saveProducts(products);
  res.json(products[index]);
});

// DELETE /api/products/:id - protected
router.delete('/:id', verifyToken, (req, res) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

  products.splice(index, 1);
  saveProducts(products);
  res.json({ message: 'Đã xóa sản phẩm' });
});

module.exports = router;
