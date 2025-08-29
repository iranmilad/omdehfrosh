// RowSelectionContext.js
import React, { createContext, useContext, useState } from 'react';

const RowSelectionContext = createContext();

export const RowSelectionProvider = ({ children }) => {
  const [checkedRows, setCheckedRows] = useState(new Set());
  const [selectedRow, setSelectedRow] = useState(null); // Assuming single selection

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
    <RowSelectionContext.Provider value={value}>
      {children}
    </RowSelectionContext.Provider>
  );
};

export const useRowSelection = () => useContext(RowSelectionContext);
