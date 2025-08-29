import { Router } from "express";
import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  batchImportSubscriptions,
} from "../../controllers/master-dashboard/subscriptionsControllers.js";

const router = Router();

// Get all subscriptions
router.get("/", getAllSubscriptions);

// Get a subscription by ID
router.get("/:id", getSubscriptionById);

// Create a new subscription
router.post("/create", createSubscription);

// Update a subscription by ID
router.put("/update/:id", updateSubscription);

// Delete a subscription by ID
router.delete("/delete/:id", deleteSubscription);

// Batch import subscriptions
router.post("/batch-import", batchImportSubscriptions);

export default router;
