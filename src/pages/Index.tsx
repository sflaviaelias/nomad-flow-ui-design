
import Navbar from "../components/Navbar";
import ActiveTripCard from "../components/ActiveTripCard";
import DiscoverySection from "../components/DiscoverySection";
import ConciergeCard from "../components/ConciergeCard";
import BudgetOverview from "../components/BudgetOverview";
import UpcomingTripsPreview from "../components/UpcomingTripsPreview";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-3 pb-10">
        {/* Greeting + quick overview */}
        <section className="mt-8 mb-6">
          <h1 className="text-3xl font-bold mb-1 text-neutral-900">Olá, João!</h1>
          <div className="text-neutral-600 text-base">Aqui está seu painel de viagens:</div>
        </section>
        <div className="mb-8">
          <ActiveTripCard
            destination="Barcelona, Espanha"
            imageUrl="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=945&q=80"
            startDate="01/07/2024"
            endDate="15/07/2024"
            budget="€1200"
            localBudget="US$ 1,300"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-8">
          <BudgetOverview />
          <ConciergeCard />
        </div>
        <DiscoverySection />
        <UpcomingTripsPreview />
      </main>
    </div>
  );
};

export default Index;
