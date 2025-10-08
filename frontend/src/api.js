const resolveBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (process.env.NODE_ENV === "production" && process.env.REACT_APP_API_URL_PROD) {
    return process.env.REACT_APP_API_URL_PROD;
  }

  if (process.env.REACT_APP_API_URL_DEV) {
    return process.env.REACT_APP_API_URL_DEV;
  }

  return "";
};

const API_BASE = resolveBaseUrl().replace(/\/$/, "");

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const getExpenses = () => request("/getExpenses");

export const addExpense = (expense) =>
  request("/addExpense", {
    method: "POST",
    body: JSON.stringify(expense),
  });

export const updateExpense = (id, expense) =>
  request(`/expenses/${id}`, {
    method: "PUT",
    body: JSON.stringify(expense),
  });

export const deleteExpense = (id) =>
  request(`/expenses/${id}`, {
    method: "DELETE",
  });
