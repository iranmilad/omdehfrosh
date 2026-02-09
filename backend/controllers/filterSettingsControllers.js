// import FiltersSettings from "../models/FiltersSettings.js";
// import getUserFromToken from "../libs/verifyToken";

import getUserFromToken from '../libs/verifyToken.js'

import FiltersSettingsBrandFastEdit from '../models/FiltersSettingsBrandFastEdit.js'
import FiltersSettingsCategoryFastEdit from '../models/FiltersSettingsCategoryFastEdit.js'

import FiltersSettingsBrand from '../models/SearchBrandSchema.js'
import FiltersSettingsCategory from '../models/SeachCategorySchema.js'

// Create new filter setting
import { v4 as uuidv4 } from 'uuid'; // Add this import at the top

export const createFilterSettingBrandMode = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) return res.status(401).json({ message: "Unauthorized" });
    const user_id = tokenData.user_id;
    const { filterName, ...filterData } = req.body; // Extract filterName from body
    

    // Create the search object with filterName and random ID
    const newSearch = {
      id: uuidv4(), // Changed from _id to id
      ...filterData,
      filterName // Add filterName to the search object
    };

    let userFilters = await FiltersSettingsBrand.findOne({ user_id });

    if (!userFilters) {
      // No settings yet for this user — create new document
      userFilters = new FiltersSettingsBrand({
        user_id,
        searches: [newSearch]
      });
    } else {
      if (userFilters.searches.length >= 5) {
        return res.status(400).json({ message: "You can only save up to 5 filter settings." });
      }

      userFilters.searches.push(newSearch);
    }


    await userFilters.save();

    // res.status(403).json({message: "با xc ایجاد شد"});


    // res.status(201).json({ 
    //   message: "خطا رخ داده است",
    //   state: "error",
    //   error: {
    //     "inputBox": "حروف راd بfه فارسی وارد sdsd"
    //   } 
    // });
    

      res.status(201).json({ 
      message: "ثبت موفق",
      state: "ok",
      data: userFilters
    });
    

  } catch (error) {
    console.error("Error creating filter setting:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateFilterSettingBrandMode = async (req, res) => {
  try {
    // Handle token validation separately to catch auth errors
    let user_id;
    try {
      const tokenResult = getUserFromToken(req, res);
      user_id = tokenResult?.user_id;
    } catch (tokenError) {
      console.error("Token validation error:", tokenError);
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id, filterName, ...filterData } = req.body;

    const userFilters = await FiltersSettingsBrand.findOne({ user_id });
    if (!userFilters) {
      return res.status(404).json({ message: "No filter settings found for this user" });
    }

    // ✅ Ensure string comparison
    const index = userFilters.searches.findIndex(search => String(search.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ message: "Filter setting not found" });
    }

    // ✅ Merge safely and preserve ID
    const originalSearch = userFilters.searches[index];
    userFilters.searches[index] = {
      ...originalSearch,
      ...filterData,
      filterName: filterName ?? originalSearch.filterName,
      id: originalSearch.id,
    };

    await userFilters.save();

    

    return res.status(200).json({
      message: "بروزرساerrorنی موفق",
      state: "ok",
      data: userFilters,
    });

  } catch (error) {
    console.error("Error updating brand filter setting:", error);
    
    // Check if the error is authentication-related
    if (error.message && (
        error.message.includes('jwt') || 
        error.message.includes('token') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('توکن نامعتبر است')
    )) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllBrandFilterSettings = async (req, res) => {
  try {
    let user_id;
    try {
      const tokenResult = getUserFromToken(req, res);
      user_id = tokenResult?.user_id;
    } catch (tokenError) {
      console.error("Token validation error:", tokenError);
      return res.status(200).json({ data: [] });
    }

    if (!user_id) {
      return res.status(200).json({ data: [] });
    }

    const userFilters = await FiltersSettingsBrand.findOne({ user_id });

    res.status(200).json({ data: userFilters?.searches || [] });
    
  } catch (error) {
    console.error("Error fetching brand filters:", error);
    
    // Check if the error is authentication-related
    if (error.message && (
        error.message.includes('jwt') || 
        error.message.includes('token') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('توکن نامعتبر است')
    )) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
    
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateFilterSettingCategoryMode = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) return res.status(401).json({ message: "Unauthorized" });
    const user_id = tokenData.user_id;
    const { id, filterName, ...filterData } = req.body;

    const userFilters = await FiltersSettingsCategory.findOne({ user_id });
    if (!userFilters) {
      return res.status(404).json({ message: "No filter settings found for this user" });
    }
const jsonString = JSON.stringify({ id, filterName, ...filterData });
    const index = userFilters.searches.findIndex(search => search.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "Filter setting not found" });
    }

    const originalSearch = userFilters.searches[index];

    userFilters.searches[index] = {
      ...originalSearch,
      ...filterData,
      filterName: filterName ?? originalSearch.filterName,
      id: originalSearch.id, // ✅ Make sure `id` is not dropped
    };

    await userFilters.save();

    return res.status(200).json({
      message: "بروزرسانی موفق",
      state: "ok",
      data: userFilters,
    });

  } catch (error) {
    console.error("Error updating category filter setting:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createFilterSettingCategoryMode = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) return res.status(401).json({ message: "Unauthorized" });
    const user_id = tokenData.user_id;
    const { filterName, ...filterData } = req.body;
    

    // Create the search object with filterName and random ID
    const newSearch = {
      id: uuidv4(), // Use 'id' instead of '_id'
      ...filterData,
      filterName
    };

    let userFilters = await FiltersSettingsCategory.findOne({ user_id });

    if (!userFilters) {
      userFilters = new FiltersSettingsCategory({
        user_id,
        searches: [newSearch]
      });
    } else {
      if (userFilters.searches.length >= 5) {
        return res.status(400).json({ message: "You can only save up to 5 filter settings." });
      }

      userFilters.searches.push(newSearch);
    }

    await userFilters.save();

      res.status(201).json({ 
      message: "ثبت موفق",
      state: "ok",
      data: userFilters
    });

    // res.status(201).json({ 
    //   message: "خطا رخ داده است",
    //   state: "error",
    //   error: {
    //     "inputBox": "حروف را به فارسی وارد کنید"
    //   } 
    // });


    // res.status(400).json({ 
    //   message: "با موفقیت ایجاد شد",
    //   state: "ok",
    //   data: userFilters 
    // });

  } catch (error) {
    console.error("Error creating filter setting:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCategoryFilterSettings = async (req, res) => {
  try {
    const tokenResult = getUserFromToken(req, res);
    const user_id = tokenResult?.user_id;
    if (!user_id) {
      return res.status(200).json({ data: [] });
    }

    const userFilters = await FiltersSettingsCategory.findOne({ user_id });

    res.status(200).json({ data: userFilters?.searches || [] });
  } catch (error) {
    console.error("Error fetching category filters:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteFilterSettingBrandMode = async (req, res) => {
  try {
    const { id } = req.query; // Get "id" from query string

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const updated = await FiltersSettingsBrand.findOneAndUpdate(
      { "searches.id": id },
      { $pull: { searches: { id } } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Brand filter not found" });
    }

    res.status(201).json({ 
      message: "عملیات dddناموفق",
      state: "error",
    });

    // return res.json({
    //   message: "Brand filter deleted successfully",
    //   id,
    // });




  } catch (error) {
    console.error("Error deleting brand filter:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteFilterSettingCategoryMode = async (req, res) => {
  try {
    const { id } = req.query; // Get "id" from query string


    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const updated = await FiltersSettingsCategory.findOneAndUpdate(
      { "searches.id": id },
      { $pull: { searches: { id } } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Category filter not found" });
    }

    return res.json({
      message: "Category filter deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Error deleting category filter:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const createFilterSettingBrandFastEdit = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) return res.status(401).json({ message: 'Unauthorized' });
    const user_id = tokenData.user_id;

    const { filterName, ...filterData } = req.body

    const newSearch = {
      id: uuidv4(),
      ...filterData,
      filterName,
    }

    let userFilters = await FiltersSettingsBrandFastEdit.findOne({ user_id })

    if (!userFilters) {
      userFilters = new FiltersSettingsBrandFastEdit({
        user_id,
        searches: [newSearch],
      })
    } else {
      if (userFilters.searches.length >= 5) {
        return res
          .status(400)
          .json({ message: 'You can only save up to 5 filter settings.' })
      }
      userFilters.searches.push(newSearch)
    }

    await userFilters.save()

    res.status(201).json({
      message: 'ثبت موفق',
      state: 'ok',
      data: userFilters,
    })
  } catch (error) {
    console.error('Error creating brand fast-edit filter:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const createFilterSettingCategoryFastEdit = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) return res.status(401).json({ message: 'Unauthorized' });
    const user_id = tokenData.user_id;

    const { filterName, ...filterData } = req.body

    const newSearch = {
      id: uuidv4(),
      ...filterData,
      filterName,
    }

    let userFilters = await FiltersSettingsCategoryFastEdit.findOne({ user_id })

    if (!userFilters) {
      userFilters = new FiltersSettingsCategoryFastEdit({
        user_id,
        searches: [newSearch],
      })
    } else {
      if (userFilters.searches.length >= 5) {
        return res
          .status(400)
          .json({ message: 'You can only save up to 5 filter settings.' })
      }
      userFilters.searches.push(newSearch)
    }

    await userFilters.save()

    res.status(201).json({
      message: 'ثبت موفق',
      state: 'ok',
      data: userFilters,
    })
  } catch (error) {
    console.error('Error creating category fast-edit filter:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ✅ UPDATE
export const updateFilterSettingBrandFastEdit = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) return res.status(401).json({ message: 'Unauthorized' });
    const user_id = tokenData.user_id;

    const { id, filterName, ...filterData } = req.body

    const userFilters = await FiltersSettingsBrandFastEdit.findOne({ user_id })
    if (!userFilters) {
      return res.status(404).json({ message: 'No filter settings found' })
    }

    const index = userFilters.searches.findIndex(
      search => String(search.id) === String(id)
    )
    if (index === -1) {
      return res.status(404).json({ message: 'Filter setting not found' })
    }

    const originalSearch = userFilters.searches[index]
    userFilters.searches[index] = {
      ...originalSearch,
      ...filterData,
      filterName: filterName ?? originalSearch.filterName,
      id: originalSearch.id,
    }

    await userFilters.save()

    res.status(200).json({
      message: 'بروزرسانی موفق',
      state: 'ok',
      data: userFilters,
    })
  } catch (error) {
    console.error('Error updating brand fast-edit filter:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const updateFilterSettingCategoryFastEdit = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) return res.status(401).json({ message: 'Unauthorized' });
    const user_id = tokenData.user_id;

    const { id, filterName, ...filterData } = req.body

    const userFilters = await FiltersSettingsCategoryFastEdit.findOne({
      user_id,
    })
    if (!userFilters) {
      return res.status(404).json({ message: 'No filter settings found' })
    }

    const index = userFilters.searches.findIndex(search => search.id === id)
    if (index === -1) {
      return res.status(404).json({ message: 'Filter setting not found' })
    }

    const originalSearch = userFilters.searches[index]
    userFilters.searches[index] = {
      ...originalSearch,
      ...filterData,
      filterName: filterName ?? originalSearch.filterName,
      id: originalSearch.id,
    }

    await userFilters.save()

    res.status(200).json({
      message: 'بروزرسانی موفق',
      state: 'ok',
      data: userFilters,
    })
  } catch (error) {
    console.error('Error updating category fast-edit filter:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ✅ GET ALL
export const getAllBrandFilterSettingsFastEdit = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) return res.status(401).json({ message: 'Unauthorized' });
    const user_id = tokenData.user_id;

    const userFilters = await FiltersSettingsBrandFastEdit.findOne({ user_id })

    res.status(200).json({ data: userFilters?.searches || [] })
  } catch (error) {
    console.error('Error fetching brand fast-edit filters:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const getAllCategoryFilterSettingsFastEdit = async (req, res) => {
  try {
    const tokenData = getUserFromToken(req, res);
    if (!tokenData || !tokenData.user_id) return res.status(401).json({ message: 'Unauthorized' });
    const user_id = tokenData.user_id;

    const userFilters = await FiltersSettingsCategoryFastEdit.findOne({
      user_id,
    })

    res.status(200).json({ data: userFilters?.searches || [] })
  } catch (error) {
    console.error('Error fetching category fast-edit filters:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// ✅ DELETE
export const deleteFilterSettingBrandFastEdit = async (req, res) => {
  try {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ message: 'ID is required' })
    }

    const updated = await FiltersSettingsBrandFastEdit.findOneAndUpdate(
      { 'searches.id': id },
      { $pull: { searches: { id } } },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: 'Brand fast-edit filter not found' })
    }

    res.json({ message: 'Brand fast-edit filter deleted', id })
  } catch (error) {
    console.error('Error deleting brand fast-edit filter:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const deleteFilterSettingCategoryFastEdit = async (req, res) => {
  try {
    const { id } = req.query
    if (!id) {
      return res.status(400).json({ message: 'ID is required' })
    }

    const updated = await FiltersSettingsCategoryFastEdit.findOneAndUpdate(
      { 'searches.id': id },
      { $pull: { searches: { id } } },
      { new: true }
    )

    if (!updated) {
      return res.status(404).json({ message: 'Category fast-edit filter not found' })
    }

    res.json({ message: 'Category fast-edit filter deleted', id })
  } catch (error) {
    console.error('Error deleting category fast-edit filter:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}





// // Get all filter settings for user
// export const getAllFilterSettings = async (req, res) => {
//   try {
//     const { user_id } = getUserFromToken(req, res);
//     if (!user_id) return res.status(401).json({ message: "Unauthorized" });

//     const settings = await FiltersSettings.find({ user_id });

//     res.status(200).json(settings);
//   } catch (error) {
//     console.error("Error fetching filter settings:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Update filter setting
// export const updateFilterSetting = async (req, res) => {
//   try {
//     const { user_id } = getUserFromToken(req, res);
//     if (!user_id) return res.status(401).json({ message: "Unauthorized" });

//     const { id } = req.params;
//     const updateData = req.body;

//     const updated = await FiltersSettings.findOneAndUpdate(
//       { _id: id, user_id },
//       updateData,
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ message: "Setting not found" });

//     res.status(200).json({ message: "Setting updated", updated });
//   } catch (error) {
//     console.error("Error updating filter setting:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // Delete filter setting
// export const deleteFilterSetting = async (req, res) => {
//   try {
//     const { user_id } = getUserFromToken(req, res);
//     if (!user_id) return res.status(401).json({ message: "Unauthorized" });

//     const { id } = req.body;
//     if (!id) return res.status(400).json({ message: "ID is required" });

//     const deleted = await FiltersSettings.findOneAndDelete({ _id: id, user_id });
//     if (!deleted) return res.status(404).json({ message: "Setting not found" });

//     res.status(200).json({ message: "Filter setting deleted" });
//   } catch (error) {
//     console.error("Error deleting filter setting:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };
