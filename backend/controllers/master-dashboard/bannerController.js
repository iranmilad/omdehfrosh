import Banner from "../../models/Banner.js";

// Get all banners
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve banners", error });
  }
};

// Get a banner by ID
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.status(200).json(banner);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve banner", error });
  }
};

// Create a new banner
export const createBanner = async (req, res) => {
  const { image, url } = req.body;

  try {
    const newBanner = new Banner({ image, url });
    await newBanner.save();
    res.status(201).json({ message: "Banner created successfully", banner: newBanner });
  } catch (error) {
    res.status(500).json({ message: "Failed to create banner", error });
  }
};

// Update an existing banner by ID
export const updateBanner = async (req, res) => {
  const { id } = req.params;
  const { image, url } = req.body;

  try {
    const updatedBanner = await Banner.findByIdAndUpdate(id, { image, url }, { new: true });

    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json({ message: "Banner updated successfully", banner: updatedBanner });
  } catch (error) {
    res.status(500).json({ message: "Failed to update banner", error });
  }
};

// Delete a banner by ID
export const deleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBanner = await Banner.findByIdAndDelete(id);

    if (!deletedBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.status(200).json({ message: "Banner deleted successfully", banner: deletedBanner });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete banner", error });
  }
};

// Batch import banners
export const batchImportBanners = async (req, res) => {
    const { banners } = req.body;
  
    if (!Array.isArray(banners) || banners.length === 0) {
      return res.status(400).json({ message: "Invalid data. Expected an array of banners." });
    }
  
    try {
      // Validate required fields
      const invalidBanners = banners.filter((banner) => !banner.image || !banner.url);
      
      if (invalidBanners.length > 0) {
        return res.status(400).json({ message: "Some banners are missing required fields." });
      }
  
      // Insert banners into the database
      const result = await Banner.insertMany(banners);
  
      res.status(201).json({
        message: `${result.length} banners imported successfully`,
        banners: result,
      });
    } catch (error) {
      res.status(500).json({ message: "Error importing banners", error });
    }
  };
  