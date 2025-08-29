import { Router } from "express";
import { 
  getAllBanners, 
  getBannerById, 
  createBanner, 
  updateBanner, 
  deleteBanner, 
  batchImportBanners} from '../../controllers/master-dashboard/bannerController.js'
  

const router = Router();

// Route to get all banners
router.get("/", getAllBanners);

// Route to get a specific banner by ID
router.get("/:id", getBannerById);

// Route to create a new banner
router.post("/create", createBanner);

// Route to update an existing banner by ID
router.put("/update/:id", updateBanner);

// Route to delete a banner by ID
router.delete("/delete/:id", deleteBanner);

// Route for batch importing banners
router.post("/batch-import", batchImportBanners);

export default router;
