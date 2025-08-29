import express from 'express';
import {
  getAllBrands,
  getBrandBySlug,
  getBrandProducts,
  getBrandStats,
  getTrendingBrands
} from '../controllers/brandspagedataController.js';

const router = express.Router();

// Routes

// GET /api/brandspagedata - Get all brands with pagination and filters
router.get('/', getAllBrands);

// GET /api/brandspagedata/trending - Get trending/featured brands
router.get('/trending', getTrendingBrands);

// GET /api/brandspagedata/:slug - Get single brand by slug
router.get('/:slug', getBrandBySlug);

// GET /api/brandspagedata/:slug/products - Get brand products with pagination and filters
router.get('/:slug/products', getBrandProducts);

// GET /api/brandspagedata/:slug/stats - Get brand statistics
router.get('/:slug/stats', getBrandStats);

export default router;