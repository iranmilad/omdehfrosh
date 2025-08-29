import Menu from '../../models/Menu.js'

// Add the full menu data to MongoDB
export const addFullMenu = async (req, res) => {
  try {
    const { menuData } = req.body;

    if (!menuData || typeof menuData !== "object") {
      return res.status(400).json({ message: "Invalid menu data" });
    }

    // Ensure menuData contains arrays for main, footer, and social
    if (!Array.isArray(menuData.main) || !Array.isArray(menuData.footer) || !Array.isArray(menuData.social)) {
      return res.status(400).json({ message: "Invalid menu structure" });
    }

    // Remove existing menu data (optional, depends on your requirement)
    await Menu.deleteMany({});

    // Insert new menu data
    const newMenu = new Menu({
      main: menuData.main,
      footer: menuData.footer,
      social: menuData.social,
    });

    await newMenu.save();

    res.status(201).json({ message: "Menu data added successfully", menu: newMenu });
  } catch (error) {
    console.error("Error saving menu:", error);
    res.status(500).json({ message: "Failed to add menu data", error: error.message });
  }
};
