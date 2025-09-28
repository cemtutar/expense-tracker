import './App.css';

const summaryCards = [
  {
    id: 'monthSpend',
    title: 'Spent this month',
    value: 1245.18,
    helper: 'Up 8.5% vs last month',
    tone: 'alert',
  },
  {
    id: 'budget',
    title: 'Budget remaining',
    value: 754.82,
    helper: 'of $2,000 total budget',
    tone: 'positive',
  },
  {
    id: 'daily',
    title: 'Average daily spend',
    value: 41.5,
    helper: 'Tracked for the last 7 days',
  },
  {
    id: 'topCategory',
    title: 'Top category',
    value: 'Housing',
    helper: '$560 on rent & utilities',
  },
];

const expenseItems = [
  {
    id: 1,
    name: 'Fresh Mart Groceries',
    category: 'Food & Dining',
    amount: 68.42,
    method: 'Visa •• 3124',
    date: 'Mar 12, 2024',
    status: 'Cleared',
  },
  {
    id: 2,
    name: 'Cityline Utilities',
    category: 'Housing',
    amount: 142.18,
    method: 'Checking',
    date: 'Mar 10, 2024',
    status: 'Scheduled',
  },
  {
    id: 3,
    name: 'Evening with Friends',
    category: 'Entertainment',
    amount: 52.0,
    method: 'Amex •• 9044',
    date: 'Mar 9, 2024',
    status: 'Cleared',
  },
  {
    id: 4,
    name: 'Monthly Transit Pass',
    category: 'Transportation',
    amount: 89.0,
    method: 'Visa •• 3124',
    date: 'Mar 6, 2024',
    status: 'Pending',
  },
  {
    id: 5,
    name: 'Streaming Bundle',
    category: 'Subscriptions',
    amount: 29.99,
    method: 'Mastercard •• 4410',
    date: 'Mar 4, 2024',
    status: 'Cleared',
  },
];

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
                  <p className="muted">Last updated 2 minutes ago</p>
                </div>
                <button className="ghost-button" type="button">
                  View all
                </button>
              </div>
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseItems.map((expense) => (
                    <tr key={expense.id}>
                      <td>
                        <div className="expense-name">
                          <strong>{expense.name}</strong>
                          <span>{expense.date}</span>
                        </div>
                      </td>
                      <td>{expense.category}</td>
                      <td>{expense.method}</td>
                      <td className="expense-amount">{formatCurrency(expense.amount)}</td>
                      <td>
                        <span className={`status-pill ${expense.status.toLowerCase()}`}>
                          {expense.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className="card add-expense-card">
              <div className="card-heading">
                <h2>Log a new expense</h2>
                <p className="muted">Quickly capture spending to keep your budgets accurate.</p>
              </div>
              <form className="expense-form">
                <label className="form-field">
                  <span>Expense name</span>
                  <input type="text" name="name" placeholder="Coffee with clients" />
                </label>
                <label className="form-field">
                  <span>Category</span>
                  <select name="category" defaultValue="">
                    <option value="" disabled>
                      Select a category
                    </option>
                    <option value="food">Food & Dining</option>
                    <option value="housing">Housing</option>
                    <option value="transport">Transportation</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="wellness">Wellness</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <div className="form-row">
                  <label className="form-field">
                    <span>Amount</span>
                    <input type="number" name="amount" placeholder="0.00" min="0" />
                  </label>
                  <label className="form-field">
                    <span>Date</span>
                    <input type="date" name="date" />
                  </label>
                </div>
                <label className="form-field">
                  <span>Payment method</span>
                  <input type="text" name="method" placeholder="Card, cash, or account" />
                </label>
                <button className="primary-button" type="submit">
                  Add expense
                </button>
              </form>
            </article>
          </section>

          <section className="layout-grid insights-grid">
            <article className="card budgets-card">
              <div className="card-heading">
                <h2>Category budgets</h2>
                <p className="muted">Stay mindful of your spending goals across categories.</p>
              </div>
              <ul className="budget-list">
                {budgets.map((budget) => {
                  const percent = Math.round((budget.spent / budget.limit) * 100);
                  const status = budgetStatus(budget.spent, budget.limit);
                  return (
                    <li key={budget.id} className="budget-item">
                      <div className="budget-meta">
                        <div>
                          <p className="budget-label">{budget.label}</p>
                          <span className="muted">
                            {formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}
                          </span>
                        </div>
                        <span className={`budget-percent ${status}`}>
                          {percent}%
                        </span>
                      </div>
                      <div className="progress">
                        <div
                          className={`progress-bar ${status}`}
                          style={{ width: `${Math.min(percent, 110)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>

            <article className="card planning-card">
              <div className="card-heading">
                <h2>Planning ahead</h2>
                <p className="muted">A few suggestions to keep future spending stress-free.</p>
              </div>
              <ul className="planning-list">
                {upcoming.map((item) => (
                  <li key={item.id}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>
              <div className="tip-box">
                <strong>Tip:</strong> Automate a small weekly transfer into your savings to make
                progress on goals without thinking about it.
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;
