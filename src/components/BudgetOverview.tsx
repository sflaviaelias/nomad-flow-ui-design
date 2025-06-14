
import React from "react";

const BudgetOverview = () => (
  <section className="rounded-lg bg-card shadow-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
    <div>
      <div className="text-xs text-neutral-500 mb-1 font-medium">Despesas no mês</div>
      <div className="flex items-end gap-2 font-bold text-2xl text-terracotta">
        R$4.500 <span className="text-xs text-neutral-400 font-medium mb-1">BRL</span>
      </div>
      <div className="text-sm text-neutral-500">Convertido: US$ 850</div>
    </div>
    <div className="flex flex-col gap-1 w-full md:w-auto">
      <div className="text-xs text-neutral-500 mb-1 font-medium">Status</div>
      <div className="w-full bg-neutral-200 rounded-md h-3 overflow-hidden">
        <div className="bg-terracotta rounded-md h-full" style={{ width: "70%" }} />
      </div>
      <div className="text-xs text-neutral-600 mt-1">Você já gastou 70% do orçamento deste mês.</div>
    </div>
  </section>
);

export default BudgetOverview;
