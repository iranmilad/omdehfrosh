import { Router } from "express";
import { 
    getCompareList, 
     } from "../controllers/compareControllers.js";
    

const router = Router();

router.post("/", getCompareList);            


export default router;
