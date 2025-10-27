const Banner = require('../models/bannerModel');

// @desc    Get all banners (active first by order)
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = async (req, res) => {
  try {
    const { title, description, link, isActive, order } = req.body;
    let images = [];
    if (req.files && req.files.length) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    }
    if (req.body.imageUrls) {
      const urls = Array.isArray(req.body.imageUrls)
        ? req.body.imageUrls
        : String(req.body.imageUrls)
            .split(/\n|,/)
            .map(s => s.trim())
            .filter(Boolean);
      images = [...images, ...urls];
    }
    if (!images.length) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const banner = new Banner({ images, title, description, link, isActive, order });
    const created = await banner.save();
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res) => {
  try {
    const { title, description, link, isActive, order } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.title = title || banner.title;
    banner.description = typeof description !== 'undefined' ? description : banner.description;
    banner.link = typeof link !== 'undefined' ? link : banner.link;
    banner.isActive = typeof isActive !== 'undefined' ? isActive : banner.isActive;
    banner.order = typeof order !== 'undefined' ? order : banner.order;

    // Remove specific images if requested
    if (req.body.removeImages) {
      let toRemove = [];
      try { toRemove = Array.isArray(req.body.removeImages) ? req.body.removeImages : JSON.parse(req.body.removeImages); } catch {}
      if (Array.isArray(toRemove) && toRemove.length) {
        banner.images = banner.images.filter(img => !toRemove.includes(img));
      }
    }
    if (req.files && req.files.length) {
      banner.images = [...banner.images, ...req.files.map(f => `/uploads/${f.filename}`)];
    }
    if (req.body.imageUrls) {
      const urls = Array.isArray(req.body.imageUrls) ? req.body.imageUrls : String(req.body.imageUrls).split(/\n|,/).map(s=>s.trim()).filter(Boolean);
      banner.images = [...banner.images, ...urls];
    }

    const updated = await banner.save();
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    await banner.deleteOne();
    res.json({ message: 'Banner removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getBanners, createBanner, updateBanner, deleteBanner };