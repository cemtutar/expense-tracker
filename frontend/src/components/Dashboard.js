import React from "react";

function Dashboard({ expenses }) {
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold">Total: ${total}</h2>
    </div>
  );
}

export default Dashboard;
