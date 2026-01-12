import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";
import { User, List, Clock, Calendar, CreditCard, X } from "lucide-react";

export default function DashboardSidebar({ section, setSection, isOpen, onClose }) {
  const { user } = useAuth();

  // FIX: If user is null, don't render organizer section
  const isOrganizer = user?.role === "organizer";

  return (
    <div className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">My Profile</div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <div className="sidebar-menu">
        <div
          className={`sidebar-item ${section === "profile" ? "active" : ""}`}
          onClick={() => setSection("profile")}
        >
          <User size={18} /> Profile
        </div>

        <div
          className={`sidebar-item ${section === "tickets" ? "active" : ""}`}
          onClick={() => setSection("tickets")}
        >
          <List size={18} /> Tickets
        </div>

        <div
          className={`sidebar-item ${section === "waitlist" ? "active" : ""}`}
          onClick={() => setSection("waitlist")}
        >
          <Clock size={18} /> Waitlist
        </div>

        <div
          className={`sidebar-item ${section === "events" ? "active" : ""}`}
          onClick={() => setSection("events")}
        >
          <Calendar size={18} /> My Events
        </div>

        <div
          className={`sidebar-item ${section === "transactions" ? "active" : ""}`}
          onClick={() => setSection("transactions")}
        >
          <CreditCard size={18} /> Transactions
        </div>
      </div>
    </div>
  );
}
