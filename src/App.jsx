import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Bell, Building2, Check, CheckCircle2, ChevronDown,
  ClipboardList, Clock3, Filter, HardDrive, LayoutDashboard, MapPin, Menu,
  Plus, RadioTower, ShieldAlert, ShieldCheck, Siren, Thermometer, Users,
  Wrench, X, Zap, Camera, History, Search, LogOut, ArrowUpRight
} from "lucide-react";

const BUILDINGS = [
  { id: "B1", name: "Academic Block", type: "Teaching", area: "Classrooms & corridors" },
  { id: "B2", name: "Central Library", type: "Library", area: "Reading rooms" },
  { id: "B3", name: "Science Laboratory", type: "Laboratory", area: "Lab wing" },
  { id: "B4", name: "Student Hostel", type: "Residential", area: "Common areas" },
  { id: "B5", name: "Administration Block", type: "Office", area: "Reception" },
  { id: "B6", name: "Auditorium & Events Hall", type: "Events", area: "Main hall" }
];

const seed = {
  readings: [
    { id: "S-101", buildingId: "B1", area: "Second-floor corridor", type: "Temperature", value: 27, unit: "°C", threshold: 40, time: Date.now() - 1000 * 60 * 12, source: "SIMULATED" },
    { id: "S-102", buildingId: "B2", area: "Reading room", type: "Temperature", value: 25, unit: "°C", threshold: 40, time: Date.now() - 1000 * 60 * 22, source: "SIMULATED" },
    { id: "S-103", buildingId: "B3", area: "Lab wing", type: "Temperature", value: 43, unit: "°C", threshold: 40, time: Date.now() - 1000 * 60 * 4, source: "SIMULATED" },
    { id: "S-104", buildingId: "B4", area: "Common area", type: "Temperature", value: 29, unit: "°C", threshold: 40, time: Date.now() - 1000 * 60 * 18, source: "SIMULATED" },
    { id: "S-105", buildingId: "B5", area: "Reception", type: "Temperature", value: 26, unit: "°C", threshold: 40, time: Date.now() - 1000 * 60 * 30, source: "SIMULATED" },
    { id: "S-106", buildingId: "B6", area: "Main hall", type: "Temperature", value: 28, unit: "°C", threshold: 40, time: Date.now() - 1000 * 60 * 8, source: "SIMULATED" }
  ],
  alerts: [
    { id: "ALT-204", buildingId: "B3", area: "Lab wing", title: "Temperature threshold exceeded", detail: "Simulated reading: 43°C (demo threshold: 40°C)", severity: "High", status: "Open", time: Date.now() - 1000 * 60 * 4, source: "SIMULATION" },
    { id: "ALT-203", buildingId: "B5", area: "Reception side door", title: "Restricted-zone event", detail: "Sample event generated for demonstration; no real access device connected.", severity: "Medium", status: "Acknowledged", time: Date.now() - 1000 * 60 * 25, source: "SIMULATION" }
  ],
  incidents: [
    { id: "INC-302", buildingId: "B3", category: "Safety", title: "Review high temperature reading", description: "Check the simulated reading and record the follow-up action.", status: "Open", priority: "High", time: Date.now() - 1000 * 60 * 4 },
    { id: "INC-301", buildingId: "B5", category: "Security", title: "Review restricted-zone event", description: "Demo event for the reception side door.", status: "In review", priority: "Medium", time: Date.now() - 1000 * 60 * 25 }
  ],
  maintenance: [
    { id: "MNT-411", buildingId: "B2", title: "Reading-room light inspection", category: "Electrical", priority: "Medium", status: "Pending", description: "Inspect sample light fixture and record findings.", photoName: "", time: Date.now() - 1000 * 60 * 60 * 3 },
    { id: "MNT-410", buildingId: "B6", title: "Pre-event equipment check", category: "Equipment", priority: "High", status: "In progress", description: "Sample request to check event equipment.", photoName: "", time: Date.now() - 1000 * 60 * 60 * 6 },
    { id: "MNT-409", buildingId: "B1", title: "Corridor wall inspection", category: "Structural", priority: "Low", status: "Completed", description: "Sample visual inspection record.", photoName: "", time: Date.now() - 1000 * 60 * 60 * 24 }
  ],
  visitors: [
    { id: "VIS-51", name: "Demo Visitor A", organization: "Sample Vendor", buildingId: "B5", purpose: "Meeting", checkIn: Date.now() - 1000 * 60 * 35, checkOut: null },
    { id: "VIS-50", name: "Demo Visitor B", organization: "Guest", buildingId: "B2", purpose: "Library visit", checkIn: Date.now() - 1000 * 60 * 120, checkOut: Date.now() - 1000 * 60 * 70 }
  ],
  accessLogs: [
    { id: "ACC-12", buildingId: "B5", zone: "Reception side door", event: "Restricted-zone simulation", time: Date.now() - 1000 * 60 * 25 },
    { id: "ACC-11", buildingId: "B4", zone: "Hostel reception", event: "Visitor check-in recorded", time: Date.now() - 1000 * 60 * 45 }
  ],
  activity: [
    { id: "ACT-1", text: "Demo data loaded for six buildings", time: Date.now() - 1000 * 60 * 30 },
    { id: "ACT-2", text: "Restricted-zone simulation added", time: Date.now() - 1000 * 60 * 25 },
    { id: "ACT-3", text: "Temperature alert generated for Science Laboratory", time: Date.now() - 1000 * 60 * 4 }
  ]
};

