
import React from "react";

interface ExpenseReceiptUploadProps {
  value?: string;
  onChange: (value: string) => void;
}

export default function ExpenseReceiptUpload({
  value,
  onChange,
}: ExpenseReceiptUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Em uma implementação real: upload para Storage e retorna URL.
    // Aqui, simula retorno de URL local.
    const url = URL.createObjectURL(file);
    onChange(url);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#6D4530] mb-1">
        Recibo (opcional)
      </label>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="input py-1"
      />
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Recibo"
            className="max-h-24 rounded shadow border"
          />
        </div>
      )}
    </div>
  );
}
