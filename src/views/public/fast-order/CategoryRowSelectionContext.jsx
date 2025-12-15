// CategoryRowSelectionContext.jsx
import React, { createContext, useContext, useState } from 'react';

const CategoryRowSelectionContext = createContext();

export const CategoryRowSelectionProvider = ({ children }) => {
  const [checkedRows, setCheckedRows] = useState(new Set());
  const [selectedRow, setSelectedRow] = useState(null);

  const toggleCheck = (id) => {
    setCheckedRows(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const value = {
    checkedRows,
    selectedRow,
    setSelectedRow,
    toggleCheck,
    isChecked: (id) => checkedRows.has(id),
    isSelected: (id) => selectedRow === id,
    isCheckedAndSelected: (id) => checkedRows.has(id) && selectedRow === id,
    clearAll: () => {
      setCheckedRows(new Set());
      setSelectedRow(null);
    }
  };

  return (
    <CategoryRowSelectionContext.Provider value={value}>
      {children}
    </CategoryRowSelectionContext.Provider>
  );
};

export const useCategoryRowSelection = () => {
  const context = useContext(CategoryRowSelectionContext);
  if (!context) {
    throw new Error('useCategoryRowSelection must be used within CategoryRowSelectionProvider');
  }
  return context;
};