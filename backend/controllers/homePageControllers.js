import getUserFromToken from '../libs/verifyToken.js';
import {
  buildHomePageFromSections,
  buildLegacyHomePage,
} from '../libs/homePageSectionBuilder.js';
import Category from '../models/Category.js';
import UserAccount from '../models/User.js';
import PriceList from "../models/PriceList.js";
import WideSlider from "../models/WideSlider.js";
import FP from '../models/FP.js';
import Banner from '../models/Banner.js';
import ProductGrid from '../models/ProductGrid.js';
import TrendProductGroup from '../models/TrendProduct.js';
import Brand from '../models/Brand.js';

const toPlainObject = (obj) => {
  if (obj && typeof obj.toObject === 'function') return obj.toObject();
  if (obj && typeof obj.toJSON === 'function') return obj.toJSON();
  return obj;
};

const generateMockInventory = () => {
  const stockOptions = [1000, 5000, 1000, 1005, 2000, 2005, 3000, 5000, 7005, 10000, 15000, 20000];
  const minOrderOptions = [1, 2, 5, 10];
  const stock = stockOptions[Math.floor(Math.random() * stockOptions.length)];
  const minOrder = minOrderOptions[Math.floor(Math.random() * minOrderOptions.length)];
  let maxOrder;
  if (stock === 0) maxOrder = 0;
  else if (stock <= minOrder) maxOrder = stock;
  else {
    const possibleMaxOrders = [minOrder * 2, minOrder * 5, minOrder * 10, stock];
    maxOrder = Math.min(
      possibleMaxOrders[Math.floor(Math.random() * possibleMaxOrders.length)],
      stock
    );
  }
  return { stock, minOrder, maxOrder };
};

const enrichProductsWithInventory = (products) =>
  products.map((product) => ({
    ...toPlainObject(product),
    ...generateMockInventory(),
  }));

export const getHomePageData = async (req, res) => {
  console.log("Fetching home page data...");

  try {
    const userData = getUserFromToken(req, res);

    let data = await buildHomePageFromSections(userData);
    let source = "homePageSections";

    if (!data || data.length === 0) {
      source = "legacy";
      try {
        data = await buildLegacyHomePage(userData);
      } catch (legacyErr) {
        if (legacyErr.message === "USER_NOT_FOUND") {
          return res.status(404).json({ message: "User not found" });
        }
        throw legacyErr;
      }
    }

    res.json({
      message: "ok",
      source,
      count: data?.length ?? 0,
      data,
    });
  } catch (err) {
    console.error("Error fetching home page data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCategoriesByUserId = async (req, res) => {
  try {
    const userData = getUserFromToken(req, res);
    const allCategories = await Category.find({});

    if (!userData || !userData.user_id) {
      const filteredCategories = allCategories.map((cat, index) => {
        const modelId = cat.subscriptionModel?.modelId;
        return {
          ...cat.toObject(),
          display: index < 3 || !modelId || modelId === "basic"
        };
      });

      return res.json({ filteredCategories });
    }

    const { user_id } = userData;
    const user = await UserAccount.findOne({ userId: user_id });

    if (!user) return res.status(404).json({ message: "User not found" });

    let userSubscriptions = [];
    if (user.subscriptions) {
      if (typeof user.subscriptions === 'object') {
        userSubscriptions = Object.keys(user.subscriptions);
      } else if (Array.isArray(user.subscriptions)) {
        userSubscriptions = user.subscriptions;
      }
    }

    const filteredCategories = allCategories.map((cat, index) => {
      const modelId = cat.subscriptionModel?.modelId;
      
      if (index < 3 || !modelId) {
        return {
          ...cat.toObject(),
          display: true
        };
      }

      const isSubscribed = userSubscriptions.some(
        sub => sub.toLowerCase() === modelId.toLowerCase()
      );
      
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
    const enrichedFps = enrichProductsWithInventory(fps);
    res.status(200).json(enrichedFps);
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
    const brandDoc = await Brand.findOne().lean();

    if (!brandDoc) {
      return res.status(404).json({ message: "Brands not found" });
    }

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
