import Subscription from "../../models/Subscription.js";

// Get all subscriptions
export const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve subscriptions", error });
  }
};

// Get subscription by ID
export const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.status(200).json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve subscription", error });
  }
};

// Create a new subscription
export const createSubscription = async (req, res) => {
  try {
    const newSubscription = new Subscription(req.body);
    await newSubscription.save();
    res.status(201).json({ message: "Subscription created successfully", subscription: newSubscription });
  } catch (error) {
    res.status(500).json({ message: "Failed to create subscription", error });
  }
};

// Update a subscription by ID
export const updateSubscription = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedSubscription = await Subscription.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedSubscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.status(200).json({ message: "Subscription updated successfully", subscription: updatedSubscription });
  } catch (error) {
    res.status(500).json({ message: "Failed to update subscription", error });
  }
};

// Delete a subscription by ID
export const deleteSubscription = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSubscription = await Subscription.findByIdAndDelete(id);
    if (!deletedSubscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    res.status(200).json({ message: "Subscription deleted successfully", subscription: deletedSubscription });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete subscription", error });
  }
};

// Batch import subscriptions
export const batchImportSubscriptions = async (req, res) => {
  const { subscriptions } = req.body;

//   if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
//     return res.status(400).json({ message: "Invalid data. Expected an array of subscriptions." });
//   }


  try {
    // Optional validation can go here if needed
    const result = await Subscription.insertMany(subscriptions);

    res.status(201).json({
      message: `${result.length} subscriptions imported successfully`,
      subscriptions: result,
    });


  } catch (error) {
    res.status(500).json({ message: "Error importing subscriptions", error });
  }
};
