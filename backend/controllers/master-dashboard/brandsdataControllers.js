import BrandsData from "../../models/BrandsData.js";

// Get all brands
export const getAllBrands = async (req, res) => {
    try {
        const brands = await BrandsData.find();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve brands", error });
    }
};

// Get a brand by ID
export const getBrandById = async (req, res) => {
    try {
        const brand = await BrandsData.findById(req.params.id);
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
    const { name, slug, logo, description, origin_country, headquarters } = req.body;

    if (!name || !slug || !logo || !description || !origin_country || !headquarters) {
        return res.status(400).json({ 
            message: "Invalid data. Name, slug, logo, description, origin_country, and headquarters are required." 
        });
    }

    try {
        const newBrand = new BrandsData(req.body);
        await newBrand.save();
        res.status(201).json({ message: "Brand created successfully", brand: newBrand });
    } catch (error) {
        res.status(500).json({ message: "Failed to create brand", error });
    }
};

// Update an existing brand by ID
export const updateBrand = async (req, res) => {
    const { id } = req.params;

    try {
        const updatedBrand = await BrandsData.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
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
        const deletedBrand = await BrandsData.findByIdAndDelete(id);

        if (!deletedBrand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        res.status(200).json({ message: "Brand deleted successfully", brand: deletedBrand });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete brand", error });
    }
};

// Batch import brands
export const batchImportBrandsDatas = async (req, res) => {
    try {
        const { brandsData } = req.body;

        if (!brandsData) {
            return res.status(400).json({ 
                message: "No brandsData provided in request body" 
            });
        }

        // Convert object to array if needed
        let dataToInsert;
        if (Array.isArray(brandsData)) {
            dataToInsert = brandsData;
        } else if (typeof brandsData === 'object') {
            // Convert object values to array
            dataToInsert = Object.values(brandsData);
        } else {
            return res.status(400).json({ 
                message: "brandsData must be an array or object" 
            });
        }

        // Remove the 'id' field from each brand since MongoDB will generate _id
        const cleanedData = dataToInsert.map(brand => {
            const { id, ...brandWithoutId } = brand;
            return brandWithoutId;
        });

        // Use the data exactly as received - no other transformation
        const result = await BrandsData.insertMany(cleanedData, { 
            ordered: false, // Continue inserting even if some documents fail
            validateBeforeSave: true 
        });

        res.status(201).json({ 
            message: "Brands imported successfully", 
            count: result.length
        });
    } catch (error) {
        console.error("Error importing brands:", error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({ 
                message: "Some brands already exist (duplicate slug)", 
                error: error.message 
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation error", 
                details: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }
        
        // Handle bulk write errors
        if (error.name === 'BulkWriteError') {
            return res.status(400).json({
                message: "Bulk write error",
                details: error.writeErrors?.map(err => ({
                    index: err.index,
                    error: err.errmsg
                }))
            });
        }
        
        res.status(500).json({ 
            message: "Server error", 
            error: error.message 
        });
    }
};