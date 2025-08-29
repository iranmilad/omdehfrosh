import ProductGrid from "../../models/ProductGrid.js";


export const getAllProductGrids = async (req, res) => {
  try {
    const productGrids = await ProductGrid.find();
    res.status(200).json(productGrids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductGridById = async (req, res) => {
  try {
    const productGrid = await ProductGrid.findById(req.params.id);
    if (!productGrid) return res.status(404).json({ message: "Product grid not found" });
    res.status(200).json(productGrid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProductGrid = async (req, res) => {
  try {
    const newProductGrid = new ProductGrid(req.body);
    await newProductGrid.save();
    res.status(201).json(newProductGrid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProductGrid = async (req, res) => {
  try {
    const updatedProductGrid = await ProductGrid.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProductGrid) return res.status(404).json({ message: "Product grid not found" });
    res.status(200).json(updatedProductGrid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProductGrid = async (req, res) => {
  try {
    const deletedProductGrid = await ProductGrid.findByIdAndDelete(req.params.id);
    if (!deletedProductGrid) return res.status(404).json({ message: "Product grid not found" });
    res.status(200).json({ message: "Product grid deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const batchImportProductGrids = async (req, res) => {
  try {
    // Extract the actual product grids array
    const { productGrid } = req.body;


    // Insert into the database
    await ProductGrid.insertMany(productGrid);
    
    res.status(201).json({ message: "Batch import successful" });
  } catch (error) {
    console.error("Error inserting product grids:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

