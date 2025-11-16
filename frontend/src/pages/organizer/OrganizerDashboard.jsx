import { useEffect, useState } from "react";
import "../../styles/organizer.css";

export default function OrganizerDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    ticketsSold: 0,
    revenue: 0,
  });

  useEffect(() => {
    // TODO: Replace with real API calls
    setStats({
      totalEvents: 5,
      ticketsSold: 120,
      revenue: 2400,
    });
  }, []);

  return (
    <div className="organizer-page">
      <h1 className="organizer-title">Organizer Dashboard</h1>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <p>Total Events</p>
          <p className="dashboard-stat-number">{stats.totalEvents}</p>
        </div>

        <div className="dashboard-stat-card">
          <p>Tickets Sold</p>
          <p className="dashboard-stat-number">{stats.ticketsSold}</p>
        </div>

        <div className="dashboard-stat-card">
          <p>Total Revenue</p>
          <p className="dashboard-stat-number">${stats.revenue}</p>
        </div>
      </div>

      <div className="organizer-card">
        <h2 className="organizer-title">Quick Actions</h2>
        <p>Create new events, manage tickets, and view statistics.</p>
      </div>
    </div>
  );
}
