
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

interface ExpensesSummaryProps {
  totalSpent: number;
  budget: number;
  currency: string;
}

export function ExpensesSummary({ totalSpent, budget, currency }: ExpensesSummaryProps) {
  const percentUsed = budget ? Math.round((totalSpent / budget) * 100) : 0;

  return (
    <div>
      <div className="mb-1 text-xs text-neutral-500 font-semibold">Orçamento usado</div>
      <div className="flex gap-2 items-end font-bold text-2xl text-terracotta">
        {formatCurrency(totalSpent, currency)}
        <span className="text-xs text-neutral-400 font-medium mb-1">
          de {formatCurrency(budget, currency)}
        </span>
      </div>
      <div className="my-2 w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-terracotta rounded-full h-full transition-all"
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>
      <div className={`text-xs mt-1 ${percentUsed > 80 ? "text-terracotta font-semibold" : "text-neutral-600"}`}>
        {percentUsed >= 100
          ? "Você ultrapassou o orçamento! ⚠️"
          : `Você já gastou ${percentUsed}% do seu orçamento.`}
      </div>
    </div>
  );
}
