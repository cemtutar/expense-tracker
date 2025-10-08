import { useEffect, useMemo, useState } from "react";

import { addExpense, deleteExpense, getExpenses, updateExpense } from "./api";
import "./App.css";
import {
  CATEGORY_OPTIONS,
  ExpenseForm,
  METHOD_OPTIONS,
  STATUS_OPTIONS,
} from "./components/ExpenseForm";

const emptyEditValues = {
  name: "",
  category: "",
  amount: "",
  date: "",
  method: "",
  status: "",
};

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const formatCurrency = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value) => {
  const date = parseDateValue(value);
  if (!date) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const safeText = (value) => {
  if (typeof value !== "string") {
    return "—";
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : "—";
};

const sortExpenses = (expenses) => {
  const items = Array.isArray(expenses) ? [...expenses] : [];
  return items.sort((a, b) => {
    const dateA = parseDateValue(a?.date ?? "");
    const dateB = parseDateValue(b?.date ?? "");
    const timeA = dateA ? dateA.getTime() : 0;
    const timeB = dateB ? dateB.getTime() : 0;
    return timeB - timeA;
  });
};

const getAmountNumber = (value) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
};

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState(emptyEditValues);
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const loadExpenses = async () => {
    const data = await getExpenses();
    setExpenses(Array.isArray(data) ? data : []);
  };

  const refreshExpenses = async (withSpinner = true) => {
    if (withSpinner) {
      setLoading(true);
    }

    try {
      await loadExpenses();
      setError("");
    } catch (err) {
      setError("Unable to load expenses right now.");
      throw err;
    } finally {
      if (withSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshExpenses().catch(() => {});
  }, []);

  const handleAddExpense = async (expense) => {
    setLoading(true);
    setError("");

    try {
      await addExpense(expense);
      await loadExpenses();
    } catch (err) {
      setError("Unable to save expense right now.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setEditingId(null);
    setEditValues(emptyEditValues);
    setModalError("");
  };

  const closeModal = () => {
    if (modalLoading) {
      return;
    }

    setIsModalOpen(false);
    setEditingId(null);
    setEditValues(emptyEditValues);
    setModalError("");
  };

  const startEditingExpense = (expense) => {
    if (!expense?.id) {
      return;
    }

    setEditingId(expense.id);
    setEditValues({
      name: typeof expense.name === "string" ? expense.name : "",
      category: typeof expense.category === "string" ? expense.category : "",
      amount:
        expense.amount === 0 || typeof expense.amount === "number"
          ? String(expense.amount)
          : "",
      date: typeof expense.date === "string" ? expense.date : "",
      method: typeof expense.method === "string" ? expense.method : "",
      status: typeof expense.status === "string" ? expense.status : "",
    });
    setModalError("");
  };

  const cancelEdit = () => {
    if (modalLoading) {
      return;
    }

    setEditingId(null);
    setEditValues(emptyEditValues);
    setModalError("");
  };

  const updateEditField = (field, value) => {
    setEditValues((previous) => ({ ...previous, [field]: value }));
  };

  const saveEdit = async () => {
    if (!editingId || modalLoading) {
      return;
    }

    const trimmed = {
      name: editValues.name.trim(),
      category: editValues.category.trim(),
      date: editValues.date.trim(),
      method: editValues.method.trim(),
      status: editValues.status.trim(),
      amountText: editValues.amount.trim(),
    };

    const amountNumber = Number(trimmed.amountText);

    if (
      !trimmed.name ||
      !trimmed.category ||
      !trimmed.date ||
      !trimmed.method ||
      !trimmed.status ||
      trimmed.amountText === "" ||
      !Number.isFinite(amountNumber)
    ) {
      setModalError("Please provide every field with a valid value.");
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      await updateExpense(editingId, {
        name: trimmed.name,
        category: trimmed.category,
        date: trimmed.date,
        method: trimmed.method,
        status: trimmed.status,
        amount: amountNumber,
      });
      await refreshExpenses(false);
      setEditingId(null);
      setEditValues(emptyEditValues);
    } catch (error) {
      setModalError("Unable to update expense right now.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!id || modalLoading) {
      return;
    }

    setModalLoading(true);
    setModalError("");

    try {
      await deleteExpense(id);
      await refreshExpenses(false);
      if (editingId === id) {
        setEditingId(null);
        setEditValues(emptyEditValues);
      }
    } catch (error) {
      setModalError("Unable to delete expense right now.");
    } finally {
      setModalLoading(false);
    }
  };

  const sortedExpenses = useMemo(() => sortExpenses(expenses), [expenses]);
  const recentExpenses = useMemo(() => sortedExpenses.slice(0, 5), [sortedExpenses]);

  const totalSpent = useMemo(
    () => sortedExpenses.reduce((sum, expense) => sum + getAmountNumber(expense.amount), 0),
    [sortedExpenses]
  );

  const modalBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Expense tracker</h1>
        <p>Log every purchase and keep tabs on where your money is going.</p>
      </header>

      {error ? <p className="global-error">{error}</p> : null}

      <main className="layout">
        <ExpenseForm onSubmit={handleAddExpense} disabled={loading} />

        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent activity</h2>
            <button type="button" className="link" onClick={openModal} disabled={!sortedExpenses.length}>
              View all
            </button>
          </div>

          {loading && !sortedExpenses.length ? (
            <p className="empty">Loading expenses…</p>
          ) : null}

          {!loading && !sortedExpenses.length ? (
            <p className="empty">No expenses logged yet. Add your first expense to get started.</p>
          ) : null}

          {recentExpenses.length ? (
            <table className="expenses-table" aria-label="Recent expenses">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Date</th>
                  <th scope="col">Category</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((expense) => (
                  <tr key={expense.id ?? `${expense.name}-${expense.date}`}>
                    <td>{safeText(expense.name)}</td>
                    <td>{formatDate(expense.date)}</td>
                    <td>{safeText(expense.category)}</td>
                    <td>{safeText(expense.method)}</td>
                    <td>{formatCurrency(typeof expense.amount === "number" ? expense.amount : null)}</td>
                    <td>{safeText(expense.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {sortedExpenses.length ? (
            <p className="total">Total tracked spending: {formatCurrency(totalSpent)}</p>
          ) : null}
        </section>
      </main>

      {isModalOpen ? (
        <div className="modal-backdrop" onClick={modalBackdropClick}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="transactions-title">
            <div className="modal-header">
              <div>
                <h2 id="transactions-title">All transactions</h2>
                <p className="modal-subtitle">Edit or delete any expense without leaving this view.</p>
              </div>
              <button type="button" className="link" onClick={closeModal} disabled={modalLoading}>
                Close
              </button>
            </div>

            {modalError ? <p className="modal-error">{modalError}</p> : null}

            <div className="table-scroll">
              <table className="expenses-table" aria-label="All expenses">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Date</th>
                    <th scope="col">Category</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedExpenses.map((expense) => {
                    const isEditing = editingId === expense.id;
                    return (
                      <tr key={expense.id ?? `${expense.name}-${expense.date}`}>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValues.name}
                              onChange={(event) => updateEditField("name", event.target.value)}
                              disabled={modalLoading}
                            />
                          ) : (
                            safeText(expense.name)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="date"
                              value={editValues.date}
                              onChange={(event) => updateEditField("date", event.target.value)}
                              disabled={modalLoading}
                            />
                          ) : (
                            formatDate(expense.date)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              list="modal-category-options"
                              value={editValues.category}
                              onChange={(event) => updateEditField("category", event.target.value)}
                              disabled={modalLoading}
                            />
                          ) : (
                            safeText(expense.category)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="text"
                              list="modal-method-options"
                              value={editValues.method}
                              onChange={(event) => updateEditField("method", event.target.value)}
                              disabled={modalLoading}
                            />
                          ) : (
                            safeText(expense.method)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editValues.amount}
                              onChange={(event) => updateEditField("amount", event.target.value)}
                              disabled={modalLoading}
                            />
                          ) : (
                            formatCurrency(typeof expense.amount === "number" ? expense.amount : null)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              value={editValues.status}
                              onChange={(event) => updateEditField("status", event.target.value)}
                              disabled={modalLoading}
                            >
                              <option value="" disabled>
                                Select status
                              </option>
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            safeText(expense.status)
                          )}
                        </td>
                        <td className="actions">
                          {isEditing ? (
                            <div className="action-buttons">
                              <button type="button" className="primary" onClick={saveEdit} disabled={modalLoading}>
                                Save
                              </button>
                              <button type="button" className="secondary" onClick={cancelEdit} disabled={modalLoading}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="secondary"
                                onClick={() => startEditingExpense(expense)}
                                disabled={modalLoading}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="danger"
                                onClick={() => handleDeleteExpense(expense.id)}
                                disabled={modalLoading}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <datalist id="modal-category-options">
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
            <datalist id="modal-method-options">
              {METHOD_OPTIONS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
