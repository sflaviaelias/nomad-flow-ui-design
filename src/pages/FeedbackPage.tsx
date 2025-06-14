
import React from "react";
import PageHeader from "@/components/PageHeader";

const FeedbackPage = () => {
  return (
    <div className="min-h-screen bg-[#FAF3EC]">
      <PageHeader title="Feedback de Local" showBack />
      <main>
        <div className="p-4 text-neutral-700">
          <div className="text-center text-lg font-medium">Em breve: feedback rápido após visitar um local.</div>
        </div>
      </main>
    </div>
  );
};

export default FeedbackPage;
