import { Router } from "express";
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  batchImportTickets}
  from '../../controllers/master-dashboard/ticketsControllers.js'



const router = Router();

// Get all tickets
router.get("/", getAllTickets);

// Get ticket by ID
router.get("/:id", getTicketById);

// Create new ticket
router.post("/create", createTicket);

// Update existing ticket
router.put("/update/:id", updateTicket);

// Delete ticket
router.delete("/delete/:id", deleteTicket);

// Batch import tickets
router.post("/batch-import", batchImportTickets);

export default router;
