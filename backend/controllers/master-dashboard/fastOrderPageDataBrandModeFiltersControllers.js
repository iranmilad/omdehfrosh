import FastOrderFilter from "../../models/FastOrderFilter.js";

// Get all filters
export const getAllFastOrderPageBrandModeFilters = async (req, res) => {
  try {
    const filters = await FastOrderPageBrandModeFilter.find(); // Fetch all filters from the database
    res.status(200).json(filters);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve filters", error });
  }
};

// Get a filter by ID
export const getFastOrderPageBrandModeFilterById = async (req, res) => {
  try {
    const filter = await FastOrderPageBrandModeFilter.findById(req.params.id); // Fetch filter by ID
    if (!filter) {
      return res.status(404).json({ message: "Filter not found" });
    }
    res.status(200).json(filter);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve filter", error });
  }
};

// Create a new filter
export const createFastOrderPageBrandModeFilter = async (req, res) => {
  const { sellers, colors } = req.body;

  try {
    const newFilter = new FastOrderPageBrandModeFilter({
      sellers,
      colors,
    });

    await newFilter.save(); // Save new filter to database
    res.status(201).json({ message: "Filter created successfully", filter: newFilter });
  } catch (error) {
    res.status(500).json({ message: "Failed to create filter", error });
  }
};

// Update an existing filter by ID
export const updateFastOrderPageBrandModeFilter = async (req, res) => {
  const { id } = req.params;
  const { sellers, colors } = req.body;

  try {
    const updatedFilter = await FastOrderPageBrandModeFilter.findByIdAndUpdate(
      id,
      { sellers, colors },
      { new: true } // Return the updated document
    );

    if (!updatedFilter) {
      return res.status(404).json({ message: "Filter not found" });
    }

    res.status(200).json({ message: "Filter updated successfully", filter: updatedFilter });
  } catch (error) {
    res.status(500).json({ message: "Failed to update filter", error });
  }
};

// Delete a filter by ID
export const deleteFastOrderPageBrandModeFilter = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFilter = await FastOrderFilter.findByIdAndDelete(id); // Delete filter by ID

    if (!deletedFilter) {
      return res.status(404).json({ message: "Filter not found" });
    }

    res.status(200).json({ message: "Filter deleted successfully", filter: deletedFilter });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete filter", error });
  }
};

// Batch import filters
export const batchImportFastOrderPageBrandModeFilters = async (req, res) => {
    const filters = req.body.filters; // Extract filters array

    try {
        let mergedFilter = { sellers: [], colors: [], deliveryTime: [] }; // Initialize a merged object

        // Loop through filters and merge sellers and colors into one object
        filters.forEach(filter => {
            if (filter.sellers) {
                mergedFilter.sellers = [...mergedFilter.sellers, ...filter.sellers];
            }
            if (filter.colors) {
                mergedFilter.colors = [...mergedFilter.colors, ...filter.colors];
            }
            if (filter.deliveryTime) {
              mergedFilter.deliveryTime = [...mergedFilter.deliveryTime, ...filter.deliveryTime];
          }
        });


        // Insert the merged filter into the database
        const result = await FastOrderFilter.create(mergedFilter);

        res.status(201).json({
            message: "Filter imported successfully",
            filter: result,
        });

    } catch (error) {
        console.error("Error importing filters:", error);
        res.status(500).json({ message: "Error importing filters", error: error.message });
    }
};
