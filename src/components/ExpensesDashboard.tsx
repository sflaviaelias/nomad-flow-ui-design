
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Plus, ChartBar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartLegendContent } from "@/components/ui/chart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
// Importando os componentes do Recharts
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string | null;
};

type Trip = {
  id: string;
  destination: string;
  budget: number | null;
  currency: string | null;
};

const CATEGORY_COLORS = {
  Alimentação: "#E76F51",
  Transporte: "#B5838D",
  Hospedagem: "#457B9D",
  Lazer: "#A2A2A2",
  Outros: "#DADADA",
};

function formatCurrency(amount: number | null | undefined, currency: string = "BRL") {
  if (amount == null) return "--";
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function ExpensesDashboard() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Faça login para ver despesas." });
        setLoading(false);
        return;
      }
      // Busca a primeira viagem do usuário
      const { data: trips } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1);

      if (!trips || trips.length === 0) {
        setTrip(null);
        setExpenses([]);
        setLoading(false);
        return;
      }
      const selectedTrip: Trip = trips[0];
      setTrip(selectedTrip);

      // Busca despesas da viagem
      const { data: expensesData } = await supabase
        .from("expenses")
        .select("*")
        .eq("trip_id", selectedTrip.id)
        .order("date", { ascending: false });

      setExpenses(
        (expensesData || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          amount: e.amount,
          category: e.category ?? "Outros"
        }))
      );
      setLoading(false);
    }
    fetchData();
  }, []);

  // Calcula totais por categoria
  const expensesByCategory = expenses.reduce(
    (agg: Record<string, number>, cur) => {
      const cat = cur.category ?? "Outros";
      agg[cat] = (agg[cat] || 0) + cur.amount;
      return agg;
    },
    {}
  );
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const budget = trip?.budget ?? 0;
  const percentUsed = budget ? Math.round((totalSpent / budget) * 100) : 0;

  // Gráfico data - sempre mostra top 4 categorias, o resto soma em "Outros"
  const topCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const otherSum = Object.entries(expensesByCategory)
    .slice(4)
    .reduce((sum, [_, v]) => sum + v, 0);
  const chartData = [
    ...topCategories.map(([cat, value]) => ({
      categoria: cat,
      valor: value,
      fill: CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || "#DADADA",
    })),
    ...(otherSum > 0
      ? [{
        categoria: "Outros",
        valor: otherSum,
        fill: CATEGORY_COLORS.Outros,
      }] : []),
  ];

  return (
    <Card className="mt-6 mb-8">
      <CardContent>
        {loading ? (
          <div className="py-10 flex items-center justify-center text-neutral-400">
            Carregando despesas...
          </div>
        ) : trip ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="block text-xs text-neutral-500 mb-1 font-medium">Viagem ativa</span>
                <span className="text-lg font-bold flex items-center gap-2">
                  <Home size={16} className="text-terracotta" />
                  {trip.destination}
                </span>
              </div>
              <Button className="bg-terracotta" onClick={() => navigate("/add-expense")}>
                <Plus size={16} /> Adicionar despesa
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="mb-1 text-xs text-neutral-500 font-semibold">Gastos por categoria</div>
                {chartData.length > 0 ? (
                  <ChartContainer
                    config={{
                      Alimentação: { color: CATEGORY_COLORS.Alimentação, label: "Alimentação", icon: ChartBar },
                      Transporte: { color: CATEGORY_COLORS.Transporte, label: "Transporte", icon: ChartBar },
                      Hospedagem: { color: CATEGORY_COLORS.Hospedagem, label: "Hospedagem", icon: ChartBar },
                      Lazer: { color: CATEGORY_COLORS.Lazer, label: "Lazer", icon: ChartBar },
                      Outros: { color: CATEGORY_COLORS.Outros, label: "Outros", icon: ChartBar },
                    }}
                    className="w-full max-w-sm"
                  >
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={chartData}>
                        <XAxis dataKey="categoria" axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="valor" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="text-neutral-400 text-sm py-12 text-center">Sem despesas ainda</div>
                )}
                <ChartLegendContent
                  payload={chartData.map(d => ({
                    color: d.fill,
                    value: d.categoria,
                    type: "square",
                  }))}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="mb-1 text-xs text-neutral-500 font-semibold">Orçamento usado</div>
                <div className="flex gap-2 items-end font-bold text-2xl text-terracotta">
                  {formatCurrency(totalSpent, trip.currency || "BRL")}
                  <span className="text-xs text-neutral-400 font-medium mb-1">
                    de {formatCurrency(trip.budget, trip.currency || "BRL")}
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
            </div>
            <div className="mt-8">
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
                      <span className="font-semibold text-neutral-700">{formatCurrency(exp.amount, trip.currency || "BRL")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="py-10 text-center text-neutral-500">
            Nenhuma viagem ativa encontrada.<br />
            Programe uma nova viagem para começar!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
