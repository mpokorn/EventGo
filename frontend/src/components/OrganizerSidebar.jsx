import { Link, useLocation } from "react-router-dom";

import "../styles/dashboard.css";
import "../styles/organizer.css";

export default function OrganizerSidebar() {
  const { pathname } = useLocation();

  const isActive = (path) =>
    pathname === path ? "sidebar-item active" : "sidebar-item";

  return (
    <aside className="dashboard-sidebar organizer-sidebar-bg"> 
      <h2 className="sidebar-title">Organizer Panel</h2>

      <div className="sidebar-menu">
        <Link className={isActive("/organizer/events")} to="/organizer/events">My Events</Link>
        <Link className={isActive("/organizer/events/create")} to="/organizer/events/create">Create Event</Link>
      </div>
    </aside>
  );
}
