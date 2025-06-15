
import React from "react";
import { AlertCircle, TrendingUp, Hammer, Info } from "lucide-react";

type Expense = {
  amount: number;
  category: string;
};

type Props = {
  expenses: Expense[];
  budget: number;
  currency: string;
};

function formatCurrency(value: number, currency = "BRL") {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Mock: orçamentos por categoria — futuro, puxar do backend/UserProfile!
const DEFAULT_CATEGORY_BUDGET: Record<string, number> = {
  "Alimentação": 0.35,
  "Transporte": 0.18,
  "Hospedagem": 0.25,
  "Lazer": 0.12,
  "Compras": 0.06,
  "Outros": 0.04,
};

export default function ExpenseInsightsAI({ expenses, budget, currency }: Props) {
  // Calcular totais por categoria
  const byCategory: Record<string, number> = {};
  expenses.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  // Estratégia: alertar se gastou mais de 80% do orçamento estimado da categoria
  const warnings: { message: string; category: string; percent: number }[] = [];
  const suggestions: string[] = [];

  for (const cat in byCategory) {
    const catBudgetTarget = (DEFAULT_CATEGORY_BUDGET[cat] || 0.1) * budget;
    const percent = (byCategory[cat] / catBudgetTarget) * 100;
    if (percent >= 80 && percent < 100) {
      warnings.push({
        message: `Você já gastou ${Math.round(percent)}% com ${cat.toLowerCase()}`,
        category: cat,
        percent,
      });
      suggestions.push(`Cuide para não ultrapassar o orçamento de ${cat.toLowerCase()}!`);
    }
    if (percent >= 100) {
      warnings.push({
        message: `Atenção: orçamento de ${cat.toLowerCase()} já esgotado.`,
        category: cat,
        percent,
      });
      suggestions.push(`Reveja gastos em ${cat.toLowerCase()}, tente economizar em outras áreas.`);
    }
  }

  // Detectar padrões gerais de gasto/ultrapassagem do total
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, budget - totalSpent);
  if (totalSpent / budget >= 0.85) {
    warnings.push({
      message: `Você já gastou ${Math.round((totalSpent / budget) * 100)}% do seu orçamento total.`,
      category: "Total",
      percent: (totalSpent / budget) * 100,
    });
    suggestions.push("Considere limitar gastos futuros — seu saldo está acabando.");
  }

  // Sugestão aleatória (mock IA): economizar em alimentação/café, buscar transporte alternativo, etc
  if (byCategory["Alimentação"] > (DEFAULT_CATEGORY_BUDGET["Alimentação"] * budget * 0.8)) {
    suggestions.push(
      "Experimente preparar refeições no local ou buscar mercados ao invés de restaurantes."
    );
  }
  if (byCategory["Transporte"] > (DEFAULT_CATEGORY_BUDGET["Transporte"] * budget * 0.8)) {
    suggestions.push(
      "Avalie usar transporte público ou compartilhar caronas para economizar."
    );
  }

  // Visualização
  return (
    <section className="rounded-lg border border-[#E76F5120] p-4 mt-4 bg-[#FFF7F4] shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="text-[#E76F51]" />
        <span className="font-bold text-[#AD4F36]">Resumo inteligente</span>
      </div>
      <div className="text-sm text-neutral-700 flex gap-2 mb-2">
        <span>Total já gasto: <span className="font-bold text-[#E76F51]">{formatCurrency(totalSpent, currency)}</span></span>
        <span>•</span>
        <span>Saldo restante: <span className="font-bold text-[#AD4F36]">{formatCurrency(remaining, currency)}</span></span>
      </div>
      {/* Barras por categoria */}
      <div className="space-y-1 my-1">
        {Object.keys(byCategory).map(cat => {
          const catBudget = (DEFAULT_CATEGORY_BUDGET[cat] || 0.1) * budget;
          const percent = Math.min(100, Math.round((byCategory[cat] / catBudget) * 100));
          return (
            <div key={cat} className="flex items-center gap-2">
              <span className="w-24 text-xs text-[#AD4F36]">{cat}</span>
              <div className="w-full h-2 bg-[#dadada60] rounded">
                <div
                  className={`${percent >= 90
                      ? "bg-[#E76F51]"
                      : percent >= 80
                        ? "bg-[#F7B267]"
                        : "bg-[#AD4F36]"} h-2 rounded transition-all`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs ml-2 w-12 text-right text-[#6D4530]">
                {formatCurrency(byCategory[cat], currency)}
              </span>
            </div>
          );
        })}
      </div>
      {/* Alertas */}
      {warnings.length > 0 && (
        <div className="flex flex-col gap-1 mt-2">
          {warnings.map((warn, i) => (
            <div
              key={i}
              className={`flex items-center text-xs rounded px-2 py-1 mb-1 font-medium
                ${warn.percent >= 100 ? "bg-[#E76F51]/20 text-[#E76F51]" : "bg-[#FDE6B1] text-[#AD4F36]"}`}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {warn.message}
            </div>
          ))}
        </div>
      )}
      {/* Sugestões */}
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-1 font-medium text-[#AD4F36] text-xs mb-1">
            <Hammer className="w-4 h-4" /> Sugestões de economia
          </div>
          {suggestions.map((s, i) => (
            <div key={i} className="bg-[#dadada30] rounded px-2 py-1 text-xs text-[#6D4530] font-medium">{s}</div>
          ))}
        </div>
      )}
      {!warnings.length && !suggestions.length && (
        <div className="flex gap-2 items-center text-xs text-[#6D4530] mt-2">
          <Info className="w-4 h-4" /> Seus gastos estão em linha com o seu orçamento. Parabéns!
        </div>
      )}
    </section>
  );
}
