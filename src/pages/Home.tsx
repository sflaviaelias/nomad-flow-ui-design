import React from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../components/HomeHeader";
import HomeQuickActions from "../components/HomeQuickActions";
import HomeActiveTripCard from "../components/HomeActiveTripCard";
import HomeDiscoverySection from "../components/HomeDiscoverySection";
import HomeExtraLinks from "../components/HomeExtraLinks";

const user = {
  name: "Flávia",
  avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
};

const activeTrip = {
  destination: "Barcelona, Espanha",
  imageUrl:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=945&q=80",
  startDate: "01/07/2024",
  endDate: "15/07/2024",
  budget: "€1200",
  localBudget: "R$ 6.850",
  visa: true,
  vaccines: false,
};

const discoveryData = [
  {
    title: "Mercados e Padarias",
    nearby: [
      { name: "Mercado Central", desc: "A 300m • 08h-19h", link: "#" },
      { name: "Padaria Monalisa", desc: "A 450m • 24h", link: "#" },
    ],
  },
  {
    title: "Cafés e Restaurantes",
    nearby: [
      { name: "Café Nómade", desc: "Wi-fi • 350m", link: "#" },
      { name: "Bistro do Porto", desc: "Cozinha local • 580m", link: "#" },
    ],
  },
  {
    title: "Co-workings por perto",
    nearby: [
      { name: "Work BCN", desc: "Sala priv. • 800m", link: "#" },
      { name: "SmartLab", desc: "Cowork 24h • 1.2km", link: "#" },
    ],
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#FAF3EC] min-h-screen font-sans">
      <HomeHeader user={user} />
      <main className="max-w-md mx-auto w-full pt-4 pb-14 px-3">
        <HomeQuickActions />
        <div className="my-5" />
        <HomeActiveTripCard trip={activeTrip} />
        <div className="my-5" />
        <HomeDiscoverySection discoveryData={discoveryData} />
        <div className="mt-7">
          <HomeExtraLinks />
        </div>
      </main>
    </div>
  );
}
