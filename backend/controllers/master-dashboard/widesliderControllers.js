import WideSlider from "../../models/WideSlider.js"

// Get all wide sliders
export const getAllWideSliders = async (req, res) => {
  try {
    const sliders = await WideSlider.find();
    res.status(200).json(sliders);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve wide sliders", error });
  }
};

// Get a wide slider by ID
export const getWideSliderById = async (req, res) => {
  try {
    const slider = await WideSlider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: "Wide slider not found" });
    }
    res.status(200).json(slider);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve wide slider", error });
  }
};

// Create a new wide slider
export const createWideSlider = async (req, res) => {
  const { id, title, slug, image, link, order } = req.body;

  try {
    const newSlider = new WideSlider({
      id,
      title,
      slug,
      image,
      link,
      order
    });

    await newSlider.save();
    res.status(201).json({ message: "Wide slider created successfully", slider: newSlider });
  } catch (error) {
    res.status(500).json({ message: "Failed to create wide slider", error });
  }
};

// Update a wide slider by ID
export const updateWideSlider = async (req, res) => {
  const { id } = req.params;
  const { title, slug, image, link, order } = req.body;

  try {
    const updatedSlider = await WideSlider.findByIdAndUpdate(
      id,
      { title, slug, image, link, order },
      { new: true }
    );

    if (!updatedSlider) {
      return res.status(404).json({ message: "Wide slider not found" });
    }

    res.status(200).json({ message: "Wide slider updated successfully", slider: updatedSlider });
  } catch (error) {
    res.status(500).json({ message: "Failed to update wide slider", error });
  }
};

// Delete a wide slider by ID
export const deleteWideSlider = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSlider = await WideSlider.findByIdAndDelete(id);
    if (!deletedSlider) {
      return res.status(404).json({ message: "Wide slider not found" });
    }
    res.status(200).json({ message: "Wide slider deleted successfully", slider: deletedSlider });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete wide slider", error });
  }
};

// Batch import wide sliders
export const batchImportWideSliders = async (req, res) => {
  const sliders = req.body.WideSliders;


  try {

    const result = await WideSlider.insertMany(sliders);

    res.status(201).json({
      message: `${result.length} wide sliders imported successfully`,
      sliders: result
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing wide sliders", error });
  }
};
