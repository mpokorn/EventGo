import { Link, useLocation } from "react-router-dom";
import { Calendar, PlusCircle, X } from "lucide-react";

import "../styles/dashboard.css";
import "../styles/organizer.css";

export default function OrganizerSidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();

  const isActive = (path) =>
    pathname === path ? "sidebar-item active" : "sidebar-item";

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`dashboard-sidebar organizer-sidebar-bg ${isOpen ? 'open' : ''}`}> 
      <div className="sidebar-header">
        <h2 className="sidebar-title">Organizer Panel</h2>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <div className="sidebar-menu">
        <Link className={isActive("/organizer/events")} to="/organizer/events" onClick={handleLinkClick}>
          <Calendar size={20} /> My Events
        </Link>
        <Link className={isActive("/organizer/events/create")} to="/organizer/events/create" onClick={handleLinkClick}>
          <PlusCircle size={20} /> Create Event
        </Link>
      </div>
    </aside>
  );
}
