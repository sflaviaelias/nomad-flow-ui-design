
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EditProfileActionsProps {
  loading: boolean;
  onSave: (e: React.FormEvent) => void;
}

export function EditProfileActions({ loading, onSave }: EditProfileActionsProps) {
  const navigate = useNavigate();
  return (
    <div className="flex gap-3">
      <Button
        type="submit"
        className="flex-1 bg-terra-600 text-white font-semibold text-lg rounded-lg py-2 mt-1 min-h-[44px]"
        style={{ fontFamily: "Inter" }}
        disabled={loading}
        onClick={onSave}
      >
        Salvar
      </Button>
      <Button
        type="button"
        variant="outline"
        className="flex-1 border-terra-700 text-terra-700 bg-[#FAF3EC] hover:bg-terra-600/10 font-semibold rounded-lg py-2 mt-1 min-h-[44px]"
        style={{ fontFamily: "Inter" }}
        onClick={() => navigate(-1)}
      >
        Cancelar
      </Button>
    </div>
  );
}
