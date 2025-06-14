
import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import ExpenseCategorySelect from "@/components/ExpenseCategorySelect";
import { Calendar } from "lucide-react";

const TRAVEL_CURRENCIES = ["BRL", "USD", "EUR", "GBP", "ARS"];
const PAYMENT_METHODS = [
  { value: "crédito", label: "Cartão de Crédito" },
  { value: "débito", label: "Cartão de Débito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "outro", label: "Outro" },
];

export default function AddExpensePage() {
  const navigate = useNavigate();
  // Em implementação real, obteríamos info da viagem ativa do contexto/DB
  const activeTripCurrency = "EUR";
  const userCurrency = "BRL";

  // State do formulário
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(activeTripCurrency);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [payment, setPayment] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);

  // Validação
  const [errors, setErrors] = useState<Record<string,string>>({});

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceipt(e.target.files?.[0] || null);
  };

  // Placeholder para conversão de moeda
  const convertedValue = (() => {
    const v = parseFloat(amount);
    if (!v || Number.isNaN(v)) return "--";
    if (currency === userCurrency) return v.toLocaleString("pt-BR", { style: "currency", currency: userCurrency });
    // Simula taxa de conversão EUR→BRL
    const rates: Record<string, number> = { "EUR": 5.7, "USD": 5.1, "BRL": 1, "GBP": 7.1, "ARS": 0.006 };
    const brl = Number((v * (rates[currency] ?? 1)).toFixed(2));
    return brl.toLocaleString("pt-BR", { style: "currency", currency: userCurrency });
  })();

  function validate() {
    const errs: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errs.amount = "Informe um valor válido";
    if (!currency) errs.currency = "Selecione a moeda";
    if (!description) errs.description = "Informe uma descrição";
    if (!date) errs.date = "Selecione a data";
    if (!category) errs.category = "Escolha uma categoria";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // Implementar lógica de persistência real aqui
    // Exemplo: await supabase.from("expenses").insert(...);
    toast({ title: "Despesa salva com sucesso!" });
    setTimeout(() => {
      navigate("/trip/active");
    }, 600);
  }

  return (
    <div className="min-h-screen bg-[#FAF3EC] font-inter">
      <PageHeader
        title="Adicionar Despesa"
        showBack
        backTo="/trip/active"
        rightAction={
          <Button
            type="button"
            variant="ghost"
            className="text-[#E76F51] underline text-base hover:bg-[#E76F5114] px-2 py-2"
            style={{ minWidth: 44, minHeight: 44 }}
            onClick={() => navigate("/trip/active")}
          >
            Cancelar
          </Button>
        }
      />
      <form
        className="max-w-md mx-auto bg-white rounded-xl shadow-soft p-5 mt-6 space-y-5"
        autoComplete="off"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label className="block mb-1 font-medium text-[#6D4530]">Valor da despesa</label>
          <div className="flex gap-2 items-center">
            <Input
              inputMode="decimal"
              type="number"
              placeholder="Ex: 25.00"
              className={`bg-[#FAF3EC] ${errors.amount ? "border-destructive" : "border-[#DADADA]"}`}
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(",", "."))}
              required
              style={{ fontFamily: "Inter" }}
            />
            <select
              className="py-2 px-3 bg-[#FAF3EC] rounded-md border border-[#DADADA] font-medium text-base min-w-[90px]"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              style={{ fontFamily: "Inter" }}
            >
              {TRAVEL_CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            ~ {convertedValue} ({userCurrency})
          </div>
          {errors.amount && <div className="text-destructive text-xs mt-1">{errors.amount}</div>}
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#6D4530]">Descrição</label>
          <Input
            placeholder="Ex: Almoço, Transporte, Museu..."
            className={`bg-[#FAF3EC] ${errors.description ? "border-destructive" : "border-[#DADADA]"}`}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            style={{ fontFamily: "Inter" }}
          />
          {errors.description && <div className="text-destructive text-xs mt-1">{errors.description}</div>}
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[130px]">
            <label className="block mb-1 font-medium text-[#6D4530]">Data</label>
            <Input
              type="date"
              className={`bg-[#FAF3EC] ${errors.date ? "border-destructive" : "border-[#DADADA]"}`}
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              style={{ fontFamily: "Inter" }}
            />
            {errors.date && <div className="text-destructive text-xs mt-1">{errors.date}</div>}
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block mb-1 font-medium text-[#6D4530]">Hora <span className="text-neutral-400">(opcional)</span></label>
            <Input
              type="time"
              className="bg-[#FAF3EC] border-[#DADADA]"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{ fontFamily: "Inter" }}
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#6D4530]">Categoria</label>
          <ExpenseCategorySelect value={category} onChange={setCategory} />
          {errors.category && <div className="text-destructive text-xs mt-1">{errors.category}</div>}
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#6D4530]">Forma de pagamento <span className="text-neutral-400">(opcional)</span></label>
          <select
            className="py-2 px-3 bg-[#FAF3EC] rounded-md border border-[#DADADA] font-medium text-base w-full"
            value={payment}
            onChange={e => setPayment(e.target.value)}
            style={{ fontFamily: "Inter", minHeight: 44 }}
          >
            <option value="">Selecione</option>
            {PAYMENT_METHODS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#6D4530]">Comprovante <span className="text-neutral-400">(opcional)</span></label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-3 py-2 bg-[#FAF3EC] rounded-md border border-[#DADADA] hover:bg-[#e4d8c6] text-[#6D4530] transition" style={{ minWidth: 44, minHeight: 44 }}>
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFile} />
              Anexar arquivo
            </label>
            {receipt && <span className="text-neutral-600 text-sm">{receipt.name}</span>}
          </div>
        </div>
        <Button
          type="submit"
          className="mt-3 w-full py-3 rounded-md text-base bg-[#E76F51] text-white font-semibold hover:bg-[#C9583C] shadow-card transition"
          style={{ minHeight: 44, fontFamily: "Inter" }}
        >
          Salvar Despesa
        </Button>
      </form>
    </div>
  );
}
