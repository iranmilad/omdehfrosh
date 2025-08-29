import Category from "../../models/Category.js";
import CategoryFilter from "../../models/CategoryFilters.js";

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve categories", error });
    }
};

// Get a category by ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve category", error });
    }
};

// Create a new category
export const createCategory = async (req, res) => {
    const { image, title, url } = req.body;

    if (!image || !title || !url) {
        return res.status(400).json({ message: "Invalid data. Image, title, and URL are required." });
    }

    try {
        const newCategory = new Category({ image, title, url });
        await newCategory.save();
        res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
        res.status(500).json({ message: "Failed to create category", error });
    }
};

// Update an existing category by ID
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { image, title, url } = req.body;

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { image, title, url },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: "Failed to update category", error });
    }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ message: "Category deleted successfully", category: deletedCategory });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete category", error });
    }
};

// Batch import categories
export const batchImportCategories = async (req, res) => {
    try {

        const { categories } = req.body;
        
        const result = await Category.insertMany(categories);




        res.status(201).json({ message: "Categories imported successfully" });
    } catch (error) {
        console.error("Error importing categories:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Batch import categories
export const batchImportCategoryFilters = async (req, res) => {
    try {

        const { categoryFilters } = req.body;
        
        const result = await CategoryFilter.insertMany(categoryFilters);

        res.status(201).json({ message: "category filters imported successfully" });
    } catch (error) {
        console.error("Error importing categories:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};