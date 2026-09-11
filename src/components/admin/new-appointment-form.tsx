"use client";

import { type FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import type { Service, Staff } from "./types";

type NewAppointmentFormProps = {
  businessSlug: string;
  services: Service[];
  staff: Staff[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancel: () => void;
};

function todayInArgentina() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function NewAppointmentForm({
  businessSlug,
  services,
  staff,
  onSubmit,
  onCancel,
}: NewAppointmentFormProps) {
  const activeServices = services.filter((service) => service.active);
  const [serviceId, setServiceId] = useState(activeServices[0]?.id ?? "");
  const eligibleStaff = staff.filter(
    (member) =>
      member.active &&
      !member.archivedAt &&
      member.services.some((service) => service.serviceId === serviceId),
  );
  const [staffId, setStaffId] = useState(eligibleStaff[0]?.id ?? "");
  const [date, setDate] = useState(todayInArgentina);
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [availabilityState, setAvailabilityState] = useState<
    "loading" | "ready" | "error"
  >("loading");

  useEffect(() => {
    if (!serviceId || !staffId || !date) return;

    let cancelled = false;
    const query = new URLSearchParams({ serviceId, staffId, date });
    void apiRequest(`/businesses/${businessSlug}/availability?${query}`)
      .then((response) => {
        if (cancelled) return;
        const nextSlots = (response as { data: { slots: string[] } }).data.slots;
        setSlots(nextSlots);
        setTime((current) => (nextSlots.includes(current) ? current : ""));
        setAvailabilityState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setSlots([]);
        setTime("");
        setAvailabilityState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [businessSlug, date, serviceId, staffId]);

  return (
    <section className="new-appointment-panel" aria-labelledby="new-appointment-title">
      <div>
        <p className="eyebrow">Carga manual</p>
        <h3 id="new-appointment-title">Agregar turno a la agenda</h3>
        <p>Registrá reservas recibidas por WhatsApp, teléfono o en el local.</p>
      </div>
      <form onSubmit={onSubmit}>
        <label>
          Canal de ingreso
          <select name="source" defaultValue="WHATSAPP">
            <option value="WHATSAPP">WhatsApp</option>
            <option value="PHONE">Teléfono</option>
            <option value="WALK_IN">En el local</option>
          </select>
        </label>
        <label>
          Nombre del cliente
          <input name="customerName" autoComplete="name" required />
        </label>
        <label>
          Teléfono
          <input name="customerPhone" type="tel" autoComplete="tel" required />
        </label>
        <label>
          Email <span className="optional-label">Opcional</span>
          <input name="customerEmail" type="email" autoComplete="email" />
        </label>
        <label>
          Servicio
          <select
            name="serviceId"
            value={serviceId}
            onChange={(event) => {
              const nextServiceId = event.target.value;
              const nextStaff = staff.find(
                (member) =>
                  member.active &&
                  !member.archivedAt &&
                  member.services.some(
                    (service) => service.serviceId === nextServiceId,
                  ),
              );
              setServiceId(nextServiceId);
              setStaffId(nextStaff?.id ?? "");
              setTime("");
              setAvailabilityState("loading");
            }}
            required
          >
            {activeServices.map((service) => (
              <option value={service.id} key={service.id}>{service.name}</option>
            ))}
          </select>
        </label>
        <label>
          Profesional
          <select
            name="staffId"
            value={staffId}
            onChange={(event) => {
              setStaffId(event.target.value);
              setTime("");
              setAvailabilityState("loading");
            }}
            required
          >
            {eligibleStaff.map((member) => (
              <option value={member.id} key={member.id}>{member.displayName}</option>
            ))}
          </select>
        </label>
        <label>
          Fecha
          <input
            name="date"
            type="date"
            min={todayInArgentina()}
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setTime("");
              setAvailabilityState("loading");
            }}
            required
          />
        </label>
        <label>
          Horario disponible
          <select
            name="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            disabled={availabilityState === "loading" || slots.length === 0}
            required
          >
            <option value="">
              {availabilityState === "loading"
                ? "Consultando horarios…"
                : slots.length === 0
                  ? "Sin horarios disponibles"
                  : "Elegir horario"}
            </option>
            {slots.map((slot) => (
              <option value={slot} key={slot}>{slot}</option>
            ))}
          </select>
        </label>
        <label className="manual-notes">
          Notas <span className="optional-label">Opcional</span>
          <textarea
            name="notes"
            rows={3}
            placeholder="Preferencias o información útil para atender al cliente"
          />
        </label>
        <p className="availability-feedback" aria-live="polite">
          {availabilityState === "error"
            ? "No se pudieron consultar los horarios. Intentá nuevamente."
            : availabilityState === "ready" && slots.length === 0
              ? "No quedan turnos para esa combinación."
              : ""}
        </p>
        <div className="new-appointment-actions">
          <button className="outline-action" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="button button-primary button-small"
            type="submit"
            disabled={!time || !staffId}
          >
            Guardar turno
          </button>
        </div>
      </form>
    </section>
  );
}
