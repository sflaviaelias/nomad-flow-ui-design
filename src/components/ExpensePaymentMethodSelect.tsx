
import React from "react";

interface ExpensePaymentMethodSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const paymentMethods = [
  { label: "Dinheiro", value: "cash" },
  { label: "Cartão de crédito", value: "credit_card" },
  { label: "Cartão de débito", value: "debit_card" },
  { label: "PIX", value: "pix" },
  { label: "Outro", value: "other" },
];

export default function ExpensePaymentMethodSelect({
  value,
  onChange,
  error,
}: ExpensePaymentMethodSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#6D4530] mb-1">
        Método de Pagamento
      </label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        <option value="">Escolha o método</option>
        {paymentMethods.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      {error && <div className="text-[#C9583C] text-xs mt-1">{error}</div>}
    </div>
  );
}
