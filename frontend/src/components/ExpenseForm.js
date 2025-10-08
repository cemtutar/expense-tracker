import { useState } from "react";

export const CATEGORY_OPTIONS = [
  "Housing",
  "Transportation",
  "Food & Dining",
  "Entertainment",
  "Wellness",
  "Utilities",
  "Miscellaneous",
];

export const METHOD_OPTIONS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Mobile Payment",
];

export const STATUS_OPTIONS = ["Pending", "Cleared", "Scheduled"];

const defaultValues = {
  name: "",
  category: "",
  amount: "",
  date: "",
  method: "",
  status: "",
};

export const ExpenseForm = ({ onSubmit, disabled }) => {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState("");

  const updateField = (field, value) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = {
      name: values.name.trim(),
      category: values.category.trim(),
      amountText: values.amount.trim(),
      date: values.date.trim(),
      method: values.method.trim(),
      status: values.status.trim(),
    };

    const parsedAmount = Number(trimmed.amountText);

    if (
      !trimmed.name ||
      !trimmed.category ||
      !trimmed.date ||
      !trimmed.method ||
      !trimmed.status ||
      trimmed.amountText === "" ||
      !Number.isFinite(parsedAmount)
    ) {
      setErrors("Please provide every field with a valid value.");
      return;
    }

    setErrors("");

    try {
      await onSubmit({
        name: trimmed.name,
        category: trimmed.category,
        date: trimmed.date,
        method: trimmed.method,
        status: trimmed.status,
        amount: parsedAmount,
      });
      setValues(defaultValues);
    } catch (error) {
      // The parent component surfaces the API error; no-op here so the user can retry.
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2 className="panel-title">Add expense</h2>
      <div className="form-grid">
        <label className="field">
          <span className="field-label">Name</span>
          <input
            type="text"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Lunch with friends"
            disabled={disabled}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Category</span>
          <input
            type="text"
            list="expense-categories"
            value={values.category}
            onChange={(event) => updateField("category", event.target.value)}
            placeholder="Food & Dining"
            disabled={disabled}
            required
          />
          <datalist id="expense-categories">
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span className="field-label">Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={(event) => updateField("amount", event.target.value)}
            placeholder="45.23"
            disabled={disabled}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Date</span>
          <input
            type="date"
            value={values.date}
            onChange={(event) => updateField("date", event.target.value)}
            disabled={disabled}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Payment method</span>
          <input
            type="text"
            list="expense-methods"
            value={values.method}
            onChange={(event) => updateField("method", event.target.value)}
            placeholder="Credit Card"
            disabled={disabled}
            required
          />
          <datalist id="expense-methods">
            {METHOD_OPTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </label>
        <label className="field">
          <span className="field-label">Status</span>
          <select
            value={values.status}
            onChange={(event) => updateField("status", event.target.value)}
            disabled={disabled}
            required
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
        </label>
      </div>

      {errors ? <p className="form-error">{errors}</p> : null}

      <button type="submit" className="primary" disabled={disabled}>
        Save expense
      </button>
    </form>
  );
};
