
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

const fallbackTags = [
  "Viajante Econômico",
  "Trabalhador Remoto",
  "Explorador Cultural",
];

export function ProfilePreferencesCard({ preferences }: { preferences: any }) {
  const travel_tags = preferences.travel_tags ?? fallbackTags;
  const hasTags = travel_tags && travel_tags.length > 0;
  return (
    <Card className="bg-white rounded-xl shadow-soft border-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-terra-900 font-semibold text-base" style={{ fontFamily: "Inter" }}>
          Preferências
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-4 pt-0">
        <div className="mb-2">
          <span className="font-medium text-terra-800 text-[15px]" style={{ fontFamily: "Inter" }}>Idiomas:</span>
          <span className="ml-1 text-terra-900">{preferences?.languages?.join(", ")}</span>
        </div>
        <div className="mb-2 flex flex-col">
          <span className="font-medium text-terra-800 text-[15px] mb-1" style={{ fontFamily: "Inter" }}>Estilo de viagem:</span>
          <div className="flex flex-wrap gap-2">
            {hasTags ? (
              travel_tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-terra-600/90 text-white rounded-full px-3 py-1 text-xs"
                  style={{ fontFamily: "Inter", minHeight: "28px" }}
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-terra-700 text-[14px]" style={{ fontFamily: "Inter" }}>
                Nenhum estilo favorito selecionado ainda.
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-medium text-terra-800 text-[15px]" style={{ fontFamily: "Inter" }}>
            Assistente IA:
          </span>
          <Badge
            className={`rounded-full px-2 py-0.5 text-xs font-medium border-none min-w-[44px] min-h-[28px] ${
              preferences?.ai_assistant
                ? "bg-terra-600 text-white"
                : "bg-[#DADADA] text-terra-900"
            }`}
            style={{ fontFamily: "Inter" }}
          >
            {preferences?.ai_assistant ? "Ativado" : "Desativado"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
