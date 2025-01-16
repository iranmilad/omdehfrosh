import { createContext, useContext } from "react";

export const EditorModeContext = createContext();

// Custom hook to use the context
export const useEditorMode = () => {
  return useContext(EditorModeContext);
};
