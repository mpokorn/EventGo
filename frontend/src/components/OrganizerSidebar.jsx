import { Link, useLocation } from "react-router-dom";
import { FiX } from "react-icons/fi";

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
          <FiX />
        </button>
      </div>

      <div className="sidebar-menu">
        <Link className={isActive("/organizer/events")} to="/organizer/events" onClick={handleLinkClick}>My Events</Link>
        <Link className={isActive("/organizer/events/create")} to="/organizer/events/create" onClick={handleLinkClick}>Create Event</Link>
      </div>
    </aside>
  );
}
