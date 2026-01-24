
import CategoryFilter from "../models/CategoryFilters.js";
import SingleProduct from "../models/SingleProduct.js";
import Category from "../models/Category.js"; // Add this import for category model
import User from "../models/User.js"; // Add this import for user model
import getUserFromToken from '../libs/verifyToken.js';


export const getCategoryDataBySlug = async (req, res) => {

  const { filters } = req.body;
  const { slug } = req.params;
  

  console.log(filters, slug)

  console.log(JSON.stringify(req.body));

  const minPrice = filters.price_min;
  const maxPrice = filters.price_max;
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    // Get user information from token (optional - user might not be logged in)
    let userId = null;
    let userAccount = null;
    
    const userTokenData = getUserFromToken(req, res);
    
    if (userTokenData) {
      userId = userTokenData.user_id;
      
      if (userId) {
        userAccount = await User.findOne({ userId });
      }
    } else {
    }

    // Get category information (optional - if not found, we'll still try to get products)
    const category = await Category.findOne({ 
      url: { $regex: `^${slug}$`, $options: "i" } 
    });

    // Build query for products
    const productQuery = { "general.categoryName": slug };
    
    // Get total count of products for pagination
    const totalProducts = await SingleProduct.countDocuments(productQuery);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Get products by categoryName with pagination (works even if Category document doesn't exist)
    const products = await SingleProduct.find(productQuery)
      .skip(skip)
      .limit(limit);
    
    // If no category found and no products found, return 404
    if (!category && (!products || products.length === 0)) {
      return res.status(404).json({ message: "Category not found." });
    }
    
    // If category not found but products exist, continue with default subscription settings
    if (!category) {
      // Use default subscription settings when category document doesn't exist
      // This allows the compare feature to work even if Category collection is incomplete
    }
    
    // Get filters
    const allfilters = await CategoryFilter.find().lean();
    const allfiltersNew = allfilters[0];

    // if (!products || products.length === 0) {
    //   return res.status(404).json({ message: "No products found for this category." });
    // }

    // 💡 Determine subscription logic
    // Use category subscription if available, otherwise default to "basic" (free)
    const categorySubscriptionModelId = category?.subscriptionModel?.modelId || "basic";
    
    // Default subscription model names mapping
    const subscriptionModelNames = {
      "basic": "رایگان",
      "pro": "اشتراک ویژه",
      "gold": "اشتراک طلایی",
      // Add more as needed
    };

    let subscriptionRequired = false;
    let userHasPurchasedSubscription = false;
    let subscriptionModel = {
      modelName: subscriptionModelNames[categorySubscriptionModelId] || "رایگان",
      modelId: categorySubscriptionModelId
    };

    // Check if subscription is required (anything other than basic)
    if (categorySubscriptionModelId !== "basic") {
      subscriptionRequired = true;

      // Check if user has purchased the required subscription
      if (userAccount && userAccount.subscriptions) {
        const userSubscription = userAccount.subscriptions[categorySubscriptionModelId];
        
        if (userSubscription) {
          const now = new Date();
          const expirationDate = new Date(userSubscription.expirationDate);
          
          // Check if subscription is still valid
          if (expirationDate > now) {
            userHasPurchasedSubscription = true;
          }
        }
      }
    } else {
      // For basic, no subscription is required
      subscriptionRequired = false;
      userHasPurchasedSubscription = true; // Set to true so access is granted
    }

    // 💡 Add `filterCheck: true` based on incoming filters
    const updatedFilters = allfiltersNew.filters.map((filter) => {
      const key = filter.key;
      const activeValues = filters[key]; // e.g., filters["brands"] → ['apple', 'samsung']

      const updatedOptions = filter.options.map((option) => {
        const isChecked = Array.isArray(activeValues) && activeValues.includes(option.value);
        return isChecked ? { ...option, filterCheck: true } : option;
      });

      return {
        ...filter,
        options: updatedOptions,
      };
    });

    // 🛍️ Transform product data
    const transformedProducts = products.map((product) => {
      return {
        id: product.id,
        image: product.general.images?.[0] || null,
        slug: product.id,
        title: product.general.title,
        regularPrice: product.combinations?.[0]?.suppliers?.[0]?.price?.regularPrice || 0,
        discountPercent: product.combinations?.[0]?.suppliers?.[0]?.price?.discountPercent || 0,
        discountedPrice: product.combinations?.[0]?.suppliers?.[0]?.price?.discountedPrice || 0,
      };
    });

    res.status(200).json({
      products: transformedProducts,
      filters: updatedFilters,
      price: { min: allfiltersNew.price.min, max: allfiltersNew.price.max },
      userPriceSet: { min: minPrice, max: maxPrice },
      totalPages: totalPages,
      totalProducts: totalProducts,
      currentPage: page,
      limit: limit,
      subscriptionRequired,
      userHasPurchasedSubscription,
      subscriptionModel
    });

  } catch (error) {
    console.error("Error fetching category data by slug:", error);
    res.status(500).json({ message: "Server error while fetching category data." });
  }
};