import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { Expense } from "@/types";
import ExpenseCategorySelect from "./ExpenseCategorySelect";
import ExpensePaymentMethodSelect from "./ExpensePaymentMethodSelect";
import ExpenseReceiptUpload from "./ExpenseReceiptUpload";

const expenseSchema = z.object({
  title: z.string().min(3, {
    message: "Título deve ter pelo menos 3 caracteres.",
  }),
  amount: z.number().min(0.01, {
    message: "Valor deve ser maior que zero.",
  }),
  category: z.string().min(1, {
    message: "Categoria é obrigatória.",
  }),
  payment_method: z.string().optional(),
  date: z.date().optional(),
  receipt_url: z.string().optional(),
});

interface ExpenseFormProps {
  onSubmit: (data: Expense) => void;
}

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Expense>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campo: título/descrição */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[#6D4530] mb-1">
          Descrição <span className="text-[#C9583C]">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register("title", { required: true })}
          className="input"
          placeholder="Ex: Café da manhã no Mercado Central"
        />
      </div>

      {/* Campo: Categoria */}
      <ExpenseCategorySelect
        value={watch("category")}
        onChange={val => setValue("category", val)}
        error={errors.category?.message}
      />

      {/* Campo: Método de pagamento */}
      <ExpensePaymentMethodSelect
        value={watch("payment_method")}
        onChange={val => setValue("payment_method", val)}
        error={errors.payment_method?.message}
      />

      {/* Campo: Valor */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-[#6D4530] mb-1">
          Valor <span className="text-[#C9583C]">*</span>
        </label>
        <input
          id="amount"
          type="number"
          min={0}
          step="0.01"
          {...register("amount", { required: true, valueAsNumber: true })}
          className="input"
          placeholder="Ex: 12.50"
        />
      </div>

      {/* Campo: Data */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-[#6D4530] mb-1">
          Data da despesa
        </label>
        <input
          id="date"
          type="date"
          {...register("date")}
          className="input"
        />
      </div>

      {/* Campo: Upload de recibo */}
      <ExpenseReceiptUpload
        value={watch("receipt_url")}
        onChange={val => setValue("receipt_url", val)}
      />

      {/* Botão submit */}
      <button
        type="submit"
        className="w-full mt-4 bg-[#E76F51] hover:bg-[#C9583C] text-white font-bold rounded-md py-3"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adicionando..." : "Adicionar despesa"}
      </button>
    </form>
  );
}
