const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
  images: [
    {
      type: String,
      required: true
    }
  ],
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  link: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;