import { error } from 'console';
import BrandsData from '../models/BrandsData.js'
import Product from '../models/Product.js'; // Adjust path as needed

// Helper function to build response
const buildResponse = (success, data = null, message = '', pagination = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (pagination) response = { ...response, ...pagination };
  return response;
};

// Helper function to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all brands
const getAllBrands = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      search,
      country,
      active = true
    } = req.query;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Build filter query
    const filter = { is_active: active === 'true' };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (country) {
      filter.origin_country = { $regex: country, $options: 'i' };
    }

    // Get brands with pagination
    const brands = await BrandsData.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(itemsPerPage)
      .lean();

    // Get total count for pagination
    const totalItems = await BrandsData.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const pagination = {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };

    res.status(200).json(
      buildResponse(true, brands, 'Brands retrieved successfully', pagination)
    );
  } catch (error) {
    console.error('Get all brands error:', error);
    res.status(500).json(
      buildResponse(false, null, 'Internal server error while fetching brands')
    );
  }
});

// Get single brand by slug
const getBrandBySlug = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    const normalizedSlug = slug.toLowerCase().trim();
    
    // Check total count without any filters
    const totalCount = await BrandsData.countDocuments({});
    
    // Get all documents without any filter
    const allDocs = await BrandsData.find({}).limit(5).lean();
    
    // Check specifically for is_active field values
    const activeStatuses = await BrandsData.find({}).select('is_active slug name').lean();

    // Now try the actual query
    const brand = await BrandsData.findOne({ 
      slug: normalizedSlug,
      is_active: true 
    })
    .lean();


    if (!brand) {
      return res.status(404).json(
        buildResponse(false, null, 'Brand not found')
      );
    }

    // Add social media URLs using the schema method
    const brandDoc = await BrandsData.findById(brand._id);
    if (brandDoc && brandDoc.getSocialMediaUrls) {
      brand.social_media_urls = brandDoc.getSocialMediaUrls();
    }
    


  //   res.status(200).json(
  // {      
  // success: "true",
  //     state: "error",
  //     message: "مشکلی در بارگذاری برند وجود دارد",
  //     error: "مشکلی در بارگذاری برند وجود دارد",
  //     }
  //   );

    res.status(200).json(
      {
      success: "true",
      state: "ok",
      message: "موفقیت در دریافت اطلاعات",
      brand: brand      
      }
    );



  } catch (error) {
    console.error('Get brand by slug error:', error);
    res.status(500).json(
      buildResponse(false, null, 'Internal server error while fetching brand')
    );
  }
});

// Get brand products
const getBrandProducts = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      category,
      minPrice,
      maxPrice,
      rating,
      inStock = true
    } = req.query;

    // First, find the brand
    const brand = await BrandsData.findOne({ 
      slug: slug.toLowerCase(),
      is_active: true 
    });

    if (!brand) {
      return res.status(404).json(
        buildResponse(false, null, 'Brand not found')
      );
    }

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Build product filter query
    const filter = { 
      brand: brand._id,
      is_active: true
    };

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Get products with pagination
    const products = await Product.find(filter)
      .populate('brand', 'name slug logo')
      .sort(sort)
      .skip(skip)
      .limit(itemsPerPage)
      .lean();

    // Get total count for pagination
    const totalItems = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const pagination = {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };

    const responseData = {
      brand: {
        _id: brand._id,
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo
      },
      products
    };

    res.status(200).json(
      buildResponse(true, responseData, 'Brand products retrieved successfully', pagination)
    );
  } catch (error) {
    console.error('Get brand products error:', error);
    res.status(500).json(
      buildResponse(false, null, 'Internal server error while fetching brand products')
    );
  }
});

// Get brand statistics
const getBrandStats = asyncHandler(async (req, res) => {
  try {
    const { slug } = req.params;

    const brand = await BrandsData.findOne({ 
      slug: slug.toLowerCase(),
      is_active: true 
    });

    if (!brand) {
      return res.status(404).json(
        buildResponse(false, null, 'Brand not found')
      );
    }

    // Get product statistics for this brand
    const productStats = await Product.aggregate([
      { $match: { brand: brand._id, is_active: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          averageRating: { $avg: '$rating' },
          totalStock: { $sum: '$stock' },
          categories: { $addToSet: '$category' }
        }
      }
    ]);

    const stats = productStats[0] || {
      totalProducts: 0,
      averagePrice: 0,
      averageRating: 0,
      totalStock: 0,
      categories: []
    };

    const responseData = {
      brand: {
        name: brand.name,
        slug: brand.slug,
        rating: brand.rating,
        total_products: brand.total_products,
        total_sales: brand.total_sales,
        market_share: brand.market_share,
        global_rank: brand.global_rank
      },
      statistics: stats
    };

    res.status(200).json(
      buildResponse(true, responseData, 'Brand statistics retrieved successfully')
    );
  } catch (error) {
    console.error('Get brand stats error:', error);
    res.status(500).json(
      buildResponse(false, null, 'Internal server error while fetching brand statistics')
    );
  }
});

// Get trending/featured brands
const getTrendingBrands = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingBrands = await BrandsData.find({
      is_active: true,
      rating: { $gte: 4.0 }
    })
    .sort({ rating: -1, total_sales: -1 })
    .limit(parseInt(limit))
    .select('name slug logo tagline rating total_products market_share')
    .lean();

    res.status(200).json(
      buildResponse(true, trendingBrands, 'Trending brands retrieved successfully')
    );
  } catch (error) {
    console.error('Get trending brands error:', error);
    res.status(500).json(
      buildResponse(false, null, 'Internal server error while fetching trending brands')
    );
  }
});

export {
  getAllBrands,
  getBrandBySlug,
  getBrandProducts,
  getBrandStats,
  getTrendingBrands
};