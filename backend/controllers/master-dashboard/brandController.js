import Brand from "../../models/Brand.js";

// Get all brands
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve brands", error });
  }
};

// Get a brand by ID
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve brand", error });
  }
};

// Create a new brand
export const createBrand = async (req, res) => {
  const { title, children } = req.body;

  if (!title || !Array.isArray(children) || children.length === 0) {
    return res.status(400).json({ message: "Invalid data. Title and children array are required." });
  }

  try {
    const newBrand = new Brand({ title, children });
    await newBrand.save();
    res.status(201).json({ message: "Brand created successfully", brand: newBrand });
  } catch (error) {
    res.status(500).json({ message: "Failed to create brand", error });
  }
};

// Update an existing brand by ID
export const updateBrand = async (req, res) => {
  const { id } = req.params;
  const { title, children } = req.body;

  try {
    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { title, children },
      { new: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json({ message: "Brand updated successfully", brand: updatedBrand });
  } catch (error) {
    res.status(500).json({ message: "Failed to update brand", error });
  }
};

// Delete a brand by ID
export const deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBrand = await Brand.findByIdAndDelete(id);

    if (!deletedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json({ message: "Brand deleted successfully", brand: deletedBrand });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete brand", error });
  }
};

// Batch import brands
export const batchImportBrands = async (req, res) => {
    try {

        // Extract 'brands' object from req.body
        const { brands } = req.body;


        let existingBrand = await Brand.findOne({ title: brands.title });

        if (existingBrand) {
            existingBrand.children = brands.children;
            await existingBrand.save();
            return res.status(200).json({ message: "Brand updated successfully", brand: existingBrand });
        }

        const newBrand = new Brand({ title: brands.title, children: brands.children });
        await newBrand.save();

        res.status(201).json({ message: "Brand imported successfully", brand: newBrand });
    } catch (error) {
        console.error("Error importing brands:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

