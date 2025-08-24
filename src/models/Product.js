const { Schema, model, Types } = require('mongoose');
const ProductSchema = new Schema({
  title: { type: String, index: true },
  description: String,
  price: Number,
  category: String,
  subcategory: String,
  location: String,
  merchantId: { type: Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ category: 1, subcategory: 1, price: 1, location: 1 });

module.exports = model('Product', ProductSchema);
