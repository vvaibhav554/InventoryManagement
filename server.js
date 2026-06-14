const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased limit for development
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting only to API routes, not static files
app.use('/api', limiter);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');
const Item = require('./models/Item');
const Transaction = require('./models/Transaction');

app.use(express.static('public'));

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/api/auth/signup', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/items', authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ user_id: req.user.userId }).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/items', authMiddleware, [
  body('name').notEmpty().withMessage('Item name is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('price_per_unit').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('max_capacity').isInt({ min: 1 }).withMessage('Max capacity must be a positive integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, quantity, price_per_unit, max_capacity } = req.body;

    const existingItem = await Item.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      user_id: req.user.userId
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Item with this name already exists' });
    }

    const item = new Item({
      name,
      quantity,
      price_per_unit,
      max_capacity,
      user_id: req.user.userId
    });

    await item.save();

    const transaction = new Transaction({
      item_id: item._id,
      transaction_type: 'IN',
      quantity_changed: quantity,
      user_id: req.user.userId
    });
    await transaction.save();

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/items/:id', authMiddleware, [
  body('name').optional().notEmpty().withMessage('Item name cannot be empty'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('price_per_unit').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('max_capacity').optional().isInt({ min: 1 }).withMessage('Max capacity must be a positive integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await Item.findOne({ _id: id, user_id: req.user.userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const oldQuantity = item.quantity;
    Object.assign(item, updates);
    await item.save();

    if (updates.quantity !== undefined && updates.quantity !== oldQuantity) {
      const quantityChanged = updates.quantity - oldQuantity;
      const transaction = new Transaction({
        item_id: item._id,
        transaction_type: quantityChanged > 0 ? 'IN' : 'OUT',
        quantity_changed: Math.abs(quantityChanged),
        user_id: req.user.userId
      });
      await transaction.save();
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/items/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findOneAndDelete({ _id: id, user_id: req.user.userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await Transaction.deleteMany({ item_id: id, user_id: req.user.userId });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/transactions', authMiddleware, [
  body('item_id').notEmpty().withMessage('Item ID is required'),
  body('transaction_type').isIn(['IN', 'OUT']).withMessage('Transaction type must be IN or OUT'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { item_id, transaction_type, quantity } = req.body;

    const item = await Item.findOne({ _id: item_id, user_id: req.user.userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (transaction_type === 'OUT' && item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const newQuantity = transaction_type === 'IN' ? item.quantity + quantity : item.quantity - quantity;
    item.quantity = newQuantity;
    await item.save();

    const transaction = new Transaction({
      item_id,
      transaction_type,
      quantity_changed: quantity,
      user_id: req.user.userId
    });
    await transaction.save();

    res.json({ message: 'Transaction recorded successfully', item });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { user_id: req.user.userId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('item_id', 'name')
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const totalItems = await Item.countDocuments({ user_id: req.user.userId });
    const items = await Item.find({ user_id: req.user.userId });

    const lowStockItems = items.filter(item => {
      const threshold = item.max_capacity * 0.15;
      return item.quantity <= threshold;
    });

    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await Transaction.find({
      user_id: req.user.userId,
      date: { $gte: thirtyDaysAgo }
    });

    const stockIn = recentTransactions
      .filter(t => t.transaction_type === 'IN')
      .reduce((sum, t) => sum + t.quantity_changed, 0);

    const stockOut = recentTransactions
      .filter(t => t.transaction_type === 'OUT')
      .reduce((sum, t) => sum + t.quantity_changed, 0);

    res.json({
      totalItems,
      lowStockItems: lowStockItems.length,
      totalValue,
      stockIn,
      stockOut,
      lowStockItemsList: lowStockItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/reports/monthly', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;

    let startDate, endDate;
    if (year && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const transactions = await Transaction.find({
      user_id: req.user.userId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('item_id', 'name');

    const reportData = {};

    transactions.forEach(transaction => {
      const date = transaction.date.toISOString().split('T')[0];
      if (!reportData[date]) {
        reportData[date] = { stockIn: 0, stockOut: 0 };
      }

      if (transaction.transaction_type === 'IN') {
        reportData[date].stockIn += transaction.quantity_changed;
      } else {
        reportData[date].stockOut += transaction.quantity_changed;
      }
    });

    const sortedDates = Object.keys(reportData).sort();
    const chartData = sortedDates.map(date => ({
      date,
      stockIn: reportData[date].stockIn,
      stockOut: reportData[date].stockOut
    }));

    res.json({
      period: { startDate, endDate },
      transactions,
      chartData,
      summary: {
        totalStockIn: transactions.filter(t => t.transaction_type === 'IN').reduce((sum, t) => sum + t.quantity_changed, 0),
        totalStockOut: transactions.filter(t => t.transaction_type === 'OUT').reduce((sum, t) => sum + t.quantity_changed, 0),
        totalTransactions: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});