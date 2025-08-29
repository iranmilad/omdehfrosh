import { Router } from "express";
import {
  getHomePageData, // New combined endpoint
  getCategoriesByUserId,
  getAllPriceList,
  getAllWideSliders,
  getAllFeaturedProducts,
  getAllBanners,
  getAllProductGrids,
  getAllTrendingProducts,
  getAllBrands
} from '../controllers/homePageControllers.js'

const router = Router();

// Combined home page data endpoint - NEW
router.get("/homepagedata", getHomePageData);

// Individual endpoints (kept for backward compatibility)
router.get("/getallhomepagecategoriesbyuserid", getCategoriesByUserId);
router.get("/getallpricelist", getAllPriceList);
router.get("/getallwidesliders", getAllWideSliders);
router.get("/getallfeaturedproducts", getAllFeaturedProducts);
router.get("/getallproductgrids", getAllProductGrids);
router.get("/getallbanners", getAllBanners);
router.get("/getalltrendingproducts", getAllTrendingProducts);
router.get("/getallbrands", getAllBrands);

export default router;