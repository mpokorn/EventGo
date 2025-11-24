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
      <button 
        onClick={onBack}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'translateX(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        ← Back to Events
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>{event?.title}</h2>
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <p style={{ margin: '0.25rem 0' }}><strong>Date:</strong> {new Date(event?.start_datetime).toLocaleString()}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Location:</strong> {event?.location}</p>
            <p style={{ margin: '0.25rem 0' }}><strong>Total Tickets:</strong> {tickets.length}</p>
          </div>
        </div>
        <Link 
          to={`/events/${eventId}`}
          style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, var(--color-accent), var(--color-primary))',
            color: 'var(--color-text-primary)',
            padding: '0.625rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
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
                      <div style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: '0.5rem' }}>
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
