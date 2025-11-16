import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrganizerLayout from "../../components/OrganizerLayout";
import { useAuth } from "../../context/AuthContext";
import "../../styles/organizer.css";

export default function OrganizerEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load organizer's events
  useEffect(() => {
    if (!user) return;

    const loadEvents = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/events/organizer/${user.id}`
        );
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await fetch(`http://localhost:5000/events/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizer_id: user.id }),
      });

      if (!res.ok) {
        const r = await res.json();
        alert(r.message || "Failed to delete event.");
        return;
      }

      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete event.");
    }
  };

  return (
    <OrganizerLayout title="My Events">
      <div className="org-events-container">

        {loading ? (
          <p className="org-muted">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="org-muted">You have no events yet.</p>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="org-event-card">

              <div className="org-event-header">
                <h3>{ev.title}</h3>
                <p className="org-location">{ev.location}</p>
              </div>

              <div className="org-event-details">
                <p>
                  <span className="label">Start:</span>{" "}
                  {new Date(ev.start_datetime).toLocaleString("sl-SI")}
                </p>

                <p>
                  <span className="label">Tickets:</span>{" "}
                  {ev.tickets_sold}/{ev.total_tickets}
                </p>
              </div>

              <div className="org-event-actions">
                <Link
                  to={`/organizer/events/${ev.id}/edit`}
                  className="org-btn small primary"
                >
                  Edit
                </Link>

                <Link
                  to={`/organizer/tickets/${ev.id}`}
                  className="org-btn small ghost"
                >
                  Tickets
                </Link>

                <button
                  onClick={() => handleDelete(ev.id)}
                  className="org-btn small danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </OrganizerLayout>
  );
}
