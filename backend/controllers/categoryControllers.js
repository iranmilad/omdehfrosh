
import CategoryFilter from "../models/CategoryFilters.js";
import SingleProduct from "../models/SingleProduct.js";
import Category from "../models/Category.js"; // Add this import for category model
import User from "../models/User.js"; // Add this import for user model
import getUserFromToken from '../libs/verifyToken.js';


export const getCategoryDataBySlug = async (req, res) => {

  const { filters } = req.body;
  const { slug } = req.params;
  

  console.log(filters, slug)

  const minPrice = filters.price_min;
  const maxPrice = filters.price_max;

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

    // Get category information

    const category = await Category.findOne({ 
      url: { $regex: `^${slug}$`, $options: "i" } 
    });

    if (!category) {

      return res.status(404).json({ message: "Category not found." });
    }

    // Get products
    const products = await SingleProduct.find({ "general.categoryName": slug });
    
    // Get filters
    const allfilters = await CategoryFilter.find().lean();
    const allfiltersNew = allfilters[0];

    // if (!products || products.length === 0) {
    //   return res.status(404).json({ message: "No products found for this category." });
    // }

    // 💡 Determine subscription logic
    const categorySubscriptionModelId = category.subscriptionModel?.modelId;
    
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
      modelName: subscriptionModelNames[categorySubscriptionModelId] || "نامشخص",
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
      totalPages: allfiltersNew.totalPages,
      subscriptionRequired,
      userHasPurchasedSubscription,
      subscriptionModel
    });

  } catch (error) {
    console.error("Error fetching category data by slug:", error);
    res.status(500).json({ message: "Server error while fetching category data." });
  }
};