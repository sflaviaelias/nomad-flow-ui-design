
import React from "react";
import Navbar from "../components/Navbar";
import ConciergeChat from "../components/ConciergeChat";

const ConciergePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto">
        <ConciergeChat />
      </main>
    </div>
  );
};

export default ConciergePage;
