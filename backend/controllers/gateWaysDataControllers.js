import GateWay from '../models/Gateway.js'

// Get all gateways
export const getAllGateWaysData = async (req, res) => {

  const {state} = req.body; // Extract state from the request body


  try {
    let gateways;

    if (state === "all") {
      gateways = await GateWay.find(); // fetch all gateways
    } else if (state === "online") {
      gateways = await GateWay.find({ "info.paymentMethod": "online" }); // filter by payment method
    } else {
      return res.status(400).json({ message: "Invalid state parameter" });
    }

    res.status(200).json(gateways);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve gateways", error });
  }
};

// Get a specific gateway by ID
export const getGateWayDataById = async (req, res) => {
  try {
    const gateway = await GateWay.findById(req.params.id); // Fetch gateway by ID
    if (!gateway) {
      return res.status(404).json({ message: "Gateway not found" });
    }
    res.status(200).json(gateway); // Return the gateway
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve gateway", error });
  }
};

// Create a new gateway
export const createGateWayData = async (req, res) => {
  const { name, label, description, icon } = req.body; // Destructure required fields

  try {
    const newGateway = new GateWay({
      name,
      label,
      description,
      icon,
    });

    await newGateway.save(); // Save new gateway to the database
    res.status(201).json({ message: "Gateway created successfully", gateway: newGateway });
  } catch (error) {
    res.status(500).json({ message: "Failed to create gateway", error });
  }
};

// Update an existing gateway by ID
export const updateGateWayData = async (req, res) => {
  const { id } = req.params;
  const { name, label, description, icon } = req.body;

  try {
    const updatedGateway = await GateWay.findByIdAndUpdate(
      id,
      { name, label, description, icon },
      { new: true } // Return the updated document
    );

    if (!updatedGateway) {
      return res.status(404).json({ message: "Gateway not found" });
    }

    res.status(200).json({ message: "Gateway updated successfully", gateway: updatedGateway });
  } catch (error) {
    res.status(500).json({ message: "Failed to update gateway", error });
  }
};

// Delete a gateway by ID
export const deleteGateWayData = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedGateway = await GateWay.findByIdAndDelete(id); // Delete gateway by ID

    if (!deletedGateway) {
      return res.status(404).json({ message: "Gateway not found" });
    }

    res.status(200).json({ message: "Gateway deleted successfully", gateway: deletedGateway });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete gateway", error });
  }
};

// Batch import gateways
export const batchImportGateWaysData = async (req, res) => {
  const gateways = req.body.gateways; // Extract gateways array from the request body

  if (!Array.isArray(gateways) || gateways.length === 0) {
    return res.status(400).json({ message: "Invalid data. Expected an array of gateways." });
  }

  try {
    // Check for missing required fields in any gateway (optional validation)
    const invalidGateways = gateways.filter(
      (gateway) => !gateway.name || !gateway.label || !gateway.description || !gateway.icon
    );

    if (invalidGateways.length > 0) {
      return res.status(400).json({ message: "Some gateways are missing required fields." });
    }

    // Insert gateways into the database using insertMany
    const result = await GateWay.insertMany(gateways);

    res.status(201).json({
      message: `${result.length} gateways imported successfully`,
      gateways: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing gateways", error });
  }
};
