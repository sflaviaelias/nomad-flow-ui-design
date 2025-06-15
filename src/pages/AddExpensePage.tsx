
import React, { useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import ExpenseForm from "@/components/ExpenseForm";
import BudgetSummary from "@/components/BudgetSummary";
import ExpenseInsightsAI from "@/components/ExpenseInsightsAI";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Tipagem compatível com ExpenseForm
type ExpenseFormData = {
  title: string;
  amount: number;
  category: string;
  payment_method?: string;
  date?: Date;
  receipt_url?: string;
};

export default function AddExpensePage() {
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Para scroll suavemente no orçamento após salvar
  const summaryRef = useRef<HTMLDivElement | null>(null);

  function handleExpenseSubmit(data: ExpenseFormData) {
    setSummaryData(data);
    setShowSummary(true);
    setAllExpenses(expenses => [
      ...expenses,
      {
        amount: data.amount,
        category: data.category || "Outros",
      }
    ]);
    setIsFormOpen(false);
    setShowSuccess(true);

    // Após 2 segundos, oculta a mensagem de sucesso
    setTimeout(() => {
      setShowSuccess(false);
      // Scroll suave para o resumo
      if (summaryRef.current) {
        summaryRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 2000);
  }

  function handleOpenForm() {
    setIsFormOpen(true);
    setTimeout(() => {
      // Dá foco no início do formulário após abrir
      const formEl = document.getElementById("expense-form");
      if (formEl) {
        formEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 350);
  }

  return (
    <div className="min-h-screen bg-[#FAF3EC] flex flex-col">
      <PageHeader title="Adicionar Despesa" showBack />
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6 flex flex-col gap-8">
        {/* Transição suave do formulário */}
        <div className="relative min-h-[50px]">
          {isFormOpen ? (
            <div
              id="expense-form"
              className="animate-fade-in transition-all duration-300"
              style={{ zIndex: 2 }}
            >
              <h2 className="text-2xl font-bold text-[#E76F51] mb-2 text-left font-inter">
                Nova despesa
              </h2>
              <p className="text-sm text-neutral-600 mb-6 text-left">
                Preencha os detalhes abaixo para adicionar uma despesa à sua viagem.
              </p>
              <ExpenseForm onSubmit={handleExpenseSubmit} />
            </div>
          ) : (
            <div
              className="flex items-center justify-start py-3 animate-fade-in transition-all duration-300"
              style={{ zIndex: 1 }}
            >
              <Button
                type="button"
                variant="ghost"
                className="gap-1 text-[#E76F51] border border-transparent px-2 py-1 shadow-none text-base font-semibold"
                onClick={handleOpenForm}
              >
                <Plus size={18} className="text-[#E76F51]" />
                Adicionar nova despesa
              </Button>
            </div>
          )}

          {/* Feedback visual após salvar (toast/light banner) */}
          {showSuccess && (
            <div className="absolute top-0 left-0 w-full flex justify-center z-10">
              <div className="flex items-center gap-2 bg-[#E6F6ED] text-[#217B4A] px-4 py-2 mt-2 rounded-md shadow animate-fade-in border border-[#B3F2CE] font-inter font-medium">
                <span className="text-lg">✅</span>
                Despesa adicionada com sucesso!
              </div>
            </div>
          )}
        </div>

        {/* Orçamento e insights, com referência para rolar suavemente */}
        {showSummary && summaryData && (
          <div ref={summaryRef} className="transition-all animate-fade-in">
            <BudgetSummary data={summaryData} onEditBudget={summaryData.onEditBudget} />
            <ExpenseInsightsAI
              expenses={allExpenses}
              budget={summaryData.budget}
              currency={summaryData.currency}
            />
          </div>
        )}
      </main>
    </div>
  );
}
