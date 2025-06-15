
export type PlaceMock = {
  id: string;
  name: string;
  category: "cafe" | "coworking" | "market" | "news";
  address: string;
  image?: string;
  rating: number;
  reviewsCount: number;
  businessHours: [string, string][];
  reviews: { name: string; rating: number; comment: string; timestamp: string }[];
};

export const PLACES_MOCK: PlaceMock[] = [
  {
    id: "cafe-nomade",
    name: "Café Nômade",
    category: "cafe",
    address: "Rua das Andorinhas, 123, Vila Madalena, São Paulo - SP",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewsCount: 21,
    businessHours: [
      ["Segunda-feira", "08:00 – 20:00"],
      ["Terça-feira", "08:00 – 20:00"],
      ["Quarta-feira", "08:00 – 20:00"],
      ["Quinta-feira", "08:00 – 21:00"],
      ["Sexta-feira", "08:00 – 21:00"],
      ["Sábado", "09:00 – 18:00"],
      ["Domingo", "Fechado"],
    ],
    reviews: [
      {
        name: "Flávia L.",
        rating: 5,
        comment: "Ambiente acolhedor e ótimo café. Voltarei mais vezes!",
        timestamp: "há 2 dias",
      },
      {
        name: "Rafael S.",
        rating: 4,
        comment: "Wi-fi rápido e boas opções de lanches.",
        timestamp: "há 1 semana",
      },
      {
        name: "Letícia M.",
        rating: 5,
        comment: "Perfeito para trabalhar, tomadas em todas as mesas.",
        timestamp: "há 1 mês",
      },
    ],
  },
  {
    id: "mercado-central",
    name: "Mercado Central",
    category: "market",
    address: "Av. Principal, 1000, Centro, São Paulo - SP",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    reviewsCount: 14,
    businessHours: [
      ["Segunda a Sábado", "08:00 – 19:00"],
      ["Domingo", "08:00 – 14:00"],
    ],
    reviews: [
      {
        name: "Juliana P.",
        rating: 5,
        comment: "Frutas frescas e ótimos preços.",
        timestamp: "há 5 dias",
      },
      {
        name: "Carlos T.",
        rating: 4,
        comment: "Atendimento cordial e muita variedade.",
        timestamp: "há 2 semanas",
      },
    ],
  },
  {
    id: "work-bcn",
    name: "Work BCN",
    category: "coworking",
    address: "Carrer de Mallorca, 200, Barcelona, Espanha",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewsCount: 9,
    businessHours: [
      ["Segunda a Sexta-feira", "08:00 – 22:00"],
      ["Sábado", "09:00 – 16:00"],
      ["Domingo", "Fechado"],
    ],
    reviews: [
      {
        name: "Marcelo S.",
        rating: 5,
        comment: "Ótimo espaço, staff prestativo e ambiente silencioso.",
        timestamp: "há 3 dias",
      },
      {
        name: "Raquel A.",
        rating: 4,
        comment: "Wifi super rápido para calls.",
        timestamp: "há 1 semana",
      },
    ],
  },
  {
    id: "padaria-monalisa",
    name: "Padaria Monalisa",
    category: "market",
    address: "Rua Bela Vista, 432, São Paulo - SP",
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviewsCount: 17,
    businessHours: [
      ["Todos os dias", "24 horas"],
    ],
    reviews: [
      {
        name: "Vitor L.",
        rating: 5,
        comment: "Melhor pão de queijo! Atendimento rápido.",
        timestamp: "há 2 dias",
      },
    ],
  },
  {
    id: "bistro-do-porto",
    name: "Bistro do Porto",
    category: "cafe",
    address: "Praça das Artes, 87, Porto, Portugal",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    rating: 4.4,
    reviewsCount: 7,
    businessHours: [
      ["Seg a Sáb", "12:00 – 23:00"],
      ["Domingo", "Fechado"],
    ],
    reviews: [
      {
        name: "Amanda Q.",
        rating: 4,
        comment: "Comida deliciosa e serviço atencioso.",
        timestamp: "há 4 dias",
      },
    ],
  },
  {
    id: "smartlab",
    name: "SmartLab",
    category: "coworking",
    address: "R. Rio Verde, 320, Goiânia - GO",
    image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewsCount: 5,
    businessHours: [
      ["Todos os dias", "24 horas"],
    ],
    reviews: [
      {
        name: "Julio Neto",
        rating: 5,
        comment: "Estrutura top! Cowork 24h funcional.",
        timestamp: "há 1 semana",
      },
    ],
  },
];
