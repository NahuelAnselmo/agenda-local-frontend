import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CancelBookingButton } from "@/components/cancel-booking-button";

export const metadata: Metadata = {
  title: "Tu reserva",
  robots: { index: false, follow: false },
};

type AppointmentDetails = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  startAt: string;
  endAt: string;
  customerName: string;
  organization: { name: string; address: string | null; location: string | null };
  service: { name: string; durationMinutes: number; priceInCents: number };
  staff: { displayName: string };
};

export default async function BookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const baseUrl =
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000/api/v1";
  const response = await fetch(baseUrl + "/appointments/" + token, {
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) notFound();

  const payload = (await response.json()) as { data: AppointmentDetails };
  const appointment = payload.data;
  const date = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(appointment.startAt));
  const price = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(appointment.service.priceInCents / 100);

  return (
    <main className="booking-detail-page">
      <Link className="brand" href="/">
        <span className="brand-mark">N</span>
        <span><strong>Norte</strong><small>Studio</small></span>
      </Link>
      <section className="booking-detail-card">
        <div className="booking-detail-intro">
          <span className="success-icon" aria-hidden="true">
            {appointment.status === "CANCELLED" ? "×" : "✓"}
          </span>
          <p className="eyebrow">
            {appointment.status === "CANCELLED"
              ? "Reserva cancelada"
              : "Reserva confirmada"}
          </p>
          <h1>Hola, {appointment.customerName.split(" ")[0]}</h1>
          <p>
            {appointment.status === "CANCELLED"
              ? "Este turno ya fue cancelado."
              : "Estos son los detalles de tu próximo turno."}
          </p>
        </div>
        <dl className="booking-detail-list">
          <div><dt>Servicio</dt><dd>{appointment.service.name}</dd></div>
          <div><dt>Fecha y hora</dt><dd>{date}</dd></div>
          <div><dt>Profesional</dt><dd>{appointment.staff.displayName}</dd></div>
          <div><dt>Duración</dt><dd>{appointment.service.durationMinutes} min</dd></div>
          <div><dt>Precio</dt><dd>{price}</dd></div>
          <div>
            <dt>Ubicación</dt>
            <dd>{appointment.organization.address}, {appointment.organization.location}</dd>
          </div>
        </dl>
        {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
          <CancelBookingButton token={token} />
        )}
        <Link className="text-link booking-home-link" href="/">
          ← Volver al sitio
        </Link>
      </section>
    </main>
  );
}
