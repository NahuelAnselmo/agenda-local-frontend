"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type View =
  | "overview"
  | "appointments"
  | "services"
  | "staff"
  | "availability"
  | "business";
type Status = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  priceInCents: number;
  active: boolean;
};

type Staff = {
  id: string;
  displayName: string;
  roleTitle: string | null;
  bio: string | null;
  initials: string | null;
  accent: string | null;
  active: boolean;
  services: { serviceId: string }[];
};

type Appointment = {
  id: string;
  status: Status;
  startAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: Service;
  staff: Staff;
};

type Business = {
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

type DashboardData = {
  metrics: {
    weekAppointments: number;
    activeServices: number;
    activeStaff: number;
    monthlyRevenueInCents: number;
  };
  business: Business;
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

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "overview", label: "Resumen", icon: "⌂" },
  { id: "appointments", label: "Agenda", icon: "□" },
  { id: "services", label: "Servicios", icon: "✦" },
  { id: "staff", label: "Equipo", icon: "◎" },
  { id: "availability", label: "Horarios", icon: "◷" },
  { id: "business", label: "Negocio", icon: "◇" },
];

const weekdays = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

const statusLabels: Record<Status, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
  NO_SHOW: "No asistió",
};

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function appointmentDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value));
}

async function apiRequest(path: string, options?: RequestInit) {
  const response = await fetch(apiUrl + path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "No se pudo completar la operación");
  }

  if (response.status === 204) return null;
  return response.json();
}

