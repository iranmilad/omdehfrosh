import Ticket from "../../models/Ticket.js";

// Get all tickets
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve tickets", error });
  }
};


// Get a single ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve ticket", error });
  }
};

// Create a new ticket
export const createTicket = async (req, res) => {
  const { title, message, userId, status } = req.body;

  try {
    const newTicket = new Ticket({ title, message, userId, status });
    await newTicket.save();
    res.status(201).json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    res.status(500).json({ message: "Failed to create ticket", error });
  }
};

// Update a ticket
export const updateTicket = async (req, res) => {
  const { id } = req.params;
  const { title, message, status } = req.body;

  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      { title, message, status },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket updated successfully", ticket: updatedTicket });
  } catch (error) {
    res.status(500).json({ message: "Failed to update ticket", error });
  }
};

// Delete a ticket
export const deleteTicket = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTicket = await Ticket.findByIdAndDelete(id);

    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ message: "Ticket deleted successfully", ticket: deletedTicket });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete ticket", error });
  }
};

// Batch import tickets
export const batchImportTickets = async (req, res) => {
  const { tickets } = req.body;


  try {


    const result = await Ticket.insertMany(tickets);

    res.status(201).json({
      message: `${result.length} tickets imported successfully`,
      tickets: result
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing tickets", error });
  }
};
