import Archive from "../../models/Archive.js";


export const getAllArchives = async (req, res) => {
  try {
    const archives = await Archive.find().populate("products");
    res.status(200).json(archives);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve archives", error });
  }
};


export const getArchiveById = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id).populate("products");

    if (!archive) {
      return res.status(404).json({ message: "Archive not found" });
    }

    res.status(200).json(archive);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve archive", error });
  }
};


export const createArchive = async (req, res) => {
  try {
    const { totalPages, price, products, filters } = req.body;

    if (!totalPages || !price || !filters) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newArchive = new Archive({
      totalPages,
      price,
      products,
      filters,
    });

    await newArchive.save();
    res.status(201).json({ message: "Archive created successfully", archive: newArchive });
  } catch (error) {
    res.status(500).json({ message: "Failed to create archive", error });
  }
};


export const updateArchive = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalPages, price, products, filters } = req.body;

    const updatedArchive = await Archive.findByIdAndUpdate(
      id,
      { totalPages, price, products, filters },
      { new: true }
    );

    if (!updatedArchive) {
      return res.status(404).json({ message: "Archive not found" });
    }

    res.status(200).json({ message: "Archive updated successfully", archive: updatedArchive });
  } catch (error) {
    res.status(500).json({ message: "Failed to update archive", error });
  }
};


export const deleteArchive = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedArchive = await Archive.findByIdAndDelete(id);

    if (!deletedArchive) {
      return res.status(404).json({ message: "Archive not found" });
    }

    res.status(200).json({ message: "Archive deleted successfully", archive: deletedArchive });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete archive", error });
  }
};


export const batchImportArchives = async (req, res) => {
  const archives = req.body; // Extract archives array properly


  try {


    // Insert archives into the database using insertMany
    const result = await Archive.insertMany(archives);

    res.status(201).json({
      message: `${result.length} archives imported successfully`,
      archives: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing archives", error });
  }
};
