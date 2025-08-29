

export const getApiUrl = (endpoint: string) => {
  const apiUrl = process.env.REACT_APP_API_URL;

  
  if (!apiUrl) {
    throw new Error("API URL is not defined in the environment variables.");
  }

  return `${apiUrl}${endpoint}`;
};
