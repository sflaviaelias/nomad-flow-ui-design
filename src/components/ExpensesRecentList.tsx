
import React from "react";

function formatCurrency(amount: number | null | undefined, currency: string = "BRL") {
  if (amount == null) return "--";
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string | null;
};

export function ExpensesRecentList({ expenses, currency }: { expenses: Expense[], currency: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-semibold text-neutral-700">Despesas recentes</span>
        <span className="text-xs text-neutral-500">({expenses.length})</span>
      </div>
      {expenses.length === 0 ? (
        <div className="text-neutral-400 text-sm py-6 text-center">Ainda não existem despesas registradas.</div>
      ) : (
        <ul className="divide-y divide-neutral-200">
          {expenses.slice(0, 6).map(exp => (
            <li key={exp.id} className="py-2 flex justify-between items-center">
              <div>
                <span className="block font-medium text-neutral-800 leading-tight">{exp.title}</span>
                <span className="block text-xs text-neutral-500">{exp.category}</span>
              </div>
              <span className="font-semibold text-neutral-700">{formatCurrency(exp.amount, currency)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