const STORAGE_KEY = "campusshield-demo-v1";
const id = (prefix) => `${prefix}-${Math.floor(Date.now() % 1000000).toString().padStart(6, "0")}`;
const fmt = (time) => new Date(time).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const buildingName = (buildingId) => BUILDINGS.find((b) => b.id === buildingId)?.name || "Unknown building";

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...seed, ...JSON.parse(saved) } : seed;
  } catch { return seed; }
}

function StatCard({ icon: Icon, label, value, note, tone = "blue" }) {
  return <div className="stat-card">
    <div className={`stat-icon ${tone}`}><Icon size={20} /></div>
    <div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>
  </div>;
}

function StatusPill({ children }) {
  const value = String(children || "").toLowerCase().replaceAll(" ", "-");
  return <span className={`status-pill ${value}`}>{children}</span>;
}

function SectionHeading({ eyebrow, title, subtitle, action }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{subtitle && <p className="muted">{subtitle}</p>}</div>{action}</div>;
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("Overview");
  const [selectedBuilding, setSelectedBuilding] = useState("All buildings");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("Campus administrator");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState("");
  const [sensorBuilding, setSensorBuilding] = useState("B3");
  const [sensorArea, setSensorArea] = useState("Lab wing");
  const [sensorValue, setSensorValue] = useState(43);
  const [sensorThreshold, setSensorThreshold] = useState(40);
  const [sensorType, setSensorType] = useState("Temperature");
  const [sosBuilding, setSosBuilding] = useState("B1");
  const [sosArea, setSosArea] = useState("");
  const [sosDescription, setSosDescription] = useState("");
  const [maintenanceForm, setMaintenanceForm] = useState({ buildingId: "B2", title: "", category: "Electrical", priority: "Medium", description: "" });
  const [visitorForm, setVisitorForm] = useState({ name: "", organization: "", buildingId: "B5", purpose: "Meeting" });
  const [incidentFilter, setIncidentFilter] = useState("All");
  const [maintenanceFilter, setMaintenanceFilter] = useState("All");

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const openAlerts = data.alerts.filter((a) => a.status === "Open").length;
  const openIncidents = data.incidents.filter((i) => i.status !== "Closed").length;
  const pendingMaintenance = data.maintenance.filter((m) => m.status !== "Completed").length;
  const checkedInVisitors = data.visitors.filter((v) => !v.checkOut).length;
  const activeFilter = selectedBuilding === "All buildings" ? null : BUILDINGS.find((b) => b.name === selectedBuilding)?.id;
  const matchesBuilding = (item) => !activeFilter || item.buildingId === activeFilter;
  const visibleBuildings = BUILDINGS.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()) && (!activeFilter || b.id === activeFilter));
  const recentActivity = [...data.activity].sort((a,b)=>b.time-a.time).slice(0,6);

  const addActivity = (text) => setData((d) => ({ ...d, activity: [{ id: id("ACT"), text, time: Date.now() }, ...d.activity].slice(0, 80) }));
  const updateData = (key, updater) => setData((d) => ({ ...d, [key]: updater(d[key]) }));

  const generateSensorEvent = () => {
    const reading = { id: id("S"), buildingId: sensorBuilding, area: sensorArea || "Unspecified area", type: sensorType, value: Number(sensorValue), unit: sensorType === "Temperature" ? "°C" : sensorType === "Humidity" ? "%" : "units", threshold: Number(sensorThreshold), time: Date.now(), source: "SIMULATED" };
    const isAlert = Number(sensorValue) > Number(sensorThreshold);
    const alert = isAlert ? { id: id("ALT"), buildingId: sensorBuilding, area: reading.area, title: `${sensorType} threshold exceeded`, detail: `Simulated reading: ${reading.value}${reading.unit} (demo threshold: ${reading.threshold}${reading.unit})`, severity: Number(sensorValue) > Number(sensorThreshold) + 10 ? "High" : "Medium", status: "Open", time: Date.now(), source: "SIMULATION" } : null;
    setData((d) => ({
      ...d,
      readings: [reading, ...d.readings].slice(0, 100),
      alerts: alert ? [alert, ...d.alerts] : d.alerts,
      activity: [{ id: id("ACT"), text: `${sensorType} demo reading added for ${buildingName(sensorBuilding)}${isAlert ? " — alert generated" : ""}`, time: Date.now() }, ...d.activity].slice(0, 80)
    }));
    setToast(isAlert ? "Demo reading saved and alert generated." : "Demo reading saved; threshold not exceeded.");
  };

  const generateRestrictedEvent = () => {
    const event = { id: id("ALT"), buildingId: sensorBuilding, area: sensorArea || "Restricted zone", title: "Restricted-zone activity", detail: "Simulated access event. No real camera or access-control device is connected.", severity: "Medium", status: "Open", time: Date.now(), source: "SIMULATION" };
    const log = { id: id("ACC"), buildingId: sensorBuilding, zone: sensorArea || "Restricted zone", event: "Restricted-zone simulation", time: Date.now() };
    setData((d) => ({ ...d, alerts: [event, ...d.alerts], accessLogs: [log, ...d.accessLogs], activity: [{ id: id("ACT"), text: `Restricted-zone simulation generated for ${buildingName(sensorBuilding)}`, time: Date.now() }, ...d.activity].slice(0,80) }));
    setToast("Restricted-zone demo event recorded.");
  };

  const acknowledgeAlert = (alertId) => {
    setData((d) => ({ ...d, alerts: d.alerts.map((a) => a.id === alertId ? { ...a, status: "Acknowledged" } : a), activity: [{ id: id("ACT"), text: `Alert ${alertId} acknowledged`, time: Date.now() }, ...d.activity] }));
    setToast("Alert acknowledged.");
  };

  const makeIncidentFromAlert = (alert) => {
    if (data.incidents.some((i) => i.sourceAlertId === alert.id)) return setToast("An incident is already linked to this alert.");
    const incident = { id: id("INC"), buildingId: alert.buildingId, category: alert.title.includes("Restricted") ? "Security" : "Safety", title: alert.title, description: alert.detail, status: "Open", priority: alert.severity, time: Date.now(), sourceAlertId: alert.id };
    setData((d) => ({ ...d, incidents: [incident, ...d.incidents], activity: [{ id: id("ACT"), text: `Incident ${incident.id} created from alert ${alert.id}`, time: Date.now() }, ...d.activity] }));
    setToast("Incident created from alert.");
  };

  const submitSos = (e) => {
    e.preventDefault();
    if (!sosDescription.trim()) return setToast("Please describe the demo incident.");
    const incident = { id: id("SOS"), buildingId: sosBuilding, category: "SOS", title: "SOS emergency report (demo)", description: `${sosArea ? `Area: ${sosArea}. ` : ""}${sosDescription}`, status: "Open", priority: "High", time: Date.now(), locationShared: false };
    setData((d) => ({ ...d, incidents: [incident, ...d.incidents], activity: [{ id: id("ACT"), text: `Demo SOS report created for ${buildingName(sosBuilding)}`, time: Date.now() }, ...d.activity] }));
    setSosArea(""); setSosDescription(""); setModal(""); setPage("Incidents"); setToast("Demo SOS incident recorded. No emergency services were contacted.");
  };

  const submitMaintenance = (e) => {
    e.preventDefault();
    if (!maintenanceForm.title.trim()) return setToast("Add a maintenance issue title.");
    const request = { ...maintenanceForm, id: id("MNT"), status: "Pending", time: Date.now(), photoName: maintenanceForm.photoName || "" };
    setData((d) => ({ ...d, maintenance: [request, ...d.maintenance], activity: [{ id: id("ACT"), text: `Maintenance request ${request.id} created for ${buildingName(request.buildingId)}`, time: Date.now() }, ...d.activity] }));
    setMaintenanceForm({ buildingId: "B2", title: "", category: "Electrical", priority: "Medium", description: "" });
    setModal(""); setPage("Maintenance"); setToast("Maintenance request created.");
  };

  const submitVisitor = (e) => {
    e.preventDefault();
    if (!visitorForm.name.trim()) return setToast("Enter a demo visitor name.");
    const visitor = { ...visitorForm, id: id("VIS"), checkIn: Date.now(), checkOut: null };
    const log = { id: id("ACC"), buildingId: visitor.buildingId, zone: "Reception", event: `Visitor check-in: ${visitor.name}`, time: Date.now() };
    setData((d) => ({ ...d, visitors: [visitor, ...d.visitors], accessLogs: [log, ...d.accessLogs], activity: [{ id: id("ACT"), text: `Visitor checked in at ${buildingName(visitor.buildingId)}`, time: Date.now() }, ...d.activity] }));
    setVisitorForm({ name: "", organization: "", buildingId: "B5", purpose: "Meeting" });
    setModal(""); setPage("Visitors"); setToast("Demo visitor checked in.");
  };

  const updateStatus = (key, recordId, status) => {
    setData((d) => ({ ...d, [key]: d[key].map((x) => x.id === recordId ? { ...x, status } : x), activity: [{ id: id("ACT"), text: `${key === "maintenance" ? "Maintenance" : "Incident"} ${recordId} updated to ${status}`, time: Date.now() }, ...d.activity] }));
    setToast("Status updated.");
  };

  const checkOutVisitor = (visitor) => {
    setData((d) => ({ ...d, visitors: d.visitors.map((v) => v.id === visitor.id ? { ...v, checkOut: Date.now() } : v), accessLogs: [{ id: id("ACC"), buildingId: visitor.buildingId, zone: "Reception", event: `Visitor check-out: ${visitor.name}`, time: Date.now() }, ...d.accessLogs], activity: [{ id: id("ACT"), text: `Visitor checked out of ${buildingName(visitor.buildingId)}`, time: Date.now() }, ...d.activity] }));
    setToast("Visitor checked out.");
  };

  const buildingsWithStatus = useMemo(() => BUILDINGS.map((b) => {
    const alerts = data.alerts.filter((a) => a.buildingId === b.id && a.status === "Open").length;
    const incidents = data.incidents.filter((i) => i.buildingId === b.id && i.status !== "Closed").length;
    const requests = data.maintenance.filter((m) => m.buildingId === b.id && m.status !== "Completed").length;
    const latest = data.readings.find((r) => r.buildingId === b.id);
    return { ...b, alerts, incidents, requests, latest, status: alerts ? "Attention" : incidents || requests ? "Monitor" : "Normal" };
  }), [data]);

  const filteredAlerts = data.alerts.filter(matchesBuilding).filter((a) => `${a.title} ${a.area} ${buildingName(a.buildingId)}`.toLowerCase().includes(search.toLowerCase()));
  const filteredIncidents = data.incidents.filter(matchesBuilding).filter((i) => incidentFilter === "All" || i.status === incidentFilter).filter((i) => `${i.title} ${i.description} ${buildingName(i.buildingId)}`.toLowerCase().includes(search.toLowerCase()));
  const filteredMaintenance = data.maintenance.filter(matchesBuilding).filter((m) => maintenanceFilter === "All" || m.status === maintenanceFilter).filter((m) => `${m.title} ${m.description} ${buildingName(m.buildingId)}`.toLowerCase().includes(search.toLowerCase()));
  const filteredVisitors = data.visitors.filter(matchesBuilding).filter((v) => `${v.name} ${v.organization} ${buildingName(v.buildingId)}`.toLowerCase().includes(search.toLowerCase()));
  const filteredLogs = data.accessLogs.filter(matchesBuilding).filter((v) => `${v.event} ${v.zone} ${buildingName(v.buildingId)}`.toLowerCase().includes(search.toLowerCase()));

  const navItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Safety & Alerts", icon: ShieldAlert },
    { name: "Incidents", icon: ClipboardList },
    { name: "Maintenance", icon: Wrench },
    { name: "Visitors & Access", icon: Users },
    { name: "Sensor Simulator", icon: RadioTower },
    { name: "History & Insights", icon: History }
  ];

  const navTo = (name) => { setPage(name); setSearch(""); };
  const buildingOptions = [{ value: "All buildings", label: "All buildings" }, ...BUILDINGS.map((b) => ({ value: b.name, label: b.name }))];
  const buildingIdOptions = BUILDINGS.map((b) => ({ value: b.id, label: b.name }));

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><ShieldCheck size={23} /></div><div><strong>CampusShield</strong><small>SMART CAMPUS SYSTEM</small></div></div>
      <div className="campus-chip"><span className="pulse-dot" /> Demo campus <span className="demo-label">SIMULATED</span></div>
      <p className="nav-label">WORKSPACE</p>
      <nav>{navItems.map(({ name, icon: Icon }) => <button key={name} className={`nav-item ${page === name ? "active" : ""}`} onClick={() => navTo(name)}><Icon size={18} /><span>{name}</span>{name === "Safety & Alerts" && openAlerts > 0 && <b>{openAlerts}</b>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="privacy-note"><ShieldCheck size={16} /><div><strong>Privacy-first demo</strong><p>No real sensors, cameras, or emergency dispatch connected.</p></div></div>
        <div className="profile-row"><div className="avatar">CS</div><div><strong>Demo operator</strong><small>Local browser session</small></div><ChevronDown size={16} /></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="breadcrumb"><span>CampusShield</span><span className="slash">/</span><strong>{page}</strong></div>
        <div className="top-actions">
          <label className="role-select"><span>View as</span><select value={role} onChange={(e) => setRole(e.target.value)}><option>Campus administrator</option><option>Security staff (demo view)</option><option>Maintenance staff (demo view)</option></select></label>
          <span className="demo-pill"><span className="pulse-dot" /> DEMO MODE</span>
        </div>
      </header>

      <div className="content">
        <div className="welcome-row">
          <div><p className="eyebrow">FICTIONAL UNIVERSITY CAMPUS</p><h1>{page === "Overview" ? "Campus overview" : page}</h1><p className="muted">Six-building safety, security and facility monitoring prototype.</p></div>
          <div className="welcome-actions"><button className="button secondary" onClick={() => setModal("sos")}><Siren size={16} /> Report SOS</button><button className="button primary" onClick={() => setModal("maintenance")}><Plus size={16} /> New request</button></div>
        </div>

        <div className="filter-bar">
          <div className="search-box"><Search size={17} /><input aria-label="Search records" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search buildings, alerts, records..." /></div>
          <div className="filter-select"><Filter size={16} /><select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}>{buildingOptions.map((o) => <option key={o.value}>{o.value}</option>)}</select></div>
        </div>

        {page === "Overview" && <div className="page-stack">
          <div className="stat-grid">
            <StatCard icon={Building2} label="Buildings monitored" value="6" note="Demo campus blocks" tone="blue" />
            <StatCard icon={Bell} label="Open alerts" value={openAlerts} note="Require review" tone="orange" />
            <StatCard icon={ClipboardList} label="Open incidents" value={openIncidents} note="Not yet closed" tone="purple" />
            <StatCard icon={Wrench} label="Pending maintenance" value={pendingMaintenance} note="Awaiting completion" tone="green" />
          </div>
          <div className="two-column">
            <section className="panel">
              <SectionHeading eyebrow="CAMPUS STATUS" title="Building overview" subtitle="Status is calculated from open demo alerts, incidents and requests." action={<span className="mini-badge"><Activity size={13} /> 6 locations</span>} />
              <div className="building-grid">{buildingsWithStatus.filter(matchesBuilding).filter((b)=>b.name.toLowerCase().includes(search.toLowerCase())).map((b) => <div className="building-card" key={b.id}>
                <div className="building-card-top"><div className="building-icon"><Building2 size={20} /></div><StatusPill>{b.status}</StatusPill></div>
                <h3>{b.name}</h3><p>{b.type} · {b.area}</p>
                <div className="building-metrics"><span><Bell size={13} /> {b.alerts} alerts</span><span><Wrench size={13} /> {b.requests} tasks</span></div>
                <div className="building-bottom"><span>{b.latest ? `${b.latest.type}: ${b.latest.value}${b.latest.unit}` : "No reading"}</span><button className="text-button" onClick={() => {setSelectedBuilding(b.name);setPage("Safety & Alerts");}}>View <ArrowUpRight size={14} /></button></div>
              </div>)}</div>
            </section>
            <section className="panel">
              <SectionHeading eyebrow="NEEDS ATTENTION" title="Recent alerts" subtitle="Sample events generated by the simulator." action={<button className="text-button" onClick={()=>setPage("Safety & Alerts")}>View all <ArrowUpRight size={14}/></button>} />
              <div className="record-list">{data.alerts.filter(matchesBuilding).slice(0,5).map((a)=><div className="record-row" key={a.id}><div className={`record-icon ${a.severity.toLowerCase()}`}><AlertTriangle size={17}/></div><div className="record-main"><strong>{a.title}</strong><p>{buildingName(a.buildingId)} · {a.area}</p><small>{fmt(a.time)}</small></div><StatusPill>{a.status}</StatusPill></div>)}</div>
            </section>
          </div>
          <div className="two-column">
            <section className="panel"><SectionHeading eyebrow="FOLLOW-UP" title="Maintenance queue" subtitle="Open requests across the campus." action={<button className="text-button" onClick={()=>setPage("Maintenance")}>Open queue <ArrowUpRight size={14}/></button>} />
              <div className="compact-table"><div className="table-head"><span>REQUEST</span><span>BUILDING</span><span>STATUS</span></div>{data.maintenance.filter((m)=>m.status!=="Completed" && matchesBuilding(m)).slice(0,4).map((m)=><div className="table-row" key={m.id}><div><strong>{m.title}</strong><small>{m.id} · {m.priority} priority</small></div><span>{buildingName(m.buildingId)}</span><StatusPill>{m.status}</StatusPill></div>)}</div>
            </section>
            <section className="panel"><SectionHeading eyebrow="ACTIVITY" title="Recent activity" subtitle="Latest changes in this browser demo." /><div className="timeline">{recentActivity.map((a)=><div className="timeline-item" key={a.id}><span className="timeline-dot"/><div><p>{a.text}</p><small>{fmt(a.time)}</small></div></div>)}</div></section>
          </div>
        </div>}

        {page === "Safety & Alerts" && <div className="page-stack">
          <div className="info-banner"><RadioTower size={19}/><div><strong>Simulated monitoring data</strong><p>These events are generated in software. No physical sensors, CCTV, or access-control devices are connected.</p></div></div>
          <section className="panel"><SectionHeading eyebrow="EVENT MONITORING" title="Safety and security alerts" subtitle="Review alerts, acknowledge them, or create an incident for follow-up." action={<button className="button primary" onClick={()=>setPage("Sensor Simulator")}><RadioTower size={16}/> Generate event</button>} />
            {filteredAlerts.length===0 ? <div className="empty-state">No matching alerts. Try another building filter or generate a demo event.</div> : <div className="alert-list">{filteredAlerts.map((a)=><div className="alert-card" key={a.id}><div className={`alert-symbol ${a.severity.toLowerCase()}`}><AlertTriangle size={20}/></div><div className="alert-content"><div className="alert-title-row"><h3>{a.title}</h3><StatusPill>{a.severity}</StatusPill><StatusPill>{a.status}</StatusPill></div><p>{buildingName(a.buildingId)} · {a.area}</p><p className="alert-detail">{a.detail}</p><small>{a.id} · {fmt(a.time)} · {a.source}</small></div><div className="alert-actions">{a.status==="Open"&&<button className="button secondary small" onClick={()=>acknowledgeAlert(a.id)}><Check size={14}/> Acknowledge</button>}<button className="button secondary small" onClick={()=>makeIncidentFromAlert(a)}><Plus size={14}/> Create incident</button></div></div>)}</div>}
          </section>
          <section className="panel"><SectionHeading eyebrow="LATEST READINGS" title="Sensor telemetry" subtitle="Most recent sample readings; values are simulated." />
            <div className="responsive-table"><table><thead><tr><th>Building / area</th><th>Measurement</th><th>Reading</th><th>Demo threshold</th><th>Source</th><th>Time</th></tr></thead><tbody>{data.readings.filter(matchesBuilding).filter((r)=>`${r.area} ${r.type} ${buildingName(r.buildingId)}`.toLowerCase().includes(search.toLowerCase())).slice(0,12).map((r)=><tr key={r.id}><td><strong>{buildingName(r.buildingId)}</strong><small>{r.area}</small></td><td>{r.type}</td><td><strong className={r.value>r.threshold?"danger-text":""}>{r.value}{r.unit}</strong></td><td>{r.threshold}{r.unit}</td><td><span className="source-tag">{r.source}</span></td><td>{fmt(r.time)}</td></tr>)}</tbody></table></div>
          </section>
        </div>}

        {page === "Incidents" && <div className="page-stack"><section className="panel"><SectionHeading eyebrow="RESPONSE TRACKING" title="Incident register" subtitle="SOS reports and alerts that need review or follow-up." action={<button className="button secondary" onClick={()=>setModal("sos")}><Siren size={16}/> New SOS report</button>} />
          <div className="inline-filters"><label>Status <select value={incidentFilter} onChange={(e)=>setIncidentFilter(e.target.value)}><option>All</option><option>Open</option><option>In review</option><option>Closed</option></select></label></div>
          <div className="record-list">{filteredIncidents.map((i)=><div className="incident-row" key={i.id}><div className={`record-icon ${i.priority.toLowerCase()}`}><ClipboardList size={18}/></div><div className="record-main"><div className="record-title-line"><strong>{i.title}</strong><StatusPill>{i.priority}</StatusPill><StatusPill>{i.status}</StatusPill></div><p>{buildingName(i.buildingId)} · {i.category}</p><p>{i.description}</p><small>{i.id} · {fmt(i.time)}</small></div><div className="record-controls">{i.status!=="Closed"&&<select aria-label={`Update status ${i.id}`} value={i.status} onChange={(e)=>updateStatus("incidents",i.id,e.target.value)}><option>Open</option><option>In review</option><option>Closed</option></select>}</div></div>)}</div>
          {filteredIncidents.length===0&&<div className="empty-state">No matching incidents.</div>}</section></div>}

        {page === "Maintenance" && <div className="page-stack"><section className="panel"><SectionHeading eyebrow="FACILITIES MANAGEMENT" title="Maintenance requests" subtitle="Track a repair from reporting through completion." action={<button className="button primary" onClick={()=>setModal("maintenance")}><Plus size={16}/> New request</button>} />
          <div className="inline-filters"><label>Status <select value={maintenanceFilter} onChange={(e)=>setMaintenanceFilter(e.target.value)}><option>All</option><option>Pending</option><option>In progress</option><option>Completed</option></select></label></div>
          <div className="record-list">{filteredMaintenance.map((m)=><div className="incident-row" key={m.id}><div className="record-icon green"><Wrench size={18}/></div><div className="record-main"><div className="record-title-line"><strong>{m.title}</strong><StatusPill>{m.priority}</StatusPill><StatusPill>{m.status}</StatusPill></div><p>{buildingName(m.buildingId)} · {m.category}</p><p>{m.description}</p>{m.photoName&&<small><Camera size={13}/> Photo attached: {m.photoName} (name only in demo)</small>}<small>{m.id} · {fmt(m.time)}</small></div><div className="record-controls">{m.status!=="Completed"&&<select aria-label={`Update maintenance ${m.id}`} value={m.status} onChange={(e)=>updateStatus("maintenance",m.id,e.target.value)}><option>Pending</option><option>In progress</option><option>Completed</option></select>}</div></div>)}</div>
          {filteredMaintenance.length===0&&<div className="empty-state">No matching maintenance requests.</div>}</section></div>}

        {page === "Visitors & Access" && <div className="page-stack"><div className="two-column"><section className="panel"><SectionHeading eyebrow="FRONT DESK" title="Visitor log" subtitle="Use fictional demo details only." action={<button className="button primary" onClick={()=>setModal("visitor")}><Plus size={16}/> Check in</button>} />
          <div className="record-list">{filteredVisitors.map((v)=><div className="visitor-row" key={v.id}><div className="avatar visitor-avatar">{v.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</div><div className="record-main"><strong>{v.name}</strong><p>{v.organization||"No organization"} · {buildingName(v.buildingId)}</p><small>{v.purpose} · In: {fmt(v.checkIn)}</small>{v.checkOut&&<small>Out: {fmt(v.checkOut)}</small>}</div>{v.checkOut?<StatusPill>Checked out</StatusPill>:<button className="button secondary small" onClick={()=>checkOutVisitor(v)}><LogOut size={14}/> Check out</button>}</div>)}</div>
          {filteredVisitors.length===0&&<div className="empty-state">No visitor records found.</div>}</section>
          <section className="panel"><SectionHeading eyebrow="SECURITY AUDIT" title="Access event log" subtitle="Sample events for review." /><div className="record-list">{filteredLogs.slice(0,12).map((l)=><div className="record-row" key={l.id}><div className="record-icon purple"><ShieldAlert size={17}/></div><div className="record-main"><strong>{l.event}</strong><p>{buildingName(l.buildingId)} · {l.zone}</p><small>{fmt(l.time)}</small></div></div>)}</div></section></div></div>}

        {page === "Sensor Simulator" && <div className="page-stack">
          <div className="info-banner"><RadioTower size={20}/><div><strong>Software-only IoT demonstration</strong><p>Use the controls to generate sample telemetry and events. This does not connect to a real sensor, camera, or emergency service.</p></div></div>
          <div className="two-column"><section className="panel"><SectionHeading eyebrow="TELEMETRY TEST" title="Simulate a sensor reading" subtitle="Readings are saved to this browser demo and shown in Safety & Alerts." />
            <form className="form-stack" onSubmit={(e)=>{e.preventDefault();generateSensorEvent();}}>
              <label>Building<select value={sensorBuilding} onChange={(e)=>setSensorBuilding(e.target.value)}>{BUILDINGS.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
              <label>Area / zone<input value={sensorArea} onChange={(e)=>setSensorArea(e.target.value)} placeholder="e.g. Second-floor corridor"/></label>
              <label>Measurement<select value={sensorType} onChange={(e)=>setSensorType(e.target.value)}><option>Temperature</option><option>Humidity</option><option>Equipment status</option></select></label>
              <label>Simulated reading <strong className="range-value">{sensorValue}{sensorType==="Temperature"?"°C":sensorType==="Humidity"?"%":" units"}</strong><input type="range" min={sensorType==="Temperature"?10:0} max={sensorType==="Temperature"?60:100} value={sensorValue} onChange={(e)=>setSensorValue(Number(e.target.value))}/></label>
              <label>Demo alert threshold<input type="number" value={sensorThreshold} onChange={(e)=>setSensorThreshold(Number(e.target.value))}/></label>
              <button className="button primary full" type="submit"><Activity size={16}/> Record simulated reading</button>
            </form>
          </section>
          <section className="panel"><SectionHeading eyebrow="SECURITY EVENT" title="Restricted-zone simulation" subtitle="Creates a demo alert and access log entry." />
            <div className="form-stack">
              <label>Building<select value={sensorBuilding} onChange={(e)=>setSensorBuilding(e.target.value)}>{BUILDINGS.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
              <label>Restricted area<input value={sensorArea} onChange={(e)=>setSensorArea(e.target.value)} placeholder="e.g. Equipment room"/></label>
              <button className="button secondary full" onClick={generateRestrictedEvent}><ShieldAlert size={16}/> Generate restricted-zone event</button>
              <div className="privacy-card"><ShieldCheck size={19}/><div><strong>Privacy note</strong><p>This only creates a test event. It does not detect people, access CCTV, or identify anyone.</p></div></div>
            </div>
          </section></div>
          <section className="panel"><SectionHeading eyebrow="LATEST TELEMETRY" title="Recent simulated readings" /><div className="responsive-table"><table><thead><tr><th>Building</th><th>Area</th><th>Type</th><th>Reading</th><th>Threshold</th><th>Time</th></tr></thead><tbody>{data.readings.filter(matchesBuilding).slice(0,10).map((r)=><tr key={r.id}><td>{buildingName(r.buildingId)}</td><td>{r.area}</td><td>{r.type}</td><td className={r.value>r.threshold?"danger-text":""}>{r.value}{r.unit}</td><td>{r.threshold}{r.unit}</td><td>{fmt(r.time)}</td></tr>)}</tbody></table></div></section>
        </div>}

        {page === "History & Insights" && <div className="page-stack">
          <div className="stat-grid"><StatCard icon={Activity} label="Readings recorded" value={data.readings.length} note="Stored in this browser" tone="blue"/><StatCard icon={ShieldAlert} label="Security events" value={data.accessLogs.length} note="Visitor and demo access logs" tone="purple"/><StatCard icon={Wrench} label="Completed repairs" value={data.maintenance.filter(m=>m.status==="Completed").length} note="Marked completed in demo" tone="green"/><StatCard icon={Clock3} label="Open SOS / incidents" value={data.incidents.filter(i=>i.status!=="Closed").length} note="Awaiting closure" tone="orange"/></div>
          <div className="two-column"><section className="panel"><SectionHeading eyebrow="REPEAT ISSUE REVIEW" title="Maintenance by category" subtitle="Counts from the current demo records." />{["Electrical","Structural","Equipment","Plumbing","Other"].map((category)=>{const count=data.maintenance.filter(m=>m.category===category).length;const max=Math.max(1,...["Electrical","Structural","Equipment","Plumbing","Other"].map(c=>data.maintenance.filter(m=>m.category===c).length));return <div className="bar-row" key={category}><div><span>{category}</span><strong>{count}</strong></div><div className="bar-track"><div className="bar-fill" style={{width:`${count/max*100}%`}}/></div></div>})}<p className="footnote">This is a simple count of demo records, not a predictive risk model.</p></section>
          <section className="panel"><SectionHeading eyebrow="EVENT HISTORY" title="Recent activity" subtitle="Latest sensor, incident and maintenance actions." /><div className="timeline">{recentActivity.map((a)=><div className="timeline-item" key={a.id}><span className="timeline-dot"/><div><p>{a.text}</p><small>{fmt(a.time)}</small></div></div>)}</div></section></div>
          <section className="panel"><SectionHeading eyebrow="DATA CONTROL" title="Demo data management" subtitle="Records are saved in localStorage in this browser only." action={<button className="button secondary" onClick={()=>{if(window.confirm("Reset all CampusShield demo records to the original sample data?")){setData(seed);setToast("Demo data reset.");}}}><History size={15}/> Reset demo data</button>} /><div className="privacy-card"><HardDrive size={20}/><div><strong>Local browser storage</strong><p>Other devices do not share this data. Clearing browser storage can remove it. Do not store real personal, security-sensitive, or emergency information here.</p></div></div></section>
        </div>}
      </div>
      <footer className="footer"><span>CampusShield prototype · TechTrix’26</span><span><span className="pulse-dot"/> Simulated data only</span></footer>
    </main>

    {modal && <div className="modal-backdrop" onClick={()=>setModal("")}><div className="modal" onClick={(e)=>e.stopPropagation()}>
      <div className="modal-header"><div><p className="eyebrow">CAMPUSSHIELD DEMO</p><h2>{modal==="sos"?"Report an SOS incident":modal==="maintenance"?"Create maintenance request":"Visitor check-in"}</h2></div><button className="icon-button" onClick={()=>setModal("")}><X size={19}/></button></div>
      {modal==="sos"&&<form className="form-stack" onSubmit={submitSos}><div className="warning-note"><Siren size={18}/><span>Demo only: this does not contact emergency services or share live location. For a real emergency, use the appropriate local emergency service.</span></div><label>Building<select value={sosBuilding} onChange={(e)=>setSosBuilding(e.target.value)}>{BUILDINGS.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label><label>Area / location<input value={sosArea} onChange={(e)=>setSosArea(e.target.value)} placeholder="e.g. ground-floor corridor"/></label><label>Describe the demo incident<textarea value={sosDescription} onChange={(e)=>setSosDescription(e.target.value)} placeholder="Use fictional test details" required rows={3}/></label><button className="button primary full" type="submit"><Siren size={16}/> Create demo SOS record</button></form>}
      {modal==="maintenance"&&<form className="form-stack" onSubmit={submitMaintenance}><label>Building<select value={maintenanceForm.buildingId} onChange={(e)=>setMaintenanceForm({...maintenanceForm,buildingId:e.target.value})}>{BUILDINGS.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label><label>Issue title<input value={maintenanceForm.title} onChange={(e)=>setMaintenanceForm({...maintenanceForm,title:e.target.value})} placeholder="e.g. Corridor light fault" required/></label><div className="form-two"><label>Category<select value={maintenanceForm.category} onChange={(e)=>setMaintenanceForm({...maintenanceForm,category:e.target.value})}><option>Electrical</option><option>Structural</option><option>Equipment</option><option>Plumbing</option><option>Other</option></select></label><label>Priority<select value={maintenanceForm.priority} onChange={(e)=>setMaintenanceForm({...maintenanceForm,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label></div><label>Description<textarea rows={3} value={maintenanceForm.description} onChange={(e)=>setMaintenanceForm({...maintenanceForm,description:e.target.value})} placeholder="Describe the sample issue"/></label><label>Inspection photo (optional)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e)=>{const f=e.target.files?.[0];if(f&&f.size>3*1024*1024){setToast("Choose an image smaller than 3 MB.");e.target.value="";return;}setMaintenanceForm({...maintenanceForm,photoName:f?f.name:""});}}/><small className="field-help">Prototype stores the filename only, not the image bytes. Secure image upload needs backend storage.</small></label><button className="button primary full" type="submit"><Plus size={16}/> Create request</button></form>}
      {modal==="visitor"&&<form className="form-stack" onSubmit={submitVisitor}><label>Visitor display name<input value={visitorForm.name} onChange={(e)=>setVisitorForm({...visitorForm,name:e.target.value})} placeholder="Use a fictional name" required/></label><label>Organization<input value={visitorForm.organization} onChange={(e)=>setVisitorForm({...visitorForm,organization:e.target.value})} placeholder="Optional"/></label><label>Destination building<select value={visitorForm.buildingId} onChange={(e)=>setVisitorForm({...visitorForm,buildingId:e.target.value})}>{BUILDINGS.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label><label>Purpose<select value={visitorForm.purpose} onChange={(e)=>setVisitorForm({...visitorForm,purpose:e.target.value})}><option>Meeting</option><option>Maintenance visit</option><option>Event</option><option>Other</option></select></label><div className="warning-note"><ShieldCheck size={17}/><span>Use fictional information in this public prototype.</span></div><button className="button primary full" type="submit"><Check size={16}/> Record check-in</button></form>}
    </div></div>}
    {toast&&<div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
  </div>;
}
