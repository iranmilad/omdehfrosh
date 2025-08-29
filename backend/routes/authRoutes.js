import { Router } from "express";
import { signup, login, verifyUser, verifyTokenMaster } from "../controllers/authControllers.js";

const router = Router();

router.post("/signup", signup); 
router.post("/login", login);
router.get("/verify-user", verifyUser); 
router.get("/verify-token-master", verifyTokenMaster); 


export default router;
