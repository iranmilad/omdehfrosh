import FastOrderLocation from "../../models/FastOrderLocation.js";

// Get all fast order locations
export const getAllFastOrderLocations = async (req, res) => {
  try {
    const locations = await FastOrderLocation.find(); // Fetch all locations from the database
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve locations", error });
  }
};

// Get a specific fast order location by ID
export const getFastOrderLocationById = async (req, res) => {
  try {
    const location = await FastOrderLocation.findById(req.params.id); // Fetch location by ID
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve location", error });
  }
};

// Create a new fast order location
export const createFastOrderLocation = async (req, res) => {
  const { idSupplier, nameSupplier, label, locations } = req.body;

  try {
    const newLocation = new FastOrderLocation({
      idSupplier,
      nameSupplier,
      label,
      locations,
    });

    await newLocation.save(); // Save new location to the database
    res.status(201).json({ message: "Location created successfully", location: newLocation });
  } catch (error) {
    res.status(500).json({ message: "Failed to create location", error });
  }
};

// Update an existing fast order location by ID
export const updateFastOrderLocation = async (req, res) => {
  const { id } = req.params;
  const { idSupplier, nameSupplier, label, locations } = req.body;

  try {
    const updatedLocation = await FastOrderLocation.findByIdAndUpdate(
      id,
      { idSupplier, nameSupplier, label, locations },
      { new: true } // Return the updated document
    );

    if (!updatedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json({ message: "Location updated successfully", location: updatedLocation });
  } catch (error) {
    res.status(500).json({ message: "Failed to update location", error });
  }
};

// Delete a fast order location by ID
export const deleteFastOrderLocation = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLocation = await FastOrderLocation.findByIdAndDelete(id); // Delete location by ID

    if (!deletedLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json({ message: "Location deleted successfully", location: deletedLocation });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete location", error });
  }
};

// Batch import fast order locations
export const batchImportFastOrderLocations = async (req, res) => {
  const {availableLocations} = req.body; // Extract locations array properly


  try {


    // Insert locations into the database using insertMany
    const result = await FastOrderLocation.insertMany(availableLocations);

    res.status(201).json({
      message: `${result.length} locations imported successfully`,
      locations: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing locations", error });
  }
};
