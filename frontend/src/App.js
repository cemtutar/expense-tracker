import { useEffect, useState } from 'react';

import { addExpense, deleteExpense, getExpenses, updateExpense } from './api';
import './App.css';

const TOTAL_BUDGET = 2000;

const budgets = [
  { id: 'food', label: 'Food & Dining', spent: 320, limit: 450 },
  { id: 'housing', label: 'Housing', spent: 560, limit: 600 },
  { id: 'transport', label: 'Transportation', spent: 180, limit: 220 },
  { id: 'wellness', label: 'Wellness', spent: 95, limit: 150 },
];

const upcoming = [
  {
    id: 'trip',
    title: 'Weekend getaway',
    description: 'Set aside $420 by April 2 to cover lodging and gas.',
  },
  {
    id: 'insurance',
    title: 'Annual insurance premium',
    description: 'Due May 14 — consider moving $80 per paycheck.',
  },
  {
    id: 'laptop',
    title: 'Laptop upgrade fund',
    description: 'You are 60% to goal. Add $120 this month to stay on track.',
  },
];

const categoryOptions = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'housing', label: 'Housing' },
  { value: 'transport', label: 'Transportation' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'other', label: 'Other' },
];

const statusOptions = ['Pending', 'Cleared', 'Scheduled'];

const defaultEditValues = {
  name: '',
  category: '',
  amount: '',
  date: '',
  method: '',
  status: '',
};

const budgetStatus = (spent, limit) => {
  if (spent > limit) {
    return 'over';
  }
  if (spent / limit > 0.75) {
    return 'warning';
  }
  return 'good';
};

