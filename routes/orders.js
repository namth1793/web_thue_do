const express = require('express');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const ordersPath = path.join(__dirname, '../data/orders.json');

function getOrders() {
  return JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
}
function saveOrders(orders) {
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
}

// GET /api/orders - protected
router.get('/', verifyToken, (req, res) => {
  const orders = getOrders();
  res.json(orders.slice().reverse()); // newest first
});

// POST /api/orders - public (customers place orders without login)
router.post('/', (req, res) => {
  const { productId, productName, customerName, customerPhone, rentalDate, returnDate, totalPrice } = req.body;
  if (!productName || !customerName || !rentalDate || !returnDate || !totalPrice) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }
  const orders = getOrders();
  const newOrder = {
    id: `ord${Date.now()}`,
    productId: productId || '',
    productName,
    customerName,
    customerPhone: customerPhone || '',
    rentalDate,
    returnDate,
    totalPrice: Number(totalPrice),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  saveOrders(orders);
  res.status(201).json(newOrder);
});

// PATCH /api/orders/:id/status - protected
router.patch('/:id/status', verifyToken, (req, res) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'renting', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
  }
  orders[index].status = status;
  saveOrders(orders);
  res.json(orders[index]);
});

// DELETE /api/orders/:id - protected
router.delete('/:id', verifyToken, (req, res) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
  orders.splice(index, 1);
  saveOrders(orders);
  res.json({ message: 'Đã xóa đơn hàng' });
});

module.exports = router;
