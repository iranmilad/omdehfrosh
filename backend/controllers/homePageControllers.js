import getUserFromToken from '../libs/verifyToken.js';
import Category from '../models/Category.js';
import UserAccount from '../models/User.js'
import PriceList from "../models/PriceList.js";
import WideSlider from "../models/WideSlider.js";
import FP from '../models/FP.js';
import Banner from '../models/Banner.js';
import ProductGrid from '../models/ProductGrid.js';
import TrendProductGroup from '../models/TrendProduct.js';
import Brand from '../models/Brand.js';

// Helper function to shuffle array (equivalent to your client-side shuffleArray)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Combined home page data endpoint
export const getHomePageData = async (req, res) => {
  try {
    const userData = getUserFromToken(req, res);

    // Fetch all data concurrently
    const [
      allCategories,
      priceLists,
      sliders,
      fps,
      banners,
      pg,
      tp,
      brandDoc
    ] = await Promise.all([
      Category.find({}),
      PriceList.find(),
      WideSlider.find(),
      FP.find(),
      Banner.find(),
      ProductGrid.find(),
      TrendProductGroup.find(),
      Brand.findOne().lean()
    ]);

    
    // Process categories with user subscription logic
    let filteredCategories;
    if (!userData || !userData.user_id) {
      // If no user data or user_id, show only "basic" as true, others false
      filteredCategories = allCategories.map(cat => {
        const modelId = cat.subscriptionModel?.modelId;
        return {
          ...cat.toObject(),
          display: modelId === "basic"
        };
      });
    } else {
      // Process categories based on user subscriptions
      const { user_id } = userData;
      const user = await UserAccount.findOne({ userId: user_id });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userSubscriptions = Object.keys(user.subscriptions || {});
      
      filteredCategories = allCategories.map(cat => {
        const modelId = cat.subscriptionModel?.modelId;
        const isSubscribed = userSubscriptions.includes(modelId);
        return {
          ...cat.toObject(),
          display: isSubscribed
        };
      });
    }

    // Process trending products (merge all products arrays)
    const allTrendingProducts = tp.reduce((acc, item) => {
      if (Array.isArray(item.products)) {
        acc.push(...item.products);
      }
      return acc;
    }, []);

    // Process brands (clean up unwanted fields)
    let processedBrands = null;
    if (brandDoc) {
      const { _id, __v, children, ...rest } = brandDoc;
      const cleanedChildren = children ? children.map(({ _id, ...child }) => child) : [];
      processedBrands = {
        ...rest,
        children: cleanedChildren,
      };
    }

    // Structure the data as expected by the client
    const data = [
      { type: "wideslider", data: sliders },
      { type: "featured_promo", data: shuffleArray(fps) },
      { type: "categories", data: filteredCategories },
      { type: "banners", data: banners },
      { type: "prices", data: priceLists },  
      { type: "featured_promo", data: shuffleArray(fps) },
      { type: "productGrid", data: pg },
      { type: "trendProducts", data: allTrendingProducts },
      { type: "brands", data: processedBrands },
      { type: "featured_products", data: shuffleArray(fps) }
    ];

    res.json({ message: "ok", data });

  } catch (err) {
    console.error("Error fetching home page data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Keep existing individual controllers for backward compatibility if needed
export const getCategoriesByUserId = async (req, res) => {
  try {
    const userData = getUserFromToken(req, res);
    const allCategories = await Category.find({});

    // If no user data or user_id, show only "basic" as true, others false
    if (!userData || !userData.user_id) {
      const filteredCategories = allCategories.map(cat => {
        const modelId = cat.subscriptionModel?.modelId;
        return {
          ...cat.toObject(),
          display: modelId === "basic"
        };
      });

      return res.json({ filteredCategories });
    }

    const { user_id } = userData;
    const userId = user_id;
    const user = await UserAccount.findOne({ userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    const userSubscriptions = Object.keys(user.subscriptions || {});

    // Map categories to determine display based on user's subscriptions
    const filteredCategories = allCategories.map(cat => {
      const modelId = cat.subscriptionModel?.modelId;
      const isSubscribed = userSubscriptions.includes(modelId);
      return {
        ...cat.toObject(),
        display: isSubscribed
      };
    });

    res.json({ filteredCategories });

  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllPriceList = async (req, res) => {
  try {
    const priceLists = await PriceList.find();
    res.status(200).json(priceLists);
  } catch (err) {
    console.error("Error fetching price lists:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllWideSliders = async (req, res) => {
  try {
    const sliders = await WideSlider.find();
    res.status(200).json(sliders);
  } catch (err) {
    console.error("Error fetching wide sliders:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllFeaturedProducts = async (req, res) => {
  try {
    const fps = await FP.find();
    res.status(200).json(fps);
  } catch (err) {
    console.error("Error fetching wide fps:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (err) {
    console.error("Error fetching wide banners:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllProductGrids = async (req, res) => {
  try {
    const pg = await ProductGrid.find();
    res.status(200).json(pg);
  } catch (err) {
    console.error("Error fetching wide pg:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllTrendingProducts = async (req, res) => {
  try {
    const tp = await TrendProductGroup.find();

    // Merge all `products` arrays into a single array
    const allProducts = tp.reduce((acc, item) => {
      if (Array.isArray(item.products)) {
        acc.push(...item.products);
      }
      return acc;
    }, []);

    res.status(200).json(allProducts);
  } catch (err) {
    console.error("Error fetching trending products:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllBrands = async (req, res) => {
  try {
    // Assuming Brand is the model for the collection holding this one document
    // You can fetch the single document like this:
    const brandDoc = await Brand.findOne().lean();

    if (!brandDoc) {
      return res.status(404).json({ message: "Brands not found" });
    }

    // Remove unwanted fields (_id and __v) from root and from children if you want:
    const { _id, __v, children, ...rest } = brandDoc;
    const cleanedChildren = children.map(({ _id, ...child }) => child);

    const response = {
      ...rest,
      children: cleanedChildren,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching brands:", err);
    res.status(500).json({ message: "Server error" });
  }
};