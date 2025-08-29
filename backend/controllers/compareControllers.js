import SingleProduct from '../models/SingleProduct.js';



export const getCompareList = async (req, res) => {
  try {
    const { items } = req.body;
    const itemIds = items?.itemIds;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: "No item IDs provided" });
    }

    const products = await SingleProduct.find({
      id: { $in: itemIds }
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching compare list:", error);
    return res.status(500).json({ message: "Server error while fetching compare list" });
  }
};
