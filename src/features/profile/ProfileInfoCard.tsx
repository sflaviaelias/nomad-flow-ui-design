
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileInfoCard({ profile }: { profile: any }) {
  const preferences = profile.preferences || {};
  return (
    <Card className="bg-white rounded-xl shadow-soft border-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-terra-900 font-semibold text-base" style={{ fontFamily: "Inter" }}>
          Informações Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-4 pt-0">
        <dl className="grid grid-cols-2 gap-y-2 text-[15px] text-terra-800" style={{ fontFamily: "Inter", wordBreak: "break-word" }}>
          <dt className="font-medium leading-tight">Nome</dt>
          <dd className="font-normal text-terra-900">{profile.name}</dd>
          <dt className="font-medium leading-tight">E-mail</dt>
          <dd className="font-normal text-terra-900">{profile.email}</dd>
          <dt className="font-medium leading-tight">Nacionalidade</dt>
          <dd className="font-normal text-terra-900">{preferences?.nationality}</dd>
          <dt className="font-medium leading-tight">Residência</dt>
          <dd className="font-normal text-terra-900">{profile.country_residence}</dd>
          <dt className="font-medium leading-tight">Moeda</dt>
          <dd className="font-normal text-terra-900">{preferences?.currency}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
