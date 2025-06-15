
import React from "react";
import { Upload, X } from "lucide-react";

type Props = {
  file: File | null;
  setFile: (f: File | null) => void;
};

export default function ExpenseReceiptUpload({ file, setFile }: Props) {
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {!file ? (
        <>
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-[#FAF3EC] text-[#E76F51] rounded-md border border-[#E76F51] hover:bg-[#E76F51]/10 font-semibold text-sm transition">
            <Upload className="mr-1" size={18} />
            Selecionar arquivo
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleSelect}
              className="hidden"
              aria-label="Selecionar comprovante"
            />
          </label>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-neutral-700 text-xs">{file.name}</span>
          <button
            type="button"
            className="ml-2 text-[#E76F51] hover:text-red-500"
            aria-label="Remover arquivo"
            onClick={() => setFile(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
