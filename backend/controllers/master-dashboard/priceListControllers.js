import PriceList from '../../models/PriceList.js'




// Get all price lists
export const getAllPriceLists = async (req, res) => {
  try {
    const priceLists = await PriceList.find();
    res.status(200).json(priceLists);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve price lists", error });
  }
};

// Get a price list by ID
export const getPriceListById = async (req, res) => {
  try {
    const priceList = await PriceList.findById(req.params.id);
    if (!priceList) {
      return res.status(404).json({ message: "Price list not found" });
    }
    res.status(200).json(priceList);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve price list", error });
  }
};

// Create a new price list
export const createPriceList = async (req, res) => {
  const { title, id, tablelist } = req.body;

  try {
    const newPriceList = new PriceList({ title, id, tablelist });
    await newPriceList.save();
    res.status(201).json({ message: "Price list created successfully", priceList: newPriceList });
  } catch (error) {
    res.status(500).json({ message: "Failed to create price list", error });
  }
};

// Update an existing price list by ID
export const updatePriceList = async (req, res) => {
  const { id } = req.params;
  const { title, tablelist } = req.body;

  try {
    const updatedPriceList = await PriceList.findByIdAndUpdate(
      id,
      { title, tablelist },
      { new: true }
    );

    if (!updatedPriceList) {
      return res.status(404).json({ message: "Price list not found" });
    }

    res.status(200).json({ message: "Price list updated successfully", priceList: updatedPriceList });
  } catch (error) {
    res.status(500).json({ message: "Failed to update price list", error });
  }
};

// Delete a price list by ID
export const deletePriceList = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPriceList = await PriceList.findByIdAndDelete(id);

    if (!deletedPriceList) {
      return res.status(404).json({ message: "Price list not found" });
    }

    res.status(200).json({ message: "Price list deleted successfully", priceList: deletedPriceList });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete price list", error });
  }
};

// Batch import price lists
export const batchImportPriceLists = async (req, res) => {
  const { priceList } = req.body;



  try {


    const result = await PriceList.insertMany(priceList);

    res.status(201).json({
      message: `${result.length} price lists imported successfully`,
      priceList: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing price lists", error });
  }
};
