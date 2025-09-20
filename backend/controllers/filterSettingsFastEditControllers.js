import getUserFromToken from '../libs/verifyToken.js'

import FiltersSettingsBrandFastEdit from '../models/FiltersSettingsBrandFastEdit.js'
import FiltersSettingsCategoryFastEdit from '../models/FiltersSettingsCategoryFastEdit.js'

import { v4 as uuidv4 } from 'uuid'

// ✅ CREATE
export const createFilterSettingBrandFastEdit = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res)
    if (!user_id) return res.status(401).json({ message: 'Unauthorized' })

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
    const { user_id } = getUserFromToken(req, res)
    if (!user_id) return res.status(401).json({ message: 'Unauthorized' })

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
    const { user_id } = getUserFromToken(req, res)
    if (!user_id) return res.status(401).json({ message: 'Unauthorized' })

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
    const { user_id } = getUserFromToken(req, res)
    if (!user_id) return res.status(401).json({ message: 'Unauthorized' })

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
    const { user_id } = getUserFromToken(req, res)
    if (!user_id) return res.status(401).json({ message: 'Unauthorized' })

    const userFilters = await FiltersSettingsBrandFastEdit.findOne({ user_id })

    res.status(200).json({ data: userFilters?.searches || [] })
  } catch (error) {
    console.error('Error fetching brand fast-edit filters:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const getAllCategoryFilterSettingsFastEdit = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res)
    if (!user_id) return res.status(401).json({ message: 'Unauthorized' })

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