const formatCurrency = (value) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : value;

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editValues, setEditValues] = useState(defaultEditValues);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const safeText = (value) =>
    typeof value === 'string' && value.trim() ? value : '—';

  const refreshExpenses = async ({ showSpinner = true } = {}) => {
    if (showSpinner) {
      setLoading(true);
    }

    try {
      const data = await getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Unable to load expenses right now.');
      throw err;
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    refreshExpenses().catch(() => {});
  }, []);

  const handleAddExpense = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setFormError(null);

    const name = (formData.get('name') || '').trim();
    const category = (formData.get('category') || '').trim();
    const amount = Number(formData.get('amount'));
    const date = (formData.get('date') || '').trim();
    const method = (formData.get('method') || '').trim();
    const status = (formData.get('status') || '').trim();

    if (
      !name ||
      !category ||
      !date ||
      !method ||
      !status ||
      !Number.isFinite(amount)
    ) {
      setFormError('Please provide valid values for all fields.');
      return;
    }

    const payload = { name, category, amount, date, method, status };

    try {
      setLoading(true);
      await addExpense(payload);
      form.reset();
      await refreshExpenses();
      setFormError(null);
    } catch (err) {
      setFormError('Unable to add expense right now.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    if (modalLoading) {
      return;
    }
    setIsModalOpen(true);
    setEditingExpenseId(null);
    setEditValues(defaultEditValues);
    setModalError(null);
  };

  const closeModal = () => {
    if (modalLoading) {
      return;
    }
    setIsModalOpen(false);
    setEditingExpenseId(null);
    setEditValues(defaultEditValues);
    setModalError(null);
  };

  const startEditingExpense = (expense) => {
    if (
      modalLoading ||
      typeof expense?.id !== 'string' ||
      expense.id.trim() === ''
    ) {
      return;
    }

    setEditingExpenseId(expense.id);
    setEditValues({
      name: typeof expense?.name === 'string' ? expense.name : '',
      category: typeof expense?.category === 'string' ? expense.category : '',
      amount:
        expense?.amount !== undefined && expense?.amount !== null
          ? String(expense.amount)
          : '',
      date: typeof expense?.date === 'string' ? expense.date : '',
      method: typeof expense?.method === 'string' ? expense.method : '',
      status: typeof expense?.status === 'string' ? expense.status : '',
    });
    setModalError(null);
  };

  const handleEditFieldChange = (field, value) => {
    setEditValues((previous) => ({ ...previous, [field]: value }));
  };

  const cancelEdit = () => {
    if (modalLoading) {
      return;
    }
    setEditingExpenseId(null);
    setEditValues(defaultEditValues);
    setModalError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingExpenseId || modalLoading) {
      return;
    }

    const trimmedName = editValues.name.trim();
    const categoryValue = editValues.category.trim();
    const dateValue = editValues.date.trim();
    const methodValue = editValues.method.trim();
    const statusValue = editValues.status.trim();
    const amountNumber = Number(editValues.amount);

    if (
      !trimmedName ||
      !categoryValue ||
      !dateValue ||
      !methodValue ||
      !statusValue ||
      !Number.isFinite(amountNumber)
    ) {
      setModalError('Please provide valid values for all fields.');
      return;
    }

    setModalError(null);
    setModalLoading(true);

    try {
      await updateExpense(editingExpenseId, {
        name: trimmedName,
        category: categoryValue,
        amount: amountNumber,
        date: dateValue,
        method: methodValue,
        status: statusValue,
      });
      await refreshExpenses({ showSpinner: false });
      setEditingExpenseId(null);
      setEditValues(defaultEditValues);
    } catch (err) {
      setModalError('Unable to update expense right now.');
      return;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (modalLoading || typeof id !== 'string' || id.trim() === '') {
      return;
    }

    setModalError(null);
    setModalLoading(true);

    try {
      await deleteExpense(id);
      await refreshExpenses({ showSpinner: false });
      if (editingExpenseId === id) {
        setEditingExpenseId(null);
        setEditValues(defaultEditValues);
      }
    } catch (err) {
      setModalError('Unable to delete expense right now.');
      return;
    } finally {
      setModalLoading(false);
    }
  };

  const totalSpent = expenses.reduce((sum, expense) => {
    const amount = Number(expense?.amount ?? 0);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const uniqueDays = new Set();
  expenses.forEach((expense) => {
    if (!expense?.date) {
      return;
    }
    const date = new Date(expense.date);
    if (!Number.isNaN(date.getTime())) {
      uniqueDays.add(date.toDateString());
    }
  });
  const trackedDays = uniqueDays.size;
  const averageDailySpend = trackedDays ? totalSpent / trackedDays : 0;

  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!expense?.category) {
      return acc;
    }
    const amount = Number(expense.amount);
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    acc[expense.category] = (acc[expense.category] || 0) + safeAmount;
    return acc;
  }, {});

  let topCategoryName = '—';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (amount > topCategoryAmount) {
      topCategoryAmount = amount;
      topCategoryName = category;
    }
  });

  const budgetRemaining = Math.max(TOTAL_BUDGET - totalSpent, 0);
  const summaryCards = [
    {
      id: 'monthSpend',
      title: 'Spent this month',
      value: totalSpent,
      helper: expenses.length
        ? `Across ${expenses.length} ${
            expenses.length === 1 ? 'transaction' : 'transactions'
          }`
        : 'No expenses recorded yet',
      tone: totalSpent > TOTAL_BUDGET ? 'alert' : undefined,
    },
    {
      id: 'budget',
      title: 'Budget remaining',
      value: budgetRemaining,
      helper: `of ${formatCurrency(TOTAL_BUDGET)} total budget`,
      tone: budgetRemaining <= TOTAL_BUDGET * 0.25 ? 'alert' : 'positive',
    },
    {
      id: 'daily',
      title: 'Average daily spend',
      value: averageDailySpend,
      helper: trackedDays
        ? `Tracked across ${trackedDays} ${trackedDays === 1 ? 'day' : 'days'}`
        : 'No tracked days yet',
    },
    {
      id: 'topCategory',
      title: 'Top category',
      value: topCategoryName,
      helper:
        topCategoryName === '—'
          ? 'Add expenses to identify trends'
          : `${formatCurrency(topCategoryAmount)} spent`,
    },
  ];

  const latestExpenseDate = expenses.reduce((latest, expense) => {
    if (!expense?.date) {
      return latest;
    }
    const date = new Date(expense.date);
    if (Number.isNaN(date.getTime())) {
      return latest;
    }
    return !latest || date > latest ? date : latest;
  }, null);

  const lastUpdatedLabel = loading
    ? 'Refreshing…'
    : error
    ? 'Unable to refresh expenses'
    : latestExpenseDate
    ? `Last updated ${latestExpenseDate.toLocaleString()}`
    : 'No expenses recorded yet';

  const modalBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className="App">
      <div className="app-shell">
        <header className="app-header">
          <div className="header-content">
            <div>
              <p className="eyebrow">Personal finance snapshot</p>
              <h1>Expense Tracker</h1>
              <p className="subtitle">
                Monitor your spending, stay within your budget, and plan the moments that
                matter most.
              </p>
            </div>
            <button className="primary-button" type="button">
              + Add quick expense
            </button>
          </div>
          <div className="stats-grid">
            {summaryCards.map((card) => (
              <article key={card.id} className="stat-card">
                <p className="stat-title">{card.title}</p>
                <p className={`stat-value ${card.tone ?? ''}`}>
                  {formatCurrency(card.value)}
                </p>
                <p className="stat-helper">{card.helper}</p>
              </article>
            ))}
          </div>
        </header>

        <main className="app-main">
          <section className="layout-grid primary-grid">
            <article className="card expenses-card">
              <div className="card-heading">
              <div>
                <h2>Recent activity</h2>
                <p className="muted">{lastUpdatedLabel}</p>
              </div>
              <button className="ghost-button" type="button" onClick={openModal}>
                View all
              </button>
            </div>
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan="6" className="muted">
                        Loading expenses…
                      </td>
                    </tr>
                  )}
                  {!loading && error && (
                    <tr>
                      <td colSpan="6" className="error">
                        {error}
                      </td>
                    </tr>
                  )}
                  {!loading && !error && expenses.length === 0 && (
                    <tr>
                      <td colSpan="6" className="muted">
                        No expenses to display yet.
                      </td>
                    </tr>
                  )}
                  {!loading && !error &&
                    expenses.map((expense, index) => {
                      const amountValue = Number(expense?.amount);
                      const formattedAmount = Number.isFinite(amountValue)
                        ? formatCurrency(amountValue)
                        : '—';
                      const statusClass =
                        typeof expense?.status === 'string'
                          ? expense.status.toLowerCase()
                          : '';
                      const key =
                        typeof expense?.id === 'string' && expense.id.trim()
                          ? expense.id
                          : `expense-${index}`;

                      return (
                        <tr key={key}>
                          <td className="expense-name">{safeText(expense?.name)}</td>
                          <td>
                            <span className="expense-date">{safeText(expense?.date)}</span>
                          </td>
                          <td>{safeText(expense?.category)}</td>
                          <td>{safeText(expense?.method)}</td>
                          <td className="expense-amount">{formattedAmount}</td>
                          <td>
                            <span className={`status-pill ${statusClass}`}>
                              {safeText(expense?.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </article>

            <article className="card add-expense-card">
              <div className="card-heading">
                <h2>Log a new expense</h2>
                <p className="muted">Quickly capture spending to keep your budgets accurate.</p>
              </div>
              <form className="expense-form" onSubmit={handleAddExpense} onSubmit={handleAddExpense}>
                <label className="form-field">
                  <span>Expense name</span>
                  <input
                   
                    type="text"
                   
                    name="name"
                   
                    placeholder="Coffee with clients"
                    required
                 
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Category</span>
                  <select name="category" defaultValue="" required>
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-row">
                  <label className="form-field">
                    <span>Amount</span>
                    <input
                     
                      type="number"
                     
                      name="amount"
                     
                      placeholder="0.00"
                     
                      min="0"
                      step="0.01"
                      required
                   
                      step="0.01"
                      required
                    />
                  </label>
                  <label className="form-field">
                    <span>Date</span>
                    <input type="date" name="date" required required />
                  </label>
                </div>
                <label className="form-field">
                  <span>Payment method</span>
                  <input
                    type="text"
                    name="method"
                    placeholder="Card, cash, or account"
                    required
                  />
                </label>
                <label className="form-field">
                  <span>Status</span>
                  <select name="status" defaultValue="" required>
                    <option value="" disabled>
                      Select a status
                    </option>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                {formError && <p className="error">{formError}</p>}
                <button className="primary-button" type="submit">
                  Add expense
                </button>
              </form>
            </article>
          </section>

          <section className="layout-grid insights-grid">
            <article className="card budgets-card">
              <div className="card-heading">
                <h2>Budget health</h2>
                <p className="muted">Track where your limits are approaching.</p>
              </div>
              <ul className="budget-list">
                {budgets.map((budget) => {
                  const status = budgetStatus(budget.spent, budget.limit);
                  const percent = Math.min((budget.spent / budget.limit) * 100, 150);

                  return (
                    <li key={budget.id} className="budget-item">
                      <div className="budget-meta">
                        <div>
                          <p className="budget-label">{budget.label}</p>
                          <p className="muted">
                            {formatCurrency(budget.spent)} of {formatCurrency(budget.limit)} spent
                          </p>
                        </div>
                        <span className={`budget-percent ${status}`}>
                          {Math.round(percent)}%
                        </span>
                      </div>
                      <div className="progress">
                        <div
                          className={`progress-bar ${status}`}
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>

            <article className="card upcoming-card">
              <div className="card-heading">
                <h2>Upcoming plans</h2>
                <p className="muted">Look ahead and budget for what matters.</p>
              </div>
              <ul className="upcoming-list">
                {upcoming.map((item) => (
                  <li key={item.id} className="upcoming-item">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={modalBackdropClick}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-transactions-heading"
          >
            <div className="modal-header">
              <div>
                <h3 id="all-transactions-heading">All transactions</h3>
                <p className="muted">
                  Manage every logged expense without leaving your dashboard.
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={closeModal}
                aria-label="Close"
                disabled={modalLoading}
              >
                ×
              </button>
            </div>
            {modalError && <p className="error modal-error">{modalError}</p>}
            {modalLoading && <p className="muted modal-status">Working…</p>}
            <div className="modal-table-wrapper">
              <table className="expense-table modal-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan="7" className="muted">
                        No expenses to display yet.
                      </td>
                    </tr>
                  )}
                  {expenses.length > 0 &&
                    expenses.map((expense, index) => {
                      const amountValue = Number(expense?.amount);
                      const formattedAmount = Number.isFinite(amountValue)
                        ? formatCurrency(amountValue)
                        : '—';
                      const statusClass =
                        typeof expense?.status === 'string'
                          ? expense.status.toLowerCase()
                          : '';
                      const hasPersistedId =
                        typeof expense?.id === 'string' && expense.id.trim() !== '';
                      const expenseId = hasPersistedId
                        ? expense.id
                        : `expense-${index}`;
                      const isEditing = hasPersistedId && editingExpenseId === expense.id;

                      if (isEditing) {
                        return (
                          <tr key={expenseId}>
                            <td>
                              <input
                                className="table-input"
                                type="text"
                                value={editValues.name}
                                onChange={(event) =>
                                  handleEditFieldChange('name', event.target.value)
                                }
                                placeholder="Expense name"
                                disabled={modalLoading}
                              />
                            </td>
                            <td>
                              <input
                                className="table-input"
                                type="date"
                                value={editValues.date}
                                onChange={(event) =>
                                  handleEditFieldChange('date', event.target.value)
                                }
                                disabled={modalLoading}
                              />
                            </td>
                            <td>
                              <select
                                className="table-input"
                                value={editValues.category}
                                onChange={(event) =>
                                  handleEditFieldChange('category', event.target.value)
                                }
                                disabled={modalLoading}
                              >
                                <option value="" disabled>
                                  Select
                                </option>
                                {categoryOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                className="table-input"
                                type="text"
                                value={editValues.method}
                                onChange={(event) =>
                                  handleEditFieldChange('method', event.target.value)
                                }
                                placeholder="Payment method"
                                disabled={modalLoading}
                              />
                            </td>
                            <td>
                              <input
                                className="table-input"
                                type="number"
                                min="0"
                                step="0.01"
                                value={editValues.amount}
                                onChange={(event) =>
                                  handleEditFieldChange('amount', event.target.value)
                                }
                                placeholder="0.00"
                                disabled={modalLoading}
                              />
                            </td>
                            <td>
                              <select
                                className="table-input"
                                value={editValues.status}
                                onChange={(event) =>
                                  handleEditFieldChange('status', event.target.value)
                                }
                                disabled={modalLoading}
                              >
                                <option value="" disabled>
                                  Select
                                </option>
                                {statusOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="modal-actions">
                              <button
                                type="button"
                                className="button primary"
                                onClick={handleSaveEdit}
                                disabled={modalLoading}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="button muted"
                                onClick={cancelEdit}
                                disabled={modalLoading}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="button danger"
                                onClick={() => handleDeleteExpense(expense.id)}
                                disabled={modalLoading}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={expenseId}>
                          <td className="expense-name">{safeText(expense?.name)}</td>
                          <td>
                            <span className="expense-date">{safeText(expense?.date)}</span>
                          </td>
                          <td>{safeText(expense?.category)}</td>
                          <td>{safeText(expense?.method)}</td>
                          <td className="expense-amount">{formattedAmount}</td>
                          <td>
                            <span className={`status-pill ${statusClass}`}>
                              {safeText(expense?.status)}
                            </span>
                          </td>
                          <td className="modal-actions">
                            {hasPersistedId ? (
                              <>
                                <button
                                  type="button"
                                  className="button secondary"
                                  onClick={() => startEditingExpense(expense)}
                                  disabled={modalLoading}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="button danger"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  disabled={modalLoading}
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <span className="muted">Unavailable</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="button secondary"
                onClick={closeModal}
                disabled={modalLoading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
