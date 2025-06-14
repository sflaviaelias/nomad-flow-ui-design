
import React from "react";
import PageHeader from "@/components/PageHeader";

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <PageHeader title="Comunidade Inteligente" showBack />
      <main>
        <div className="p-4 text-neutral-700">
          <div className="text-center text-lg font-medium">Sugestões de outros nômades e grupos temporários.</div>
        </div>
      </main>
    </div>
  );
};

export default CommunityPage;
