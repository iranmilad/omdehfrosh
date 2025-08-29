import FP from "../../models/FP.js";

// Get all FPs
export const getAllFPs = async (req, res) => {
  try {
    const fps = await FP.find();
    res.status(200).json(fps);
  } catch (err) {
    console.error("Error fetching FPs:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get FP by ID
export const getFPById = async (req, res) => {
  try {
    const fp = await FP.findById(req.params.id);
    if (!fp) {
      return res.status(404).json({ message: "FP not found" });
    }
    res.status(200).json(fp);
  } catch (err) {
    console.error("Error fetching FP:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new FP
export const createFP = async (req, res) => {
  try {
    const newFP = new FP(req.body);
    await newFP.save();
    res.status(201).json({ message: "FP created successfully", fp: newFP });
  } catch (err) {
    console.error("Error creating FP:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update FP by ID
export const updateFP = async (req, res) => {
  try {
    const updatedFP = await FP.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFP) {
      return res.status(404).json({ message: "FP not found" });
    }
    res.status(200).json({ message: "FP updated successfully", fp: updatedFP });
  } catch (err) {
    console.error("Error updating FP:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete FP by ID
export const deleteFP = async (req, res) => {
  try {
    const deletedFP = await FP.findByIdAndDelete(req.params.id);
    if (!deletedFP) {
      return res.status(404).json({ message: "FP not found" });
    }
    res.status(200).json({ message: "FP deleted successfully", fp: deletedFP });
  } catch (err) {
    console.error("Error deleting FP:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Batch import FPs
export const batchImportFPs = async (req, res) => {
  const fps = req.body.featuredproducts;



  try {

    const result = await FP.insertMany(fps);


    res.status(201).json({
      message: `${result.length} FPs imported successfully`,
      fps: result
    });


  } catch (err) {
    console.error("Error importing FPs:", err);
    res.status(500).json({ message: "Server error" });
  }
};
