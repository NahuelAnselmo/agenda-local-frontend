"use client";

type StaffAccessDetails = {
  staffName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
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
        <p>
          Por ahora el sistema prepara el mensaje, pero no envía emails automáticamente.
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
