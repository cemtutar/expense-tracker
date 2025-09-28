import React from "react";

function ExpenseList({ expenses, onDelete }) {
  return (
    <ul className="divide-y">
      {expenses.map((e) => (
        <li
          key={e.id}
          className="py-2 flex justify-between items-center"
        >
          <span>
            {e.category} - ${e.amount} ({e.date})
          </span>
          <button
            onClick={() => onDelete(e.id)}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ExpenseList;
