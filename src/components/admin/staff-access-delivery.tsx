"use client";

type StaffAccessDetails = {
  staffName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
  emailDelivery: "sent" | "not_configured" | "failed";
};

export function StaffAccessDelivery({
  details,
  onClose,
  onMessage,
}: {
  details: StaffAccessDetails;
  onClose: () => void;
  onMessage: (message: string) => void;
}) {
  const message = [
    `Hola ${details.staffName}, ya tenés acceso a la agenda.`,
    `Ingresá en: ${details.loginUrl}`,
    `Usuario: ${details.email}`,
    `Contraseña temporal: ${details.temporaryPassword}`,
    "Al ingresar podés cambiar tus credenciales desde Mi cuenta.",
  ].join("\n");
  const emailUrl = `mailto:${encodeURIComponent(details.email)}?subject=${encodeURIComponent(
    "Acceso a la agenda",
  )}&body=${encodeURIComponent(message)}`;
  const deliveryMessage = {
    sent: "El email con las credenciales fue enviado automáticamente.",
    not_configured:
      "El acceso fue creado, pero Resend todavía no está configurado. Compartí estos datos manualmente.",
    failed:
      "El acceso fue creado, pero el proveedor rechazó el email. Podés reenviarlo manualmente.",
  }[details.emailDelivery];

  async function copyDetails() {
    try {
      await navigator.clipboard.writeText(message);
      onMessage("Datos de acceso copiados");
    } catch {
      onMessage("No se pudieron copiar los datos automáticamente");
    }
  }

  return (
    <section className="access-delivery" aria-labelledby="access-delivery-title">
      <div>
        <p className="eyebrow">Acceso creado</p>
        <h3 id="access-delivery-title">Compartí estos datos con {details.staffName}</h3>
        <p className={details.emailDelivery === "sent" ? "delivery-success" : ""}>
          {deliveryMessage}
        </p>
      </div>
      <dl>
        <div><dt>Página de ingreso</dt><dd><a href={details.loginUrl}>{details.loginUrl}</a></dd></div>
        <div><dt>Email</dt><dd>{details.email}</dd></div>
        <div><dt>Contraseña temporal</dt><dd><code>{details.temporaryPassword}</code></dd></div>
      </dl>
      <div className="access-delivery-actions">
        <button className="outline-action" type="button" onClick={() => void copyDetails()}>
          Copiar datos
        </button>
        <a className="button button-primary button-small" href={emailUrl}>
          Preparar email
        </a>
        <button className="text-action" type="button" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </section>
  );
}

export type { StaffAccessDetails };
