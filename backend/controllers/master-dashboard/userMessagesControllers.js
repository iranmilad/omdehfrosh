import UserMessage from "../../models/UserMessage.js";

// Get all user messages
export const getAllUserMessages = async (req, res) => {
  try {
    const userMessages = await UserMessage.find(); // Fetch all user messages from the database
    res.status(200).json(userMessages);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve user messages", error });
  }
};

// Get a user message by ID
export const getUserMessageById = async (req, res) => {
  try {
    const userMessage = await UserMessage.findById(req.params.id); // Fetch user message by ID
    if (!userMessage) {
      return res.status(404).json({ message: "User message not found" });
    }
    res.status(200).json(userMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve user message", error });
  }
};

// Create a new user message
export const createUserMessage = async (req, res) => {
  const { userId, message, status, createdAt } = req.body;

  try {
    const newUserMessage = new UserMessage({
      userId,
      message,
      status,
      createdAt,
    });

    await newUserMessage.save(); // Save new user message to database
    res.status(201).json({ message: "User message created successfully", userMessage: newUserMessage });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user message", error });
  }
};

// Update an existing user message by ID
export const updateUserMessage = async (req, res) => {
  const { id } = req.params;
  const { message, status } = req.body;

  try {
    const updatedUserMessage = await UserMessage.findByIdAndUpdate(
      id,
      { message, status },
      { new: true } // Return the updated document
    );

    if (!updatedUserMessage) {
      return res.status(404).json({ message: "User message not found" });
    }

    res.status(200).json({ message: "User message updated successfully", userMessage: updatedUserMessage });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user message", error });
  }
};

// Delete a user message by ID
export const deleteUserMessage = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUserMessage = await UserMessage.findByIdAndDelete(id); // Delete user message by ID

    if (!deletedUserMessage) {
      return res.status(404).json({ message: "User message not found" });
    }

    res.status(200).json({ message: "User message deleted successfully", userMessage: deletedUserMessage });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user message", error });
  }
};

// Batch import user messages
export const batchImportUserMessages = async (req, res) => {
  const userMessages = req.body.messages; // Extract userMessages array properly

  try {

    // Insert user messages into the database using insertMany
    const result = await UserMessage.insertMany(userMessages);

    res.status(201).json({
      message: `${result.length} user messages imported successfully`,
      userMessages: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing user messages", error });
  }
};
