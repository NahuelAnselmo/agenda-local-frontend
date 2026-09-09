export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  featured?: boolean;
};

export type Professional = {
  id: string;
  name: string;
  role: string;
  initials: string;
  accent: string;
  serviceIds: string[];
};

export type Business = {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  address: string;
  rating: number;
  reviews: number;
  phone: string;
  schedule: string;
};

export const business: Business = {
  id: "norte-studio",
  slug: "norte-studio",
  name: "Norte Studio",
  category: "Barbería & cuidado personal",
  location: "Palermo, Buenos Aires",
  address: "Honduras 4821",
  rating: 4.9,
  reviews: 128,
  phone: "+54 11 5555-0194",
  schedule: "Lun a sáb · 9:00 a 20:00",
};

export const services: Service[] = [
  {
    id: "classic-cut",
    name: "Corte clásico",
    description: "Asesoramiento, corte a tijera o máquina y styling final.",
    durationMinutes: 40,
    price: 12500,
    featured: true,
  },
  {
    id: "beard-design",
    name: "Diseño de barba",
    description: "Perfilado, toalla caliente y acabado con productos premium.",
    durationMinutes: 30,
    price: 9000,
  },
  {
    id: "full-service",
    name: "Corte + barba",
    description: "La experiencia completa para renovar tu estilo.",
    durationMinutes: 70,
    price: 19500,
    featured: true,
  },
  {
    id: "color-refresh",
    name: "Color refresh",
    description: "Cobertura sutil y tratamiento para un resultado natural.",
    durationMinutes: 55,
    price: 18000,
  },
];

export const professionals: Professional[] = [
  {
    id: "nico-ramos",
    name: "Nico Ramos",
    role: "Barbero senior",
    initials: "NR",
    accent: "terracotta",
    serviceIds: ["classic-cut", "beard-design", "full-service"],
  },
  {
    id: "cami-sosa",
    name: "Cami Sosa",
    role: "Stylist & colorist",
    initials: "CS",
    accent: "sage",
    serviceIds: ["classic-cut", "full-service", "color-refresh"],
  },
  {
    id: "fran-lopez",
    name: "Fran López",
    role: "Barbero",
    initials: "FL",
    accent: "sand",
    serviceIds: ["classic-cut", "beard-design", "full-service"],
  },
];

export const timeSlots = [
  "09:00",
  "09:45",
  "10:30",
  "11:15",
  "12:00",
  "14:00",
  "14:45",
  "15:30",
  "16:15",
  "17:00",
  "17:45",
  "18:30",
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}
