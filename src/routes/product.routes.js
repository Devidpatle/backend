const router = require('express').Router();
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');


// CREATE (merchant)
router.post('/', requireAuth(['merchant']), async (req, res) => {
  const body = { ...req.body, merchantId: req.user.id };
  const product = await Product.create(body);
  res.status(201).json(product);
});

// UPDATE (merchant owns it)
router.put('/:id', requireAuth(['merchant']), async (req, res) => {
  const p = await Product.findOneAndUpdate(
    { _id: req.params.id, merchantId: req.user.id },
    req.body, { new: true }
  );
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// DELETE (merchant owns it)
router.delete('/:id', requireAuth(['merchant']), async (req, res) => {
  const result = await Product.findOneAndDelete({
    _id: req.params.id,
    merchantId: req.user.id
  });
  if (!result) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
});
// PUBLIC LIST with filters + sorting + pagination
router.get('/', requireAuth(['merchant', 'user']), async (req, res) => {
  const {
    q, category, subcategory, location,
    minPrice, maxPrice, sort = 'createdAt:desc',
    page = 1, limit = 12
  } = req.query;

  const filter = {};
  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;
  if (location) filter.location = location;
  if (minPrice || maxPrice) filter.price = {
    ...(minPrice ? { $gte: Number(minPrice) } : {}),
    ...(maxPrice ? { $lte: Number(maxPrice) } : {})
  };

  const [sortField, sortDir] = sort.split(':');
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ [sortField]: sortDir === 'asc' ? 1 : -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// MERCHANT: list own products
router.get('/mine', requireAuth(['merchant']), async (req, res) => {
  const items = await Product.find({ merchantId: req.user.id }).sort({ createdAt: -1 });
  res.json(items);
});

module.exports = router;
