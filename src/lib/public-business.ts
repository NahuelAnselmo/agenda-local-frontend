import "server-only";
import {
  business as demoBusiness,
  professionals as demoProfessionals,
  services as demoServices,
  type Business,
  type Professional,
  type Service,
} from "@/data/demo-business";

type ApiBusiness = {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string | null;
  address: string | null;
  rating: number | null;
  reviewCount: number;
  phone: string | null;
  scheduleText: string | null;
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    priceInCents: number;
  }>;
  staff: Array<{
    id: string;
    displayName: string;
    roleTitle: string | null;
    initials: string | null;
    accent: string | null;
    serviceIds: string[];
  }>;
};

export type PublicBusinessData = {
  business: Business;
  services: Service[];
  professionals: Professional[];
};

const fallback: PublicBusinessData = {
  business: demoBusiness,
  services: demoServices,
  professionals: demoProfessionals,
};

export async function getPublicBusiness(): Promise<PublicBusinessData> {
  const baseUrl =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000/api/v1";

  try {
    const response = await fetch(baseUrl + "/businesses/norte-studio", {
      cache: "no-store",
    });
    if (!response.ok) return fallback;

    const payload = (await response.json()) as { data: ApiBusiness };
    const data = payload.data;
    return {
      business: {
        id: data.id,
        slug: data.slug,
        name: data.name,
        category: data.category,
        location: data.location ?? demoBusiness.location,
        address: data.address ?? demoBusiness.address,
        rating: data.rating ?? demoBusiness.rating,
        reviews: data.reviewCount,
        phone: data.phone ?? demoBusiness.phone,
        schedule: data.scheduleText ?? demoBusiness.schedule,
      },
      services: data.services.map((service) => ({
        id: service.id,
        name: service.name,
        description: service.description ?? "",
        durationMinutes: service.durationMinutes,
        price: service.priceInCents / 100,
      })),
      professionals: data.staff.map((member) => ({
        id: member.id,
        name: member.displayName,
        role: member.roleTitle ?? "Profesional",
        initials: member.initials ?? member.displayName.slice(0, 2).toUpperCase(),
        accent: member.accent ?? "sage",
        serviceIds: member.serviceIds,
      })),
    };
  } catch {
    return fallback;
  }
}
