// CategoryRowSelectionContext.js - For Fast Edit Category Component
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const CategoryRowSelectionContext = createContext();

const CHECKED_ROWS_COOKIE = 'category_fast_edit_checked_rows';
const SELECTED_ROW_COOKIE = 'category_fast_edit_selected_row';

export const CategoryRowSelectionProvider = ({ children }) => {
  // Initialize state from cookies
  const getInitialCheckedRows = () => {
    const stored = Cookies.get(CHECKED_ROWS_COOKIE);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return new Set(parsed);
      } catch (error) {
        console.error('Error parsing checked rows from cookie:', error);
      }
    }
    return new Set();
  };

  const getInitialSelectedRow = () => {
    const stored = Cookies.get(SELECTED_ROW_COOKIE);
    return stored || null;
  };

  const [checkedRows, setCheckedRows] = useState(getInitialCheckedRows);
  const [selectedRow, setSelectedRow] = useState(getInitialSelectedRow);

  // Save checked rows to cookie whenever it changes
  useEffect(() => {
    const checkedRowsArray = Array.from(checkedRows);
    if (checkedRowsArray.length > 0) {
      Cookies.set(CHECKED_ROWS_COOKIE, JSON.stringify(checkedRowsArray), { expires: 7 });
    } else {
      Cookies.remove(CHECKED_ROWS_COOKIE);
    }
  }, [checkedRows]);

  // Save selected row to cookie whenever it changes
  useEffect(() => {
    if (selectedRow) {
      Cookies.set(SELECTED_ROW_COOKIE, selectedRow, { expires: 7 });
    } else {
      Cookies.remove(SELECTED_ROW_COOKIE);
    }
  }, [selectedRow]);

  const toggleCheck = (id) => {
    setCheckedRows(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const clearAll = () => {
    setCheckedRows(new Set());
    setSelectedRow(null);
    // Also clear cookies
    Cookies.remove(CHECKED_ROWS_COOKIE);
    Cookies.remove(SELECTED_ROW_COOKIE);
  };

  const value = {
    checkedRows,
    selectedRow,
    setSelectedRow,
    toggleCheck,
    isChecked: (id) => checkedRows.has(id),
    isSelected: (id) => selectedRow === id,
    isCheckedAndSelected: (id) => checkedRows.has(id) && selectedRow === id,
    clearAll
  };

  return (
    <CategoryRowSelectionContext.Provider value={value}>
      {children}
    </CategoryRowSelectionContext.Provider>
  );
};

export const useCategoryRowSelection = () => useContext(CategoryRowSelectionContext);