
import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import ExpenseForm from "@/components/ExpenseForm";
import BudgetSummary from "@/components/BudgetSummary";

export default function AddExpensePage() {
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[#FAF3EC] flex flex-col">
      <PageHeader title="Adicionar Despesa" showBack />
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6 flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-bold text-[#E76F51] mb-2 text-left font-inter">
            Nova despesa
          </h2>
          <p className="text-sm text-neutral-600 mb-6 text-left">
            Preencha os detalhes abaixo para adicionar uma despesa à sua viagem.
          </p>
          <ExpenseForm
            onCreated={(summary) => {
              setSummaryData(summary);
              setShowSummary(true);
            }}
          />
        </div>
        {showSummary && summaryData && (
          <BudgetSummary data={summaryData} onEditBudget={summaryData.onEditBudget} />
        )}
      </main>
    </div>
  );
}
