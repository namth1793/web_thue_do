const express = require('express');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const ordersPath = path.join(__dirname, '../data/orders.json');

function getOrders() {
  return JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
}

// GET /api/revenue - protected
router.get('/', verifyToken, (req, res) => {
  const orders = getOrders();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = orders.length;

  // Tính doanh thu theo tháng (6 tháng gần nhất)
  const now = new Date();
  const monthlyData = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const monthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getFullYear() === year && orderDate.getMonth() + 1 === month;
    });

    monthlyData.push({
      month: `${month}/${year}`,
      revenue: monthOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      orders: monthOrders.length,
    });
  }

  // Doanh thu tháng hiện tại
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const thisMonthOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
  });
  const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  // Top sản phẩm được thuê nhiều nhất
  const productCount = {};
  orders.forEach(o => {
    productCount[o.productName] = (productCount[o.productName] || 0) + 1;
  });
  const topProducts = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  res.json({
    totalRevenue,
    totalOrders,
    thisMonthRevenue,
    thisMonthOrders: thisMonthOrders.length,
    monthlyData,
    topProducts,
    recentOrders: orders.slice(-5).reverse(),
  });
});

module.exports = router;
