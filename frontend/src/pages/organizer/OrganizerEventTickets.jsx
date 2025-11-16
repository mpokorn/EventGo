import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OrganizerLayout from "../../components/OrganizerLayout";
import "../../styles/organizer.css";

export default function OrganizerEventTickets() {
  const { id } = useParams(); // event_id
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    try {
      const res = await fetch(`http://localhost:5000/tickets/event/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Unable to load tickets.");

      setTickets(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [id]);

  const refundTicket = async (ticketId) => {
    if (!window.confirm("Refund this ticket?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/tickets/${ticketId}/refund`,
        { method: "POST" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update local state
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: "refunded" } : t
        )
      );
    } catch (err) {
      alert("Refund failed: " + err.message);
    }
  };

  return (
    <OrganizerLayout title="Tickets Sold">
      <div className="org-events-container">
        <h1 className="organizer-title">Tickets Sold</h1>

        {loading && <p className="org-muted">Loading tickets...</p>}

        {error && <p className="org-error">{error}</p>}

        {!loading && tickets.length === 0 && (
          <p className="org-muted">No tickets sold for this event yet.</p>
        )}

        {tickets.map((t) => (
          <div key={t.id} className="org-event-card">
            <div className="org-event-header">
              <h3>{t.type}</h3>
              <p className="org-location">€{t.price}</p>
            </div>

            <div className="org-event-details">
              <p>
                <span className="label">Buyer:</span> {t.first_name}{" "}
                {t.last_name}
              </p>
              <p>
                <span className="label">Email:</span> {t.email}
              </p>
              <p>
                <span className="label">Status:</span>{" "}
                {t.status === "refunded" ? (
                  <span style={{ color: "#f87171" }}>Refunded</span>
                ) : (
                  <span style={{ color: "#4ade80" }}>Active</span>
                )}
              </p>
            </div>

            <div className="org-event-actions">
              {t.status !== "refunded" && (
                <button
                  className="org-btn small danger"
                  onClick={() => refundTicket(t.id)}
                >
                  Refund
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </OrganizerLayout>
  );
}
