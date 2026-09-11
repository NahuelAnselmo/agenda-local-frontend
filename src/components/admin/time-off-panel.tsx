"use client";

import { type FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import type { Staff } from "./types";

type TimeOff = {
  id: string;
  reason: string | null;
  startAt: string;
  endAt: string;
  staffId: string | null;
  staff: Staff | null;
};

type TimeOffPanelProps = {
  role: "OWNER" | "STAFF";
  currentStaffId: string | null;
  staff: Staff[];
  onMessage: (message: string) => void;
};

function dateTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value));
}

export function TimeOffPanel({
  role,
  currentStaffId,
  staff,
  onMessage,
}: TimeOffPanelProps) {
  const [blocks, setBlocks] = useState<TimeOff[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  async function loadBlocks() {
    const response = (await apiRequest("/admin/time-off")) as { data: TimeOff[] };
    setBlocks(response.data);
    setState("ready");
  }

  useEffect(() => {
    let cancelled = false;
    void apiRequest("/admin/time-off")
      .then((response) => {
        if (cancelled) return;
        setBlocks((response as { data: TimeOff[] }).data);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function createBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await apiRequest("/admin/time-off", {
        method: "POST",
        body: JSON.stringify({
          staffId: formData.get("staffId") || null,
          reason: formData.get("reason"),
          startAt: new Date(String(formData.get("startAt"))).toISOString(),
          endAt: new Date(String(formData.get("endAt"))).toISOString(),
        }),
      });
      form.reset();
      onMessage("Bloqueo agregado a la agenda");
      await loadBlocks();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "No se pudo crear el bloqueo");
    }
  }

  async function removeBlock(id: string) {
    try {
      await apiRequest("/admin/time-off/" + id, { method: "DELETE" });
      onMessage("Bloqueo eliminado");
      await loadBlocks();
    } catch (error) {
      onMessage(error instanceof Error ? error.message : "No se pudo eliminar el bloqueo");
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-card-heading">
        <div>
          <p className="eyebrow">Disponibilidad real</p>
          <h2>Ausencias y bloqueos</h2>
        </div>
        <span className="count-pill">{blocks.length} próximos</span>
      </div>

      <form className="time-off-form" onSubmit={createBlock}>
        {role === "OWNER" && (
          <label>
            Agenda
            <select name="staffId" defaultValue="">
              <option value="">Todo el local</option>
              {staff.filter((member) => member.active && !member.archivedAt).map((member) => (
                <option value={member.id} key={member.id}>{member.displayName}</option>
              ))}
            </select>
          </label>
        )}
        <label>
          Desde
          <input name="startAt" type="datetime-local" required />
        </label>
        <label>
          Hasta
          <input name="endAt" type="datetime-local" required />
        </label>
        <label>
          Motivo <span className="optional-label">Opcional</span>
          <input name="reason" placeholder="Vacaciones, trámite, feriado…" />
        </label>
        <button className="button button-primary button-small" type="submit">
          Bloquear horario
        </button>
      </form>

      {state === "loading" && <p className="empty-state">Cargando bloqueos…</p>}
      {state === "error" && (
        <p className="empty-state" role="alert">No se pudieron cargar los bloqueos.</p>
      )}
      {state === "ready" && blocks.length === 0 && (
        <p className="empty-state">No hay ausencias o cierres próximos.</p>
      )}
      {state === "ready" && blocks.length > 0 && (
        <div className="time-off-list">
          {blocks.map((block) => {
            const canDelete = role === "OWNER" || block.staffId === currentStaffId;
            return (
              <article key={block.id}>
                <div>
                  <span>{block.staff?.displayName ?? "Todo el local"}</span>
                  <strong>{block.reason || "Sin motivo indicado"}</strong>
                </div>
                <p>{dateTime(block.startAt)} → {dateTime(block.endAt)}</p>
                {canDelete && (
                  <button type="button" onClick={() => void removeBlock(block.id)}>
                    Eliminar
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
