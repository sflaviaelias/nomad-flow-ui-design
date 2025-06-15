import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Plus, ChartBar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChartContainer, ChartLegendContent } from "@/components/ui/chart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useGuestMode } from "@/hooks/useGuestMode";
import { showGuestBlockedToast } from "./GuestLoginToast";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import { ExpensesChart } from "./ExpensesChart";
import { ExpensesSummary } from "./ExpensesSummary";
import { ExpensesRecentList } from "./ExpensesRecentList";

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
  const { isGuest } = useGuestMode();

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
    .sort((a, b) => b[1] - a[1])
    .slice(4)
    .reduce((sum, [, value]) => sum + value, 0);

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
              <Button
                className="bg-terracotta"
                onClick={isGuest ? showGuestBlockedToast : () => navigate("/add-expense")}
                disabled={isGuest}
              >
                <Plus size={16} /> Adicionar despesa
              </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <ExpensesChart chartData={chartData} />
              </div>
              <div className="flex-1 min-w-[200px]">
                <ExpensesSummary totalSpent={totalSpent} budget={trip.budget || 0} currency={trip.currency || "BRL"} />
              </div>
            </div>
            <div className="mt-8">
              <ExpensesRecentList expenses={expenses} currency={trip.currency || "BRL"} />
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
