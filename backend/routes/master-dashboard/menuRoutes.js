import { Router } from "express";
import { addFullMenu } from '../../controllers/master-dashboard/menuController.js'

const router = Router();

// Route to add the entire menu data to MongoDB
router.post("/add-full-menu", addFullMenu);

export default router;
