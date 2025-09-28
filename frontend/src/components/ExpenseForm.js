import React, { useState } from "react";

function ExpenseForm({ onAdd }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      name: name.trim(),
      amount: Number(amount),
      category,
      date,
      method: method.trim(),
      status,
    });
    setName("");
    setAmount("");
    setCategory("");
    setDate("");
    setMethod("");
    setStatus("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <input
        type="text"
        placeholder="Payment method"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="border p-2 w-full"
        required
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border p-2 w-full"
        required
      >
        <option value="" disabled>
          Select status
        </option>
        <option value="Pending">Pending</option>
        <option value="Cleared">Cleared</option>
        <option value="Scheduled">Scheduled</option>
      </select>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Expense
      </button>
    </form>
  );
}

export default ExpenseForm;
