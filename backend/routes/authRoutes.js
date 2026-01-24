import { Router } from "express";
import { signup, login, verifyUser, verifyTokenMaster, getUserInitialData } from "../controllers/authControllers.js";



const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-user", verifyUser);
router.get("/verify-token-master", verifyTokenMaster);
router.get("/user-initial-data", getUserInitialData); // New combined endpoint


export default router;
