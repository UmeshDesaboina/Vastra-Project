const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  images: [
    {
      type: String,
      required: true
    }
  ],
  description: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Category'
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  countInStock: {
    type: Number,
    required: true,
    default: 0
  },
  fabric: {
    type: String
  },
  sizes: [String],
  deliveryCharges: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    required: true,
    default: 0
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;