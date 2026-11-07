
import React from "react";
import PageHeader from "@/components/PageHeader";
import TripForm from "@/components/TripForm";

const NewTripPage = () => (
  <div className="min-h-screen bg-[#FAF3EC] flex flex-col">
    <PageHeader title="Programar Nova Viagem" showBack />
    <main className="flex-1 w-full max-w-xl mx-auto pt-2 pb-6 px-2 md:px-0">
      <TripForm />
    </main>
  </div>
);

export default NewTripPage;
