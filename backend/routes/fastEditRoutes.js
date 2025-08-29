import express from "express";
import {
    updateProduct }
    from '../controllers/fastEditControllers.js'

const router = express.Router();


router.put("/updateproduct", updateProduct);




export default router;
