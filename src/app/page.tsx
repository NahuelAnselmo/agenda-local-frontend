import { BookingWidget } from "@/components/booking-widget";
import { formatPrice } from "@/data/demo-business";
import { getPublicBusiness } from "@/lib/public-business";

const benefits = [
  ["01", "Elegí tu servicio", "Precios y duración siempre claros."],
  ["02", "Encontrá tu horario", "Disponibilidad actualizada al instante."],
  ["03", "Confirmá en segundos", "Sin llamadas ni esperas innecesarias."],
];

export default async function Home() {
  const { business, services, professionals } = await getPublicBusiness();

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Norte Studio, inicio">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span><strong>Norte</strong><small>Studio</small></span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#servicios">Servicios</a>
          <a href="#equipo">Equipo</a>
          <a href="#ubicacion">Ubicación</a>
          <a href="/admin">Administración</a>
        </nav>
        <a className="button button-small button-dark" href="#reservar">
          Reservar turno
        </a>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">Barbería contemporánea · Palermo</p>
          <h1>Tu estilo.<br /><em>Tu momento.</em></h1>
          <p className="hero-lead">
            Cortes precisos, atención personalizada y una experiencia diseñada
            para que salgas sintiéndote mejor.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#reservar">Reservar ahora</a>
            <a className="text-link" href="#servicios">Ver servicios <span>↘</span></a>
          </div>
          <div className="trust-row">
            <div className="rating-avatars" aria-hidden="true">
              <span>NR</span><span>CS</span><span>FL</span>
            </div>
            <div>
              <strong><span aria-label="5 estrellas">★★★★★</span> {business.rating}</strong>
              <small>Más de {business.reviews} clientes nos recomiendan</small>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Interior de Norte Studio">
          <div className="visual-frame">
            <div className="barber-pole" aria-hidden="true"><span /></div>
            <div className="mirror" aria-hidden="true">
              <span className="mirror-glow" />
              <span className="chair"><i /><b /></span>
            </div>
            <div className="visual-caption">
              <span>Abierto hoy</span><strong>9:00 — 20:00</strong>
            </div>
          </div>
          <div className="floating-note">
            <span aria-hidden="true">✦</span>
            <div><small>Próximo turno</small><strong>Hoy, 15:30</strong></div>
          </div>
        </div>
      </section>

      <section className="benefit-strip" aria-label="Cómo reservar">
        {benefits.map(([number, title, copy]) => (
          <article key={number}>
            <span>{number}</span>
            <div><h2>{title}</h2><p>{copy}</p></div>
          </article>
        ))}
      </section>

      <section className="services-section" id="servicios">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Nuestros servicios</p>
            <h2>Todo lo que necesitás,<br /><em>bien hecho.</em></h2>
          </div>
          <p>
            Trabajamos con técnicas actuales y productos seleccionados para
            lograr resultados que se sienten propios.
          </p>
        </div>
        <div className="service-showcase">
          {services.map((service, index) => (
            <article key={service.id} className={service.featured ? "featured-service" : ""}>
              <span className="service-number">0{index + 1}</span>
              <div><h3>{service.name}</h3><p>{service.description}</p></div>
              <footer>
                <span>{service.durationMinutes} min</span>
                <strong>{formatPrice(service.price)}</strong>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="booking-section" id="reservar">
        <div className="booking-intro">
          <p className="eyebrow">Agenda simple</p>
          <h2>Tu próximo turno,<br /><em>a pocos clics.</em></h2>
          <p>
            Elegí el servicio, la persona y el horario que mejor se adapten a
            vos. La reserva se confirma en el momento.
          </p>
          <ul>
            <li><span>✓</span> Cancelación y reprogramación online</li>
            <li><span>✓</span> Recordatorio antes del turno</li>
            <li><span>✓</span> Tus datos siempre protegidos</li>
          </ul>
        </div>
        <BookingWidget
          businessData={business}
          serviceOptions={services}
          professionalOptions={professionals}
        />
      </section>

      <section className="location-section" id="ubicacion">
        <div className="location-card">
          <p className="eyebrow">Encontranos</p>
          <h2>{business.address}</h2>
          <p>{business.location}</p>
          <div><span>{business.schedule}</span><span>{business.phone}</span></div>
        </div>
        <div className="map-art" aria-label={"Mapa ilustrativo de " + business.location}>
          <span className="map-road road-one" />
          <span className="map-road road-two" />
          <span className="map-road road-three" />
          <span className="map-pin">N</span>
          <small>Palermo</small>
        </div>
      </section>

      <footer className="site-footer" id="equipo">
        <a className="brand footer-brand" href="#inicio">
          <span className="brand-mark">N</span>
          <span><strong>Norte</strong><small>Studio</small></span>
        </a>
        <p>Una experiencia de cuidado personal hecha a tu medida.</p>
        <div>
          <a href="#servicios">Servicios</a>
          <a href="#reservar">Reservas</a>
          <a href="mailto:hola@nortestudio.demo">Contacto</a>
        </div>
        <small>© {new Date().getFullYear()} Norte Studio · Demo de producto</small>
      </footer>
    </main>
  );
}
