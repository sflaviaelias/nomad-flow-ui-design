import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import ExpenseReceiptUpload from "./ExpenseReceiptUpload";
import ExpenseCategorySelect from "./ExpenseCategorySelect";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "Alimentação", label: "Alimentação" },
  { value: "Transporte", label: "Transporte" },
  { value: "Hospedagem", label: "Hospedagem" },
  { value: "Lazer", label: "Lazer" },
  { value: "Compras", label: "Compras" },
  { value: "Outros", label: "Outros" }
];

const PAYMENT_METHODS = [
  "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Transferência", "PIX", "Outro"
];

export default function ExpenseForm({ onCreated }: { onCreated: (summary: any) => void }) {
  const [trip, setTrip] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [loading, setLoading] = useState(false);
  const [expenseDate, setExpenseDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Budget/data for summary
  const [budgetInfo, setBudgetInfo] = useState<any>(null);
  const [convertedValue, setConvertedValue] = useState<number | null>(null);

  const form = useForm({
    defaultValues: {
      title: "",
      amount: "",
      description: "",
      category: "Alimentação",
      payment: "",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const amount = Number(form.watch("amount") || 0);

  // Busca viagem ativa do usuário real, status + log detalhado
  useEffect(() => {
    async function fetchTrip() {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[ExpenseForm] user:', user); // DEBUG LOG
      if (!user) {
        toast({ title: "É necessário estar logada(o)." });
        setLoading(false);
        return;
      }

      // Busca todas as viagens do usuário
      const { data: trips, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      console.log('[ExpenseForm] trips:', trips, 'error:', error, 'user_id:', user.id); // DEBUG LOG

      if (error) {
        toast({
          title: "Erro ao buscar viagens:",
          description: error.message
        });
        setLoading(false);
        return;
      }
      if (!trips?.length) {
        // Explicação detalhada para casos reais
        toast({
          title: "Nenhuma viagem REAL encontrada para seu usuário.",
          description: "Cadastre uma viagem antes de inserir despesas (mocks não aparecem aqui)."
        });
        setLoading(false);
        return;
      }
      // Seleciona como ativa a viagem cuja data de início <= hoje <= fim, senão a mais recente
      const today = new Date().toISOString().slice(0, 10);
      let activeTrip = trips.find(
        (t: any) => t.start_date <= today && t.end_date >= today
      );
      if (!activeTrip) activeTrip = trips[0];

      setTrip(activeTrip);
      setBudgetInfo({
        tripId: activeTrip.id,
        budget: Number(activeTrip.budget) || 0,
        currency: activeTrip.currency || "BRL"
      });
      setLoading(false);
    }
    fetchTrip();
  }, []);

  // Conversão (aparece quando existir valor)
  const { converted, loading: loadingConvert } = useCurrencyConversion(
    amount,
    budgetInfo?.currency || "BRL",
    "BRL"
  );
  useEffect(() => {
    setConvertedValue(converted ?? null);
  }, [converted]);

  const handleSubmit = async (values: any) => {
    if (!trip) return;

    setLoading(true);

    let receiptUrl = null;
    if (receiptFile) {
      const fileExt = receiptFile.name.split(".").pop();
      const fileName = `receipt_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("receipts")
        .upload(`${trip.id}/${fileName}`, receiptFile, {
          cacheControl: "3600",
          upsert: false,
        });
      if (!error) {
        receiptUrl = data.path;
      }
    }

    // Salva a despesa incluindo o novo campo description
    const { error: insertError } = await supabase.from("expenses").insert([
      {
        trip_id: trip.id,
        title: values.title,
        amount: Number(values.amount),
        date: expenseDate,
        category,
        description: values.description, // agora está garantido no banco!
        payment_method: paymentMethod,
        receipt_url: receiptUrl,
      }
    ]);
    setLoading(false);

    if (insertError) {
      toast({ title: "Erro ao salvar!", description: insertError.message });
      return;
    }
    // Atualiza valores para o resumo
    const { data: exp } = await supabase
      .from("expenses")
      .select("amount") // campos básicos, mas se quiser usar description pode incluir: .select("amount, description")
      .eq("trip_id", trip.id);
    const totalSpent = (exp || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    onCreated({
      tripId: trip.id,
      budget: budgetInfo.budget,
      currency: budgetInfo.currency,
      totalSpent,
      amount: Number(values.amount),
      remaining: Math.max(0, (budgetInfo.budget - totalSpent)),
      percent: budgetInfo.budget ? Math.round((totalSpent / budgetInfo.budget) * 100) : 0,
      onEditBudget: async (newBudget: number) => {
        await supabase.from("trips").update({ budget: newBudget }).eq("id", trip.id);
        toast({ title: "Orçamento atualizado!" });
      }
    });
    form.reset();
    setReceiptFile(null);
    setPaymentMethod("");
    setCategory("Alimentação");
  };

  // Caso não haja viagem no banco, retorna visualmente explicação para o usuário
  return !trip ? (
    <div className="text-neutral-400 text-sm py-6 text-center">
      {loading ? "Carregando informações da viagem..." :
        <>
          Nenhuma viagem cadastrada foi encontrada para o seu usuário.<br />
          Para adicionar despesas, cadastre antes uma <span className="text-[#E76F51] font-semibold">viagem real</span> pelo app.
        </>
      }
    </div>
  ) : (
    <form
      className="bg-white rounded-lg shadow-card p-6 space-y-6 border border-[#E76F5115]"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div>
        <label className="block font-semibold text-[#AD4F36] mb-1" htmlFor="title">
          Descrição <span className="text-[#E76F51]">*</span>
        </label>
        <Input
          type="text"
          id="title"
          placeholder="Ex: Jantar em restaurante"
          {...form.register("title", { required: true })}
          autoComplete="off"
          maxLength={64}
          className="mb-2"
        />
      </div>
      <div>
        <label className="block font-semibold text-[#AD4F36] mb-1" htmlFor="amount">
          Valor <span className="text-[#E76F51]">*</span>
        </label>
        <Input
          type="number"
          step="0.01"
          inputMode="decimal"
          min={0}
          id="amount"
          {...form.register("amount", { required: true, min: 0.01 })}
          placeholder={`Valor em ${trip.currency}`}
        />
        {amount > 0 && (
          <div className="text-xs text-neutral-500 mt-1">Convertido: R$ {convertedValue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
        )}
      </div>
      <div>
        <label className="block font-semibold text-[#AD4F36] mb-1" htmlFor="date">Data</label>
        <Input
          type="date"
          id="date"
          {...form.register("date")}
          value={expenseDate}
          onChange={e => { setExpenseDate(e.target.value); form.setValue("date", e.target.value); }}
        />
      </div>
      <div>
        <label className="block font-semibold text-[#AD4F36] mb-2">Categoria</label>
        <ExpenseCategorySelect value={category} onChange={setCategory} />
      </div>
      <div>
        <label className="block font-semibold text-[#AD4F36] mb-1" htmlFor="payment">
          Forma de pagamento
        </label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger id="payment" className="w-full">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block font-semibold text-[#AD4F36] mb-1" htmlFor="description">
          Observações
        </label>
        <Textarea id="description" placeholder="Ex: Foi pago em dinheiro" {...form.register("description")} />
      </div>
      <div>
        <label className="block font-semibold text-[#AD4F36] mb-2">Comprovante (opcional)</label>
        <ExpenseReceiptUpload file={receiptFile} setFile={setReceiptFile} />
      </div>
      <Button type="submit" className="w-full bg-[#E76F51] hover:bg-[#C9583C] text-white text-base font-bold rounded-md mt-2" disabled={loading || loadingConvert}>
        {loading ? "Salvando..." : "Salvar despesa"}
      </Button>
    </form>
  );
}
