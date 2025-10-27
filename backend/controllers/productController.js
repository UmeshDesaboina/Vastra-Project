const Product = require('../models/productModel');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};
    
    // Category can be ObjectId or category name
    let category = {};
    const rawCategory = req.query.category;
    const hasCategory = rawCategory !== undefined && rawCategory !== null && String(rawCategory).trim() !== '' && !['null','undefined'].includes(String(rawCategory).toLowerCase());
    if (hasCategory) {
      const val = rawCategory;
      if (String(val).match(/^[0-9a-fA-F]{24}$/)) {
        category = { category: val };
      } else {
        const Category = require('../models/categoryModel');
        const found = await Category.findOne({ name: { $regex: `^${val}$`, $options: 'i' } });
        if (found) category = { category: found._id };
        else category = { category: null }; // yields no results
      }
    }

    const featured = req.query.featured ? { isFeatured: true } : {};
    const trending = req.query.trending ? { isTrending: true } : {};

    // Price range filters
    let priceFilter = {};
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const price = {};
    if (minPrice && !Number.isNaN(minPrice)) price.$gte = minPrice;
    if (maxPrice && !Number.isNaN(maxPrice)) price.$lte = maxPrice;
    if (Object.keys(price).length > 0) {
      priceFilter = { price };
    }
    
    const filter = { ...keyword, ...category, ...featured, ...trending, ...priceFilter };
    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
    
    res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category','name');
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category,
      price, 
      discountPrice,
      countInStock,
      fabric,
      sizes,
      deliveryCharges,
      isFeatured,
      isTrending
    } = req.body;
    
    if (!name || !description || !category || !price || !countInStock) {
      return res.status(400).json({ message: 'name, description, category, price, countInStock are required' });
    }

let images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Also accept image URLs via body: imageUrls (array or comma-separated)
    if (req.body.imageUrls) {
      const urls = Array.isArray(req.body.imageUrls)
        ? req.body.imageUrls
        : String(req.body.imageUrls)
            .split(/\n|,/)
            .map(s => s.trim())
            .filter(Boolean);
      images = [...images, ...urls];
    }

    // resolve category: accept id or name
    let categoryId = category;
    if (!String(category).match(/^[0-9a-fA-F]{24}$/)) {
      const Category = require('../models/categoryModel');
      const found = await Category.findOne({ name: category });
      if (!found) {
        return res.status(400).json({ message: 'Invalid category' });
      }
      categoryId = found._id;
    }

    const sizesArr = Array.isArray(sizes) ? sizes : (typeof sizes === 'string' && sizes.length ? sizes.split(',').map(s => s.trim()) : []);
    
    const product = new Product({
      name,
      images,
      description,
      category: categoryId,
      price,
      discountPrice,
      countInStock,
      fabric,
      sizes: sizesArr,
      deliveryCharges: deliveryCharges || 0,
      isFeatured,
      isTrending
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category,
      price, 
      discountPrice,
      countInStock,
      fabric,
      sizes,
      deliveryCharges,
      isFeatured,
      isTrending
    } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;

      if (category) {
        let categoryId = category;
        if (!String(category).match(/^[0-9a-fA-F]{24}$/)) {
          const Category = require('../models/categoryModel');
          const found = await Category.findOne({ name: category });
          if (!found) {
            return res.status(400).json({ message: 'Invalid category' });
          }
          categoryId = found._id;
        }
        product.category = categoryId;
      }

      if (typeof price !== 'undefined') product.price = price;
      if (typeof discountPrice !== 'undefined') product.discountPrice = discountPrice;
      if (typeof countInStock !== 'undefined') product.countInStock = countInStock;
      if (typeof fabric !== 'undefined') product.fabric = fabric;
      if (typeof sizes !== 'undefined') {
        product.sizes = Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()) : product.sizes);
      }
      if (typeof deliveryCharges !== 'undefined') product.deliveryCharges = deliveryCharges;
      product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
      product.isTrending = isTrending !== undefined ? isTrending : product.isTrending;
      
      // Remove images if requested
      if (req.body.removeImages) {
        let toRemove = [];
        try {
          toRemove = Array.isArray(req.body.removeImages)
            ? req.body.removeImages
            : JSON.parse(req.body.removeImages);
        } catch {
          toRemove = String(req.body.removeImages)
            .split(/\n|,/) 
            .map(s => s.trim())
            .filter(Boolean);
        }
        if (Array.isArray(toRemove) && toRemove.length) {
          product.images = product.images.filter(img => !toRemove.includes(img));
        }
      }

      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        product.images = [...product.images, ...newImages];
      }
      // accept additional image URLs
      if (req.body.imageUrls) {
        const urls = Array.isArray(req.body.imageUrls)
          ? req.body.imageUrls
          : String(req.body.imageUrls)
              .split(/\n|,/)
              .map(s => s.trim())
              .filter(Boolean);
        product.images = [...product.images, ...urls];
      }
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
      // Check if user already reviewed
      const alreadyReviewed = product.reviews.find(
        (review) => review.user.toString() === req.user._id.toString()
      );
      
      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }
      
      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
      };
      
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;
      
      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a product review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
const updateProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
      const review = product.reviews.id(req.params.reviewId);
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      // Check if user owns the review or is admin
      if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(401).json({ message: 'Not authorized to edit this review' });
      }
      
      review.rating = Number(rating);
      review.comment = comment;
      
      // Recalculate rating
      product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
      
      await product.save();
      res.json({ message: 'Review updated' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (product) {
      const review = product.reviews.id(req.params.reviewId);
      
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
      
      // Check if user owns the review or is admin
      if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(401).json({ message: 'Not authorized to delete this review' });
      }
      
      review.deleteOne();
      
      // Recalculate rating and numReviews
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.length > 0 
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
        : 0;
      
      await product.save();
      res.json({ message: 'Review removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  createProductReview,
  updateProductReview,
  deleteProductReview
};
