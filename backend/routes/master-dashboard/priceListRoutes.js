import { Router } from "express";
import {
  getAllPriceLists,
  getPriceListById,
  createPriceList,
  updatePriceList,
  deletePriceList,
  batchImportPriceLists,
} from '../../controllers/master-dashboard/priceListControllers.js'

const router = Router();

router.get("/", getAllPriceLists);
router.get("/:id", getPriceListById);
router.post("/create", createPriceList);
router.put("/update/:id", updatePriceList);
router.delete("/delete/:id", deletePriceList);
router.post("/batch-import", batchImportPriceLists);

export default router;
