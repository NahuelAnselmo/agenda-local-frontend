"use client";

import { useState } from "react";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function CancelBookingButton({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  async function cancelBooking() {
    if (!window.confirm("¿Querés cancelar este turno?")) return;
    setStatus("loading");

    try {
      const response = await fetch(
        apiUrl + "/appointments/" + token + "/cancel",
        { method: "PATCH" },
      );
      if (!response.ok) throw new Error();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="cancel-success" role="status">
        El turno fue cancelado correctamente.
      </p>
    );
  }

  return (
    <div className="cancel-booking">
      <button
        type="button"
        onClick={cancelBooking}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Cancelando…" : "Cancelar este turno"}
      </button>
      {status === "error" && (
        <p role="alert">No pudimos cancelar el turno. Intentá nuevamente.</p>
      )}
    </div>
  );
}
