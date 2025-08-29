import express from "express";
import {
  // getUsers,
  newSMSCode, verifySMS,
  // updateUser,
  // removeUser
} from "../controllers/smsControllers.js"; // Make sure this is updated to use the new controller


const router = express.Router();

// Routes for users
router.post(`/newsmscode`, newSMSCode); // Add a user
router.post(`/verifysms`, verifySMS); // Add a user


export default router;
