import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OrganizerLayout from "../../components/OrganizerLayout";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";

import { eventService } from "../../api/eventService";

import "../../styles/organizer.css";

export default function OrganizerEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, type: "confirm", title: "", message: "", onConfirm: null });

  // Load organizer's events
  useEffect(() => {
    if (!user) return;

    const loadEvents = async () => {
      try {
        const res = await eventService.getByOrganizer(user.id);
        setEvents(res.data);
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [user]);

  const handleDelete = async (id) => {
    setModal({
      isOpen: true,
      type: "confirm",
      title: "Delete Event",
      message: "Are you sure you want to delete this event?",
      onConfirm: async () => {
        setModal({ ...modal, isOpen: false });
        try {
          await eventService.delete(id, user.id);
          setEvents((prev) => prev.filter((e) => e.id !== id));
        } catch (err) {
          console.error(err);
          setModal({
            isOpen: true,
            type: "alert",
            title: "Error",
            message: err.response?.data?.message || "Could not delete event.",
            onConfirm: null
          });
        }
      }
    });
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
                  to={`/organizer/events/${ev.id}/tickets`}
                  className="org-btn small ghost"
                >
                  Tickets
                </Link>

                <Link
                  to={`/organizer/events/${ev.id}/waitlist`}
                  className="org-btn small ghost"
                >
                  Waitlist
                </Link>

                <Link
                  to={`/organizer/events/${ev.id}/analytics`}
                  className="org-btn small ghost"
                >
                  Analytics
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

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </OrganizerLayout>
  );
}
