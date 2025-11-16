import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

export default function DashboardTopBar({ section }) {
  const { user } = useAuth();

  // Friendly names for sections
  const titles = {
    profile: "Your Profile",
    tickets: "Your Tickets",
    waitlist: "Your Waitlist",
    events: "Your Events"
  };

  return (
    <div className="dashboard-topbar">
      <h2 className="dashboard-topbar-title">
        {titles[section] || "Dashboard"}
      </h2>

      <div className="dashboard-topbar-right">
        {user && (
          <span className="dashboard-user">
            Hello, <strong>{user.first_name}</strong>
          </span>
        )}
      </div>
    </div>
  );
}