export function AdminDashboard() {
  const [view, setView] = useState<View>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [authState, setAuthState] = useState<"loading" | "guest" | "authenticated">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [showNewService, setShowNewService] = useState(false);
  const [showNewStaff, setShowNewStaff] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [agendaAppointments, setAgendaAppointments] = useState<Appointment[] | null>(
    null,
  );

  async function loadDashboard() {
    try {
      const response = (await apiRequest("/admin/dashboard")) as {
        data: DashboardData;
      };
      setData(response.data);
      setAuthState("authenticated");
    } catch {
      setAuthState("guest");
    }
  }

  useEffect(() => {
    let cancelled = false;

    void apiRequest("/admin/dashboard")
      .then((response) => {
        if (cancelled) return;
        setData((response as { data: DashboardData }).data);
        setAuthState("authenticated");
      })
      .catch(() => {
        if (!cancelled) setAuthState("guest");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);

    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo ingresar");
    }
  }

  async function logout() {
    await apiRequest("/auth/logout", { method: "POST" });
    setData(null);
    setAuthState("guest");
  }

  async function updateAppointment(id: string, status: Status) {
    await apiRequest("/admin/appointments/" + id, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setMessage("Turno actualizado");
    await loadDashboard();
    if (view === "appointments") await loadAppointments();
  }

  async function loadAppointments(filters?: {
    q?: string;
    status?: string;
    staffId?: string;
  }) {
    const query = new URLSearchParams();
    if (filters?.q) query.set("q", filters.q);
    if (filters?.status) query.set("status", filters.status);
    if (filters?.staffId) query.set("staffId", filters.staffId);
    const suffix = query.size > 0 ? "?" + query.toString() : "";
    const response = (await apiRequest("/admin/appointments" + suffix)) as {
      data: Appointment[];
    };
    setAgendaAppointments(response.data);
  }

  async function filterAppointments(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await loadAppointments({
        q: String(formData.get("q") ?? "").trim(),
        status: String(formData.get("status") ?? ""),
        staffId: String(formData.get("staffId") ?? ""),
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "No se pudo filtrar la agenda",
      );
    }
  }

  function changeView(nextView: View) {
    setView(nextView);
    if (nextView === "appointments") {
      void loadAppointments().catch((error: unknown) => {
        setMessage(
          error instanceof Error ? error.message : "No se pudo cargar la agenda",
        );
      });
    }
  }

  async function toggleService(service: Service) {
    await apiRequest("/admin/services/" + service.id, {
      method: "PATCH",
      body: JSON.stringify({ active: !service.active }),
    });
    setMessage(service.active ? "Servicio pausado" : "Servicio activado");
    await loadDashboard();
  }

  async function updateService(
    event: FormEvent<HTMLFormElement>,
    service: Service,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await apiRequest("/admin/services/" + service.id, {
      method: "PATCH",
      body: JSON.stringify({
        durationMinutes: Number(formData.get("durationMinutes")),
        priceInCents: Number(formData.get("price")) * 100,
      }),
    });
    setMessage("Precio y duración actualizados");
    await loadDashboard();
  }

  async function createService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    await apiRequest("/admin/services", {
      method: "POST",
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
        durationMinutes: Number(formData.get("durationMinutes")),
        priceInCents: Number(formData.get("price")) * 100,
      }),
    });
    form.reset();
    setShowNewService(false);
    setMessage("Servicio creado correctamente");
    await loadDashboard();
  }

  async function toggleStaff(member: Staff) {
    await apiRequest("/admin/staff/" + member.id, {
      method: "PATCH",
      body: JSON.stringify({ active: !member.active }),
    });
    setMessage(member.active ? "Profesional pausado" : "Profesional activado");
    await loadDashboard();
  }

  async function createStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    await apiRequest("/admin/staff", {
      method: "POST",
      body: JSON.stringify({
        displayName: formData.get("displayName"),
        roleTitle: formData.get("roleTitle"),
        bio: formData.get("bio"),
        serviceIds: formData.getAll("serviceIds").map(String),
      }),
    });
    form.reset();
    setShowNewStaff(false);
    setMessage("Profesional agregado correctamente");
    await loadDashboard();
  }

  async function updateStaff(
    event: FormEvent<HTMLFormElement>,
    member: Staff,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await apiRequest("/admin/staff/" + member.id, {
      method: "PATCH",
      body: JSON.stringify({
        displayName: formData.get("displayName"),
        roleTitle: formData.get("roleTitle"),
        bio: formData.get("bio"),
        serviceIds: formData.getAll("serviceIds").map(String),
      }),
    });
    setEditingStaffId(null);
    setMessage("Datos del profesional actualizados");
    await loadDashboard();
  }

  async function updateAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const intervals = weekdays
      .filter((day) => formData.get("enabled-" + day.value) === "on")
      .map((day) => ({
        weekday: day.value,
        startTime: String(formData.get("start-" + day.value)),
        endTime: String(formData.get("end-" + day.value)),
      }));

    await apiRequest("/admin/availability", {
      method: "PUT",
      body: JSON.stringify({ intervals }),
    });
    setMessage("Horarios de atención actualizados");
    await loadDashboard();
  }

  async function updateBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await apiRequest("/admin/business", {
      method: "PATCH",
      body: JSON.stringify({
        name: formData.get("name"),
        category: formData.get("category"),
        address: formData.get("address"),
        location: formData.get("location"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        scheduleText: formData.get("scheduleText"),
      }),
    });
    setMessage("Información pública actualizada");
    await loadDashboard();
  }

  if (authState === "loading") {
    return (
      <main className="admin-loading">
        <span className="admin-loader" />
        <p>Cargando tu espacio de trabajo…</p>
      </main>
    );
  }

  if (authState === "guest") {
    return (
      <main className="login-page">
        <Link className="brand admin-brand" href="/">
          <span className="brand-mark">N</span>
          <span><strong>Norte</strong><small>Gestión</small></span>
        </Link>
        <section className="login-card">
          <div className="login-art" aria-hidden="true">
            <span>Agenda</span>
            <strong>Todo tu negocio,<br />en un solo lugar.</strong>
            <i>✦</i>
          </div>
          <form onSubmit={login}>
            <p className="eyebrow">Panel administrativo</p>
            <h1>Bienvenido de nuevo</h1>
            <p>Ingresá para administrar turnos, servicios y profesionales.</p>
            <label>
              Email
              <input
                name="email"
                type="email"
                defaultValue="admin@nortestudio.demo"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Contraseña
              <input
                name="password"
                type="password"
                defaultValue="Demo1234!"
                autoComplete="current-password"
                required
              />
            </label>
            <button className="button button-primary full-width" type="submit">
              Ingresar al panel
            </button>
            {message && <p className="form-error" role="alert">{message}</p>}
            <small className="demo-hint">
              Las credenciales demo ya están cargadas para facilitar la revisión.
            </small>
          </form>
        </section>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="brand admin-brand" href="/">
          <span className="brand-mark">N</span>
          <span><strong>Norte</strong><small>Gestión</small></span>
        </Link>
        <nav aria-label="Secciones de administración">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => changeView(item.id)}
              type="button"
            >
              <span aria-hidden="true">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <a href="/" target="_blank">↗ Ver sitio público</a>
          <button type="button" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="eyebrow">{data.business.name}</p>
            <h1>{navItems.find((item) => item.id === view)?.label}</h1>
          </div>
          <div className="admin-profile">
            <span>MN</span>
            <div><strong>Martina Norte</strong><small>Propietaria</small></div>
          </div>
        </header>

        <div className="mobile-admin-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => changeView(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        {message && (
          <button className="admin-toast" type="button" onClick={() => setMessage("")}>
            ✓ {message}
          </button>
        )}

        {view === "overview" && (
          <>
            <div className="metric-grid">
              <Metric label="Turnos próximos" value={String(data.metrics.weekAppointments)} detail="Próximos 7 días" />
              <Metric label="Servicios activos" value={String(data.metrics.activeServices)} detail="Publicados actualmente" />
              <Metric label="Profesionales" value={String(data.metrics.activeStaff)} detail="Con agenda habilitada" />
              <Metric label="Ingresos del mes" value={money(data.metrics.monthlyRevenueInCents)} detail="Turnos completados" />
            </div>
            <section className="admin-card">
              <div className="admin-card-heading">
                <div><p className="eyebrow">Agenda</p><h2>Próximos turnos</h2></div>
                <button className="text-action" onClick={() => changeView("appointments")} type="button">Ver agenda completa →</button>
              </div>
              <AppointmentList
                appointments={data.appointments.slice(0, 5)}
                onUpdate={updateAppointment}
                businessName={data.business.name}
              />
            </section>
          </>
        )}

        {view === "appointments" && (
          <section className="admin-card">
            <div className="admin-card-heading">
              <div><p className="eyebrow">Operación diaria</p><h2>Agenda de turnos</h2></div>
              <span className="count-pill">
                {agendaAppointments?.length ?? data.appointments.length} resultados
              </span>
            </div>
            <form className="agenda-filters" onSubmit={filterAppointments}>
              <label>
                <span>Buscar cliente</span>
                <input name="q" type="search" placeholder="Nombre, email o teléfono" />
              </label>
              <label>
                <span>Profesional</span>
                <select name="staffId" defaultValue="">
                  <option value="">Todos</option>
                  {data.staff.map((member) => (
                    <option value={member.id} key={member.id}>
                      {member.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Estado</span>
                <select name="status" defaultValue="">
                  <option value="">Todos</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
              </label>
              <button className="button button-dark button-small" type="submit">
                Aplicar filtros
              </button>
            </form>
            <AppointmentList
              appointments={agendaAppointments ?? data.appointments}
              onUpdate={updateAppointment}
              businessName={data.business.name}
            />
          </section>
        )}

        {view === "services" && (
          <section className="admin-card">
            <div className="admin-card-heading">
              <div><p className="eyebrow">Catálogo</p><h2>Servicios</h2></div>
              <button className="button button-dark button-small" type="button" onClick={() => setShowNewService(!showNewService)}>
                {showNewService ? "Cerrar" : "+ Nuevo servicio"}
              </button>
            </div>
            {showNewService && <NewServiceForm onSubmit={createService} />}
            <div className="management-grid">
              {data.services.map((service) => (
                <article className={"management-card " + (!service.active ? "inactive" : "")} key={service.id}>
                  <div className="management-card-top">
                    <span className="service-glyph">✦</span>
                    <span className={"state-dot " + (service.active ? "on" : "")}>
                      {service.active ? "Activo" : "Pausado"}
                    </span>
                  </div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <form
                    className="service-quick-edit"
                    onSubmit={(event) => void updateService(event, service)}
                  >
                    <label>
                      Duración
                      <span>
                        <input
                          name="durationMinutes"
                          type="number"
                          min="10"
                          defaultValue={service.durationMinutes}
                        /> min
                      </span>
                    </label>
                    <label>
                      Precio
                      <span>
                        $ <input
                          name="price"
                          type="number"
                          min="0"
                          defaultValue={service.priceInCents / 100}
                        />
                      </span>
                    </label>
                    <button type="submit">Guardar cambios</button>
                  </form>
                  <button className="outline-action" type="button" onClick={() => toggleService(service)}>
                    {service.active ? "Pausar publicación" : "Volver a publicar"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === "staff" && (
          <section className="admin-card">
            <div className="admin-card-heading">
              <div><p className="eyebrow">Equipo</p><h2>Profesionales</h2></div>
              <button
                className="button button-dark button-small"
                type="button"
                onClick={() => setShowNewStaff(!showNewStaff)}
              >
                {showNewStaff ? "Cerrar" : "+ Nuevo profesional"}
              </button>
            </div>
            {showNewStaff && (
              <StaffForm
                services={data.services}
                onSubmit={createStaff}
                submitLabel="Agregar profesional"
              />
            )}
            <div className="management-grid staff-management">
              {data.staff.map((member) => (
                <article className={"management-card " + (!member.active ? "inactive" : "")} key={member.id}>
                  <div className={"large-avatar avatar-" + member.accent}>{member.initials}</div>
                  <h3>{member.displayName}</h3>
                  <p>{member.roleTitle}</p>
                  <span className="service-count">
                    {member.services.length === 0
                      ? "Sin servicios asignados"
                      : member.services
                          .map(({ serviceId }) =>
                            data.services.find((service) => service.id === serviceId)?.name,
                          )
                          .filter(Boolean)
                          .join(" · ")}
                  </span>
                  <button
                    className="outline-action"
                    type="button"
                    onClick={() =>
                      setEditingStaffId(
                        editingStaffId === member.id ? null : member.id,
                      )
                    }
                  >
                    {editingStaffId === member.id ? "Cerrar edición" : "Editar profesional"}
                  </button>
                  <button className="outline-action" type="button" onClick={() => toggleStaff(member)}>
                    {member.active ? "Pausar agenda" : "Activar agenda"}
                  </button>
                  {editingStaffId === member.id && (
                    <StaffForm
                      member={member}
                      services={data.services}
                      onSubmit={(event) => updateStaff(event, member)}
                      submitLabel="Guardar profesional"
                    />
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {view === "availability" && (
          <section className="admin-card">
            <div className="admin-card-heading">
              <div>
                <p className="eyebrow">Disponibilidad</p>
                <h2>Horarios de atención</h2>
              </div>
              <span className="count-pill">Zona horaria Buenos Aires</span>
            </div>
            <form className="availability-form" onSubmit={updateAvailability}>
              {weekdays.map((day) => {
                const dayIntervals = data.availability.filter(
                  (interval) => interval.weekday === day.value,
                );
                return (
                  <div className="availability-row" key={day.value}>
                    <label className="day-toggle">
                      <input
                        type="checkbox"
                        name={"enabled-" + day.value}
                        defaultChecked={dayIntervals.length > 0}
                      />
                      <span>{day.label}</span>
                    </label>
                    <label>
                      <span>Apertura</span>
                      <input
                        type="time"
                        name={"start-" + day.value}
                        defaultValue={dayIntervals[0]?.startTime ?? "09:00"}
                      />
                    </label>
                    <label>
                      <span>Cierre</span>
                      <input
                        type="time"
                        name={"end-" + day.value}
                        defaultValue={
                          dayIntervals[dayIntervals.length - 1]?.endTime ?? "20:00"
                        }
                      />
                    </label>
                  </div>
                );
              })}
              <div className="availability-footer">
                <p>
                  Los horarios disponibles se recalculan automáticamente según
                  la duración de cada servicio y los turnos ya reservados.
                </p>
                <button className="button button-primary" type="submit">
                  Guardar horarios
                </button>
              </div>
            </form>
          </section>
        )}

        {view === "business" && (
          <section className="admin-card">
            <div className="admin-card-heading">
              <div>
                <p className="eyebrow">Configuración</p>
                <h2>Información del negocio</h2>
              </div>
              <a className="text-action" href="/" target="_blank">
                Ver perfil público ↗
              </a>
            </div>
            <form className="business-form" onSubmit={updateBusiness}>
              <label>
                Nombre comercial
                <input name="name" defaultValue={data.business.name} required />
              </label>
              <label>
                Rubro
                <input
                  name="category"
                  defaultValue={data.business.category}
                  placeholder="Ej. Barbería y cuidado personal"
                  required
                />
              </label>
              <label>
                Dirección
                <input
                  name="address"
                  defaultValue={data.business.address ?? ""}
                  placeholder="Calle y número"
                />
              </label>
              <label>
                Ciudad o barrio
                <input
                  name="location"
                  defaultValue={data.business.location ?? ""}
                  placeholder="Ej. Palermo, Buenos Aires"
                />
              </label>
              <label>
                WhatsApp o teléfono
                <input
                  name="phone"
                  type="tel"
                  defaultValue={data.business.phone ?? ""}
                  placeholder="Ej. +54 11 5555-0194"
                />
              </label>
              <label>
                Email público
                <input
                  name="email"
                  type="email"
                  defaultValue={data.business.email ?? ""}
                  placeholder="hola@tunegocio.com"
                />
              </label>
              <label className="wide-field">
                Horario resumido
                <input
                  name="scheduleText"
                  defaultValue={data.business.scheduleText ?? ""}
                  placeholder="Ej. Lun a sáb · 9:00 a 20:00"
                />
              </label>
              <div className="business-form-footer wide-field">
                <p>
                  Estos datos se muestran a clientes en la página de reservas.
                  Los horarios disponibles se administran en la sección Horarios.
                </p>
                <button className="button button-primary" type="submit">
                  Guardar información
                </button>
              </div>
            </form>
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function AppointmentList({
  appointments,
  onUpdate,
  businessName,
}: {
  appointments: Appointment[];
  onUpdate: (id: string, status: Status) => Promise<void>;
  businessName: string;
}) {
  if (appointments.length === 0) {
    return <p className="empty-state">No hay turnos próximos.</p>;
  }

  return (
    <div className="appointment-list">
      {appointments.map((appointment) => (
        <article key={appointment.id}>
          <div className="appointment-time">
            <strong>{appointmentDate(appointment.startAt).split(", ")[1]}</strong>
            <span>{appointmentDate(appointment.startAt).split(", ")[0]}</span>
          </div>
          <div className="appointment-customer">
            <span className={"mini-avatar avatar-" + appointment.staff.accent}>
              {appointment.customerName.split(" ").map((part) => part[0]).join("").slice(0, 2)}
            </span>
            <div><strong>{appointment.customerName}</strong><small>{appointment.customerEmail}</small></div>
          </div>
          <div className="appointment-service">
            <strong>{appointment.service.name}</strong>
            <small>con {appointment.staff.displayName}</small>
          </div>
          <span className={"status-badge status-" + appointment.status.toLowerCase()}>
            {statusLabels[appointment.status]}
          </span>
          <div className="appointment-actions">
            <select
              aria-label={"Cambiar estado del turno de " + appointment.customerName}
              value={appointment.status}
              onChange={(event) => void onUpdate(appointment.id, event.target.value as Status)}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
            <a
              href={whatsappUrl(appointment, businessName)}
              target="_blank"
              rel="noreferrer"
              aria-label={"Escribir por WhatsApp a " + appointment.customerName}
            >
              WhatsApp ↗
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

function whatsappUrl(appointment: Appointment, businessName: string) {
  let phone = appointment.customerPhone.replace(/\D/g, "").replace(/^0+/, "");
  if (/^11\d{8}$/.test(phone)) phone = "549" + phone;
  if (/^54(?!9)\d{10}$/.test(phone)) phone = "549" + phone.slice(2);

  const message = [
    `Hola ${appointment.customerName}, te escribimos de ${businessName}.`,
    `Tu turno es ${appointmentDate(appointment.startAt)} para ${appointment.service.name}`,
    `con ${appointment.staff.displayName}.`,
    "¿Podés confirmarnos tu asistencia?",
  ].join(" ");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function NewServiceForm({
  onSubmit,
}: {
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <form className="new-service-form" onSubmit={onSubmit}>
      <label>Nombre<input name="name" placeholder="Ej. Tratamiento capilar" required /></label>
      <label>Duración<input name="durationMinutes" type="number" min="10" defaultValue="45" required /></label>
      <label>Precio<input name="price" type="number" min="0" placeholder="15000" required /></label>
      <label className="wide-field">Descripción<input name="description" placeholder="Breve descripción para clientes" /></label>
      <button className="button button-primary" type="submit">Crear servicio</button>
    </form>
  );
}

function StaffForm({
  member,
  services,
  onSubmit,
  submitLabel,
}: {
  member?: Staff;
  services: Service[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  submitLabel: string;
}) {
  const assignedServices = new Set(
    member?.services.map(({ serviceId }) => serviceId) ?? [],
  );

  return (
    <form className="staff-form" onSubmit={onSubmit}>
      <div className="staff-fields">
        <label>
          Nombre
          <input
            name="displayName"
            defaultValue={member?.displayName}
            placeholder="Ej. Alex Martínez"
            required
          />
        </label>
        <label>
          Especialidad
          <input
            name="roleTitle"
            defaultValue={member?.roleTitle ?? ""}
            placeholder="Ej. Colorista"
          />
        </label>
        <label className="wide-field">
          Presentación
          <textarea
            name="bio"
            defaultValue={member?.bio ?? ""}
            placeholder="Experiencia y enfoque profesional"
            rows={3}
          />
        </label>
      </div>
      <fieldset>
        <legend>Servicios que realiza</legend>
        <div className="staff-service-options">
          {services.map((service) => (
            <label key={service.id}>
              <input
                type="checkbox"
                name="serviceIds"
                value={service.id}
                defaultChecked={assignedServices.has(service.id)}
              />
              <span>{service.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button className="button button-primary" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
