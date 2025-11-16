import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import "../styles/events.css";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get("/events")
      .then((res) => {
        const now = new Date();
        const upcoming = (res.data || []).filter((e) => {
          const end = e?.end_datetime ? new Date(e.end_datetime) : null;
          const start = e?.start_datetime ? new Date(e.start_datetime) : null;
          if (end instanceof Date && !isNaN(end)) return end > now;
          if (start instanceof Date && !isNaN(start)) return start > now;
          return true; // keep if no dates to avoid hiding valid items
        });
        setEvents(upcoming);
      })
      .catch((err) => console.error("API error:", err));
  }, []);

  return (
    <div className="events-page">
      <div className="events-header">
        <h1 className="events-title">Upcoming Events</h1>
        <p className="events-subtitle">Discover and join events happening near you.</p>
      </div>

      {events.length === 0 ? (
        <p className="no-events">No events found.</p>
      ) : (
        <div className="events-grid">
          {events.map((e) => (
            <div className="event-card" key={e.id}>
              <div className="event-card-content">
                <h2 className="event-title">{e.title}</h2>
                <p className="event-description">
                  {e.description?.substring(0, 100)}...
                </p>

                <div className="event-info">
                  <p>
                    <span>Date:</span> {new Date(e.start_datetime).toLocaleString("sl-SI")}
                  </p>
                  <p>
                    <span>Location:</span> {e.location}
                  </p>
                  <p>
                    <span>Tickets Sold:</span> {e.tickets_sold}/{e.total_tickets}
                  </p>
                </div>

                <Link to={`/events/${e.id}`} className="event-btn">
                  Buy Tickets
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
