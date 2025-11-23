export default function ProfileTickets({ reservedTickets, activeTickets, expiredTickets, loading, onResell, onAccept, onDecline }) {
  return (
    <section className="profile-card profile-tickets">
      <h2>Your Tickets</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>

          {/* RESERVED TICKETS (FROM WAITLIST) */}
          {reservedTickets && reservedTickets.length > 0 && (
            <>
              <h3 style={{ color: '#4CAF50' }}> Ticket Offers (from Waitlist)</h3>
              <ul className="ticket-list">
                {reservedTickets.map(t => (
                  <li key={t.id} className="ticket-item reserved">
                    <div className="ticket-info">
                      <strong>{t.event_name}</strong> – {t.ticket_type} ({t.ticket_price} €)
                      <div className="ticket-meta">
                        Event: {new Date(t.start_datetime).toLocaleString()}
                      </div>
                      <div className="ticket-offer-badge">
                         You've been offered this ticket from the waitlist!
                      </div>
                    </div>

                    <div className="ticket-actions">
                      <button
                        className="ticket-accept-btn"
                        onClick={() => onAccept(t.transaction_id)}
                      >
                        ✓ Accept
                      </button>
                      <button
                        className="ticket-decline-btn"
                        onClick={() => onDecline(t.transaction_id)}
                      >
                        ✗ Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ACTIVE TICKETS */}
          <h3>Active Tickets</h3>
          <ul className="ticket-list">

            {activeTickets.map(t => (
              <li key={t.id} className="ticket-item">

                <div className="ticket-info">
                  <strong>{t.event_name}</strong> – {t.ticket_type} ({t.ticket_price} €)
                  <div className="ticket-meta">
                    Event: {new Date(t.start_datetime).toLocaleString()}
                  </div>
                </div>

                {/* RETURN / RESELL BUTTON */}
                <button
                  className="ticket-return-btn"
                  onClick={() => onResell(t.id, t.event_id)}
                >
                  Return Ticket
                </button>

              </li>
            ))}

            {activeTickets.length === 0 && <p>No active tickets.</p>}
          </ul>

          {/* EXPIRED TICKETS */}
          <h3>Expired Tickets</h3>
          <ul className="ticket-list">

            {expiredTickets.map(t => (
              <li key={t.id} className="ticket-item" style={{ opacity: 0.6 }}>
                <div><strong>{t.event_name}</strong></div>
                <div className="ticket-meta">
                  Event ended: {new Date(t.end_datetime).toLocaleString()}
                </div>
              </li>
            ))}

            {expiredTickets.length === 0 && <p>No expired tickets.</p>}
          </ul>

        </>
      )}
    </section>
  );
}
