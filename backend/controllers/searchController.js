// controllers/searchController.js

/**
 * Search Controller
 * Searches across products, categories, and brands
 */
export const searchController = async (req, res) => {
  try {
    console.log("Search request received:", {
      query: req.query,
      params: req.params,
      url: req.url
    });

    // Accept both 'query' and 's' parameters for flexibility
    const searchQuery = req.query.query || req.query.s;

    // Validate query parameter
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: "Search query parameter is required (use 'query' or 's')"
      });
    }

    if (searchQuery.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 3 characters long"
      });
    }

    const searchTerm = searchQuery.trim();
    console.log(`Searching for: "${searchTerm}"`);

    // TODO: Replace with your actual database queries
    // Example using Mongoose (MongoDB):
    /*
    const [products, categories, brands] = await Promise.all([
      Product.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      }).limit(10).select('id name'),
      
      Category.find({
        name: { $regex: searchTerm, $options: 'i' }
      }).limit(10).select('id name'),
      
      Brand.find({
        name: { $regex: searchTerm, $options: 'i' }
      }).limit(10).select('id name')
    ]);
    */

    // Example using Sequelize (SQL):
    /*
    const { Op } = require('sequelize');
    const [products, categories, brands] = await Promise.all([
      Product.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { description: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        },
        attributes: ['id', 'name'],
        limit: 10
      }),
      
      Category.findAll({
        where: { name: { [Op.iLike]: `%${searchTerm}%` } },
        attributes: ['id', 'name'],
        limit: 10
      }),
      
      Brand.findAll({
        where: { name: { [Op.iLike]: `%${searchTerm}%` } },
        attributes: ['id', 'name'],
        limit: 10
      })
    ]);
    */

    // TEMPORARY: Mock data for testing
    const products = mockSearchProducts(searchTerm);
    const categories = mockSearchCategories(searchTerm);
    const brands = mockSearchBrands(searchTerm);

    console.log('Search results:', {
      products: products.length,
      categories: categories.length,
      brands: brands.length
    });

    // Build response in the expected format
    const response = [];

    if (products.length > 0) {
      response.push({
        searchResultName: "product",
        products: products
      });
    }

    if (categories.length > 0) {
      response.push({
        searchResultName: "category",
        categories: categories
      });
    }

    if (brands.length > 0) {
      response.push({
        searchResultName: "brand",
        brands: brands
      });
    }

    console.log("Final search response:", response);

    // Return empty array if no results (not an error)
    return res.status(200).json(response);

  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while searching",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================
// MOCK DATA FUNCTIONS (Remove in production)
// ============================================

function mockSearchProducts(searchTerm) {
  const allProducts = [
    { id: "prod1", name: "گوشی سامسونگ مدل A12" },
    { id: "prod2", name: "گوشی شیائومی مدل Redmi Note 10" },
    { id: "prod3", name: "گوشی اپل iPhone 13 Pro" },
    { id: "prod4", name: "تبلت سامسونگ Galaxy Tab S8" },
    { id: "prod5", name: "لپ تاپ ایسوس VivoBook" },
    { id: "prod6", name: "هدفون بلوتوث سونی WH-1000XM4" },
    { id: "prod7", name: "ساعت هوشمند شیائومی Mi Band 7" },
    { id: "prod8", name: "کیبورد مکانیکی لاجیتک G915" },
  ];

  return allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);
}

function mockSearchCategories(searchTerm) {
  const allCategories = [
    { id: "cat1", name: "گوشی" },
    { id: "cat2", name: "تبلت" },
    { id: "cat3", name: "لپ تاپ" },
    { id: "cat4", name: "لوازم جانبی" },
    { id: "cat5", name: "ساعت هوشمند" },
  ];

  return allCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);
}

function mockSearchBrands(searchTerm) {
  const allBrands = [
    { id: "brand1", name: "سامسونگ" },
    { id: "brand2", name: "شیائومی" },
    { id: "brand3", name: "اپل" },
    { id: "brand4", name: "ایسوس" },
    { id: "brand5", name: "سونی" },
    { id: "brand6", name: "لاجیتک" },
  ];

  return allBrands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);
}