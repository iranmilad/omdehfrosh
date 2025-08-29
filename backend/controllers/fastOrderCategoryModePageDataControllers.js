import FastOrderCategory from '../models/FastOrderCategory.js'


// Get all fast order categories
export const getAllFastOrderCategories = async (req, res) => {
  try {
    const categories = await FastOrderCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve categories", error });
  }
};



// Get a fast order category by ID
export const getFastOrderCategoryById = async (req, res) => {
  try {
    const category = await FastOrderCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve category", error });
  }
};

// Create a new fast order category
export const createFastOrderCategory = async (req, res) => {
  const { id, title, description, image, parentCategory } = req.body;

  try {
    const newCategory = new FastOrderCategory({
      id,
      title,
      description,
      image,
      parentCategory,
    });

    await newCategory.save();
    res.status(201).json({ message: "Category created successfully", category: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Failed to create category", error });
  }
};

// Update an existing fast order category by ID
export const updateFastOrderCategory = async (req, res) => {
  const { id } = req.params;
  const { title, description, image, parentCategory } = req.body;

  try {
    const updatedCategory = await FastOrderCategory.findByIdAndUpdate(
      id,
      { title, description, image, parentCategory },
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

// Delete a fast order category by ID
export const deleteFastOrderCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await FastOrderCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully", category: deletedCategory });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category", error });
  }
};

// Batch import fast order categories
export const batchImportFastOrderCategories = async (req, res) => {
  const categoriesFastOrder = req.body;


  try {
    // Validate required fields
    // const invalidCategories = categories.filter(
    //   (category) => !category.id || !category.title || !category.image
    // );

    // if (invalidCategories.length > 0) {
    //   return res.status(400).json({ message: "Some categories are missing required fields." });
    // }

    // Insert categories into the database
    const result = await FastOrderCategory.insertMany(categoriesFastOrder);

    res.status(201).json({
      message: `${result.length} categories imported successfully`,
      categories: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing categories", error });
  }
};
