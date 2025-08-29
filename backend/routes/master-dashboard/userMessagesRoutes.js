import { Router } from "express";
import { 
  getAllUserMessages, 
  getUserMessageById, 
  createUserMessage, 
  updateUserMessage, 
  deleteUserMessage, 
  batchImportUserMessages 
} from '../../controllers/master-dashboard/userMessagesControllers.js';

const router = Router();

// Route to get all user messages
router.get("/", getAllUserMessages);

// Route to get a specific user message by ID
router.get("/:id", getUserMessageById);

// Route to create a new user message
router.post("/create", createUserMessage);

// Route to update an existing user message by ID
router.put("/update/:id", updateUserMessage);

// Route to delete a user message by ID
router.delete("/delete/:id", deleteUserMessage);

// Route for batch importing user messages
router.post("/batch-import", batchImportUserMessages);

export default router;
