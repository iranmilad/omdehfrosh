import FastOrderBrand from "../../models/FastOrderBrand.js";


// Get all fast order brands
export const getAllFastOrderBrands = async (req, res) => {
  try {
    const brands = await FastOrderBrand.find(); // Fetch all brands
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve brands", error });
  }
};

// Get a fast order brand by ID
export const getFastOrderBrandById = async (req, res) => {
  try {
    const brand = await FastOrderBrand.findById(req.params.id); // Fetch brand by ID
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve brand", error });
  }
};

// Create a new fast order brand
export const createFastOrderBrand = async (req, res) => {
  const { id, title, idBrand, name, categories, image } = req.body;

  try {
    const newBrand = new FastOrderBrand({
      id,
      title,
      idBrand,
      name,
      categories,
      image,
    });

    await newBrand.save(); // Save new brand to database
    res.status(201).json({ message: "Brand created successfully", brand: newBrand });
  } catch (error) {
    res.status(500).json({ message: "Failed to create brand", error });
  }
};

// Update an existing fast order brand by ID
export const updateFastOrderBrand = async (req, res) => {
  const { id } = req.params;
  const { title, idBrand, name, categories, image } = req.body;

  try {
    const updatedBrand = await FastOrderBrand.findByIdAndUpdate(
      id,
      { title, idBrand, name, categories, image },
      { new: true } // Return the updated document
    );

    if (!updatedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json({ message: "Brand updated successfully", brand: updatedBrand });
  } catch (error) {
    res.status(500).json({ message: "Failed to update brand", error });
  }
};

// Delete a fast order brand by ID
export const deleteFastOrderBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBrand = await FastOrderBrand.findByIdAndDelete(id); // Delete brand by ID

    if (!deletedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json({ message: "Brand deleted successfully", brand: deletedBrand });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete brand", error });
  }
};

// Batch import fast order brands
export const batchImportFastOrderBrands = async (req, res) => {
  const brands = req.body.brands; // Extract brands array

  if (!Array.isArray(brands) || brands.length === 0) {
    return res.status(400).json({ message: "Invalid data. Expected an array of brands." });
  }

  try {
    // Validate required fields
    const invalidBrands = brands.filter(
      (brand) => !brand.id || !brand.title || !brand.idBrand || !brand.name || !brand.image
    );

    if (invalidBrands.length > 0) {
      return res.status(400).json({ message: "Some brands are missing required fields." });
    }

    // Insert brands into the database using insertMany
    const result = await FastOrderBrand.insertMany(brands);

    res.status(201).json({
      message: `${result.length} brands imported successfully`,
      brands: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing brands", error });
  }
};
