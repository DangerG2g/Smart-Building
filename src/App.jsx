import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Bell, Building2, Check, ChevronDown, ClipboardList,
  Clock3, DoorOpen, LayoutDashboard, MapPin, Menu, Plus, Shield, ShieldAlert,
  Siren, Thermometer, Users, Wrench, X, Zap, Search, Filter, CheckCircle2,
  CircleAlert, Radio, LogOut, Settings, Eye, Flame, Droplets
} from "lucide-react";

const seedBuildings = [
  { id: "BLD-01", name: "Academic Block A", location: "North Campus", temperature: 27, air: 42, status: "Normal" },
  { id: "BLD-02", name: "Science Laboratory", location: "East Campus", temperature: 31, air: 58, status: "Warning" },
  { id: "BLD-03", name: "Central Library", location: "Main Campus", temperature: 25, air: 35, status: "Normal" }
];
const seedAlerts = [
  { id: 1001, title: "Temperature above configured threshold", building: "Science Laboratory", severity: "High", time: "Just now", status: "Open", type: "Sensor" },
  { id: 1002, title: "Restricted-area event detected (simulation)", building: "Academic Block A", severity: "Medium", time: "12 min ago", status: "Acknowledged", type: "Security" },
  { id: 1003, title: "Routine equipment inspection due", building: "Central Library", severity: "Low", time: "35 min ago", status: "Open", type: "Maintenance" }
];
const seedRequests = [
  { id: "MR-201", title: "Ceiling fan not working", building: "Academic Block A", category: "Electrical", priority: "Medium", status: "In Progress", reporter: "Demo Student", created: "Today, 09:20" },
  { id: "MR-202", title: "Water leak near washroom", building: "Science Laboratory", category: "Plumbing", priority: "High", status: "Pending", reporter: "Demo Staff", created: "Today, 10:05" }
];
const seedVisitors = [
  { id: "VIS-301", name: "Aarav Sharma", purpose: "Meeting", host: "Admin Office", building: "Academic Block A", entry: "09:10", status: "Inside" },
  { id: "VIS-302", name: "Neha Verma", purpose: "Delivery", host: "Reception", building: "Central Library", entry: "10:25", status: "Checked out" }
];
const initialIncidents = [
  { id: "INC-401", title: "Safety drill record (demo)", category: "Safety", severity: "Low", building: "Academic Block A", status: "Closed", created: "Today, 08:30", details: "Demonstration record only." }
];
const readStore = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const saveStore = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
const navItems = [
  ["Overview", LayoutDashboard], ["Monitoring", Activity], ["Alerts", Bell],
  ["Incidents & SOS", Siren], ["Maintenance", Wrench], ["Visitors", Users]
];
const timeNow = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function Status({ children }) {
  const value = String(children || "Open").toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${value}`}>{children}</span>;
}
function Severity({ children }) {
  return <span className={`severity severity-${String(children).toLowerCase()}`}><span />{children}</span>;
}
function Metric({ label, value, note, icon: Icon, tone = "blue" }) {
  return <div className="metric card">
    <div className={`metric-icon ${tone}`}><Icon size={19}/></div>
    <div className="metric-label">{label}</div>
    <div className="metric-value">{value}</div>
    <div className="metric-note">{note}</div>
  </div>;
}
function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="modal card">
      <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18}/></button></div>
      {children}
    </section>
  </div>;
}

export default function App() {
  const [page, setPage] = useState("Overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [role, setRole] = useState("Administrator");
  const [buildings, setBuildings] = useState(() => readStore("sb_buildings", seedBuildings));
  const [alerts, setAlerts] = useState(() => readStore("sb_alerts", seedAlerts));
  const [requests, setRequests] = useState(() => readStore("sb_requests", seedRequests));
  const [visitors, setVisitors] = useState(() => readStore("sb_visitors", seedVisitors));
  const [incidents, setIncidents] = useState(() => readStore("sb_incidents", initialIncidents));
  const [modal, setModal] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [simActive, setSimActive] = useState(false);

  useEffect(() => saveStore("sb_buildings", buildings), [buildings]);
  useEffect(() => saveStore("sb_alerts", alerts), [alerts]);
  useEffect(() => saveStore("sb_requests", requests), [requests]);
  useEffect(() => saveStore("sb_visitors", visitors), [visitors]);
  useEffect(() => saveStore("sb_incidents", incidents), [incidents]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const openAlerts = alerts.filter(a => a.status === "Open").length;
  const openRequests = requests.filter(r => r.status !== "Resolved").length;
  const activeIncidents = incidents.filter(i => i.status !== "Closed").length;
  const filteredAlerts = useMemo(() => alerts.filter(a =>
    `${a.title} ${a.building} ${a.type} ${a.severity}`.toLowerCase().includes(search.toLowerCase())
  ), [alerts, search]);
  const filteredRequests = useMemo(() => requests.filter(r =>
    `${r.title} ${r.building} ${r.category} ${r.status}`.toLowerCase().includes(search.toLowerCase())
  ), [requests, search]);

  function triggerSensorAlert() {
    const building = buildings[1] || buildings[0];
    const id = Date.now();
    const nextAlert = { id, title: "Simulated temperature threshold exceeded", building: building.name, severity: "High", time: timeNow(), status: "Open", type: "Sensor" };
    setAlerts(prev => [nextAlert, ...prev]);
    setBuildings(prev => prev.map(b => b.id === building.id ? { ...b, temperature: 38, status: "Warning" } : b));
    setSimActive(true);
    setNotice("Simulated sensor alert created.");
  }
  function resetSimulation() {
    setBuildings(seedBuildings);
    setAlerts(seedAlerts);
    setSimActive(false);
    setNotice("Demo sensor values reset.");
  }
  function acknowledgeAlert(id) {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Acknowledged" } : a));
    setNotice("Alert acknowledged.");
  }
  function submitSOS(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || "Emergency SOS").trim();
    const building = String(fd.get("building") || "Academic Block A");
    const details = String(fd.get("details") || "SOS raised from prototype").trim();
    const id = `INC-${Date.now().toString().slice(-6)}`;
    setIncidents(prev => [{ id, title, category: "SOS / Emergency", severity: "High", building, status: "Open", created: timeNow(), details }, ...prev]);
    setAlerts(prev => [{ id: Date.now(), title: `SOS: ${title}`, building, severity: "High", time: timeNow(), status: "Open", type: "Emergency" }, ...prev]);
    setModal("");
    setPage("Incidents & SOS");
    setNotice("SOS recorded in the demo system. No real emergency service was contacted.");
  }
  function submitMaintenance(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = `MR-${Date.now().toString().slice(-6)}`;
    setRequests(prev => [{
      id, title: String(fd.get("title")).trim(), building: String(fd.get("building")),
      category: String(fd.get("category")), priority: String(fd.get("priority")),
      status: "Pending", reporter: "Demo User", created: timeNow()
    }, ...prev]);
    setModal("");
    setPage("Maintenance");
    setNotice("Maintenance request saved on this browser.");
  }
  function submitVisitor(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = `VIS-${Date.now().toString().slice(-6)}`;
    setVisitors(prev => [{
      id, name: String(fd.get("name")).trim(), purpose: String(fd.get("purpose")),
      host: String(fd.get("host")).trim(), building: String(fd.get("building")),
      entry: timeNow(), status: "Inside"
    }, ...prev]);
    setModal("");
    setPage("Visitors");
    setNotice("Demo visitor entry recorded.");
  }
  function updateRequest(id, status) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setNotice(`Request updated: ${status}.`);
  }
  function checkoutVisitor(id) {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: "Checked out" } : v));
    setNotice("Visitor checked out.");
  }
  function closeIncident(id) {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: "Closed" } : i));
    setNotice("Incident marked closed.");
  }

  const titleMap = {
    "Overview": "Building overview", "Monitoring": "Live monitoring",
    "Alerts": "Alert centre", "Incidents & SOS": "Incidents & emergency SOS",
    "Maintenance": "Maintenance requests", "Visitors": "Visitor management"
  };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Shield size={22}/></div><div><strong>sentinel<span>.</span></strong><small>SMART BUILDING PLATFORM</small></div><button className="icon-btn mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="building-select"><Building2 size={16}/><span>North Campus</span><ChevronDown size={15}/></div>
      <div className="nav-label">MAIN MENU</div>
      <nav className="nav-list">
        {navItems.map(([name, Icon]) => <button key={name} className={`nav-item ${page === name ? "active" : ""}`} onClick={() => { setPage(name); setMobileNav(false); setSearch(""); }}>
          <Icon size={18}/><span>{name}</span>
          {name === "Alerts" && openAlerts > 0 && <b className="nav-count">{openAlerts}</b>}
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="system-status"><span className="pulse-dot"/><div><b>All systems operational</b><small>Demo environment</small></div></div>
        <div className="profile"><div className="avatar">AD</div><div className="profile-info"><b>Alex Morgan</b><small>{role}</small></div><Settings size={17} className="profile-settings"/></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20}/></button>
        <div className="breadcrumbs">Workspace <span>/</span> <b>{page}</b></div>
        <div className="top-actions">
          <div className="demo-pill"><span className="pulse-dot"/> SIMULATION MODE</div>
          <button className="icon-btn notification-btn" onClick={() => setPage("Alerts")} aria-label="Open alerts"><Bell size={19}/>{openAlerts > 0 && <i/>}</button>
          <div className="top-avatar">AM</div>
        </div>
      </header>

      <div className="content">
        <div className="page-heading">
          <div><div className="eyebrow">NORTH CAMPUS <span>•</span> THURSDAY, 22 OCTOBER</div><h1>{titleMap[page]}</h1><p>Monitor safety, respond to incidents, and keep your campus running smoothly.</p></div>
          <div className="heading-actions">
            <label className="role-select"><Shield size={15}/><select value={role} onChange={e => setRole(e.target.value)} aria-label="Demo role"><option>Administrator</option><option>Security Staff</option><option>Maintenance Staff</option><option>Student / Staff</option></select></label>
            <button className="btn btn-danger" onClick={() => setModal("sos")}><Siren size={16}/> Emergency SOS</button>
          </div>
        </div>

        {page === "Overview" && <>
          <div className="welcome-banner"><div className="welcome-icon"><ShieldCheckIcon/></div><div className="welcome-text"><h2>Your campus at a glance</h2><p>Building monitoring and incident management in one place.</p></div><div className="banner-right"><span className="live-dot"/> DEMO SYSTEM ACTIVE</div></div>
          <div className="metric-grid">
            <Metric label="Buildings monitored" value={buildings.length} note="Across North Campus" icon={Building2} tone="blue"/>
            <Metric label="Open alerts" value={openAlerts} note="Require attention" icon={Bell} tone="orange"/>
            <Metric label="Active incidents" value={activeIncidents} note="Not yet closed" icon={ShieldAlert} tone="red"/>
            <Metric label="Maintenance tasks" value={openRequests} note="Awaiting resolution" icon={Wrench} tone="purple"/>
          </div>
          <div className="section-grid">
            <section className="card section-card">
              <div className="section-head"><div><h2>Building status</h2><p>Simulated environmental readings</p></div><button className="text-btn" onClick={() => setPage("Monitoring")}>View monitoring <span>→</span></button></div>
              <div className="building-list">
                {buildings.map(b => <div className="building-row" key={b.id}><div className="building-symbol"><Building2 size={19}/></div><div className="building-info"><b>{b.name}</b><small><MapPin size={12}/>{b.location}</small></div><div className="building-reading"><Thermometer size={14}/><b>{b.temperature}°C</b><small>Temp.</small></div><div className="building-reading air"><Activity size={14}/><b>{b.air}</b><small>Air index*</small></div><Status>{b.status}</Status></div>)}
              </div>
              <p className="fine-print">*Air index is an illustrative demo value, not a certified air-quality measurement.</p>
            </section>
            <section className="card section-card">
              <div className="section-head"><div><h2>Recent alerts</h2><p>Latest system events</p></div><button className="text-btn" onClick={() => setPage("Alerts")}>All alerts <span>→</span></button></div>
              <div className="alert-list">
                {alerts.slice(0, 4).map(a => <div className="alert-row" key={a.id}><div className={`alert-symbol ${a.severity.toLowerCase()}`}>{a.type === "Sensor" ? <Thermometer size={17}/> : a.type === "Security" ? <ShieldAlert size={17}/> : <AlertTriangle size={17}/>}</div><div className="alert-info"><b>{a.title}</b><small>{a.building} · {a.time}</small></div><Severity>{a.severity}</Severity></div>)}
              </div>
            </section>
          </div>
          <section className="card section-card activity-card">
            <div className="section-head"><div><h2>Quick actions</h2><p>Try the prototype workflows</p></div></div>
            <div className="quick-actions">
              <button className="quick-action" onClick={() => setModal("sos")}><span className="qa-icon red"><Siren size={20}/></span><b>Raise emergency SOS</b><small>Create a demo incident</small><span className="qa-arrow">↗</span></button>
              <button className="quick-action" onClick={() => setModal("maintenance")}><span className="qa-icon purple"><Wrench size={20}/></span><b>Report a maintenance issue</b><small>Submit a repair request</small><span className="qa-arrow">↗</span></button>
              <button className="quick-action" onClick={() => setModal("visitor")}><span className="qa-icon blue"><Users size={20}/></span><b>Register a visitor</b><small>Log a campus entry</small><span className="qa-arrow">↗</span></button>
              <button className="quick-action" onClick={triggerSensorAlert}><span className="qa-icon orange"><Activity size={20}/></span><b>Simulate sensor alert</b><small>Test the alert workflow</small><span className="qa-arrow">↗</span></button>
            </div>
          </section>
        </>}

        {page === "Monitoring" && <section className="card section-card">
          <div className="section-head"><div><h2>Building sensor simulation</h2><p>All readings on this page are generated for demonstration only.</p></div><div className="inline-actions"><button className="btn btn-secondary" onClick={resetSimulation}>Reset demo</button><button className="btn btn-primary" onClick={triggerSensorAlert}><Zap size={15}/> Simulate threshold breach</button></div></div>
          <div className="monitor-grid">{buildings.map(b => <div className="monitor-card" key={b.id}><div className="monitor-card-head"><div className="building-symbol"><Building2 size={19}/></div><Status>{b.status}</Status></div><h3>{b.name}</h3><p>{b.id} · {b.location}</p><div className="sensor-metrics"><div><Thermometer size={18}/><span>Temperature</span><b>{b.temperature}°C</b><small>Demo threshold: 30°C</small></div><div><Activity size={18}/><span>Air index*</span><b>{b.air}</b><small>Illustrative value</small></div></div><div className="meter"><span style={{width:`${Math.min(b.temperature/45*100,100)}%`, background:b.temperature > 30 ? "#e58a32" : "#1b9a79"}}/></div>{b.temperature > 30 && <div className="warning-note"><AlertTriangle size={14}/> Configured temperature threshold exceeded</div>}</div>)}</div>
          <div className="info-callout"><CircleAlert size={18}/><div><b>Prototype limitation</b><p>These values do not come from physical sensors. This simulation cannot detect actual fires, intrusions, structural damage, or unsafe air.</p></div></div>
        </section>}

        {page === "Alerts" && <section className="card section-card">
          <div className="section-head"><div><h2>Alerts and notifications</h2><p>Review and acknowledge system events.</p></div><div className="table-tools"><div className="search-box"><Search size={15}/><input placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)}/></div></div></div>
          <div className="table-wrap"><table><thead><tr><th>Alert</th><th>Building</th><th>Type</th><th>Severity</th><th>Time</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {filteredAlerts.map(a => <tr key={a.id}><td><b>{a.title}</b></td><td>{a.building}</td><td>{a.type}</td><td><Severity>{a.severity}</Severity></td><td>{a.time}</td><td><Status>{a.status}</Status></td><td>{a.status === "Open" ? <button className="small-btn" onClick={() => acknowledgeAlert(a.id)}><Check size={14}/> Acknowledge</button> : <span className="muted">—</span>}</td></tr>)}
          </tbody></table>{filteredAlerts.length === 0 && <div className="empty-state">No matching alerts found.</div>}</div>
        </section>}

        {page === "Incidents & SOS" && <section className="card section-card">
          <div className="section-head"><div><h2>Incident register</h2><p>SOS requests and incident history for the demo.</p></div><button className="btn btn-danger" onClick={() => setModal("sos")}><Siren size={15}/> Raise SOS</button></div>
          <div className="incident-banner"><Siren size={20}/><div><b>Emergency workflow is simulated</b><p>Submitting SOS creates an in-app record only. It does not contact emergency services or transmit live location.</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>Incident ID</th><th>Incident</th><th>Building</th><th>Severity</th><th>Created</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {incidents.map(i => <tr key={i.id}><td><span className="id-text">{i.id}</span></td><td><b>{i.title}</b><small className="cell-sub">{i.details}</small></td><td>{i.building}</td><td><Severity>{i.severity}</Severity></td><td>{i.created}</td><td><Status>{i.status}</Status></td><td>{i.status !== "Closed" ? <button className="small-btn" onClick={() => closeIncident(i.id)}><Check size={14}/> Close</button> : <span className="muted">—</span>}</td></tr>)}
          </tbody></table></div>
        </section>}

        {page === "Maintenance" && <section className="card section-card">
          <div className="section-head"><div><h2>Maintenance requests</h2><p>Report faults and track repairs to completion.</p></div><button className="btn btn-primary" onClick={() => setModal("maintenance")}><Plus size={16}/> New request</button></div>
          <div className="mini-summary"><span><b>{requests.length}</b> total requests</span><span><b>{requests.filter(r => r.status === "Pending").length}</b> pending</span><span><b>{requests.filter(r => r.status === "In Progress").length}</b> in progress</span><span><b>{requests.filter(r => r.status === "Resolved").length}</b> resolved</span></div>
          <div className="table-tools"><div className="search-box"><Search size={15}/><input placeholder="Search maintenance..." value={search} onChange={e => setSearch(e.target.value)}/></div></div>
          <div className="table-wrap"><table><thead><tr><th>Request</th><th>Building</th><th>Category</th><th>Priority</th><th>Reporter</th><th>Status</th><th>Update</th></tr></thead><tbody>
            {filteredRequests.map(r => <tr key={r.id}><td><span className="id-text">{r.id}</span><b className="cell-title">{r.title}</b><small className="cell-sub">{r.created}</small></td><td>{r.building}</td><td>{r.category}</td><td><Severity>{r.priority}</Severity></td><td>{r.reporter}</td><td><Status>{r.status}</Status></td><td><select className="status-select" value={r.status} onChange={e => updateRequest(r.id, e.target.value)}><option>Pending</option><option>In Progress</option><option>Resolved</option></select></td></tr>)}
          </tbody></table>{filteredRequests.length === 0 && <div className="empty-state">No matching requests found.</div>}</div>
        </section>}

        {page === "Visitors" && <section className="card section-card">
          <div className="section-head"><div><h2>Visitor register</h2><p>Demo entry and exit records. Use fictional visitor details.</p></div><button className="btn btn-primary" onClick={() => setModal("visitor")}><Plus size={16}/> Register visitor</button></div>
          <div className="info-callout"><Shield size={18}/><div><b>Privacy note</b><p>Only collect necessary visitor information. Restrict this register to authorized staff and follow your institution's retention policy.</p></div></div>
          <div className="table-wrap"><table><thead><tr><th>Visitor ID</th><th>Name</th><th>Purpose</th><th>Host</th><th>Building</th><th>Entry</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {visitors.map(v => <tr key={v.id}><td><span className="id-text">{v.id}</span></td><td><b>{v.name}</b></td><td>{v.purpose}</td><td>{v.host}</td><td>{v.building}</td><td>{v.entry}</td><td><Status>{v.status}</Status></td><td>{v.status === "Inside" ? <button className="small-btn" onClick={() => checkoutVisitor(v.id)}>Check out</button> : <span className="muted">—</span>}</td></tr>)}
          </tbody></table></div>
        </section>}

        <footer className="footer"><span>© 2026 Sentinel · TechTrix’26 prototype</span><span><span className="pulse-dot"/> Simulation data only</span></footer>
      </div>
    </main>

    {modal === "sos" && <Modal title="Raise emergency SOS" onClose={() => setModal("")}><form className="form" onSubmit={submitSOS}>
      <div className="form-alert"><Siren size={18}/><span>This creates a demo record only. It will not contact real emergency services.</span></div>
      <label>Incident title<input name="title" required defaultValue="Emergency assistance requested" placeholder="Describe the emergency"/></label>
      <label>Building<select name="building" defaultValue="Academic Block A">{buildings.map(b => <option key={b.id}>{b.name}</option>)}</select></label>
      <label>Additional details<textarea name="details" rows="3" placeholder="Add a short description..."/></label>
      <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setModal("")}>Cancel</button><button className="btn btn-danger"><Siren size={15}/> Create SOS record</button></div>
    </form></Modal>}
    {modal === "maintenance" && <Modal title="New maintenance request" onClose={() => setModal("")}><form className="form" onSubmit={submitMaintenance}>
      <label>Issue title<input name="title" required placeholder="e.g. Light not working"/></label>
      <label>Building<select name="building" defaultValue="Academic Block A">{buildings.map(b => <option key={b.id}>{b.name}</option>)}</select></label>
      <div className="form-row"><label>Category<select name="category"><option>Electrical</option><option>Plumbing</option><option>Equipment</option><option>Cleaning</option><option>Other</option></select></label><label>Priority<select name="priority"><option>Low</option><option selected>Medium</option><option>High</option></select></label></div>
      <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setModal("")}>Cancel</button><button className="btn btn-primary"><Plus size={15}/> Submit request</button></div>
    </form></Modal>}
    {modal === "visitor" && <Modal title="Register visitor" onClose={() => setModal("")}><form className="form" onSubmit={submitVisitor}>
      <label>Visitor name<input name="name" required placeholder="Use fictional demo details"/></label>
      <div className="form-row"><label>Purpose<select name="purpose"><option>Meeting</option><option>Delivery</option><option>Maintenance</option><option>Other</option></select></label><label>Building<select name="building">{buildings.map(b => <option key={b.id}>{b.name}</option>)}</select></label></div>
      <label>Host / department<input name="host" required placeholder="e.g. Reception"/></label>
      <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setModal("")}>Cancel</button><button className="btn btn-primary"><Plus size={15}/> Save visitor</button></div>
    </form></Modal>}

    {notice && <div className="toast"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={() => setNotice("")}><X size={15}/></button></div>}
  </div>;
}
function ShieldCheckIcon() { return <Shield size={25}/>; }
