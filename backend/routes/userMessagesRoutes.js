import { Router } from "express";
import { getAllUserMessages } from "../controllers/userMessagesControllers.js";
    

const router = Router();



router.get("/", getAllUserMessages);     






export default router;
