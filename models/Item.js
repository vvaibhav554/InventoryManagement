const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  price_per_unit: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  max_capacity: {
    type: Number,
    required: true,
    min: 1,
    default: 100
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

ItemSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

ItemSchema.virtual('is_low_stock').get(function() {
  const threshold = this.max_capacity * 0.15;
  return this.quantity <= threshold;
});

ItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Item', ItemSchema);