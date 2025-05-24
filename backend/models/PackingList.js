const mongoose = require('mongoose');

const packingListSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  categories: [{
    name: {
      type: String,
      required: true
    },
    items: [{
      name: String,
      quantity: {
        type: Number,
        default: 1
      },
      isPacked: {
        type: Boolean,
        default: false
      },
      priority: {
        type: String,
        enum: ['essential', 'important', 'optional'],
        default: 'important'
      },
      aiSuggested: {
        type: Boolean,
        default: false
      }
    }]
  }],
  completionPercentage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PackingList', packingListSchema);
