export type View =
  | "overview"
  | "appointments"
  | "services"
  | "staff"
  | "availability"
  | "business"
  | "account";

export type Status =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export type AppointmentSource = "WEB" | "WHATSAPP" | "PHONE" | "WALK_IN";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceInCents: number;
  active: boolean;
};

export type Staff = {
  id: string;
  displayName: string;
  roleTitle: string | null;
  bio: string | null;
  initials: string | null;
  accent: string | null;
  active: boolean;
  archivedAt: string | null;
  user: {
    email: string;
    memberships: { id: string }[];
  } | null;
  services: { serviceId: string }[];
};

export type Appointment = {
  id: string;
  status: Status;
  source: AppointmentSource;
  startAt: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  notes: string | null;
  service: Service;
  staff: Staff;
};

export type Business = {
  id: string;
  name: string;
  slug: string;
  category: string;
  address: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  scheduleText: string | null;
};

export type DashboardData = {
  metrics: {
    weekAppointments: number;
    activeServices: number;
    activeStaff: number;
    monthlyRevenueInCents: number;
  };
  business: Business;
  account: {
    user: { id: string; name: string; email: string };
    role: "OWNER" | "STAFF";
    staffId: string | null;
  };
  appointments: Appointment[];
  services: Service[];
  staff: Staff[];
  availability: Array<{
    id: string;
    weekday: number;
    startTime: string;
    endTime: string;
  }>;
};
