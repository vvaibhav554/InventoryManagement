const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  transaction_type: {
    type: String,
    required: true,
    enum: ['IN', 'OUT']
  },
  quantity_changed: {
    type: Number,
    required: true,
    min: 1
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  }
});

TransactionSchema.index({ item_id: 1, date: -1 });
TransactionSchema.index({ user_id: 1, date: -1 });

TransactionSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);