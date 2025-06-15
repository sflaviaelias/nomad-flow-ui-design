
import React, { useState } from "react";
import { BadgeDollarSign, CircleDollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function formatCurrency(amount: number, currency = "BRL") {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function BudgetSummary({ data, onEditBudget }: { data: any, onEditBudget?: (v: number) => void }) {
  const { budget, totalSpent, amount, remaining, currency, percent } = data;
  const [editing, setEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget);

  // Feedback visual adaptativo
  let statusMsg = "";
  let icon = <CircleDollarSign className="text-[#E76F51]" size={24} />;
  let statusBg = "bg-[#E76F51]/10";
  if (percent >= 100) {
    statusMsg = "Você ultrapassou o orçamento! Atenção para não comprometer o restante da viagem.";
    icon = <BadgeDollarSign className="text-[#E76F51]" size={24} />;
    statusBg = "bg-[#E76F51]/20";
  } else if (percent >= 80) {
    statusMsg = "Fique atento: Você já gastou mais de 80% do orçamento.";
    icon = <BadgeDollarSign className="text-[#E76F51]" size={24} />;
    statusBg = "bg-[#E76F51]/15";
  } else {
    statusMsg = "Sua gestão financeira está em dia!";
    icon = <CircleDollarSign className="text-[#6D4530]" size={24} />;
    statusBg = "bg-[#6D4530]/10";
  }

  return (
    <section className="rounded-lg bg-white shadow-card p-6 border border-[#E76F5115] mt-2 flex flex-col gap-2">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-[#AD4F36] text-lg">Resumo do orçamento</div>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => setEditing(true)}>
          Editar orçamento
        </Button>
      </div>
      <div className="flex items-end gap-2 font-bold text-2xl text-[#E76F51]">
        {formatCurrency(totalSpent, currency)}
        <span className="text-xs text-neutral-400 font-medium mb-1">
          de {!editing ? (
            <>{formatCurrency(budget, currency)}</>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                if (onEditBudget && !isNaN(Number(newBudget))) {
                  onEditBudget(Number(newBudget));
                  setEditing(false);
                }
              }}
            >
              <Input
                value={newBudget}
                type="number"
                step="0.01"
                min={1}
                className="inline-block w-24 text-base mr-1"
                onChange={e => setNewBudget(Number(e.target.value))}
                autoFocus
              />
              <Button type="submit" size="sm" className="ml-1 text-xs">Salvar</Button>
            </form>
          )}
        </span>
      </div>
      <div className="my-2 w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-[#E76F51] rounded-full h-full transition-all"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <div className={`text-xs mt-1 ${percent > 80 ? "text-[#E76F51] font-semibold" : "text-[#6D4530]"}`}>
        {percent >= 100
          ? "Você ultrapassou o orçamento! ⚠️"
          : `Você já gastou ${percent}% do orçamento.`}
      </div>
      <div className={`flex items-center gap-2 px-3 py-2 mt-3 rounded ${statusBg}`}>
        {icon} <span className="text-sm">{statusMsg}</span>
      </div>
      <div className="text-xs text-neutral-400 mt-2 text-right">
        Valor restante: <span className="font-bold text-[#E76F51]">{formatCurrency(remaining, currency)}</span>
      </div>
      <Button
        variant="ghost"
        className="text-[#E76F51] underline text-xs mt-2"
        onClick={() => window.location.href = "/trip/active"}
      >Ver visão completa</Button>
    </section>
  );
}
