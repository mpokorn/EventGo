import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

export default function ProfileEventTickets({ eventId, onBack }) {
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const res = await api.get(`/tickets/user/${user.id}/event/${eventId}`);
        setEvent(res.data.event);
        setTickets(res.data.tickets || []);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError(err.response?.data?.message || "Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, eventId]);

  // Group tickets by status
  const activeTickets = tickets.filter(t => t.status === 'active');
  const reservedTickets = tickets.filter(t => t.status === 'reserved');
  const pendingReturnTickets = tickets.filter(t => t.status === 'pending_return');
  const refundedTickets = tickets.filter(t => t.status === 'refunded');

  if (loading) {
    return (
      <section className="profile-card">
        <p>Loading tickets...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="profile-card">
        <p className="error">{error}</p>
      </section>
    );
  }

  return (
    <section className="profile-card profile-tickets">
      <button onClick={onBack} className="back-btn">
        ← Back to My Events
      </button>
      
      <div className="event-tickets-header">
        <div className="event-tickets-info">
          <h2>{event?.title}</h2>
          <p><strong>Date:</strong> {new Date(event?.start_datetime).toLocaleString()}</p>
          <p><strong>Location:</strong> {event?.location}</p>
          <p><strong>Total Tickets:</strong> {tickets.length}</p>
        </div>
        <Link to={`/events/${eventId}`} className="event-tickets-link">
          View Event Page
        </Link>
      </div>

      {tickets.length === 0 ? (
        <p>No tickets found for this event.</p>
      ) : (
        <>
          {/* RESERVED TICKETS */}
          {reservedTickets.length > 0 && (
            <>
              <h3 className="success">🎫 Reserved Tickets</h3>
              <ul className="ticket-list">
                {reservedTickets.map(t => (
                  <li key={t.id} className="ticket-item reserved">
                    <div className="ticket-info">
                      <strong>Ticket #{t.id}</strong> – {t.ticket_type || "General"} ({t.ticket_price} €)
                      <div className="ticket-meta">
                        Issued: {new Date(t.issued_at).toLocaleString()}
                      </div>
                      <div className="ticket-offer-badge">
                        Reserved from waitlist
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ACTIVE TICKETS */}
          {activeTickets.length > 0 && (
            <>
              <h3>Active Tickets</h3>
              <ul className="ticket-list">
                {activeTickets.map(t => (
                  <li key={t.id} className="ticket-item">
                    <div className="ticket-info">
                      <strong>Ticket #{t.id}</strong> – {t.ticket_type || "General"} ({t.ticket_price} €)
                      <div className="ticket-meta">
                        Issued: {new Date(t.issued_at).toLocaleString()}
                      </div>
                      <div className="ticket-transaction-id">
                        Transaction: #{t.transaction_id}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* PENDING RETURN TICKETS */}
          {pendingReturnTickets.length > 0 && (
            <>
              <h3 className="warning spaced">Pending Return</h3>
              <ul className="ticket-list">
                {pendingReturnTickets.map(t => (
                  <li key={t.id} className="ticket-item pending-return">
                    <div className="ticket-info">
                      <strong>Ticket #{t.id}</strong> – {t.ticket_type || "General"} ({t.ticket_price} €)
                      <div className="ticket-meta">
                        Issued: {new Date(t.issued_at).toLocaleString()}
                      </div>
                      <div className="ticket-status-box pending">
                        <strong>Return Requested</strong>
                        <span className="status-text">
                          Your ticket is being offered to the waitlist. You'll be refunded when someone accepts it.
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* REFUNDED TICKETS */}
          {refundedTickets.length > 0 && (
            <>
              <h3 className="success spaced">Successfully Refunded</h3>
              <ul className="ticket-list">
                {refundedTickets.map(t => (
                  <li key={t.id} className="ticket-item refunded">
                    <div className="ticket-info">
                      <strong>Ticket #{t.id}</strong> – {t.ticket_type || "General"} ({t.ticket_price} €)
                      <div className="ticket-meta">
                        Issued: {new Date(t.issued_at).toLocaleString()}
                      </div>
                      <div className="ticket-status-box success">
                        <strong>Return Completed</strong>
                        <span className="status-text">
                          Your ticket was successfully sold and you have been refunded (2% platform fee applied).
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}
