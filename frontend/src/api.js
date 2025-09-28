import axios from "axios";

// Choose API base URL depending on environment
const API_BASE =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL_PROD
    : process.env.REACT_APP_API_URL_DEV;

// Helper function for logging and error handling
const handleRequest = async (requestFunc, description) => {
  try {
    console.log(`Calling API: ${description}`);
    const res = await requestFunc();
    return res.data;
  } catch (err) {
    console.error(`Failed to ${description}:`, err.response?.data || err.message);
    throw err;
  }
};

// Get all expenses
export const getExpenses = async () => {
  return handleRequest(
    () => axios.get(`${API_BASE}/getExpenses`),
    "get expenses"
  );
};

// Add a new expense
export const addExpense = async (expense) => {
  return handleRequest(
    () => axios.post(`${API_BASE}/addExpense`, expense),
    "add expense"
  );
};

export const deleteExpense = async (id) => {
  return handleRequest(
    () => axios.delete(`${API_BASE}/expenses/${id}`),
    `delete expense ${id}`
  );
};

