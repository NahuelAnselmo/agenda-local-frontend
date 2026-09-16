"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="public-error-page">
      <section>
        <span aria-hidden="true">!</span>
        <p className="eyebrow">Servicio temporalmente no disponible</p>
        <h1>No pudimos cargar la agenda</h1>
        <p>
          Tus datos no se reemplazaron por información de ejemplo. Esperá unos
          segundos y volvé a intentar.
        </p>
        <button className="button button-primary" type="button" onClick={reset}>
          Reintentar
        </button>
      </section>
    </main>
  );
}
