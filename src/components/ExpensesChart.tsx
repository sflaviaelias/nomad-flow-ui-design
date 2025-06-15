
import React from "react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { ChartContainer, ChartLegendContent } from "@/components/ui/chart";
import { ChartBar } from "lucide-react";

const CATEGORY_COLORS = {
  Alimentação: "#E76F51",
  Transporte: "#B5838D",
  Hospedagem: "#457B9D",
  Lazer: "#A2A2A2",
  Outros: "#DADADA",
};

export function ExpensesChart({ chartData }: { chartData: any[] }) {
  return (
    <div className="mb-1">
      <div className="text-xs text-neutral-500 font-semibold mb-1">Gastos por categoria</div>
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
  );
}

