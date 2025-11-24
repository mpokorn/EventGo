import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";
import { FiUser, FiList, FiClock, FiCalendar, FiCreditCard, FiX } from "react-icons/fi";

export default function DashboardSidebar({ section, setSection, isOpen, onClose }) {
  const { user } = useAuth();

  // FIX: If user is null, don't render organizer section
  const isOrganizer = user?.role === "organizer";

  return (
    <div className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">My Profile</div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
          <FiX />
        </button>
      </div>

      <div className="sidebar-menu">
        <div
          className={`sidebar-item ${section === "profile" ? "active" : ""}`}
          onClick={() => setSection("profile")}
        >
          <FiUser /> Profile
        </div>

        <div
          className={`sidebar-item ${section === "tickets" ? "active" : ""}`}
          onClick={() => setSection("tickets")}
        >
          <FiList /> Tickets
        </div>

        <div
          className={`sidebar-item ${section === "waitlist" ? "active" : ""}`}
          onClick={() => setSection("waitlist")}
        >
          <FiClock /> Waitlist
        </div>

        <div
          className={`sidebar-item ${section === "events" ? "active" : ""}`}
          onClick={() => setSection("events")}
        >
          <FiCalendar /> My Events
        </div>

        <div
          className={`sidebar-item ${section === "transactions" ? "active" : ""}`}
          onClick={() => setSection("transactions")}
        >
          <FiCreditCard /> Transactions
        </div>
      </div>
    </div>
  );
}
