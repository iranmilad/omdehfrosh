import SingleProduct from '../../models/SingleProduct.js'



// Get all single products
export const getAllSingleProducts = async (req, res) => {
  try {
    const singleProducts = await SingleProduct.find();
    res.json(singleProducts);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving single products", error });
  }
};

// Get a single product by ID
export const getSingleProductById = async (req, res) => {
  try {
    const singleProduct = await SingleProduct.findById(req.params.id);
    if (!singleProduct) {
      return res.status(404).json({ message: "Single product not found" });
    }
    res.json(singleProduct);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving single product", error });
  }
};

// Create a new single product
export const createSingleProduct = async (req, res) => {
  try {
    const newSingleProduct = new SingleProduct(req.body);
    await newSingleProduct.save();
    res.status(201).json(newSingleProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating single product", error });
  }
};

// Update an existing single product
export const updateSingleProduct = async (req, res) => {
  try {
    const updatedSingleProduct = await SingleProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSingleProduct) {
      return res.status(404).json({ message: "Single product not found" });
    }
    res.json(updatedSingleProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating single product", error });
  }
};

// Delete a single product by ID
export const deleteSingleProduct = async (req, res) => {
  try {
    const deletedSingleProduct = await SingleProduct.findByIdAndDelete(req.params.id);
    if (!deletedSingleProduct) {
      return res.status(404).json({ message: "Single product not found" });
    }
    res.json({ message: "Single product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting single product", error });
  }
};

// Batch import single products
export const batchImportSingleProducts = async (req, res) => {
  const { singleProducts } = req.body


  try {
    const singleProductsInsert = await SingleProduct.insertMany(singleProducts);
    res.status(201).json({ message: "Single products imported successfully", singleProductsInsert });
  } catch (error) {
    console.error("Error importing single products:", error);
    res.status(500).json({ message: "Error importing single products", error: error.message });
}
};
