import Gateway from '../../models/Gateway.js'

// Get all gateways
export const getAllGateways = async (req, res) => {
  try {
    const gateways = await Gateway.find(); // Fetch all gateways from the database
    res.status(200).json(gateways);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve gateways", error });
  }
};

// Get a gateway by ID
export const getGatewayById = async (req, res) => {
  try {
    const gateway = await Gateway.findById(req.params.id); // Fetch gateway by ID
    if (!gateway) {
      return res.status(404).json({ message: "Gateway not found" });
    }
    res.status(200).json(gateway);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve gateway", error });
  }
};

// Create a new gateway
export const createGateway = async (req, res) => {
  const { name, label, description, icon } = req.body;

  try {
    const newGateway = new Gateway({
      name,
      label,
      description,
      icon,
    });

    await newGateway.save(); // Save new gateway to database
    res.status(201).json({ message: "Gateway created successfully", gateway: newGateway });
  } catch (error) {
    res.status(500).json({ message: "Failed to create gateway", error });
  }
};

// Update an existing gateway by ID
export const updateGateway = async (req, res) => {
  const { id } = req.params;
  const { name, label, description, icon } = req.body;

  try {
    const updatedGateway = await Gateway.findByIdAndUpdate(
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
export const deleteGateway = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedGateway = await Gateway.findByIdAndDelete(id); // Delete gateway by ID

    if (!deletedGateway) {
      return res.status(404).json({ message: "Gateway not found" });
    }

    res.status(200).json({ message: "Gateway deleted successfully", gateway: deletedGateway });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete gateway", error });
  }
};

// Batch import gateways
export const batchImportGateways = async (req, res) => {
  const gateways = req.body.gateways; // Extract gateways array from request body


  try {
    
    const result = await Gateway.insertMany(gateways);

    res.status(201).json({
      message: `${result.length} gateways imported successfully`,
      gateways: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing gateways", error });
  }
};
