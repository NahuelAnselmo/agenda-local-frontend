"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  business,
  formatPrice,
  professionals,
  services,
  timeSlots,
  type Professional,
  type Service,
} from "@/data/demo-business";

type Step = "service" | "professional" | "schedule" | "details";
type Status = "idle" | "submitting" | "success" | "error";

type DayOption = {
  value: string;
  weekday: string;
  day: string;
  month: string;
};

const steps: { id: Step; label: string }[] = [
  { id: "service", label: "Servicio" },
  { id: "professional", label: "Profesional" },
  { id: "schedule", label: "Horario" },
  { id: "details", label: "Tus datos" },
];

const stepOrder = steps.map((step) => step.id);

function createDays(): DayOption[] {
  const formatter = new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  });

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + index + 1);
    const parts = formatter.formatToParts(date);
    const getPart = (type: "weekday" | "day" | "month") =>
      parts.find((part) => part.type === type)?.value.replace(".", "") ?? "";

    return {
      value: date.toISOString().slice(0, 10),
      weekday: getPart("weekday"),
      day: getPart("day"),
      month: getPart("month"),
    };
  });
}

export function BookingWidget() {
  const days = useMemo(() => createDays(), []);
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service>(services[0]);
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);
  const [selectedDay, setSelectedDay] = useState(days[1]);
  const [selectedTime, setSelectedTime] = useState("10:30");
  const [status, setStatus] = useState<Status>("idle");

  const currentStep = stepOrder.indexOf(step);
  const availableProfessionals = professionals.filter((professional) =>
    professional.serviceIds.includes(selectedService.id),
  );

  function chooseService(service: Service) {
    setSelectedService(service);
    setSelectedProfessional(null);
    setStep("professional");
  }

  function chooseProfessional(professional: Professional | null) {
    setSelectedProfessional(professional);
    setStep("schedule");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

    try {
      const response = await fetch(
        apiUrl + "/businesses/" + business.slug + "/appointments",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: selectedService.id,
            staffId: selectedProfessional?.id ?? null,
            date: selectedDay.value,
            time: selectedTime,
            customer: {
              name: formData.get("name"),
              email: formData.get("email"),
              phone: formData.get("phone"),
            },
          }),
        },
      );

      if (!response.ok) throw new Error("No se pudo crear la reserva");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section className="booking-card success-card" aria-live="polite">
        <div className="success-icon" aria-hidden="true">
          ✓
        </div>
        <p className="eyebrow">Reserva confirmada</p>
        <h2>¡Nos vemos pronto!</h2>
        <p className="success-copy">
          Te enviamos los detalles de tu turno por email. También podés
          reprogramarlo desde el enlace de confirmación.
        </p>
        <div className="confirmation-summary">
          <span>{selectedService.name}</span>
          <strong>
            {selectedDay.weekday} {selectedDay.day} {selectedDay.month} ·{" "}
            {selectedTime}
          </strong>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => {
            setStatus("idle");
            setStep("service");
          }}
        >
          Hacer otra reserva
        </button>
      </section>
    );
  }

  return (
    <section className="booking-card" aria-labelledby="booking-title">
      <div className="booking-heading">
        <div>
          <p className="eyebrow">Reserva online</p>
          <h2 id="booking-title">Elegí tu próximo turno</h2>
        </div>
        <span className="secure-label">Confirmación inmediata</span>
      </div>

      <ol className="stepper" aria-label="Progreso de la reserva">
        {steps.map((item, index) => (
          <li
            key={item.id}
            className={index <= currentStep ? "step-active" : ""}
            aria-current={item.id === step ? "step" : undefined}
          >
            <span>{index + 1}</span>
            <small>{item.label}</small>
          </li>
        ))}
      </ol>

      {step === "service" && (
        <div className="booking-panel">
          <div className="panel-title">
            <h3>¿Qué servicio buscás?</h3>
            <p>El precio y la duración se muestran antes de reservar.</p>
          </div>
          <div className="service-list">
            {services.map((service) => (
              <button
                className="service-option"
                key={service.id}
                type="button"
                onClick={() => chooseService(service)}
              >
                <span className="service-copy">
                  <strong>{service.name}</strong>
                  <small>{service.description}</small>
                  <span>{service.durationMinutes} min</span>
                </span>
                <b>{formatPrice(service.price)}</b>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "professional" && (
        <div className="booking-panel">
          <div className="panel-title">
            <button
              className="back-button"
              type="button"
              onClick={() => setStep("service")}
            >
              ← Volver
            </button>
            <h3>Elegí quién te atiende</h3>
            <p>Podés seleccionar un profesional o tomar el primer disponible.</p>
          </div>
          <div className="professional-grid">
            <button
              className="professional-option any-professional"
              type="button"
              onClick={() => chooseProfessional(null)}
            >
              <span className="avatar avatar-any" aria-hidden="true">
                +
              </span>
              <strong>Primer disponible</strong>
              <small>Más opciones de horario</small>
            </button>
            {availableProfessionals.map((professional) => (
              <button
                className="professional-option"
                type="button"
                key={professional.id}
                onClick={() => chooseProfessional(professional)}
              >
                <span className={"avatar avatar-" + professional.accent}>
                  {professional.initials}
                </span>
                <strong>{professional.name}</strong>
                <small>{professional.role}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "schedule" && (
        <div className="booking-panel">
          <div className="panel-title">
            <button
              className="back-button"
              type="button"
              onClick={() => setStep("professional")}
            >
              ← Volver
            </button>
            <h3>Elegí día y horario</h3>
            <p>Horarios disponibles para {selectedService.name.toLowerCase()}.</p>
          </div>
          <div className="day-picker" aria-label="Días disponibles">
            {days.map((day) => (
              <button
                key={day.value}
                type="button"
                className={day.value === selectedDay.value ? "selected" : ""}
                onClick={() => setSelectedDay(day)}
                aria-pressed={day.value === selectedDay.value}
              >
                <small>{day.weekday}</small>
                <strong>{day.day}</strong>
                <span>{day.month}</span>
              </button>
            ))}
          </div>
          <div className="time-grid" aria-label="Horarios disponibles">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                className={time === selectedTime ? "selected" : ""}
                onClick={() => setSelectedTime(time)}
                aria-pressed={time === selectedTime}
              >
                {time}
              </button>
            ))}
          </div>
          <button
            className="button button-primary full-width"
            type="button"
            onClick={() => setStep("details")}
          >
            Continuar con este horario
          </button>
        </div>
      )}

      {step === "details" && (
        <div className="booking-panel details-layout">
          <div>
            <div className="panel-title">
              <button
                className="back-button"
                type="button"
                onClick={() => setStep("schedule")}
              >
                ← Volver
              </button>
              <h3>Completá tus datos</h3>
              <p>Los usaremos únicamente para gestionar tu turno.</p>
            </div>
            <form className="booking-form" onSubmit={submitBooking}>
              <label>
                Nombre y apellido
                <input name="name" autoComplete="name" required />
              </label>
              <label>
                Email
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <label>
                Teléfono
                <input name="phone" type="tel" autoComplete="tel" required />
              </label>
              <label className="consent-label">
                <input name="consent" type="checkbox" required />
                <span>Acepto recibir la confirmación y avisos sobre este turno.</span>
              </label>
              <button
                className="button button-primary full-width"
                type="submit"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? "Confirmando…" : "Confirmar reserva"}
              </button>
              {status === "error" && (
                <p className="form-error" role="alert">
                  No pudimos conectar con el servidor. Verificá que el backend esté
                  activo e intentá nuevamente.
                </p>
              )}
            </form>
          </div>
          <aside className="booking-summary" aria-label="Resumen de la reserva">
            <p className="eyebrow">Tu reserva</p>
            <h4>{selectedService.name}</h4>
            <dl>
              <div>
                <dt>Profesional</dt>
                <dd>{selectedProfessional?.name ?? "Primer disponible"}</dd>
              </div>
              <div>
                <dt>Fecha</dt>
                <dd>
                  {selectedDay.weekday} {selectedDay.day} {selectedDay.month}
                </dd>
              </div>
              <div>
                <dt>Horario</dt>
                <dd>{selectedTime}</dd>
              </div>
              <div>
                <dt>Duración</dt>
                <dd>{selectedService.durationMinutes} min</dd>
              </div>
            </dl>
            <div className="summary-total">
              <span>Total</span>
              <strong>{formatPrice(selectedService.price)}</strong>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
