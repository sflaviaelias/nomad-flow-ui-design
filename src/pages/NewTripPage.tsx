
import React from "react";
import TripCreationWizard from "../components/TripCreationWizard";
import Navbar from "../components/Navbar";

const NewTripPage = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 w-full max-w-xl mx-auto pt-2 pb-6 px-2 md:px-0">
      <TripCreationWizard />
    </main>
  </div>
);

export default NewTripPage;
